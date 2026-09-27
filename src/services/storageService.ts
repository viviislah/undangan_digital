import { InvitationData, RSVPRecord, RSVPReply, TemplateDefinition } from '../types/invitation';
import { TEMPLATES } from '../data/templates';
import { saveAudioTrack, resolveAudioUrl } from './audioStorage';

const STORAGE_KEY = 'undanganku_invitations_v1';

export const SAMPLE_INVITATION_1: InvitationData = {
  id: 'inv-gold-001',
  slug: 'rizky-amanda',
  title: 'The Wedding of Rizky & Amanda',
  category: 'wedding',
  isPublished: true,
  createdAt: '2025-06-01T10:00:00Z',
  updatedAt: '2025-06-15T14:30:00Z',
  viewsCount: 342,
  greetingTitle: "Walimatul 'Ursy",
  quoteText: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
  quoteSource: 'Q.S. Ar-Rum: 21',
  heroSubtitle: 'Dengan penuh rasa syukur dan memohon ridho Allah SWT, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami tercinta:',
  coverPhotoUrl: '/images/Salinan-foto-profil.png',
  mempelaiPria: {
    namaLengkap: 'Rizky Pratama, S.Kom.',
    namaPanggilan: 'Rizky',
    orangTua: 'Putra pertama dari Bpk. Ir. H. Bambang Sudiro & Ibu Hj. Retno Wulandari',
    anakKe: 'Putra Pertama',
    instagram: 'rizky.pratama',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  },
  mempelaiWanita: {
    namaLengkap: 'Amanda Putri Lestari, S.E.',
    namaPanggilan: 'Amanda',
    orangTua: 'Putri kedua dari Bpk. H. Hendra Gunawan & Ibu Hj. Siti Maryam',
    anakKe: 'Putri Kedua',
    instagram: 'amanda.lestari',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  events: [
    {
      id: 'event-akad',
      namaAcara: 'Akad Nikah',
      tanggal: '2025-10-25',
      waktuMulai: '08:00',
      waktuSelesai: '10:00',
      zonaWaktu: 'WIB',
      namaTempat: 'Masjid Agung Al-Barkah',
      alamat: 'Jl. Pemuda No. 45, Kebayoran Baru, Jakarta Selatan',
      linkGoogleMaps: 'https://maps.google.com/?q=-6.2384,106.8123',
      latitude: -6.2384,
      longitude: 106.8123,
    },
    {
      id: 'event-resepsi',
      namaAcara: 'Resepsi Pernikahan',
      tanggal: '2025-10-25',
      waktuMulai: '11:00',
      waktuSelesai: '16:00',
      zonaWaktu: 'WIB',
      namaTempat: 'Grand Ballroom Hotel Mulia Senayan',
      alamat: 'Jl. Asia Afrika Senayan No. 1, Gelora, Jakarta Pusat',
      linkGoogleMaps: 'https://maps.google.com/?q=-6.2163,106.7979',
      latitude: -6.2163,
      longitude: 106.7979,
    },
  ],
  loveStories: [
    {
      id: 'story-1',
      tahun: '2020',
      judul: 'Awal Perjumpaan',
      cerita: 'Kami pertama kali berkenalan di sebuah seminar teknologi di kampus. Obrolan singkat mengenai riset berubah menjadi diskusi hangat setiap hari.',
      fotoUrl: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'story-2',
      tahun: '2022',
      judul: 'Menjalin Komitmen',
      cerita: 'Setelah dua tahun saling mengenal dan mengerti karakter masing-masing dalam berbagai suka dan duka, kami memutuskan untuk melangkah ke jenjang yang lebih serius.',
      fotoUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
    },
  ],
  gallery: [
    {
      id: 'gal-1',
      url: '/images/Salinan-foto-profil.png',
      caption: 'Momen Prewedding di Hutan Pinus',
    },
    {
      id: 'gal-2',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      caption: 'Tawa dan Senyuman Bersama',
    },
    {
      id: 'gal-3',
      url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
      caption: 'Menatap Masa Depan Berdua',
    },
    {
      id: 'gal-4',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      caption: 'Hari Bahagia yang Dinanti',
    },
  ],
  bankAccounts: [
    {
      id: 'bank-1',
      namaBank: 'BCA',
      nomorRekening: '8410293819',
      atasNama: 'Rizky Pratama',
      catatan: 'Amplop Digital Mempelai Pria',
    },
    {
      id: 'bank-2',
      namaBank: 'Bank Mandiri',
      nomorRekening: '1370019283741',
      atasNama: 'Amanda Putri Lestari',
      catatan: 'Amplop Digital Mempelai Wanita',
    },
  ],
  giftAddress: {
    penerima: 'Amanda & Rizky (Keluarga Bpk. Hendra Gunawan)',
    nomorTelepon: '0812-3456-7890',
    alamatLengkap: 'Jl. Dahlia No. 18, Kebayoran Baru, Jakarta Selatan, 12150',
    catatanKurir: 'Mohon konfirmasi via WhatsApp sebelum pengiriman paket kado.',
  },
  rsvpList: [],
  theme: TEMPLATES[0].defaultTheme,
  music: {
    enabled: true,
    autoPlay: true,
    title: 'Lagu Pernikahan',
    artist: 'Musik Pilihan',
    audioUrl: '',
  },
  pesanPenutup: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.',
  protokolKesehatan: true,
};

export const SAMPLE_INVITATION_2: InvitationData = {
  id: 'inv-black-002',
  slug: 'dimas-sarah',
  title: 'Wedding of Dimas & Sarah',
  category: 'wedding',
  isPublished: true,
  createdAt: '2025-06-05T08:00:00Z',
  updatedAt: '2025-06-12T11:20:00Z',
  viewsCount: 189,
  greetingTitle: 'The Celebration of Love',
  quoteText: 'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.',
  quoteSource: 'Romantic Anthology',
  heroSubtitle: 'We invite you to share in our joy as we exchange wedding vows and begin our new chapter together.',
  coverPhotoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  mempelaiPria: {
    namaLengkap: 'Dimas Aditya, S.T.',
    namaPanggilan: 'Dimas',
    orangTua: 'Putra tercinta dari Bpk. Hadi Susanto & Ibu Sri Rahayu',
    anakKe: 'Putra Pertama',
    instagram: 'dimas.aditya',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  mempelaiWanita: {
    namaLengkap: 'Sarah Gabriella, B.Des.',
    namaPanggilan: 'Sarah',
    orangTua: 'Putri tercinta dari Bpk. Antonius Wijaya & Ibu Christine W.',
    anakKe: 'Putri Bungsu',
    instagram: 'sarah.gabriella',
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  },
  events: [
    {
      id: 'event-holy-matrimony',
      namaAcara: 'Pemberkatan Nikah',
      tanggal: '2025-11-15',
      waktuMulai: '10:00',
      waktuSelesai: '12:00',
      zonaWaktu: 'WIB',
      namaTempat: 'Gereja Katedral Jakarta',
      alamat: 'Jl. Katedral No. 7B, Pasar Baru, Sawah Besar, Jakarta Pusat',
      linkGoogleMaps: 'https://maps.google.com/?q=-6.1692,106.8331',
      latitude: -6.1692,
      longitude: 106.8331,
    },
    {
      id: 'event-evening-reception',
      namaAcara: 'Gala Dinner & Reception',
      tanggal: '2025-11-15',
      waktuMulai: '18:30',
      waktuSelesai: '21:30',
      zonaWaktu: 'WIB',
      namaTempat: 'The Glass House Ritz-Carlton Pacific Place',
      alamat: 'SCBD, Jl. Jend. Sudirman Kav 52-53, Senayan, Jakarta Selatan',
      linkGoogleMaps: 'https://maps.google.com/?q=-6.2255,106.8098',
      latitude: -6.2255,
      longitude: 106.8098,
    },
  ],
  loveStories: [
    {
      id: 'story-d1',
      tahun: '2021',
      judul: 'Coffee & Conversations',
      cerita: 'Pertemuan tak sengaja di kedai kopi senja di Bandung membuka lembaran cerita yang tak pernah kami bayangkan sebelumnya.',
      fotoUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'story-d2',
      tahun: '2024',
      judul: 'Under The Tokyo Stars',
      cerita: 'Di bawah indahnya gemerlap lampu malam Tokyo, sebuah cincin tersemat sebagai simbol janji sehidup semati.',
      fotoUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
    },
  ],
  gallery: [
    {
      id: 'gal-d1',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      caption: 'Prewedding Cinematic',
    },
    {
      id: 'gal-d2',
      url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
      caption: 'Together is our favorite place to be',
    },
  ],
  bankAccounts: [
    {
      id: 'bank-d1',
      namaBank: 'BCA',
      nomorRekening: '5220391823',
      atasNama: 'Dimas Aditya',
      catatan: 'Amplop Digital Wedding',
    },
  ],
  giftAddress: {
    penerima: 'Sarah & Dimas',
    nomorTelepon: '0811-9876-5432',
    alamatLengkap: 'Apartemen Sudirman Park Tower A, Jakarta Pusat',
    catatanKurir: 'Dapat dititipkan ke resepsionis concierge.',
  },
  rsvpList: [],
  theme: TEMPLATES[1].defaultTheme,
  music: {
    enabled: true,
    autoPlay: true,
    title: 'Lagu Pernikahan',
    artist: 'Musik Pilihan',
    audioUrl: '',
  },
  pesanPenutup: 'Kehadiran dan doa restu Anda adalah kado terindah bagi kami yang mengawali langkah baru ini.',
  protokolKesehatan: true,
};

export const getStoredInvitations = (): InvitationData[] => {
  try {
    const ALL_PURGED_FLAG = 'undanganku_all_invitations_purged_v2';
    // If the purge flag is not set yet, purge all saved invitations as requested
    if (!localStorage.getItem(ALL_PURGED_FLAG)) {
      try {
        localStorage.setItem(STORAGE_KEY, '[]');
        localStorage.setItem(ALL_PURGED_FLAG, 'true');
      } catch {}
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === '[]') {
      return [];
    }
    let parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return [];
      let changed = false;

      // Purge any stale draft invitations requested by user
      const DRAFTS_PURGED_FLAG = 'wedding_drafts_purged_flag_v1';
      if (!localStorage.getItem(DRAFTS_PURGED_FLAG)) {
        const nonDrafts = parsed.filter((inv: any) => inv.isPublished !== false);
        if (nonDrafts.length !== parsed.length) {
          parsed = nonDrafts;
          changed = true;
        }
        try {
          localStorage.setItem(DRAFTS_PURGED_FLAG, 'true');
        } catch {}
      }

      // Clear mock RSVPs from default sample invitations to keep list pristine
      const cleaned = parsed.map((inv: any) => {
        let updatedInv = { ...inv };
        if (inv.id === 'inv-gold-001' && (!updatedInv.coverPhotoUrl || updatedInv.coverPhotoUrl.includes('photo-1519741497674-611481863552'))) {
          updatedInv.coverPhotoUrl = '/images/Salinan-foto-profil.png';
          changed = true;
        }
        // Auto-heal stale /uploads/ URLs from localhost development that do not exist on static hosting
        if (updatedInv.coverPhotoUrl && (updatedInv.coverPhotoUrl.startsWith('/uploads/') || updatedInv.coverPhotoUrl.startsWith('uploads/'))) {
          updatedInv.coverPhotoUrl = '/images/Salinan-foto-profil.png';
          changed = true;
        }
        if (updatedInv.mempelaiPria?.fotoUrl && (updatedInv.mempelaiPria.fotoUrl.startsWith('/uploads/') || updatedInv.mempelaiPria.fotoUrl.startsWith('uploads/'))) {
          updatedInv.mempelaiPria = {
            ...updatedInv.mempelaiPria,
            fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
          };
          changed = true;
        }
        if (updatedInv.mempelaiWanita?.fotoUrl && (updatedInv.mempelaiWanita.fotoUrl.startsWith('/uploads/') || updatedInv.mempelaiWanita.fotoUrl.startsWith('uploads/'))) {
          updatedInv.mempelaiWanita = {
            ...updatedInv.mempelaiWanita,
            fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
          };
          changed = true;
        }
        if (inv.id === 'inv-gold-001' || inv.id === 'inv-black-002') {
          updatedInv.rsvpList = [];
        }
        return updatedInv;
      });
      if (changed) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        } catch {}
      }
      return cleaned;
    }
    return [];
  } catch (err) {
    console.error('Error reading localStorage invitations:', err);
    return [];
  }
};

export const saveInvitationToStorage = (
  invitation: InvitationData,
  syncToServer = true,
  onServerSyncComplete?: (updatedInvitation: InvitationData) => void
): InvitationData[] => {
  const all = getStoredInvitations();
  const existingIdx = all.findIndex((i) => i.id === invitation.id);

  let updated: InvitationData[];
  const timestamp = new Date().toISOString();
  const itemToSave = { ...invitation, updatedAt: timestamp };

  // Store large base64 uploads in IndexedDB so localStorage quota is never exceeded
  if (itemToSave.music?.audioUrl && itemToSave.music.audioUrl.startsWith('data:audio/')) {
    const audioKey = `audio_${itemToSave.id}`;
    saveAudioTrack(audioKey, itemToSave.music.audioUrl);
    itemToSave.music = {
      ...itemToSave.music,
      audioUrl: `indexeddb:${audioKey}`,
    };
  }

  if (existingIdx >= 0) {
    updated = [...all];
    updated[existingIdx] = itemToSave;
  } else {
    updated = [itemToSave, ...all];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    try {
      // If full list exceeds browser quota, save only user-created invitations
      const userOnly = updated.filter((i) => i.id !== 'inv-gold-001' && i.id !== 'inv-black-002');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly.length > 0 ? userOnly : [itemToSave]));
    } catch (fallbackErr) {
      console.warn('Fallback save failed:', fallbackErr);
    }
  }

  // Cross-device sync: save to server API only when syncToServer is true (explicit save / publish)
  if (syncToServer && typeof fetch !== 'undefined') {
    const prepareAndPost = async () => {
      let payload = { ...itemToSave };
      if (payload.music?.audioUrl && payload.music.audioUrl.startsWith('indexeddb:')) {
        const cached = await resolveAudioUrl(payload.music.audioUrl);
        if (cached && cached.startsWith('data:audio/')) {
          payload.music = {
            ...payload.music,
            audioUrl: cached,
          };
        }
      }

      try {
        const res = await fetch('/api/invitations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.invitation) {
            // Update local storage with the real server URL (relative path) returned by the server
            const latestAll = getStoredInvitations();
            const latestIdx = latestAll.findIndex((i) => i.id === invitation.id);
            if (latestIdx >= 0) {
              latestAll[latestIdx] = data.invitation;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(latestAll));
            }
            if (onServerSyncComplete) {
              onServerSyncComplete(data.invitation);
            }
          }
        }
      } catch (err) {
        console.warn('Server sync notice:', err);
      }
    };
    prepareAndPost();
  }

  return updated;
};

export const deleteInvitationFromStorage = (id: string): InvitationData[] => {
  const all = getStoredInvitations();
  const filtered = all.filter((i) => i.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete from localStorage:', err);
  }

  if (typeof fetch !== 'undefined') {
    fetch(`/api/invitations/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  }

  return filtered;
};

export const deleteAllDraftsFromStorage = (): InvitationData[] => {
  const all = getStoredInvitations();
  const filtered = all.filter((i) => i.isPublished !== false);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete drafts from localStorage:', err);
  }

  if (typeof fetch !== 'undefined') {
    fetch('/api/invitations-drafts', { method: 'DELETE' }).catch(() => {});
  }

  return filtered;
};

export const deleteAllInvitationsFromStorage = (): InvitationData[] => {
  const ALL_PURGED_FLAG = 'undanganku_all_invitations_purged_v2';
  try {
    localStorage.setItem(STORAGE_KEY, '[]');
    localStorage.setItem(ALL_PURGED_FLAG, 'true');
  } catch (err) {
    console.error('Failed to delete all invitations from localStorage:', err);
  }

  if (typeof fetch !== 'undefined') {
    fetch('/api/invitations', { method: 'DELETE' }).catch(() => {});
  }

  return [];
};

export const loadSampleInvitationsToStorage = (): InvitationData[] => {
  const samples = [SAMPLE_INVITATION_1, SAMPLE_INVITATION_2];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch (err) {
    console.error('Failed to load sample invitations:', err);
  }
  // Sync to server so public links work for anyone viewing
  samples.forEach((sample) => {
    saveInvitationToStorage(sample, true);
  });
  return samples;
};

export const findInvitationBySlugOrId = (slugOrId: string): InvitationData | undefined => {
  const clean = slugOrId.toLowerCase().trim().split('?')[0].split('&')[0].replace(/^\/+|\/+$/g, '');
  if (!clean) return undefined;

  const all = getStoredInvitations();
  const found = all.find((i) => i.slug?.toLowerCase() === clean || i.id?.toLowerCase() === clean);
  if (found) return found;

  // Fallback to sample invitations
  if (clean === 'rizky-amanda' || clean === SAMPLE_INVITATION_1.slug || clean === SAMPLE_INVITATION_1.id) {
    return SAMPLE_INVITATION_1;
  }
  if (clean === 'dimas-sarah' || clean === 'dimas-citra' || clean === SAMPLE_INVITATION_2.slug || clean === SAMPLE_INVITATION_2.id) {
    return SAMPLE_INVITATION_2;
  }

  // Fallback to template sample
  const matchedTmpl = TEMPLATES.find((t) => t.id === clean || clean.includes(t.id));
  if (matchedTmpl) {
    return createNewInvitationFromTemplate(matchedTmpl, {
      title: `The Wedding of Farhan & Nabila (${matchedTmpl.name})`,
      slug: clean,
      isPublished: true,
    });
  }

  return undefined;
};

export const fetchInvitationBySlugOrIdAsync = async (slugOrId: string): Promise<InvitationData | undefined> => {
  const clean = slugOrId.toLowerCase().trim().split('?')[0].split('&')[0].replace(/^\/+|\/+$/g, '');
  if (!clean) return undefined;

  const local = findInvitationBySlugOrId(clean);

  try {
    const res = await fetch(`/api/invitations/${encodeURIComponent(clean)}`);
    if (res.ok) {
      const serverInv = await res.json();
      if (serverInv && serverInv.id) {
        saveInvitationToStorage(serverInv, false);
        return serverInv;
      }
    }
  } catch (err) {
    console.warn('Could not fetch invitation from server:', err);
  }

  return local;
};

export const syncAllInvitationsFromServer = async (): Promise<InvitationData[]> => {
  try {
    const res = await fetch('/api/invitations');
    if (res.ok) {
      const serverList = await res.json();
      if (Array.isArray(serverList)) {
        const local = getStoredInvitations();
        const map = new Map<string, InvitationData>();
        // Only keep local if published; do not restore deleted drafts
        local.forEach((inv) => {
          if (inv.isPublished !== false) {
            map.set(inv.id, inv);
          }
        });
        serverList.forEach((inv: InvitationData) => map.set(inv.id, inv));
        const merged = Array.from(map.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    // offline or static mode
  }
  return getStoredInvitations();
};

/**
 * Deduplicate RSVP records by unique ID or same sender name + message within a short window
 */
export const deduplicateRSVPList = (list: RSVPRecord[]): RSVPRecord[] => {
  if (!Array.isArray(list)) return [];
  const result: RSVPRecord[] = [];
  for (const item of list) {
    if (!item) continue;
    const isDuplicate = result.some((existing) => {
      if (existing.id && item.id && existing.id === item.id) return true;
      const sameName = String(existing.nama || '').trim().toLowerCase() === String(item.nama || '').trim().toLowerCase();
      const sameMessage = String(existing.pesanDoa || '').trim().toLowerCase() === String(item.pesanDoa || '').trim().toLowerCase();
      if (sameName && sameMessage) {
        const timeDiff = Math.abs(new Date(existing.createdAt).getTime() - new Date(item.createdAt).getTime());
        if (isNaN(timeDiff) || timeDiff < 60000) {
          return true;
        }
      }
      return false;
    });

    if (!isDuplicate) {
      // Also deduplicate replies inside the RSVP item
      const cleanReplies: RSVPReply[] = [];
      if (Array.isArray(item.replies)) {
        for (const rep of item.replies) {
          if (!rep) continue;
          const isRepDup = cleanReplies.some((existingRep) => {
            if (existingRep.id && rep.id && existingRep.id === rep.id) return true;
            return (
              String(existingRep.nama || '').trim().toLowerCase() === String(rep.nama || '').trim().toLowerCase() &&
              String(existingRep.pesan || '').trim().toLowerCase() === String(rep.pesan || '').trim().toLowerCase()
            );
          });
          if (!isRepDup) cleanReplies.push(rep);
        }
      }

      result.push({
        ...item,
        replies: cleanReplies,
      });
    }
  }
  return result;
};

// In-flight request lock to avoid double submissions within short interval
const inFlightRSVPKeys = new Set<string>();

export const addRSVPToInvitation = (
  invitationId: string,
  record: Omit<RSVPRecord, 'id' | 'createdAt' | 'invitationId'>
): RSVPRecord => {
  const all = getStoredInvitations();
  const target = all.find((i) => i.id === invitationId || i.slug === invitationId);
  const trimmedName = record.nama.trim();
  const trimmedMessage = record.pesanDoa.trim();

  // Check if an identical RSVP already exists locally
  const existing = (target?.rsvpList || []).find((r) => {
    return (
      r.nama.trim().toLowerCase() === trimmedName.toLowerCase() &&
      r.pesanDoa.trim().toLowerCase() === trimmedMessage.toLowerCase()
    );
  });
  if (existing) {
    return existing;
  }

  const newRecord: RSVPRecord = {
    ...record,
    nama: trimmedName,
    pesanDoa: trimmedMessage,
    id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    invitationId: target ? target.id : invitationId,
    createdAt: new Date().toISOString(),
  };

  if (target) {
    target.rsvpList = deduplicateRSVPList([newRecord, ...(target.rsvpList || [])]);
    const existingIdx = all.findIndex((i) => i.id === target.id);
    if (existingIdx >= 0) {
      all[existingIdx] = target;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      } catch (e) {
        console.warn('Local storage write warning:', e);
      }
    }
  }

  return newRecord;
};

/**
 * Async version of RSVP submission that awaits the server confirmation and returns updated rsvpList
 * Safely guards against duplicate clicks, network duplicates, and race conditions
 */
export const submitRSVPAsync = async (
  invitationId: string,
  record: Omit<RSVPRecord, 'id' | 'createdAt' | 'invitationId'>
): Promise<{ rsvp: RSVPRecord; rsvpList: RSVPRecord[] }> => {
  const trimmedName = record.nama.trim();
  const trimmedMessage = record.pesanDoa.trim();
  const dedupKey = `${invitationId}_${trimmedName.toLowerCase()}_${trimmedMessage.toLowerCase()}`;

  // If identical RSVP is currently in flight, return current state to prevent double submit
  if (inFlightRSVPKeys.has(dedupKey)) {
    const all = getStoredInvitations();
    const target = all.find((i) => i.id === invitationId || i.slug === invitationId);
    const existing = (target?.rsvpList || []).find(
      (r) =>
        r.nama.trim().toLowerCase() === trimmedName.toLowerCase() &&
        r.pesanDoa.trim().toLowerCase() === trimmedMessage.toLowerCase()
    );
    return {
      rsvp: existing || {
        ...record,
        id: 'rsvp-pending',
        invitationId,
        createdAt: new Date().toISOString(),
      },
      rsvpList: deduplicateRSVPList(target?.rsvpList || []),
    };
  }

  inFlightRSVPKeys.add(dedupKey);
  // Auto-expire lock after 5 seconds
  setTimeout(() => inFlightRSVPKeys.delete(dedupKey), 5000);

  const localRsvp = addRSVPToInvitation(invitationId, record);
  const all = getStoredInvitations();
  const target = all.find((i) => i.id === invitationId || i.slug === invitationId);
  let rsvpList = deduplicateRSVPList(target?.rsvpList || [localRsvp]);

  if (typeof fetch !== 'undefined') {
    try {
      const res = await fetch(`/api/invitations/${encodeURIComponent(invitationId)}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: trimmedName,
          status: record.status,
          jumlahTamu: record.jumlahTamu,
          pesanDoa: trimmedMessage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.rsvpList)) {
          rsvpList = deduplicateRSVPList(data.rsvpList);
          const latestAll = getStoredInvitations();
          const latestTarget = latestAll.find((i) => i.id === invitationId || i.slug === invitationId);
          if (latestTarget) {
            latestTarget.rsvpList = rsvpList;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(latestAll));
          }
          return { rsvp: data.rsvp || localRsvp, rsvpList };
        }
      }
    } catch (err) {
      console.warn('Network sync notice for RSVP:', err);
    }
  }

  return { rsvp: localRsvp, rsvpList };
};

/**
 * Fetch the latest live RSVP list from the server for real-time wishes feed
 */
export const fetchRSVPListAsync = async (invitationId: string): Promise<RSVPRecord[]> => {
  if (typeof fetch !== 'undefined') {
    try {
      const res = await fetch(`/api/invitations/${encodeURIComponent(invitationId)}/rsvp`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.rsvpList)) {
          const cleanList = deduplicateRSVPList(data.rsvpList);
          const all = getStoredInvitations();
          const target = all.find((i) => i.id === invitationId || i.slug === invitationId);
          if (target) {
            target.rsvpList = cleanList;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
          }
          return cleanList;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch latest RSVPs from server:', err);
    }
  }

  const all = getStoredInvitations();
  const target = all.find((i) => i.id === invitationId || i.slug === invitationId);
  return deduplicateRSVPList(target?.rsvpList || []);
};

/**
 * Submit a reply to a specific RSVP wish and synchronize with server
 */
export const submitRSVPReplyAsync = async (
  invitationId: string,
  rsvpId: string,
  reply: { nama: string; pesan: string; isHost?: boolean }
): Promise<{ reply: RSVPReply; rsvpList: RSVPRecord[] }> => {
  const all = getStoredInvitations();
  const target = all.find((i) => i.id === invitationId || i.slug === invitationId);
  const trimmedName = reply.nama.trim();
  const trimmedMessage = reply.pesan.trim();

  const newReply: RSVPReply = {
    id: 'reply-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    rsvpId,
    nama: trimmedName,
    pesan: trimmedMessage,
    isHost: Boolean(reply.isHost),
    createdAt: new Date().toISOString(),
  };

  if (target && Array.isArray(target.rsvpList)) {
    const rsvp = target.rsvpList.find((r) => r.id === rsvpId);
    if (rsvp) {
      const existingReplies = rsvp.replies || [];
      const alreadyExists = existingReplies.some(
        (rep) =>
          rep.nama.trim().toLowerCase() === trimmedName.toLowerCase() &&
          rep.pesan.trim().toLowerCase() === trimmedMessage.toLowerCase()
      );
      if (!alreadyExists) {
        rsvp.replies = [...existingReplies, newReply];
        const existingIdx = all.findIndex((i) => i.id === target.id);
        if (existingIdx >= 0) {
          all[existingIdx] = target;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
          } catch (e) {
            console.warn('Local storage write warning:', e);
          }
        }
      }
    }
  }

  let rsvpList = deduplicateRSVPList(target?.rsvpList || []);

  if (typeof fetch !== 'undefined') {
    try {
      const res = await fetch(
        `/api/invitations/${encodeURIComponent(invitationId)}/rsvp/${encodeURIComponent(rsvpId)}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: trimmedName,
            pesan: trimmedMessage,
            isHost: reply.isHost,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.rsvpList)) {
          rsvpList = deduplicateRSVPList(data.rsvpList);
          const latestAll = getStoredInvitations();
          const latestTarget = latestAll.find((i) => i.id === invitationId || i.slug === invitationId);
          if (latestTarget) {
            latestTarget.rsvpList = rsvpList;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(latestAll));
          }
          return { reply: data.reply || newReply, rsvpList };
        }
      }
    } catch (err) {
      console.warn('Network sync notice for RSVP reply:', err);
    }
  }

  return { reply: newReply, rsvpList };
};

export const incrementViewCount = (invitationId: string): void => {
  const all = getStoredInvitations();
  const target = all.find((i) => i.id === invitationId || i.slug === invitationId);
  if (target) {
    target.viewsCount = (target.viewsCount || 0) + 1;
    saveInvitationToStorage(target);
  }
};

export const createNewInvitationFromTemplate = (
  template: TemplateDefinition,
  customData?: Partial<InvitationData>
): InvitationData => {
  const uniqueId = 'inv-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);
  const dateStr = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let greetingTitle = "Walimatul 'Ursy";
  let quoteText = 'Maha Suci Allah yang telah menciptakan manusia berpasang-pasangan. Semoga Allah memberkahi ikatan suci ini hingga surga-Nya.';
  let quoteSource = 'Doa Restu Pernikahan';
  let heroSubtitle = 'Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dalam perayaan pernikahan kami:';

  if (template.id === 'islami-mubarak') {
    greetingTitle = "Walimatul 'Ursy";
    quoteText = 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.';
    quoteSource = 'Q.S. Ar-Rum: 21';
    heroSubtitle = 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan syukuran pernikahan kami:';
  } else if (template.id === 'floral-garden') {
    greetingTitle = 'The Wedding Celebration';
    quoteText = 'Dua jiwa yang dipersatukan dalam ikrar suci, melangkah bersama merajut hari-hari penuh cinta, tawa, dan kebahagiaan abadi.';
    quoteSource = 'Cinta Abadi';
    heroSubtitle = 'Bersama semerbak kebahagiaan, kami mengundang Anda untuk turut merayakan momen terindah dalam hidup kami:';
  } else if (template.id === 'luxury-black') {
    greetingTitle = 'Royal Wedding Reception';
    quoteText = 'Gravitasi cinta menyatukan dua takdir dalam satu simfoni malam yang megah, abadi, dan penuh keanggunan.';
    quoteSource = 'Symphony of Love';
    heroSubtitle = 'Merupakan suatu kehormatan yang mendalam mengundang Bapak/Ibu/Saudara/i dalam malam resepsi perayaan kami:';
  } else if (template.id === 'minimalis-modern') {
    greetingTitle = 'Together Forever';
    quoteText = 'Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.';
    quoteSource = 'Lao Tzu';
    heroSubtitle = 'Kami mengundang Anda untuk menjadi bagian dari awal lembaran baru perjalanan cinta kami:';
  } else if (template.id === 'modern-lilac') {
    greetingTitle = 'A Dream Come True';
    quoteText = 'Kisah cinta terindah bukanlah yang tanpa cela, melainkan dua hati yang senantiasa memilih untuk saling menjaga dalam setiap masa.';
    quoteSource = 'Janji Setia';
    heroSubtitle = 'Dalam suka cita dan rasa syukur, kami mengundang Anda untuk berbagi kebahagiaan di hari istimewa kami:';
  } else if (template.id === 'rustic-terracotta') {
    greetingTitle = 'A Sacred Union';
    quoteText = 'Di bawah naungan semesta dan restu keluarga, kami merayakan tumbuhnya cinta yang sederhana, tulus, dan abadi selamanya.';
    quoteSource = 'Harmoni Semesta';
    heroSubtitle = 'Dengan penuh kehangatan hati, kami mengundang sahabat dan keluarga untuk merayakan ikatan janji suci kami:';
  } else if (template.id === 'soft-nautical') {
    greetingTitle = 'Sail Away With Love';
    quoteText = 'Bagaikan bahtera yang berlayar di samudra tenang, kompas hati kami senantiasa menuntun pada satu pelabuhan: cinta sejati.';
    quoteSource = 'Samudra Asmara';
    heroSubtitle = 'Melabuhkan janji suci ke dermaga bahagia, kami mengundang Anda untuk menjadi saksi ikrar cinta kami:';
  }

  const newInvitation: InvitationData = {
    id: uniqueId,
    slug: customData?.slug || `undangan-${Date.now().toString(36)}`,
    title: customData?.title || 'Undangan Pernikahan Kita',
    category: (customData?.category as any) || 'wedding',
    isPublished: customData?.isPublished !== undefined ? customData.isPublished : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewsCount: 1,
    greetingTitle: customData?.greetingTitle || greetingTitle,
    quoteText: customData?.quoteText || quoteText,
    quoteSource: customData?.quoteSource || quoteSource,
    heroSubtitle: customData?.heroSubtitle || heroSubtitle,
    coverPhotoUrl: template.thumbnail,
    mempelaiPria: {
      namaLengkap: customData?.mempelaiPria?.namaLengkap || '',
      namaPanggilan: customData?.mempelaiPria?.namaPanggilan || '',
      orangTua: customData?.mempelaiPria?.orangTua || '',
      anakKe: customData?.mempelaiPria?.anakKe || '',
      instagram: customData?.mempelaiPria?.instagram || '',
      fotoUrl: customData?.mempelaiPria?.fotoUrl || '',
    },
    mempelaiWanita: {
      namaLengkap: customData?.mempelaiWanita?.namaLengkap || '',
      namaPanggilan: customData?.mempelaiWanita?.namaPanggilan || '',
      orangTua: customData?.mempelaiWanita?.orangTua || '',
      anakKe: customData?.mempelaiWanita?.anakKe || '',
      instagram: customData?.mempelaiWanita?.instagram || '',
      fotoUrl: customData?.mempelaiWanita?.fotoUrl || '',
    },
    events: customData?.events || [
      {
        id: 'evt-1',
        namaAcara: 'Akad Nikah / Pemberkatan',
        tanggal: dateStr,
        waktuMulai: '08:00',
        waktuSelesai: '10:00',
        zonaWaktu: 'WIB',
        namaTempat: '',
        alamat: '',
        linkGoogleMaps: '',
      },
      {
        id: 'evt-2',
        namaAcara: 'Resepsi Pernikahan',
        tanggal: dateStr,
        waktuMulai: '11:00',
        waktuSelesai: '14:00',
        zonaWaktu: 'WIB',
        namaTempat: '',
        alamat: '',
        linkGoogleMaps: '',
      },
    ],
    loveStories: customData?.loveStories || [],
    gallery: customData?.gallery || [],
    bankAccounts: customData?.bankAccounts || [],
    giftAddress: customData?.giftAddress || {
      penerima: '',
      nomorTelepon: '',
      alamatLengkap: '',
      catatanKurir: '',
    },
    rsvpList: [],
    theme: { ...template.defaultTheme },
    music: {
      enabled: true,
      autoPlay: true,
      title: 'Lagu Pernikahan',
      artist: 'Musik Pilihan',
      audioUrl: '',
    },
    pesanPenutup: 'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    protokolKesehatan: true,
    ...customData,
  };

  return newInvitation;
};
