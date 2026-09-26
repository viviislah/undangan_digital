// Centralized Wedding Asset System & Theme Visual Profiles
// Structured categories: backgrounds, flowers, ornaments, frames, textures, icons

export interface ThemeVisualAssets {
  id: string;
  name: string;
  categoryTitle: string;
  tagline: string;
  backgrounds: {
    cover: string;
    hero: string;
    quoteBg: string;
    textureUrl?: string;
  };
  palette: {
    primary: string; // Accent color
    secondary: string; // Complementary accent
    bg: string; // Base canvas
    cardBg: string; // Card surface
    cardBorder: string; // Border color
    text: string; // Body text
    heading: string; // Title text
    accentLight: string; // Soft highlight
    glow: string; // Drop shadow glow
  };
  button: {
    gradient: string;
    textColor: string;
    shadow: string;
  };
  countdown: {
    cardBg: string;
    cardBorder: string;
    primaryColor: string;
    labelColor: string;
  };
  cardShapeClass: string;
  frameShapeClass: string;
  petalColor: 'gold' | 'rose' | 'white' | 'emerald' | 'lilac' | 'terracotta' | 'navy';
  ornamentStyle: 'leaves' | 'arabesque' | 'geometric' | 'sparkles' | 'none' | 'floral' | 'terracotta' | 'nautical';
  couplePhotoShape: 'portrait' | 'arch' | 'rounded' | 'dome' | 'square' | 'circle';
  fontDisplay: string;
  bismillahHeading?: boolean;
  isDark?: boolean;
  openingAnimation?: string;
}

export const WEDDING_THEMES: Record<string, ThemeVisualAssets> = {
  'elegant-gold': {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    categoryTitle: 'Kerajaan Mewah',
    tagline: 'The Royal Wedding Celebration',
    backgrounds: {
      cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      hero: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
      quoteBg: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    },
    palette: {
      primary: '#C5A059',
      secondary: '#E6CA85',
      bg: '#FAF7F0',
      cardBg: 'rgba(255, 255, 255, 0.9)',
      cardBorder: 'rgba(197, 160, 89, 0.28)',
      text: '#3D342C',
      heading: '#2A221B',
      accentLight: 'rgba(230, 202, 133, 0.2)',
      glow: 'rgba(197, 160, 89, 0.35)',
    },
    button: {
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #F5DE98 50%, #9B7824 100%)',
      textColor: '#1A1408',
      shadow: '0 8px 25px rgba(212, 175, 55, 0.45)',
    },
    countdown: {
      cardBg: 'rgba(255, 255, 255, 0.12)',
      cardBorder: 'rgba(255, 255, 255, 0.28)',
      primaryColor: '#FEF08A',
      labelColor: 'rgba(254, 240, 138, 0.95)',
    },
    cardShapeClass: 'rounded-3xl',
    frameShapeClass: 'rounded-2xl',
    petalColor: 'gold',
    ornamentStyle: 'leaves',
    couplePhotoShape: 'portrait',
    fontDisplay: 'font-cinzel',
  },

  'luxury-black': {
    id: 'luxury-black',
    name: 'Luxury Black',
    categoryTitle: 'Midnight & Gold Noir',
    tagline: 'Gala Night & Royal Celebration',
    backgrounds: {
      cover: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
      hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      quoteBg: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    },
    palette: {
      primary: '#E5C07B',
      secondary: '#D4AF37',
      bg: '#0D0D11',
      cardBg: 'rgba(22, 22, 28, 0.88)',
      cardBorder: 'rgba(229, 192, 123, 0.32)',
      text: '#E2E4E9',
      heading: '#FFF7E6',
      accentLight: 'rgba(229, 192, 123, 0.18)',
      glow: 'rgba(229, 192, 123, 0.45)',
    },
    button: {
      gradient: 'linear-gradient(135deg, #F5D061 0%, #E5B03A 50%, #9E7412 100%)',
      textColor: '#0B0B0E',
      shadow: '0 8px 30px rgba(229, 192, 123, 0.45)',
    },
    countdown: {
      cardBg: 'rgba(18, 18, 24, 0.75)',
      cardBorder: 'rgba(229, 192, 123, 0.35)',
      primaryColor: '#FDE68A',
      labelColor: 'rgba(253, 230, 138, 0.9)',
    },
    cardShapeClass: 'rounded-2xl',
    frameShapeClass: 'rounded-2xl',
    petalColor: 'gold',
    ornamentStyle: 'geometric',
    couplePhotoShape: 'portrait',
    fontDisplay: 'font-serif-display',
    isDark: true,
  },

  'floral-garden': {
    id: 'floral-garden',
    name: 'Floral Garden',
    categoryTitle: 'Kebun Bunga Romantis',
    tagline: 'A Romantic Floral Tale',
    backgrounds: {
      cover: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
      hero: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85',
      quoteBg: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    },
    palette: {
      primary: '#D9777F',
      secondary: '#889E73',
      bg: '#FFF8F8',
      cardBg: 'rgba(255, 255, 255, 0.92)',
      cardBorder: 'rgba(217, 119, 127, 0.25)',
      text: '#443335',
      heading: '#2D1B1E',
      accentLight: 'rgba(217, 119, 127, 0.16)',
      glow: 'rgba(217, 119, 127, 0.35)',
    },
    button: {
      gradient: 'linear-gradient(135deg, #E11D48 0%, #FB7185 50%, #BE123C 100%)',
      textColor: '#FFFFFF',
      shadow: '0 8px 25px rgba(225, 29, 72, 0.38)',
    },
    countdown: {
      cardBg: 'rgba(255, 241, 242, 0.2)',
      cardBorder: 'rgba(254, 205, 211, 0.45)',
      primaryColor: '#FFE4E6',
      labelColor: 'rgba(254, 205, 211, 0.95)',
    },
    cardShapeClass: 'rounded-[32px]',
    frameShapeClass: 'rounded-2xl',
    petalColor: 'rose',
    ornamentStyle: 'floral',
    couplePhotoShape: 'portrait',
    fontDisplay: 'font-script',
  },

  'islami-mubarak': {
    id: 'islami-mubarak',
    name: 'Islami Mubarak',
    categoryTitle: "Syar'i Zamrud & Emas",
    tagline: 'Walimatul Ursy Barakah',
    backgrounds: {
      cover: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85',
      hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      quoteBg: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    },
    palette: {
      primary: '#0F766E',
      secondary: '#D4AF37',
      bg: '#F0FDF4',
      cardBg: 'rgba(255, 255, 255, 0.94)',
      cardBorder: 'rgba(15, 118, 110, 0.28)',
      text: '#1C332D',
      heading: '#0B2620',
      accentLight: 'rgba(15, 118, 110, 0.15)',
      glow: 'rgba(15, 118, 110, 0.35)',
    },
    button: {
      gradient: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 50%, #0D5C56 100%)',
      textColor: '#FFFFFF',
      shadow: '0 8px 25px rgba(15, 118, 110, 0.4)',
    },
    countdown: {
      cardBg: 'rgba(204, 251, 241, 0.18)',
      cardBorder: 'rgba(94, 234, 212, 0.35)',
      primaryColor: '#CCFBF1',
      labelColor: 'rgba(204, 251, 241, 0.95)',
    },
    cardShapeClass: 'rounded-t-[48px] rounded-b-3xl',
    frameShapeClass: 'rounded-2xl',
    petalColor: 'emerald',
    ornamentStyle: 'arabesque',
    couplePhotoShape: 'arch',
    fontDisplay: 'font-cinzel',
    bismillahHeading: true,
  },

  'minimalis-modern': {
    id: 'minimalis-modern',
    name: 'Minimalis Clean',
    categoryTitle: 'Modernist Monochrome',
    tagline: 'The Minimalist Wedding',
    backgrounds: {
      cover: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=85',
      hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      quoteBg: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
    },
    palette: {
      primary: '#18181B',
      secondary: '#71717A',
      bg: '#F8FAFC',
      cardBg: 'rgba(255, 255, 255, 0.98)',
      cardBorder: 'rgba(226, 232, 240, 0.9)',
      text: '#1E293B',
      heading: '#09090B',
      accentLight: 'rgba(24, 24, 27, 0.06)',
      glow: 'rgba(0, 0, 0, 0.08)',
    },
    button: {
      gradient: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
      textColor: '#FFFFFF',
      shadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
    },
    countdown: {
      cardBg: 'rgba(0, 0, 0, 0.25)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      primaryColor: '#F8FAFC',
      labelColor: 'rgba(241, 245, 249, 0.85)',
    },
    cardShapeClass: 'rounded-xl',
    frameShapeClass: 'rounded-2xl',
    petalColor: 'white',
    ornamentStyle: 'none',
    couplePhotoShape: 'portrait',
    fontDisplay: 'font-serif-display',
  },

  'modern-lilac': {
    id: 'modern-lilac',
    name: 'Soft Lavender',
    categoryTitle: 'Pastel Lilac & Impian',
    tagline: 'A Dreamy Fairy-tale Journey',
    backgrounds: {
      cover: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85',
      hero: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
      quoteBg: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
    palette: {
      primary: '#8B5CF6',
      secondary: '#C4B5FD',
      bg: '#FAF5FF',
      cardBg: 'rgba(255, 255, 255, 0.92)',
      cardBorder: 'rgba(139, 92, 246, 0.22)',
      text: '#3B1A66',
      heading: '#2E1065',
      accentLight: 'rgba(139, 92, 246, 0.12)',
      glow: 'rgba(139, 92, 246, 0.3)',
    },
    button: {
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #6D28D9 100%)',
      textColor: '#FFFFFF',
      shadow: '0 8px 25px rgba(124, 58, 237, 0.38)',
    },
    countdown: {
      cardBg: 'rgba(243, 232, 255, 0.2)',
      cardBorder: 'rgba(216, 180, 254, 0.45)',
      primaryColor: '#F3E8FF',
      labelColor: 'rgba(233, 213, 255, 0.95)',
    },
    cardShapeClass: 'rounded-[32px]',
    frameShapeClass: 'rounded-2xl',
    petalColor: 'lilac',
    ornamentStyle: 'sparkles',
    couplePhotoShape: 'portrait',
    fontDisplay: 'font-brush',
  },

  'rustic-terracotta': {
    id: 'rustic-terracotta',
    name: 'Rustic Terracotta',
    categoryTitle: 'Bohemian Earthy & Sun',
    tagline: 'Warm Bohemian Earth Wedding',
    backgrounds: {
      cover: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=85',
      hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      quoteBg: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    },
    palette: {
      primary: '#C2593F',
      secondary: '#D97706',
      bg: '#FDF8F5',
      cardBg: 'rgba(255, 250, 245, 0.94)',
      cardBorder: 'rgba(194, 89, 63, 0.25)',
      text: '#45261D',
      heading: '#33160E',
      accentLight: 'rgba(194, 89, 63, 0.14)',
      glow: 'rgba(194, 89, 63, 0.35)',
    },
    button: {
      gradient: 'linear-gradient(135deg, #C2593F 0%, #EA580C 50%, #9A3412 100%)',
      textColor: '#FFFFFF',
      shadow: '0 8px 25px rgba(194, 89, 63, 0.42)',
    },
    countdown: {
      cardBg: 'rgba(255, 237, 213, 0.22)',
      cardBorder: 'rgba(254, 215, 170, 0.4)',
      primaryColor: '#FFEDD5',
      labelColor: 'rgba(254, 215, 170, 0.95)',
    },
    cardShapeClass: 'rounded-2xl',
    frameShapeClass: 'rounded-2xl',
    petalColor: 'terracotta',
    ornamentStyle: 'terracotta',
    couplePhotoShape: 'arch',
    fontDisplay: 'font-serif-display',
  },

  'soft-nautical': {
    id: 'soft-nautical',
    name: 'Royal Ocean Navy',
    categoryTitle: 'Bahari Megah & Samudra',
    tagline: 'Sail Away In Eternal Love',
    backgrounds: {
      cover: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=85',
      hero: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=85',
      quoteBg: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
    palette: {
      primary: '#1E3A8A',
      secondary: '#3B82F6',
      bg: '#F0F9FF',
      cardBg: 'rgba(255, 255, 255, 0.94)',
      cardBorder: 'rgba(30, 58, 138, 0.24)',
      text: '#1E293B',
      heading: '#0F172A',
      accentLight: 'rgba(30, 58, 138, 0.12)',
      glow: 'rgba(30, 58, 138, 0.35)',
    },
    button: {
      gradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #172554 100%)',
      textColor: '#FFFFFF',
      shadow: '0 8px 25px rgba(30, 64, 175, 0.42)',
    },
    countdown: {
      cardBg: 'rgba(224, 242, 254, 0.18)',
      cardBorder: 'rgba(186, 230, 253, 0.4)',
      primaryColor: '#E0F2FE',
      labelColor: 'rgba(186, 230, 253, 0.95)',
    },
    cardShapeClass: 'rounded-2xl',
    frameShapeClass: 'rounded-2xl',
    petalColor: 'navy',
    ornamentStyle: 'nautical',
    couplePhotoShape: 'portrait',
    fontDisplay: 'font-cinzel',
  },
};

export function getThemeVisuals(templateId?: string): ThemeVisualAssets {
  if (templateId && WEDDING_THEMES[templateId]) {
    return WEDDING_THEMES[templateId];
  }
  return WEDDING_THEMES['elegant-gold'];
}

// Fallback image link in case any external URL fails
export const FALLBACK_WEDDING_IMG =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80';

// Distinct high-resolution portrait fallbacks for Groom & Bride
export const FALLBACK_GROOM_IMG =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';

export const FALLBACK_BRIDE_IMG =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

