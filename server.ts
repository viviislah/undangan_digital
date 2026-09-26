import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllInvitationsFromDb,
  getInvitationBySlugOrIdFromDb,
  upsertInvitationInDb,
  deleteInvitationFromDb,
  deleteAllDraftsFromDb,
  deleteAllInvitationsFromDb,
  incrementInvitationViewsInDb,
  addRSVPToDb,
  getRSVPsFromDb,
  addRSVPReplyInDb,
} from './src/db/invitations.ts';
import { SAMPLE_INVITATION_1, SAMPLE_INVITATION_2, createNewInvitationFromTemplate } from './src/services/storageService.ts';
import { TEMPLATES } from './src/data/templates.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'invitations.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function loadInvitations(): any[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading invitations.json:', err);
    return [];
  }
}

function saveInvitations(invitations: any[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(invitations, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing invitations.json:', err);
  }
}

// Helper to extract and save base64 files
function processImageBase64(base64Url: string, prefix: string, id: string): string {
  if (!base64Url || typeof base64Url !== 'string') return base64Url;
  if (base64Url.startsWith('data:image/')) {
    try {
      const base64Index = base64Url.indexOf(';base64,');
      if (base64Index !== -1) {
        const header = base64Url.substring(0, base64Index);
        const rawBase64 = base64Url.substring(base64Index + 8).replace(/\s+/g, '');
        const contentType = header.replace('data:', '');
        const extension = contentType.split('/')[1]?.split('+')[0] || 'jpg';
        const safeExt = extension === 'jpeg' ? 'jpg' : extension;
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const cleanId = String(id || 'img').replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${prefix}_${cleanId}_${Date.now()}_${randomSuffix}.${safeExt}`;
        const filePath = path.join(UPLOADS_DIR, fileName);

        fs.writeFileSync(filePath, Buffer.from(rawBase64, 'base64'));
        console.log(`Saved custom image upload to ${filePath}`);
        return `/uploads/${fileName}`;
      }
    } catch (err) {
      console.error(`Error saving image upload for ${prefix}:`, err);
    }
  }
  return base64Url;
}

function processInvitationUploads(invitation: any): any {
  if (!invitation) return invitation;

  // 1. Process custom audio file uploads
  if (invitation.music && invitation.music.audioUrl) {
    const audioUrl = invitation.music.audioUrl;
    if (audioUrl.startsWith('data:audio/')) {
      try {
        const match = audioUrl.match(/^data:(audio\/[a-zA-Z0-9]+);base64,(.+)$/);
        if (match) {
          const contentType = match[1];
          const base64Data = match[2];
          const extension = contentType.split('/')[1] || 'mp3';
          const fileName = `audio_${invitation.id}.${extension}`;
          const filePath = path.join(UPLOADS_DIR, fileName);

          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          console.log(`Saved custom audio upload to ${filePath}`);

          invitation.music.audioUrl = `/uploads/${fileName}`;
        }
      } catch (err) {
        console.error('Error saving audio upload:', err);
      }
    }
  }

  // 2. Process coverPhotoUrl
  if (invitation.coverPhotoUrl && invitation.coverPhotoUrl.startsWith('data:image/')) {
    invitation.coverPhotoUrl = processImageBase64(invitation.coverPhotoUrl, 'cover', invitation.id);
  }

  // 3. Process Mempelai Pria photo
  if (invitation.mempelaiPria && invitation.mempelaiPria.fotoUrl && invitation.mempelaiPria.fotoUrl.startsWith('data:image/')) {
    invitation.mempelaiPria.fotoUrl = processImageBase64(invitation.mempelaiPria.fotoUrl, 'groom', invitation.id);
  }

  // 4. Process Mempelai Wanita photo
  if (invitation.mempelaiWanita && invitation.mempelaiWanita.fotoUrl && invitation.mempelaiWanita.fotoUrl.startsWith('data:image/')) {
    invitation.mempelaiWanita.fotoUrl = processImageBase64(invitation.mempelaiWanita.fotoUrl, 'bride', invitation.id);
  }

  // 5. Process love stories photos
  if (Array.isArray(invitation.loveStories)) {
    invitation.loveStories.forEach((story: any, idx: number) => {
      if (story.fotoUrl && story.fotoUrl.startsWith('data:image/')) {
        story.fotoUrl = processImageBase64(story.fotoUrl, `story_${idx}`, invitation.id);
      }
    });
  }

  // 6. Process gallery photos
  if (Array.isArray(invitation.gallery)) {
    invitation.gallery.forEach((photo: any, idx: number) => {
      if (photo.url && photo.url.startsWith('data:image/')) {
        photo.url = processImageBase64(photo.url, `gallery_${idx}`, invitation.id);
      }
    });
  }

  // 7. Process gift digital account QR codes
  if (invitation.gift && Array.isArray(invitation.gift.rekening)) {
    invitation.gift.rekening.forEach((rek: any, idx: number) => {
      if (rek.qrCodeUrl && rek.qrCodeUrl.startsWith('data:image/')) {
        rek.qrCodeUrl = processImageBase64(rek.qrCodeUrl, `qris_${idx}`, invitation.id);
      }
    });
  }

  return invitation;
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded audio and images
app.use('/uploads', express.static(UPLOADS_DIR));

// Audio streaming proxy to bypass CORS restrictions
app.get('/api/proxy-audio', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send('URL query parameter is required');
  }

  try {
    const rangeHeader = req.headers.range;
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: '*/*',
    };

    if (rangeHeader) {
      fetchHeaders.Range = rangeHeader;
    }

    const response = await fetch(url, { headers: fetchHeaders });

    if (!response.ok && response.status !== 206) {
      return res.status(response.status).send(`Failed to fetch remote audio: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (response.status === 206) {
      res.status(206);
      if (response.headers.get('content-range')) {
        res.setHeader('Content-Range', response.headers.get('content-range')!);
      }
    } else {
      res.status(200);
    }

    if (response.headers.get('content-length')) {
      res.setHeader('Content-Length', response.headers.get('content-length')!);
    }

    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(Buffer.from(value));
        await pump();
      };
      await pump();
    } else {
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    console.error('Proxy audio error:', err);
    res.status(500).send(err.message || 'Internal proxy error');
  }
});

// Helper to deduplicate RSVP records
function deduplicateRsvps(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  const result: any[] = [];
  for (const item of list) {
    if (!item) continue;
    const isDuplicate = result.some((existing) => {
      if (existing.id && item.id && existing.id === item.id) return true;
      const sameName = String(existing.nama || '').trim().toLowerCase() === String(item.nama || '').trim().toLowerCase();
      const sameMessage = String(existing.pesanDoa || existing.ucapan || '').trim().toLowerCase() === String(item.pesanDoa || item.ucapan || '').trim().toLowerCase();
      if (sameName && sameMessage) {
        const timeDiff = Math.abs(new Date(existing.createdAt).getTime() - new Date(item.createdAt).getTime());
        if (isNaN(timeDiff) || timeDiff < 30000) {
          return true;
        }
      }
      return false;
    });
    if (!isDuplicate) {
      result.push(item);
    }
  }
  return result;
}

// API: Get all invitations (Cloud SQL PostgreSQL + local sync)
app.get('/api/invitations', async (_req, res) => {
  try {
    const dbList = await getAllInvitationsFromDb();
    if (dbList.length > 0) {
      return res.json(dbList);
    }
  } catch (err) {
    console.warn('Database query fallback to file:', err);
  }
  const invitations = loadInvitations();
  res.json(invitations);
});

// API: Get invitation by slug or id
app.get('/api/invitations/:slugOrId', async (req, res) => {
  const { slugOrId } = req.params;
  const cleanParam = decodeURIComponent(slugOrId).trim().toLowerCase();

  // 1. Try PostgreSQL database first
  try {
    const foundDb = await getInvitationBySlugOrIdFromDb(slugOrId);
    if (foundDb) {
      return res.json(foundDb);
    }
  } catch (err) {
    console.warn('Database query fallback for invitation:', err);
  }

  // 2. Check local data file backup
  const invitations = loadInvitations();
  const found = invitations.find(
    (i: any) =>
      (i.slug && i.slug.toLowerCase() === cleanParam) ||
      (i.id && i.id.toLowerCase() === cleanParam)
  );
  if (found) {
    return res.json({
      ...found,
      rsvpList: deduplicateRsvps(found.rsvpList || []),
    });
  }

  // 3. Fallback to default sample invitations (ensures shared customer preview links always work)
  if (
    cleanParam === 'rizky-amanda' ||
    cleanParam === SAMPLE_INVITATION_1.slug.toLowerCase() ||
    cleanParam === SAMPLE_INVITATION_1.id.toLowerCase()
  ) {
    try {
      await upsertInvitationInDb(SAMPLE_INVITATION_1);
    } catch {}
    return res.json(SAMPLE_INVITATION_1);
  }

  if (
    cleanParam === 'dimas-sarah' ||
    cleanParam === 'dimas-citra' ||
    cleanParam === SAMPLE_INVITATION_2.slug.toLowerCase() ||
    cleanParam === SAMPLE_INVITATION_2.id.toLowerCase()
  ) {
    try {
      await upsertInvitationInDb(SAMPLE_INVITATION_2);
    } catch {}
    return res.json(SAMPLE_INVITATION_2);
  }

  // 4. Fallback to theme template sample invitation
  const matchedTemplate = TEMPLATES.find(
    (t) => t.id === cleanParam || cleanParam.includes(t.id) || cleanParam === 'katalog'
  );
  if (matchedTemplate) {
    const demoInv = createNewInvitationFromTemplate(matchedTemplate, {
      title: `The Wedding of Farhan & Nabila (${matchedTemplate.name})`,
      slug: cleanParam,
      isPublished: true,
    });
    try {
      await upsertInvitationInDb(demoInv);
    } catch {}
    return res.json(demoInv);
  }

  return res.status(404).json({ error: 'Invitation not found' });
});

// API: Increment invitation view count
app.post('/api/invitations/:slugOrId/view', async (req, res) => {
  const { slugOrId } = req.params;
  try {
    const views = await incrementInvitationViewsInDb(slugOrId);
    return res.json({ success: true, viewsCount: views });
  } catch (err) {
    console.warn('Failed to increment views in database:', err);
    return res.json({ success: true });
  }
});

// API: Get RSVP list for an invitation
app.get('/api/invitations/:slugOrId/rsvp', async (req, res) => {
  const { slugOrId } = req.params;
  try {
    const foundDb = await getInvitationBySlugOrIdFromDb(slugOrId);
    if (foundDb) {
      const dbRsvps = await getRSVPsFromDb(foundDb.id);
      return res.json({ success: true, rsvpList: dbRsvps });
    }
  } catch (err) {
    console.warn('Database RSVP query error:', err);
  }

  const invitations = loadInvitations();
  const found = invitations.find((i: any) => i.slug === slugOrId || i.id === slugOrId);
  if (!found) {
    return res.status(404).json({ error: 'Invitation not found' });
  }
  const cleanList = deduplicateRsvps(found.rsvpList || []);
  res.json({ success: true, rsvpList: cleanList });
});

// API: Submit RSVP confirmation & wishes
app.post('/api/invitations/:slugOrId/rsvp', async (req, res) => {
  const { slugOrId } = req.params;
  const { nama, status, jumlahTamu, pesanDoa } = req.body;

  if (!nama || !pesanDoa) {
    return res.status(400).json({ error: 'Nama dan ucapan doa wajib diisi' });
  }

  const trimmedName = String(nama).trim();
  const trimmedPesan = String(pesanDoa).trim();

  // Try PostgreSQL first
  try {
    const foundDb = await getInvitationBySlugOrIdFromDb(slugOrId);
    if (foundDb) {
      const mappedStatus: any =
        status === 'not-attending' || status === 'not_attending'
          ? 'not_attending'
          : status === 'tentative' || status === 'uncertain'
          ? 'uncertain'
          : 'attending';
      const guestCount = mappedStatus === 'not_attending' ? 0 : Number(jumlahTamu) || 1;
      const newRsvpRecord = {
        id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        invitationId: foundDb.id,
        nama: trimmedName,
        status: mappedStatus,
        jumlahTamu: guestCount,
        pesanDoa: trimmedPesan,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      const saved = await addRSVPToDb(foundDb.id, newRsvpRecord);
      const list = await getRSVPsFromDb(foundDb.id);
      return res.json({ success: true, rsvp: saved, rsvpList: list });
    }
  } catch (err) {
    console.error('Database RSVP error, falling back to local file:', err);
  }

  // Fallback to local JSON storage
  const invitations = loadInvitations();
  const targetIdx = invitations.findIndex((i: any) => i.slug === slugOrId || i.id === slugOrId);

  if (targetIdx === -1) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  const target = invitations[targetIdx];
  const newRsvp = {
    id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    invitationId: target.id,
    nama: trimmedName,
    status: status || 'attending',
    jumlahTamu: status === 'attending' ? Number(jumlahTamu) || 1 : 0,
    pesanDoa: trimmedPesan,
    createdAt: new Date().toISOString(),
  };

  target.rsvpList = deduplicateRsvps([newRsvp, ...(target.rsvpList || [])]);
  target.updatedAt = new Date().toISOString();
  invitations[targetIdx] = target;
  saveInvitations(invitations);

  res.json({ success: true, rsvp: newRsvp, rsvpList: target.rsvpList });
});

// API: Reply to an RSVP wish / prayer
app.post('/api/invitations/:slugOrId/rsvp/:rsvpId/reply', optionalAuth, async (_req: AuthRequest, res) => {
  const { slugOrId, rsvpId } = _req.params;
  const { nama, pesan, isHost } = _req.body;

  if (!nama || !pesan) {
    return res.status(400).json({ error: 'Nama dan balasan wajib diisi' });
  }

  const trimmedReplyName = String(nama).trim();
  const trimmedReplyMsg = String(pesan).trim();
  const newReply = {
    id: 'reply-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    rsvpId,
    nama: trimmedReplyName,
    pesan: trimmedReplyMsg,
    isHost: Boolean(isHost),
    createdAt: new Date().toISOString(),
  };

  try {
    const foundDb = await getInvitationBySlugOrIdFromDb(slugOrId);
    if (foundDb) {
      await addRSVPReplyInDb(foundDb.id, rsvpId, newReply);
      const list = await getRSVPsFromDb(foundDb.id);
      return res.json({ success: true, reply: newReply, rsvpList: list });
    }
  } catch (err) {
    console.warn('Database RSVP reply error:', err);
  }

  // Fallback
  const invitations = loadInvitations();
  const targetIdx = invitations.findIndex((i: any) => i.slug === slugOrId || i.id === slugOrId);

  if (targetIdx === -1) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  const target = invitations[targetIdx];
  const rsvp = (target.rsvpList || []).find((r: any) => r.id === rsvpId);
  if (!rsvp) {
    return res.status(404).json({ error: 'RSVP wish not found' });
  }

  rsvp.replies = [...(rsvp.replies || []), newReply];
  target.updatedAt = new Date().toISOString();
  saveInvitations(invitations);

  res.json({ success: true, reply: newReply, rsvpList: target.rsvpList });
});

// API: Direct Image Upload
app.post('/api/upload-image', (req, res) => {
  const { image, prefix, id } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  const savedUrl = processImageBase64(image, prefix || 'photo', id || 'upload');
  if (savedUrl && savedUrl.startsWith('/uploads/')) {
    return res.json({ success: true, url: savedUrl });
  }

  return res.status(500).json({ error: 'Failed to process image' });
});

// API: Save or update invitation (Stores directly in PostgreSQL + local backup)
app.post('/api/invitations', optionalAuth, async (req: AuthRequest, res) => {
  let newInv = req.body;
  if (!newInv || !newInv.id) {
    return res.status(400).json({ error: 'Invalid invitation data' });
  }

  // Process and convert base64 audio and images into real server-side files
  newInv = processInvitationUploads(newInv);
  newInv.updatedAt = new Date().toISOString();

  // Save to Cloud SQL PostgreSQL
  try {
    const saved = await upsertInvitationInDb(newInv, req.user?.uid);
    // Also sync to local file for backup
    const invitations = loadInvitations();
    const existingIdx = invitations.findIndex((i: any) => i.id === newInv.id || i.slug === newInv.slug);
    if (existingIdx >= 0) {
      invitations[existingIdx] = newInv;
    } else {
      invitations.unshift(newInv);
    }
    saveInvitations(invitations);
    return res.json({ success: true, invitation: saved });
  } catch (err) {
    console.error('Database write error, saving locally:', err);
    const invitations = loadInvitations();
    const existingIdx = invitations.findIndex((i: any) => i.id === newInv.id || i.slug === newInv.slug);
    if (existingIdx >= 0) {
      invitations[existingIdx] = newInv;
    } else {
      invitations.unshift(newInv);
    }
    saveInvitations(invitations);
    return res.json({ success: true, invitation: newInv });
  }
});

// API: Delete all invitations (both drafts and published)
app.delete('/api/invitations', optionalAuth, async (_req: AuthRequest, res) => {
  try {
    const deletedCount = await deleteAllInvitationsFromDb();
    console.log(`Deleted all ${deletedCount} invitations from database`);
  } catch (err) {
    console.warn('Database delete all invitations error:', err);
  }
  saveInvitations([]);
  res.json({ success: true, message: 'Semua undangan yang tersimpan berhasil dihapus' });
});

// API: Delete all drafts
app.delete('/api/invitations-drafts', optionalAuth, async (_req: AuthRequest, res) => {
  try {
    const deletedCount = await deleteAllDraftsFromDb();
    console.log(`Deleted ${deletedCount} drafts from database`);
  } catch (err) {
    console.warn('Database delete drafts error:', err);
  }
  let invitations = loadInvitations();
  const prevCount = invitations.length;
  invitations = invitations.filter((i: any) => i.isPublished !== false);
  saveInvitations(invitations);
  res.json({ success: true, count: prevCount - invitations.length, message: 'Semua draft berhasil dihapus' });
});

// API: Delete invitation
app.delete('/api/invitations/:id', optionalAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    await deleteInvitationFromDb(id);
  } catch (err) {
    console.warn('Database delete error:', err);
  }
  let invitations = loadInvitations();
  invitations = invitations.filter((i: any) => i.id !== id && i.slug !== id);
  saveInvitations(invitations);
  res.json({ success: true });
});

// API: Synchronize user profile into PostgreSQL users table
app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'User token required' });
    }
    const userRecord = await getOrCreateUser(req.user.uid, req.user.email || '');
    res.json({ success: true, user: userRecord });
  } catch (err: any) {
    console.error('Error syncing user to database:', err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Auto-seed initial invitations from invitations.json and samples into Cloud SQL PostgreSQL if missing
async function seedInitialDatabaseIfEmpty() {
  try {
    const list = await getAllInvitationsFromDb();
    const existingIds = new Set(list.map((i) => i.id));
    const local = loadInvitations();
    const allToSeed = [SAMPLE_INVITATION_1, SAMPLE_INVITATION_2, ...local];
    let seededCount = 0;

    for (const item of allToSeed) {
      if (!existingIds.has(item.id)) {
        await upsertInvitationInDb(item);
        existingIds.add(item.id);
        seededCount++;
      }
    }

    if (seededCount > 0) {
      console.log(`Seeded ${seededCount} invitations into Cloud SQL PostgreSQL.`);
    }
  } catch (err) {
    console.warn('Database seeding deferred:', err);
  }
}

// Setup Vite or Static File Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Note: Automatic seeding disabled so cleared invitations remain clean and empty

  if (!isProd) {
    // Vite Dev Server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
