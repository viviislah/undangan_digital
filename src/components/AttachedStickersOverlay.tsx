import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttachedIconSticker } from '../types/invitation';
import {
  Heart,
  Sparkles,
  Crown,
  Wine,
  Flame,
  Infinity as InfinityIcon,
} from 'lucide-react';

interface AttachedStickersOverlayProps {
  stickers?: AttachedIconSticker[];
  isCover?: boolean;
  themePrimary?: string;
}

export const AttachedStickersOverlay: React.FC<AttachedStickersOverlayProps> = ({
  stickers = [],
  isCover = false,
  themePrimary = '#D4AF37',
}) => {
  const [clickedStickerId, setClickedStickerId] = useState<string | null>(null);

  if (!stickers || stickers.length === 0) return null;

  const renderIconGraphic = (icon: AttachedIconSticker['icon']) => {
    switch (icon) {
      case 'rings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <circle cx="8" cy="13" r="5" stroke="currentColor" />
            <circle cx="15" cy="11" r="5" stroke="currentColor" />
            <path d="M12 4L13.5 6.5L15 6L14 8L15 10" stroke="currentColor" strokeLinecap="round" />
          </svg>
        );
      case 'heart-pulse':
        return <Heart className="w-full h-full fill-current" />;
      case 'dove':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M21 4c-.9 0-1.8.3-2.5.8L16 6.3V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4.5L5.7 6.2a3.5 3.5 0 0 0-5 4.9L3 13.5V19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2.5l5.3-5.3A3.5 3.5 0 0 0 21 4z" />
          </svg>
        );
      case 'bismillah':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8A8.96 8.96 0 0 0 12 3z" />
            <polygon points="17 4 18.2 6.8 21.2 7 18.9 9 19.6 12 17 10.4 14.4 12 15.1 9 12.8 7 15.8 6.8" />
          </svg>
        );
      case 'crown':
        return <Crown className="w-full h-full fill-current" />;
      case 'sparkles':
        return <Sparkles className="w-full h-full fill-current" />;
      case 'champagne':
        return <Wine className="w-full h-full fill-current" />;
      case 'rose':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.9 1.2 3.5 2.9 4.1L8 15h3v7h2v-7h3l-2.4-4.4c1.7-.6 2.9-2.2 2.9-4.1C16.5 4 14.5 2 12 2zm0 3c.8 0 1.5.7 1.5 1.5S12.8 8 12 8s-1.5-.7-1.5-1.5S11.2 5 12 5z" />
          </svg>
        );
      case 'butterfly':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 7c-1.5-3-5.5-4-8-2-3 2.5-3 8 2 10 2 1 4 0 5-1l1 1 1-1c1 1 3 2 5 1 5-2 5-7.5 2-10-2.5-2-6.5-1-8 2z" />
          </svg>
        );
      case 'infinity':
      default:
        return <InfinityIcon className="w-full h-full" />;
    }
  };

  const getAnimationProps = (anim: AttachedIconSticker['animation']) => {
    switch (anim) {
      case 'pulse':
        return {
          animate: { scale: [1, 1.15, 1], filter: ['drop-shadow(0 0 2px rgba(255,255,255,0.4))', 'drop-shadow(0 0 10px rgba(255,215,0,0.8))', 'drop-shadow(0 0 2px rgba(255,255,255,0.4))'] },
          transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'bounce':
        return {
          animate: { y: [0, -8, 0] },
          transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'rotate-slow':
        return {
          animate: { rotate: 360 },
          transition: { duration: 12, repeat: Infinity, ease: 'linear' as const },
        };
      case 'float-sway':
        return {
          animate: { y: [0, -6, 0], x: [0, 4, 0, -4, 0], rotate: [-4, 4, -4] },
          transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'glow':
      default:
        return {
          animate: { opacity: [0.75, 1, 0.75], scale: [0.98, 1.05, 0.98] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
        };
    }
  };

  const getSizeClasses = (size: AttachedIconSticker['size'] = 'medium') => {
    switch (size) {
      case 'small':
        return { icon: 'w-6 h-6', badge: 'p-1.5 text-[9px]' };
      case 'large':
        return { icon: 'w-10 h-10', badge: 'p-3 text-xs' };
      case 'medium':
      default:
        return { icon: 'w-8 h-8', badge: 'p-2 text-[10px]' };
    }
  };

  const getPositionStyle = (pos: AttachedIconSticker['position']): React.CSSProperties => {
    switch (pos) {
      case 'top-left':
        return { top: '24px', left: '20px' };
      case 'top-right':
        return { top: '24px', right: '20px' };
      case 'bottom-left':
        return { bottom: '24px', left: '20px' };
      case 'bottom-right':
        return { bottom: '24px', right: '20px' };
      case 'cover-center':
        return { top: '65%', left: '50%', transform: 'translateX(-50%)' };
      case 'floating-bottom-right':
      default:
        return { bottom: '80px', right: '18px', zIndex: 40 };
    }
  };

  return (
    <>
      {stickers
        .filter((s) => s.enabled !== false)
        .map((sticker) => {
          // If on cover, allow cover-specific and corners; if not on cover, show floating or in-page
          const posStyle = getPositionStyle(sticker.position);
          const anim = getAnimationProps(sticker.animation);
          const sizeInfo = getSizeClasses(sticker.size);
          const stickerColor = sticker.color || themePrimary;
          const isClicked = clickedStickerId === sticker.id;

          return (
            <div
              key={sticker.id}
              className="absolute z-30 pointer-events-auto select-none"
              style={posStyle}
            >
              <motion.button
                type="button"
                {...anim}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  setClickedStickerId(sticker.id);
                  setTimeout(() => setClickedStickerId(null), 1200);
                }}
                className={`relative flex items-center gap-1.5 rounded-full backdrop-blur-md border border-white/40 shadow-lg cursor-pointer transition-colors ${sizeInfo.badge}`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  color: stickerColor,
                  boxShadow: `0 4px 14px ${stickerColor}35`,
                }}
                title={sticker.label || 'Stiker Animasi Undangan'}
              >
                <div className={`${sizeInfo.icon} shrink-0`}>
                  {renderIconGraphic(sticker.icon)}
                </div>

                {sticker.label && (
                  <span className="font-bold tracking-wider uppercase pr-1 text-stone-800 drop-shadow-xs dark:text-white">
                    {sticker.label}
                  </span>
                )}

                {/* Interactive Click Burst Effect */}
                <AnimatePresence>
                  {isClicked && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 rounded-full border-2 border-amber-300 pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          );
        })}
    </>
  );
};
