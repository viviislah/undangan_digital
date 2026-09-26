export type InvitationCategory = 'wedding' | 'birthday' | 'engagement' | 'khitan' | 'event';

export type AttendanceStatus = 'attending' | 'not_attending' | 'uncertain';

export interface PersonProfile {
  namaLengkap: string;
  namaPanggilan: string;
  orangTua: string;
  anakKe?: string;
  instagram?: string;
  fotoUrl: string;
}

export interface EventSchedule {
  id: string;
  namaAcara: string; // e.g. "Akad Nikah", "Pemberkatan", "Resepsi Siang", "Tasyakuran"
  tanggal: string; // ISO date YYYY-MM-DD
  waktuMulai: string; // HH:mm
  waktuSelesai: string; // HH:mm atau "Selesai"
  zonaWaktu: string; // WIB, WITA, WIT
  namaTempat: string;
  alamat: string;
  linkGoogleMaps: string;
  latitude?: number;
  longitude?: number;
}

export interface LoveStoryStep {
  id: string;
  tahun: string;
  judul: string;
  cerita: string;
  fotoUrl?: string;
  // Font & visual color customization
  judulColor?: string;
  ceritaColor?: string;
  tahunColor?: string;
  badgeBgColor?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface BankAccount {
  id: string;
  namaBank: string; // BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, QRIS
  nomorRekening: string;
  atasNama: string;
  catatan?: string;
}

export interface GiftAddress {
  penerima: string;
  nomorTelepon: string;
  alamatLengkap: string;
  catatanKurir?: string;
}

export interface RSVPReply {
  id: string;
  rsvpId: string;
  nama: string;
  pesan: string;
  isHost?: boolean;
  createdAt: string;
}

export interface RSVPRecord {
  id: string;
  invitationId: string;
  nama: string;
  status: AttendanceStatus;
  jumlahTamu: number;
  pesanDoa: string;
  createdAt: string;
  replies?: RSVPReply[];
}

export interface GuestRecord {
  id: string;
  nama: string;
  panggilan: string; // e.g. "Yth. Bapak/Ibu"
  whatsApp?: string;
  statusUndangan: 'pending' | 'sent' | 'opened';
  createdAt: string;
}

export interface AttachedIconSticker {
  id: string;
  icon: 'rings' | 'heart-pulse' | 'dove' | 'bismillah' | 'crown' | 'sparkles' | 'champagne' | 'rose' | 'butterfly' | 'infinity';
  label?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'cover-center' | 'floating-bottom-right';
  animation: 'pulse' | 'bounce' | 'rotate-slow' | 'float-sway' | 'glow';
  color?: string;
  size?: 'small' | 'medium' | 'large';
  enabled?: boolean;
}

export interface ThemeConfig {
  templateId: string;
  primaryColor: string; // Hex e.g. #D4AF37
  secondaryColor: string; // Hex
  bgColor: string; // e.g. #FAF7F2 or #121212
  textColor: string;
  fontDisplay: 'font-serif-display' | 'font-cinzel' | 'font-script' | 'font-brush' | 'font-sans-clean' | 'font-italiana' | 'font-parisienne' | 'font-garamond' | 'font-sacramento';
  fontBody: 'font-sans-clean' | 'font-serif-display' | 'font-garamond' | 'font-italiana' | 'font-cinzel';
  borderStyle: 'classic-gold' | 'minimal' | 'floral' | 'islamic' | 'modern-card' | 'rounded';
  ornamentStyle: 'leaves' | 'arabesque' | 'geometric' | 'sparkles' | 'none';
  backgroundPattern?: 'dots' | 'damask' | 'stars' | 'subtle-lines' | 'none';
  coverBlur?: number; // Blur in pixels

  // Typography color & size customization
  headingColor?: string; // Hex color for titles & headings
  quoteColor?: string; // Hex color for quote & verses
  storyHeadingColor?: string; // Hex color for Love Story headings & titles
  storyTextColor?: string; // Hex color for Love Story narrative body text
  storyYearColor?: string; // Hex color for Love Story year tags & marker dot
  storyBadgeBgColor?: string; // Hex color for Love Story year badge background
  headingSize?: 'compact' | 'normal' | 'large' | 'xlarge'; // Font size scale for headings
  bodySize?: 'compact' | 'normal' | 'large'; // Font size scale for body text

  // Animation options
  openingAnimationOverride?: string; // Custom opening animation
  ambientEffect?: 'petals' | 'sparkles' | 'hearts' | 'butterflies' | 'fireflies' | 'bubbles' | 'none'; // Particle effect
  entranceAnimation?: 'fade-up' | 'zoom-in' | 'slide-up' | 'bounce-subtle' | 'glow-reveal'; // Scroll entrance

  // Animated icon stickers attached to invitation
  attachedStickers?: AttachedIconSticker[];

  // Couple photo display shape (portrait frame format)
  couplePhotoShape?: 'portrait' | 'arch' | 'rounded' | 'dome' | 'square' | 'circle';
}

export interface MusicConfig {
  enabled: boolean;
  autoPlay: boolean;
  title: string;
  artist: string;
  audioUrl?: string;
  presetId?: string;
}

export interface InvitationData {
  id: string;
  templateId?: string;
  slug: string; // URL identifier e.g. "rizky-amanda"
  title: string; // e.g. "The Wedding of Rizky & Amanda"
  category: InvitationCategory;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;

  // General & Greeting
  greetingTitle: string; // e.g. "Walimatul 'Ursy" or "Wedding Celebration"
  quoteText: string; // Romantic quote or religious verse
  quoteSource: string; // e.g. "Q.S Ar-Rum: 21" or "Kahlil Gibran"
  heroSubtitle: string; // e.g. "Kami mengundang Anda untuk merayakan cinta kami"
  coverPhotoUrl: string;

  // Couple Info (or Single Honoree for birthday/khitan)
  mempelaiPria: PersonProfile;
  mempelaiWanita: PersonProfile;

  // Events (Akad, Resepsi, etc)
  events: EventSchedule[];

  // Love Story / Highlights
  loveStories: LoveStoryStep[];

  // Photos
  gallery: GalleryPhoto[];

  // Digital Envelope & Gifts
  bankAccounts: BankAccount[];
  giftAddress: GiftAddress;

  // Live RSVP & Wishes
  rsvpList: RSVPRecord[];
  guests?: GuestRecord[];

  // Customization & Media
  theme: ThemeConfig;
  music: MusicConfig;

  // Protocol & Note
  pesanPenutup: string;
  protokolKesehatan: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
  accentBadge: string;
  defaultTheme: ThemeConfig;
  previewFeatures: string[];
}

export interface TemplateTransitionConfig {
  variants: {
    initial: Record<string, any>;
    animate: Record<string, any>;
    exit: Record<string, any>;
  };
  transition: {
    duration?: number;
    ease?: number[] | string;
    type?: string;
    damping?: number;
    stiffness?: number;
  };
  navigationBadge: string;
  feelDescription: string;
}

export const TEMPLATE_TRANSITION_VARIANTS: Record<string, TemplateTransitionConfig> = {
  'elegant-gold': {
    variants: {
      initial: { opacity: 0, scale: 0.94, y: 32, filter: 'blur(6px)' },
      animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 1.05, y: -24, filter: 'blur(8px)' },
    },
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
    navigationBadge: 'Transisi Royal Grandeur',
    feelDescription: 'Elevasi megah dengan kehalusan emas bangsawan',
  },
  'luxury-black': {
    variants: {
      initial: { opacity: 0, scale: 0.88, filter: 'brightness(1.5) contrast(1.2)' },
      animate: { opacity: 1, scale: 1, filter: 'brightness(1) contrast(1)' },
      exit: { opacity: 0, scale: 1.12, filter: 'brightness(0.3) blur(4px)' },
    },
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
    navigationBadge: 'Transisi Noir Sinematik',
    feelDescription: 'Fokus lensa dramatis dan kedalaman kontras hitam obsidian',
  },
  'floral-garden': {
    variants: {
      initial: { opacity: 0, scale: 0.96, rotate: -2, y: 28 },
      animate: { opacity: 1, scale: 1, rotate: 0, y: 0 },
      exit: { opacity: 0, scale: 0.92, rotate: 2, y: -20 },
    },
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 140,
    },
    navigationBadge: 'Transisi Kelopak Bunga Lembut',
    feelDescription: 'Ayunan organik manis seperti kelopak mawar yang melayang',
  },
  'islami-mubarak': {
    variants: {
      initial: { opacity: 0, y: 48, scale: 0.97 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -36, scale: 0.98 },
    },
    transition: {
      duration: 0.52,
      ease: [0.25, 0.1, 0.25, 1],
    },
    navigationBadge: 'Transisi Kubah Sakinah',
    feelDescription: 'Pengangkatan vertikal teduh laksana pilar kubah suci',
  },
  'minimalis-modern': {
    variants: {
      initial: { opacity: 0, x: 42, skewX: -1.5 },
      animate: { opacity: 1, x: 0, skewX: 0 },
      exit: { opacity: 0, x: -42, skewX: 1.5 },
    },
    transition: {
      duration: 0.42,
      ease: [0.33, 1, 0.68, 1],
    },
    navigationBadge: 'Transisi Editorial Modern',
    feelDescription: 'Geseran linier tegas, bersih, dan berwibawa khas studio desain',
  },
  'modern-lilac': {
    variants: {
      initial: { opacity: 0, scale: 1.08, rotate: 1.8, filter: 'blur(5px)' },
      animate: { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 0.9, rotate: -1.8, filter: 'blur(6px)' },
    },
    transition: {
      duration: 0.56,
      ease: [0.34, 1.56, 0.64, 1],
    },
    navigationBadge: 'Transisi Lilac Ethereal',
    feelDescription: 'Putaran halus memikat berbalut pendaran nebula lavender impian',
  },
  'rustic-terracotta': {
    variants: {
      initial: { opacity: 0, y: -38, scaleY: 0.92, originY: 0 },
      animate: { opacity: 1, y: 0, scaleY: 1, originY: 0 },
      exit: { opacity: 0, y: 32, scaleY: 0.94, originY: 1 },
    },
    transition: {
      duration: 0.5,
      ease: [0.22, 0.61, 0.36, 1],
    },
    navigationBadge: 'Transisi Lembaran Senja',
    feelDescription: 'Guliran lembaran kertas terakota alami dengan kehangatan senja',
  },
  'soft-nautical': {
    variants: {
      initial: { opacity: 0, y: 36, x: -16, rotate: -1 },
      animate: { opacity: 1, y: 0, x: 0, rotate: 0 },
      exit: { opacity: 0, y: -28, x: 16, rotate: 1 },
    },
    transition: {
      duration: 0.58,
      ease: [0.19, 1, 0.22, 1],
    },
    navigationBadge: 'Transisi Gelombang Samudra',
    feelDescription: 'Luncuran dinamis laksana deburan ombak berpadu horizon laut biru',
  },
  'vintage-rose': {
    variants: {
      initial: { opacity: 0, scale: 0.95, y: 40, filter: 'sepia(0.5)' },
      animate: { opacity: 1, scale: 1, y: 0, filter: 'sepia(0)' },
      exit: { opacity: 0, scale: 1.05, y: -30, filter: 'sepia(0.5)' },
    },
    transition: {
      duration: 0.58,
      ease: [0.25, 1, 0.5, 1],
    },
    navigationBadge: 'Transisi Rosewood Klasik',
    feelDescription: 'Slide beludru merah mawar berpadu kehangatan nuansa klasik vintage Eropa',
  },
  'emerald-forest': {
    variants: {
      initial: { opacity: 0, scale: 0.97, y: 24, rotate: 0.8 },
      animate: { opacity: 1, scale: 1, y: 0, rotate: 0 },
      exit: { opacity: 0, scale: 0.95, y: -24, rotate: -0.8 },
    },
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 120,
    },
    navigationBadge: 'Transisi Daun Hutan Zamrud',
    feelDescription: 'Ayunan lembut dedaunan hutan segar dengan keanggunan hijau zamrud',
  },
  'cherry-blossom': {
    variants: {
      initial: { opacity: 0, scale: 0.92, rotate: -3, x: -20 },
      animate: { opacity: 1, scale: 1, rotate: 0, x: 0 },
      exit: { opacity: 0, scale: 1.08, rotate: 3, x: 20 },
    },
    transition: {
      duration: 0.6,
      ease: [0.34, 1.3, 0.64, 1],
    },
    navigationBadge: 'Transisi Angin Sakura',
    feelDescription: 'Embusan lembut musim semi sakura romantis bergaya kelopak melayang',
  },
  'vintage-sepia': {
    variants: {
      initial: { opacity: 0, scale: 0.98, filter: 'contrast(0.8) sepia(0.8)' },
      animate: { opacity: 1, scale: 1, filter: 'contrast(1) sepia(0)' },
      exit: { opacity: 0, scale: 1.02, filter: 'contrast(0.8) sepia(0.8)' },
    },
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
    navigationBadge: 'Transisi Sepia Memori',
    feelDescription: 'Tampilan tenang nan eksklusif laksana membuka lembar memori lama bernuansa hangat',
  },
  'crimson-emperor': {
    variants: {
      initial: { opacity: 0, scaleX: 0.9, rotateY: -15 },
      animate: { opacity: 1, scaleX: 1, rotateY: 0 },
      exit: { opacity: 0, scaleX: 1.1, rotateY: 15 },
    },
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
    navigationBadge: 'Transisi Kipas Kencana',
    feelDescription: 'Pekarangan istana kirmizi megah yang terbuka simetris sarat makna keberuntungan',
  },
  'pastel-peach': {
    variants: {
      initial: { opacity: 0, scale: 0.85, y: 15 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.85, y: -15 },
    },
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 160,
    },
    navigationBadge: 'Transisi Awan Peach Ceria',
    feelDescription: 'Ayunan membal yang ceria, segar, hangat, dan bersahabat',
  },
  'royal-purple': {
    variants: {
      initial: { opacity: 0, y: 50, scale: 0.96, filter: 'hue-rotate(-15deg)' },
      animate: { opacity: 1, y: 0, scale: 1, filter: 'hue-rotate(0deg)' },
      exit: { opacity: 0, y: -40, scale: 1.04, filter: 'hue-rotate(15deg)' },
    },
    transition: {
      duration: 0.6,
      ease: [0.25, 0.8, 0.25, 1],
    },
    navigationBadge: 'Transisi Amethyst Ningrat',
    feelDescription: 'Pengangkatan vertikal beludru aristokrat dengan kilau pendar keunguan yang mewah',
  },
};

export function getTemplateTransition(templateId?: string): TemplateTransitionConfig {
  if (templateId && TEMPLATE_TRANSITION_VARIANTS[templateId]) {
    return TEMPLATE_TRANSITION_VARIANTS[templateId];
  }
  return TEMPLATE_TRANSITION_VARIANTS['elegant-gold'];
}
