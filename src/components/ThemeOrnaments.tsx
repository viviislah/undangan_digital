import React from 'react';
import { ThemeVisualAssets } from '../data/weddingAssets';

interface ThemeOrnamentProps {
  theme: ThemeVisualAssets;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeTopOrnament: React.FC<ThemeOrnamentProps> = ({
  theme,
  className = '',
  size = 'md',
}) => {
  const primary = theme.palette.primary;
  const secondary = theme.palette.secondary;

  const sizePx = size === 'sm' ? 24 : size === 'lg' ? 44 : 32;

  switch (theme.ornamentStyle) {
    case 'arabesque':
      // Islamic dome & 8-pointed star (Rub el Hizb)
      return (
        <div className={`flex flex-col items-center gap-1 ${className}`}>
          <svg
            width={sizePx * 1.4}
            height={sizePx}
            viewBox="0 0 48 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 2C24 2 27 10 33 13C39 16 46 16 46 16C46 16 39 19 36 24C33 29 32 30 24 30C16 30 15 29 12 24C9 19 2 16 2 16C2 16 9 16 15 13C21 10 24 2 24 2Z"
              stroke={primary}
              strokeWidth="1.2"
              fill={secondary}
              fillOpacity="0.15"
            />
            <circle cx="24" cy="16" r="3" fill={primary} />
          </svg>
        </div>
      );

    case 'floral':
      // Botanical floral wreath
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <svg
            width={sizePx * 1.5}
            height={sizePx}
            viewBox="0 0 54 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M27 7C25 3 21 3 19 6C17 9 19 13 22 15C19 16 16 19 18 22C20 25 24 24 26 21C26 24 29 27 32 25C35 23 34 19 32 17C35 16 37 12 34 9C31 6 28 8 27 11V7Z"
              fill={primary}
              fillOpacity="0.3"
              stroke={primary}
              strokeWidth="1"
            />
            <circle cx="27" cy="16" r="2.5" fill={secondary} />
            <path
              d="M8 16C12 16 16 14 18 12M46 16C42 16 38 14 36 12"
              stroke={primary}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'geometric':
      // Luxury Black Art-Deco diamond
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <svg
            width={sizePx * 1.2}
            height={sizePx}
            viewBox="0 0 40 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="20,2 34,16 20,30 6,16"
              stroke={primary}
              strokeWidth="1.2"
              fill={primary}
              fillOpacity="0.12"
            />
            <polygon points="20,8 28,16 20,24 12,16" stroke={secondary} strokeWidth="1" />
            <line x1="2" y1="16" x2="6" y2="16" stroke={primary} strokeWidth="1.2" />
            <line x1="34" y1="16" x2="38" y2="16" stroke={primary} strokeWidth="1.2" />
          </svg>
        </div>
      );

    case 'sparkles':
      // Modern Lilac celestial twinkle
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <svg
            width={sizePx * 1.3}
            height={sizePx}
            viewBox="0 0 44 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 4C22 12 26 16 34 16C26 16 22 20 22 28C22 20 18 16 10 16C18 16 22 12 22 4Z"
              fill={primary}
              fillOpacity="0.35"
              stroke={primary}
              strokeWidth="1"
            />
            <circle cx="9" cy="8" r="1.5" fill={secondary} />
            <circle cx="35" cy="24" r="1.5" fill={secondary} />
          </svg>
        </div>
      );

    case 'terracotta':
      // Bohemian sunburst & dried palm
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <svg
            width={sizePx * 1.4}
            height={sizePx}
            viewBox="0 0 48 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="24"
              cy="20"
              r="10"
              fill={primary}
              fillOpacity="0.2"
              stroke={primary}
              strokeWidth="1.2"
            />
            <path
              d="M24 6V2M14 9L11 6M34 9L37 6M7 20H3M45 20H41"
              stroke={secondary}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M17 20C17 16.134 20.134 13 24 13C27.866 13 31 16.134 31 20"
              stroke={primary}
              strokeWidth="1"
            />
          </svg>
        </div>
      );

    case 'nautical':
      // Ocean compass star
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <svg
            width={sizePx * 1.2}
            height={sizePx}
            viewBox="0 0 40 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="16" r="12" stroke={secondary} strokeWidth="1" strokeDasharray="2 2" />
            <path
              d="M20 4L22 14L32 16L22 18L20 28L18 18L8 16L18 14L20 4Z"
              fill={primary}
              fillOpacity="0.2"
              stroke={primary}
              strokeWidth="1.2"
            />
            <circle cx="20" cy="16" r="2" fill={secondary} />
          </svg>
        </div>
      );

    case 'none':
      // Minimalist Clean Studio
      return (
        <div className={`flex items-center justify-center gap-1.5 ${className}`}>
          <div className="w-8 h-[1px]" style={{ backgroundColor: primary }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
          <div className="w-8 h-[1px]" style={{ backgroundColor: primary }} />
        </div>
      );

    case 'leaves':
    default:
      // Royal laurel wreath
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <svg
            width={sizePx * 1.4}
            height={sizePx}
            viewBox="0 0 48 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 6C20 10 14 14 6 16C14 18 20 22 24 26C28 22 34 18 42 16C34 14 28 10 24 6Z"
              fill={primary}
              fillOpacity="0.22"
              stroke={primary}
              strokeWidth="1.2"
            />
            <circle cx="24" cy="16" r="2" fill={secondary} />
            <circle cx="15" cy="16" r="1.2" fill={primary} />
            <circle cx="33" cy="16" r="1.2" fill={primary} />
          </svg>
        </div>
      );
  }
};

export const ThemeBismillahHeader: React.FC<{ theme: ThemeVisualAssets }> = ({ theme }) => {
  if (!theme.bismillahHeading) return null;

  return (
    <div className="flex flex-col items-center justify-center py-2 text-center select-none">
      <p
        className="font-serif text-lg sm:text-xl md:text-2xl tracking-wider leading-relaxed"
        style={{ color: theme.palette.primary }}
        dir="rtl"
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
      <div
        className="w-12 h-[1px] my-1"
        style={{
          background: `linear-gradient(to right, transparent, ${theme.palette.secondary}, transparent)`,
        }}
      />
    </div>
  );
};
