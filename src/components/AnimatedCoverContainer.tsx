import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OpeningAnimationType } from '../data/themeAnimations';
import { Sparkles } from 'lucide-react';
import { resolveExternalMediaUrl } from '../services/imageService';

interface AnimatedCoverContainerProps {
  type: OpeningAnimationType;
  isOpeningSequence: boolean;
  coverPhotoUrl: string;
  themeVisuals: any;
  children: React.ReactNode;
}

export const AnimatedCoverContainer: React.FC<AnimatedCoverContainerProps> = ({
  type,
  isOpeningSequence,
  coverPhotoUrl: rawCoverPhotoUrl,
  themeVisuals,
  children,
}) => {
  const safeCoverUrl = React.useMemo(() => {
    if (!rawCoverPhotoUrl) return '';
    return resolveExternalMediaUrl(rawCoverPhotoUrl);
  }, [rawCoverPhotoUrl]);

  const bgOverlayGradient =
    type === 'shutter-aperture'
      ? 'linear-gradient(to bottom, rgba(5, 5, 8, 0.72) 0%, rgba(10, 10, 14, 0.88) 50%, rgba(3, 3, 5, 0.98) 100%)'
      : type === 'blooming-envelope'
      ? 'linear-gradient(to bottom, rgba(70, 25, 35, 0.52) 0%, rgba(80, 30, 40, 0.72) 50%, rgba(45, 15, 20, 0.94) 100%)'
      : type === 'dome-arch-reveal'
      ? 'linear-gradient(to bottom, rgba(10, 40, 35, 0.55) 0%, rgba(15, 60, 50, 0.75) 50%, rgba(6, 25, 20, 0.96) 100%)'
      : type === 'editorial-split'
      ? 'linear-gradient(to bottom, rgba(15, 15, 18, 0.6) 0%, rgba(20, 20, 25, 0.8) 50%, rgba(10, 10, 12, 0.95) 100%)'
      : type === 'fairy-sparkle-zoom'
      ? 'linear-gradient(to bottom, rgba(50, 20, 80, 0.55) 0%, rgba(65, 25, 105, 0.75) 50%, rgba(35, 12, 60, 0.95) 100%)'
      : type === 'terracotta-scroll'
      ? 'linear-gradient(to bottom, rgba(70, 30, 20, 0.55) 0%, rgba(90, 40, 25, 0.75) 50%, rgba(50, 20, 12, 0.96) 100%)'
      : type === 'ocean-wave-slide'
      ? 'linear-gradient(to bottom, rgba(10, 25, 60, 0.55) 0%, rgba(15, 35, 80, 0.75) 50%, rgba(8, 18, 45, 0.96) 100%)'
      : 'linear-gradient(to bottom, rgba(15, 12, 10, 0.52) 0%, rgba(15, 12, 10, 0.72) 45%, rgba(10, 8, 7, 0.94) 100%)';

  // Safely formatted for CSS background-image: wrapped in url("...") to handle base64, query parameters and special chars
  const coverBgStyle = React.useMemo(() => {
    if (!safeCoverUrl) return bgOverlayGradient;
    const escaped = safeCoverUrl.replace(/"/g, '\\"');
    return `${bgOverlayGradient}, url("${escaped}")`;
  }, [bgOverlayGradient, safeCoverUrl]);

  const blurAmount = themeVisuals?.coverBlur || 0;
  const blurOverlay = blurAmount > 0 ? (
    <div
      className="absolute inset-0 pointer-events-none z-10 transition-all duration-300"
      style={{ backdropFilter: `blur(${blurAmount}px)` }}
    />
  ) : null;

  // 1. ELEGANT GOLD: ROYAL CURTAIN / DOUBLE DOOR SPLIT OPENING
  if (type === 'royal-curtain') {
    return (
      <div className="absolute inset-0 z-40 w-full h-full overflow-hidden select-none">
        {/* Left Gate Leaf */}
        <motion.div
          animate={
            isOpeningSequence
              ? {
                  x: '-102%',
                  rotateY: -25,
                  opacity: 0.2,
                  transition: { duration: 1.15, ease: [0.25, 1, 0.35, 1] },
                }
              : { x: 0, rotateY: 0, opacity: 1 }
          }
          className="absolute inset-y-0 left-0 w-1/2 bg-cover bg-left z-20 overflow-hidden border-r border-amber-300/40 shadow-2xl origin-left"
          style={{
            backgroundImage: coverBgStyle,
          }}
        >
          {blurOverlay}
          {/* Ornate Gold Border strip */}
          <div className="absolute top-0 right-0 bottom-0 w-3 bg-gradient-to-l from-amber-400/40 via-amber-200/20 to-transparent" />
          <div className="absolute top-8 right-3 text-amber-300/40">
            <svg width="24" height="48" viewBox="0 0 24 48" fill="none" stroke="currentColor">
              <path d="M24 0 C 12 12, 12 36, 24 48" strokeWidth="1.5" />
            </svg>
          </div>
        </motion.div>

        {/* Right Gate Leaf */}
        <motion.div
          animate={
            isOpeningSequence
              ? {
                  x: '102%',
                  rotateY: 25,
                  opacity: 0.2,
                  transition: { duration: 1.15, ease: [0.25, 1, 0.35, 1] },
                }
              : { x: 0, rotateY: 0, opacity: 1 }
          }
          className="absolute inset-y-0 right-0 w-1/2 bg-cover bg-right z-20 overflow-hidden border-l border-amber-300/40 shadow-2xl origin-right"
          style={{
            backgroundImage: coverBgStyle,
          }}
        >
          {blurOverlay}
          {/* Ornate Gold Border strip */}
          <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-r from-amber-400/40 via-amber-200/20 to-transparent" />
          <div className="absolute top-8 left-3 text-amber-300/40 scale-x-[-1]">
            <svg width="24" height="48" viewBox="0 0 24 48" fill="none" stroke="currentColor">
              <path d="M24 0 C 12 12, 12 36, 24 48" strokeWidth="1.5" />
            </svg>
          </div>
        </motion.div>

        {/* Foreground Content (Fades out and scales into majestic opening) */}
        <motion.div
          animate={
            isOpeningSequence
              ? {
                  scale: 1.12,
                  opacity: 0,
                  filter: 'blur(4px)',
                  transition: { duration: 0.75, ease: 'easeIn' },
                }
              : { scale: 1, opacity: 1 }
          }
          className="relative z-30 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6"
        >
          {children}
        </motion.div>

        {/* Golden light burst ray from center */}
        {isOpeningSequence && (
          <motion.div
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 2.5, 3] }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute inset-0 m-auto w-40 h-40 rounded-full z-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(253, 230, 138, 0.95) 0%, rgba(217, 119, 6, 0.4) 60%, transparent 80%)',
            }}
          />
        )}
      </div>
    );
  }

  // 2. LUXURY BLACK: CINEMATIC NOIR ZOOM & APERTURE FOCUS
  if (type === 'shutter-aperture') {
    return (
      <motion.div
        animate={
          isOpeningSequence
            ? {
                scale: 1.25,
                opacity: 0,
                filter: 'brightness(2.2) contrast(1.2) blur(8px)',
                transition: { duration: 1.05, ease: [0.25, 0.1, 0.25, 1] },
              }
            : { scale: 1, opacity: 1, filter: 'none' }
        }
        className="absolute inset-0 z-40 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center overflow-hidden select-none"
        style={{
          backgroundImage: coverBgStyle,
        }}
      >
        {blurOverlay}
        {/* Shutter expanding gold aperture rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <motion.div
            animate={
              isOpeningSequence
                ? { scale: [1, 3.5], opacity: [0.6, 0] }
                : { scale: [1, 1.03, 1], opacity: [0.25, 0.4, 0.25] }
            }
            transition={
              isOpeningSequence
                ? { duration: 0.9, ease: 'easeOut' }
                : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
            className="w-72 h-72 rounded-full border border-amber-400/40"
          />
          <motion.div
            animate={
              isOpeningSequence
                ? { scale: [1, 4.5], opacity: [0.4, 0] }
                : { scale: [1, 1.06, 1], opacity: [0.15, 0.3, 0.15] }
            }
            transition={
              isOpeningSequence
                ? { duration: 1.0, ease: 'easeOut', delay: 0.05 }
                : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
            }
            className="w-96 h-96 rounded-full border border-amber-300/20"
          />
        </div>

        {children}
      </motion.div>
    );
  }

  // 3. FLORAL GARDEN: BLOOMING ENVELOPE FLAP UNFOLDING UPWARDS
  if (type === 'blooming-envelope') {
    return (
      <div className="absolute inset-0 z-40 w-full h-full overflow-hidden select-none bg-stone-900">
        {/* Flap that rotates up like opening a wax-sealed love letter */}
        <motion.div
          animate={
            isOpeningSequence
              ? {
                  rotateX: -110,
                  y: '-70%',
                  opacity: 0,
                  transition: { duration: 1.15, ease: [0.34, 1.2, 0.64, 1] },
                }
              : { rotateX: 0, y: 0, opacity: 1 }
          }
          style={{
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
            backgroundImage: coverBgStyle,
          }}
          className="absolute inset-0 z-30 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center shadow-2xl"
        >
          {blurOverlay}
          {/* Top Envelope Triangular Fold Accent */}
          <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-rose-400/20 to-transparent pointer-events-none" />

          {children}

          {/* Floating petal burst during opening */}
          {isOpeningSequence && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0.4,
                    rotate: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 350,
                    y: (Math.random() - 0.8) * 450,
                    scale: 1 + Math.random() * 0.5,
                    rotate: Math.random() * 360,
                    opacity: 0,
                  }}
                  transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.04 }}
                  className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-rose-300 via-pink-400 to-rose-600 shadow-md"
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // 4. ISLAMI MUBARAK: SACRED DOME ARCH EXPANDING
  if (type === 'dome-arch-reveal') {
    return (
      <div className="absolute inset-0 z-40 w-full h-full overflow-hidden select-none">
        {/* Arch Mask container */}
        <motion.div
          animate={
            isOpeningSequence
              ? {
                  clipPath: 'ellipse(160% 160% at 50% 0%)',
                  y: '-105%',
                  opacity: 0,
                  transition: { duration: 1.1, ease: [0.25, 1, 0.35, 1] },
                }
              : {
                  clipPath: 'ellipse(100% 100% at 50% 50%)',
                  y: 0,
                  opacity: 1,
                }
          }
          className="absolute inset-0 z-30 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center shadow-2xl"
          style={{
            backgroundImage: coverBgStyle,
          }}
        >
          {blurOverlay}
          {/* Top Decorative Islamic Arch Shape */}
          <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none opacity-40">
            <svg width="220" height="40" viewBox="0 0 220 40" fill="none">
              <path
                d="M0 0 C60 0, 80 30, 110 30 C140 30, 160 0, 220 0"
                stroke="#14B8A6"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {children}

          {/* Emerald Noor Radiance during opening */}
          {isOpeningSequence && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.9, 0], scale: [0.8, 2.2, 2.5] }}
              transition={{ duration: 1.05 }}
              className="absolute inset-0 m-auto w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.85) 0%, rgba(13, 148, 136, 0.35) 60%, transparent 80%)',
              }}
            />
          )}
        </motion.div>
      </div>
    );
  }

  // 5. MINIMALIS MODERN: HIGH-FASHION EDITORIAL VERTICAL SLICE
  if (type === 'editorial-split') {
    return (
      <motion.div
        animate={
          isOpeningSequence
            ? {
                y: '-100%',
                opacity: 0,
                transition: { duration: 0.88, ease: [0.77, 0, 0.175, 1] }, // Precise easeInOutQuint
              }
            : { y: 0, opacity: 1 }
        }
        className="absolute inset-0 z-40 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center overflow-hidden select-none"
        style={{
          backgroundImage: coverBgStyle,
        }}
      >
        {blurOverlay}
        {/* Minimalist modern architectural geometric framing line */}
        <div className="absolute inset-5 border border-white/20 pointer-events-none" />

        {children}
      </motion.div>
    );
  }

  // 6. MODERN LILAC: FAIRY TALE SWIRL & SPARKLE ROTATION
  if (type === 'fairy-sparkle-zoom') {
    return (
      <motion.div
        animate={
          isOpeningSequence
            ? {
                rotate: 8,
                scale: 1.3,
                opacity: 0,
                filter: 'blur(6px) hue-rotate(20deg)',
                transition: { duration: 1.1, ease: [0.34, 1.15, 0.64, 1] },
              }
            : { rotate: 0, scale: 1, opacity: 1, filter: 'none' }
        }
        className="absolute inset-0 z-40 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center overflow-hidden select-none origin-center"
        style={{
          backgroundImage: coverBgStyle,
        }}
      >
        {blurOverlay}
        {children}

        {/* Twinkling star bursts */}
        {isOpeningSequence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            {[...Array(8)].map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.8, 0],
                  rotate: [0, 180],
                  x: (Math.sin(idx) * 120),
                  y: (Math.cos(idx) * 160),
                }}
                transition={{ duration: 0.9, delay: idx * 0.06 }}
                className="absolute text-purple-200"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // 7. RUSTIC TERRACOTTA: WARM PARCHMENT ROLL DOWNWARDS
  if (type === 'terracotta-scroll') {
    return (
      <motion.div
        animate={
          isOpeningSequence
            ? {
                y: '105%',
                scale: 0.95,
                opacity: 0.1,
                rotateZ: -2,
                transition: { duration: 1.1, ease: [0.25, 1, 0.35, 1] },
              }
            : { y: 0, scale: 1, opacity: 1, rotateZ: 0 }
        }
        className="absolute inset-0 z-40 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center overflow-hidden select-none origin-top"
        style={{
          backgroundImage: coverBgStyle,
        }}
      >
        {blurOverlay}
        {/* Subtle rustic parchment top & bottom shadow gradient */}
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-amber-950/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-amber-950/60 to-transparent pointer-events-none" />

        {children}
      </motion.div>
    );
  }

  // 9. 3D BOOK FOLD FLIP
  if (type === 'book-flip') {
    return (
      <div className="absolute inset-0 z-40 w-full h-full overflow-hidden select-none [perspective:1400px]">
        <motion.div
          animate={
            isOpeningSequence
              ? {
                  rotateY: -115,
                  x: '-40%',
                  opacity: 0,
                  transition: { duration: 1.2, ease: [0.25, 1, 0.35, 1] },
                }
              : { rotateY: 0, x: 0, opacity: 1 }
          }
          className="absolute inset-0 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center overflow-hidden origin-left shadow-2xl"
          style={{
            backgroundImage: coverBgStyle,
            transformStyle: 'preserve-3d',
          }}
        >
          {blurOverlay}
          {/* Spine crease shadow effect */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 left-2 w-[1px] bg-amber-300/40 pointer-events-none" />
          {children}
        </motion.div>
      </div>
    );
  }

  // 10. GOLDEN STARLIGHT SPARKLE BURST
  if (type === 'sparkle-burst') {
    return (
      <motion.div
        animate={
          isOpeningSequence
            ? {
                scale: 1.45,
                opacity: 0,
                filter: 'brightness(2.2) blur(8px)',
                transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
              }
            : { scale: 1, opacity: 1, filter: 'brightness(1) blur(0px)' }
        }
        className="absolute inset-0 z-40 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center overflow-hidden select-none origin-center"
        style={{
          backgroundImage: coverBgStyle,
        }}
      >
        {blurOverlay}
        {/* Flash radiance overlay during opening */}
        {isOpeningSequence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-radial from-amber-100/90 via-amber-300/40 to-transparent pointer-events-none z-30"
          />
        )}
        {children}
      </motion.div>
    );
  }

  // 8. SOFT NAUTICAL: OCEAN WAVE SLIDE & HORIZON CREST
  return (
    <motion.div
      animate={
        isOpeningSequence
          ? {
              y: '-105%',
              scale: 0.97,
              skewY: -3,
              opacity: 0,
              transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
            }
          : { y: 0, scale: 1, skewY: 0, opacity: 1 }
      }
      className="absolute inset-0 z-40 w-full h-full flex flex-col justify-between items-center text-center px-4 py-4 sm:px-6 sm:py-6 bg-cover bg-center overflow-hidden select-none origin-top"
      style={{
        backgroundImage: coverBgStyle,
      }}
    >
      {blurOverlay}
      {/* Nautical compass lines */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400/20 via-sky-300/50 to-blue-400/20 pointer-events-none" />

      {children}
    </motion.div>
  );
};
