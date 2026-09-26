import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

  // 1. Process custom audio file uploads (Save base64 data to a real server MP3/WAV file)
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

  // 2. Process all uploaded base64 photos to keep invitation lightweight and shareable
  invitation.coverPhotoUrl = processImageBase64(invitation.coverPhotoUrl, 'cover', invitation.id);

  if (invitation.mempelaiPria) {
    invitation.mempelaiPria.fotoUrl = processImageBase64(invitation.mempelaiPria.fotoUrl, 'pria', invitation.id);
  }
  if (invitation.mempelaiWanita) {
    invitation.mempelaiWanita.fotoUrl = processImageBase64(invitation.mempelaiWanita.fotoUrl, 'wanita', invitation.id);
  }

  if (Array.isArray(invitation.loveStories)) {
    invitation.loveStories = invitation.loveStories.map((story: any) => ({
      ...story,
      fotoUrl: processImageBase64(story.fotoUrl, 'story', story.id || invitation.id),
    }));
  }

  if (Array.isArray(invitation.gallery)) {
    invitation.gallery = invitation.gallery.map((item: any) => ({
      ...item,
      url: processImageBase64(item.url, 'gallery', item.id || invitation.id),
    }));
  }

  return invitation;
}

// Allow large payloads for custom audio / photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS for cross-origin access
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static uploaded files and public images so they are accessible on any device globally
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public')));

// API: Proxy Audio for Google Drive & external URLs with Full Range (HTTP 206) Support for iOS Safari
app.get('/api/proxy-audio', async (req, res) => {
  try {
    let targetUrl = req.query.url as string;
    const fileId = req.query.id as string;

    if (fileId) {
      targetUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    }

    if (!targetUrl) {
      return res.status(400).send('Missing url or id parameter');
    }

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    // Follow redirects and handle Google Drive confirmation cookies
    let response = await fetch(targetUrl, { headers });

    // Check if Google Drive returned a confirmation warning page
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html') && fileId) {
      const htmlText = await response.text();
      const confirmMatch = htmlText.match(/confirm=([0-9A-Za-z_-]+)/);
      const confirmToken = confirmMatch ? confirmMatch[1] : 't';
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;

      response = await fetch(downloadUrl, { headers });
    }

    if (!response.ok && response.status !== 206) {
      return res.status(response.status).send(`Failed to stream audio (${response.status})`);
    }

    let outContentType = response.headers.get('content-type') || 'audio/mpeg';
    if (!outContentType.startsWith('audio/') && !outContentType.startsWith('video/')) {
      outContentType = 'audio/mpeg';
    }

    res.setHeader('Content-Type', outContentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Forward range-specific headers
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

// API: Get all invitations
app.get('/api/invitations', (_req, res) => {
  const invitations = loadInvitations();
  res.json(invitations);
});

// API: Get invitation by slug or id
app.get('/api/invitations/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const invitations = loadInvitations();
  const found = invitations.find((i: any) => i.slug === slugOrId || i.id === slugOrId);
  if (!found) {
    return res.status(404).json({ error: 'Invitation not found' });
  }
  res.json({
    ...found,
    rsvpList: deduplicateRsvps(found.rsvpList || []),
  });
});

// Helper to deduplicate RSVP records by ID and duplicate submissions within 30s
function deduplicateRsvps(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  const result: any[] = [];
  for (const item of list) {
    if (!item) continue;
    const isDuplicate = result.some((existing) => {
      if (existing.id && item.id && existing.id === item.id) return true;
      const sameName = String(existing.nama || '').trim().toLowerCase() === String(item.nama || '').trim().toLowerCase();
      const sameMessage = String(existing.pesanDoa || '').trim().toLowerCase() === String(item.pesanDoa || '').trim().toLowerCase();
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

// API: Get RSVP list for an invitation
app.get('/api/invitations/:slugOrId/rsvp', (req, res) => {
  const { slugOrId } = req.params;
  const invitations = loadInvitations();
  const found = invitations.find((i: any) => i.slug === slugOrId || i.id === slugOrId);
  if (!found) {
    return res.status(404).json({ error: 'Invitation not found' });
  }
  const cleanList = deduplicateRsvps(found.rsvpList || []);
  res.json({ success: true, rsvpList: cleanList });
});

// API: Submit RSVP confirmation & wishes from any device globally
app.post('/api/invitations/:slugOrId/rsvp', (req, res) => {
  const { slugOrId } = req.params;
  const { nama, status, jumlahTamu, pesanDoa } = req.body;

  if (!nama || !pesanDoa) {
    return res.status(400).json({ error: 'Nama dan ucapan doa wajib diisi' });
  }

  const invitations = loadInvitations();
  const targetIdx = invitations.findIndex((i: any) => i.slug === slugOrId || i.id === slugOrId);

  if (targetIdx === -1) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  const target = invitations[targetIdx];
  const trimmedName = String(nama).trim();
  const trimmedPesan = String(pesanDoa).trim();

  // Deduplication check: if a message with the exact same name and prayer was submitted recently,
  // return existing record to prevent duplicate entries
  const existingRecent = (target.rsvpList || []).find((r: any) => {
    if (
      String(r.nama || '').trim().toLowerCase() === trimmedName.toLowerCase() &&
      String(r.pesanDoa || '').trim().toLowerCase() === trimmedPesan.toLowerCase()
    ) {
      const timeDiff = Date.now() - new Date(r.createdAt).getTime();
      return isNaN(timeDiff) || timeDiff < 30000;
    }
    return false;
  });

  if (existingRecent) {
    const cleanList = deduplicateRsvps(target.rsvpList || []);
    return res.json({ success: true, rsvp: existingRecent, rsvpList: cleanList, duplicatePrevented: true });
  }

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

  // Also update guest status if name matches
  if (Array.isArray(target.guests)) {
    const matchedGuest = target.guests.find(
      (g: any) => g.nama && g.nama.toLowerCase().trim() === trimmedName.toLowerCase()
    );
    if (matchedGuest) {
      matchedGuest.statusUndangan = 'opened';
    }
  }

  target.updatedAt = new Date().toISOString();
  invitations[targetIdx] = target;
  saveInvitations(invitations);

  res.json({ success: true, rsvp: newRsvp, rsvpList: target.rsvpList });
});

// API: Reply to an RSVP wish / prayer
app.post('/api/invitations/:slugOrId/rsvp/:rsvpId/reply', (req, res) => {
  const { slugOrId, rsvpId } = req.params;
  const { nama, pesan, isHost } = req.body;

  if (!nama || !pesan) {
    return res.status(400).json({ error: 'Nama dan balasan wajib diisi' });
  }

  const invitations = loadInvitations();
  const targetIdx = invitations.findIndex((i: any) => i.slug === slugOrId || i.id === slugOrId);

  if (targetIdx === -1) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  const target = invitations[targetIdx];
  if (!Array.isArray(target.rsvpList)) {
    target.rsvpList = [];
  }

  const rsvp = target.rsvpList.find((r: any) => r.id === rsvpId);
  if (!rsvp) {
    return res.status(404).json({ error: 'RSVP wish not found' });
  }

  const trimmedReplyName = String(nama).trim();
  const trimmedReplyMsg = String(pesan).trim();

  // Deduplicate replies within 20 seconds
  const existingReply = (rsvp.replies || []).find((rep: any) => {
    if (
      String(rep.nama || '').trim().toLowerCase() === trimmedReplyName.toLowerCase() &&
      String(rep.pesan || '').trim().toLowerCase() === trimmedReplyMsg.toLowerCase()
    ) {
      const timeDiff = Date.now() - new Date(rep.createdAt).getTime();
      return isNaN(timeDiff) || timeDiff < 20000;
    }
    return false;
  });

  if (existingReply) {
    return res.json({ success: true, reply: existingReply, rsvpList: target.rsvpList, duplicatePrevented: true });
  }

  const newReply = {
    id: 'reply-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    rsvpId,
    nama: trimmedReplyName,
    pesan: trimmedReplyMsg,
    isHost: Boolean(isHost),
    createdAt: new Date().toISOString(),
  };

  rsvp.replies = [...(rsvp.replies || []), newReply];

  target.updatedAt = new Date().toISOString();
  invitations[targetIdx] = target;
  saveInvitations(invitations);

  res.json({ success: true, reply: newReply, rsvpList: target.rsvpList });
});

// API: Direct Image Upload (Used when user picks or compresses an image in editor)
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

// API: Save or update invitation
app.post('/api/invitations', (req, res) => {
  let newInv = req.body;
  if (!newInv || !newInv.id) {
    return res.status(400).json({ error: 'Invalid invitation data' });
  }

  // Process and convert base64 audio and images into real server-side files
  newInv = processInvitationUploads(newInv);

  const invitations = loadInvitations();
  const existingIdx = invitations.findIndex((i: any) => i.id === newInv.id || i.slug === newInv.slug);

  newInv.updatedAt = new Date().toISOString();

  if (existingIdx >= 0) {
    invitations[existingIdx] = newInv;
  } else {
    invitations.unshift(newInv);
  }

  saveInvitations(invitations);
  res.json({ success: true, invitation: newInv });
});

// API: Delete invitation
app.delete('/api/invitations/:id', (req, res) => {
  const { id } = req.params;
  let invitations = loadInvitations();
  invitations = invitations.filter((i: any) => i.id !== id && i.slug !== id);
  saveInvitations(invitations);
  res.json({ success: true });
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

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
