import React, { useState } from 'react';
import { resolveExternalMediaUrl } from '../services/imageService';

interface FacthLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'color';
  showSubtitle?: boolean;
}

export const FacthLogo: React.FC<FacthLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'light',
  showSubtitle = false,
}) => {
  const [loadError, setLoadError] = useState(false);

  // Height mappings based on size
  const heightClasses = {
    xs: 'h-7 sm:h-8',
    sm: 'h-9 sm:h-10',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-28',
  }[size] || 'h-10';

  // For light backgrounds (e.g. top Navbar), use dark stone logo
  // For dark backgrounds (e.g. footer), use white logo
  const rawLogo = theme === 'dark' ? '/facth-logo-white.png' : '/facth-logo-dark.png';
  const logoSrc = resolveExternalMediaUrl(rawLogo);
  const fallbackSrc = resolveExternalMediaUrl('/facth-logo.png');

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={loadError ? fallbackSrc : logoSrc}
        alt="Facth Printing"
        className={`${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
        loading="eager"
        decoding="async"
        onError={() => setLoadError(true)}
      />

      {showSubtitle && (
        <div className="flex flex-col border-l border-stone-300 pl-2">
          <span className={`font-serif-display text-xs font-bold tracking-wider leading-none ${
            theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
          }`}>
            Visthetic
          </span>
          <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${
            theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
          }`}>
            facth printing
          </span>
        </div>
      )}
    </div>
  );
};
