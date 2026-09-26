// Theme-specific Opening Animation Styles & Motion Profiles
// Each template gets an entirely unique, high-craft opening animation experience:
// 1. elegant-gold: 'royal-curtain' - Royal double door split opening to the sides with golden crest flash
// 2. luxury-black: 'shutter-aperture' - Cinematic dark zoom-depth aperture + gold ring expansion
// 3. floral-garden: 'blooming-envelope' - Envelope top flap unfolding upwards with rose petal flutter
// 4. islami-mubarak: 'dome-arch-reveal' - Sacred Islamic dome arch gate expanding with emerald glow
// 5. minimalis-modern: 'editorial-split' - High-fashion editorial clean vertical slice fade with typography slide
// 6. modern-lilac: 'fairy-sparkle-zoom' - Dreamy fairy-tale swirl zoom & star twinkle dissipation
// 7. rustic-terracotta: 'terracotta-scroll' - Earthy warm scroll unrolling downwards with gentle parchment curl
// 8. soft-nautical: 'ocean-wave-slide' - Majestic navy sea horizon cresting slide with cool silver refraction

export type OpeningAnimationType =
  | 'royal-curtain'
  | 'shutter-aperture'
  | 'blooming-envelope'
  | 'dome-arch-reveal'
  | 'editorial-split'
  | 'fairy-sparkle-zoom'
  | 'terracotta-scroll'
  | 'ocean-wave-slide'
  | 'book-flip'
  | 'sparkle-burst';

export interface ThemeOpeningAnimationConfig {
  type: OpeningAnimationType;
  label: string;
  badge: string;
  duration: number; // in seconds
  soundPreset: string;
  description: string;
}

export const ALL_OPENING_ANIMATIONS_LIST: ThemeOpeningAnimationConfig[] = [
  {
    type: 'royal-curtain',
    label: 'Royal Gate Split',
    badge: 'Pintu Gerbang Istana',
    duration: 1.15,
    soundPreset: 'romantic-harp',
    description: 'Pintu gerbang kembar terbuka ke kiri dan kanan dengan kilau emas megah.',
  },
  {
    type: 'blooming-envelope',
    label: 'Blooming Envelope Flap',
    badge: 'Amplop Kelopak Mekar',
    duration: 1.2,
    soundPreset: 'sweet-music-box',
    description: 'Amplop berornamen floral terbuka ke atas diiringi kelopak mawar berguguran.',
  },
  {
    type: 'shutter-aperture',
    label: 'Cinematic Noir Zoom',
    badge: 'Aperture Sinematik',
    duration: 1.1,
    soundPreset: 'acoustic-guitar',
    description: 'Fokus lensa kamera sinematik dengan cincin emas meluas secara dramatis.',
  },
  {
    type: 'dome-arch-reveal',
    label: 'Sacred Dome Arch',
    badge: 'Kubah Lengkung Syar’i',
    duration: 1.15,
    soundPreset: 'islamic-nasheed',
    description: 'Kubah lengkung suci terangkat anggun memancarkan pendar cahaya zamrud.',
  },
  {
    type: 'book-flip',
    label: '3D Book Fold Flip',
    badge: 'Buku Lipatan 3D',
    duration: 1.2,
    soundPreset: 'acoustic-guitar',
    description: 'Cover surat terbuka ke samping seperti lembaran buku / kartu undangan fisik 3D.',
  },
  {
    type: 'sparkle-burst',
    label: 'Golden Starlight Burst',
    badge: 'Ledakan Kilau Bintang',
    duration: 1.05,
    soundPreset: 'sweet-music-box',
    description: 'Cahaya benderang bintang emas meledak memancarkan pendar pesta berkilau.',
  },
  {
    type: 'editorial-split',
    label: 'Architectural Slide',
    badge: 'Editorial Modernist',
    duration: 0.9,
    soundPreset: 'acoustic-guitar',
    description: 'Transisi minimalis tegas, bersih, modern, dan bergaya majalah fashion.',
  },
  {
    type: 'fairy-sparkle-zoom',
    label: 'Fairy Tale Swirl',
    badge: 'Pusaran Peri & Lilac',
    duration: 1.1,
    soundPreset: 'sweet-music-box',
    description: 'Pusaran pendar bintang lavender lembut dengan efek kilau peri impian.',
  },
  {
    type: 'terracotta-scroll',
    label: 'Warm Parchment Unroll',
    badge: 'Gulungan Kertas Senja',
    duration: 1.15,
    soundPreset: 'acoustic-guitar',
    description: 'Surat terakota hangat bergulir anggun ke bawah bernuansa bohemian alami.',
  },
  {
    type: 'ocean-wave-slide',
    label: 'Navy Wave Horizon',
    badge: 'Gelombang Cakrawala',
    duration: 1.1,
    soundPreset: 'ambient-piano',
    description: 'Gelombang biru samudra menyapu ke atas dengan kilau perak tenang.',
  },
];

export const THEME_OPENING_ANIMATIONS: Record<string, ThemeOpeningAnimationConfig> = {
  'elegant-gold': {
    type: 'royal-curtain',
    label: 'Royal Gate Split',
    badge: 'Gerbang Istana Megah',
    duration: 1.15,
    soundPreset: 'romantic-harp',
    description: 'Pintu gerbang emas terbuka ke kiri dan kanan dengan pancaran cahaya megah.',
  },
  'luxury-black': {
    type: 'shutter-aperture',
    label: 'Cinematic Noir Zoom',
    badge: 'Aperture Lensa Noir',
    duration: 1.1,
    soundPreset: 'acoustic-guitar',
    description: 'Fokus kamera sinematik dengan cincin emas berkilau dan efek kedalaman dramatis.',
  },
  'floral-garden': {
    type: 'blooming-envelope',
    label: 'Blooming Petal Flap',
    badge: 'Kelopak Mawar Merekah',
    duration: 1.2,
    soundPreset: 'sweet-music-box',
    description: 'Amplop bunga mekar ke atas diiringi guguran kelopak mawar merah muda.',
  },
  'islami-mubarak': {
    type: 'dome-arch-reveal',
    label: 'Sacred Dome Arch',
    badge: 'Kubah Lengkung Syar’i',
    duration: 1.15,
    soundPreset: 'islamic-nasheed',
    description: 'Kubah lengkung masjid terangkat anggun memancarkan cahaya zamrud sakinah.',
  },
  'minimalis-modern': {
    type: 'editorial-split',
    label: 'Architectural Slide',
    badge: 'Editorial Modernist',
    duration: 0.9,
    soundPreset: 'acoustic-guitar',
    description: 'Transisi minimalis editorial cepat, tegas, bersih, dan berwibawa.',
  },
  'modern-lilac': {
    type: 'fairy-sparkle-zoom',
    label: 'Fairy Tale Swirl',
    badge: 'Pendar Lilac & Bintang',
    duration: 1.1,
    soundPreset: 'sweet-music-box',
    description: 'Pusaran pendar bintang lavender lembut dengan efek kilau peri impian.',
  },
  'rustic-terracotta': {
    type: 'terracotta-scroll',
    label: 'Warm Parchment Unroll',
    badge: 'Gulungan Surat Senja',
    duration: 1.15,
    soundPreset: 'acoustic-guitar',
    description: 'Surat terakota hangat bergulir anggun ke bawah membawa nuansa bohemian alami.',
  },
  'soft-nautical': {
    type: 'ocean-wave-slide',
    label: 'Navy Wave Horizon',
    badge: 'Gelombang Cakrawala Biru',
    duration: 1.1,
    soundPreset: 'ambient-piano',
    description: 'Gelombang biru samudra menyapu ke atas dengan kilau perak dan ketenangan laut.',
  },
  'vintage-rose': {
    type: 'royal-curtain',
    label: 'Velvet Curtain Split',
    badge: 'Gerbang Beludru Mawar',
    duration: 1.2,
    soundPreset: 'romantic-harp',
    description: 'Pintu gerbang beludru mawar merah terbelah ke samping dengan sentuhan emas kuno.',
  },
  'emerald-forest': {
    type: 'ocean-wave-slide',
    label: 'Emerald Canopy Slide',
    badge: 'Luncuran Daun Zamrud',
    duration: 1.15,
    soundPreset: 'ambient-piano',
    description: 'Dedaunan hutan zamrud menyapu lembut menguak keanggunan pelataran pernikahan.',
  },
  'cherry-blossom': {
    type: 'blooming-envelope',
    label: 'Sakura Blooming Flap',
    badge: 'Kelopak Sakura Mekar',
    duration: 1.2,
    soundPreset: 'sweet-music-box',
    description: 'Amplop merah muda mekar ke atas diiringi kelopak sakura berguguran ditiup angin.',
  },
  'vintage-sepia': {
    type: 'terracotta-scroll',
    label: 'Retro Parchment Unroll',
    badge: 'Gulungan Kertas Sepia',
    duration: 1.15,
    soundPreset: 'acoustic-guitar',
    description: 'Guliran kertas perkamen cokelat sepia bernuansa kenangan indah masa lalu.',
  },
  'crimson-emperor': {
    type: 'royal-curtain',
    label: 'Crimson Palace Split',
    badge: 'Kubah Istana Kencana',
    duration: 1.15,
    soundPreset: 'romantic-harp',
    description: 'Gerbang istana merah kirmizi kekaisaran terbuka megah memancarkan aura keberuntungan.',
  },
  'pastel-peach': {
    type: 'fairy-sparkle-zoom',
    label: 'Peach Bubble Swirl',
    badge: 'Pendar Peach Ceria',
    duration: 1.1,
    soundPreset: 'sweet-music-box',
    description: 'Pusaran gelembung peach manis nan ceria bergaya transisi modern yang segar.',
  },
  'royal-purple': {
    type: 'dome-arch-reveal',
    label: 'Royal Amethyst Arch',
    badge: 'Lengkung Amethyst',
    duration: 1.15,
    soundPreset: 'ambient-piano',
    description: 'Kubah lengkung amethyst ungu aristokrat terangkat anggun memancarkan pendar keemasan.',
  },
};

export function getThemeOpeningAnimation(
  templateId?: string,
  overrideAnimation?: string
): ThemeOpeningAnimationConfig {
  if (overrideAnimation) {
    const found = ALL_OPENING_ANIMATIONS_LIST.find((opt) => opt.type === overrideAnimation);
    if (found) return found;
  }
  if (templateId && THEME_OPENING_ANIMATIONS[templateId]) {
    return THEME_OPENING_ANIMATIONS[templateId];
  }
  return THEME_OPENING_ANIMATIONS['elegant-gold'];
}

// Re-export transition configurations from types/invitation to preserve compatibility
export type { TemplateTransitionConfig } from '../types/invitation';
export { TEMPLATE_TRANSITION_VARIANTS, getTemplateTransition } from '../types/invitation';
