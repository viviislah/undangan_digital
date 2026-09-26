import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon } from 'lucide-react';
import { resolveExternalMediaUrl } from '../services/imageService';
import { FALLBACK_WEDDING_IMG } from '../data/weddingAssets';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface CinematicImageRevealProps {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  direction?: 'left' | 'right' | 'up' | 'zoom' | 'curtain';
  delay?: number;
  duration?: number;
  shape?: 'rounded' | 'circle' | 'arch';
  showGleam?: boolean;
  hoverZoom?: boolean;
  aspectRatioClass?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const CinematicImageReveal: React.FC<CinematicImageRevealProps> = ({
  src,
  fallbackSrc,
  alt = 'Foto Undangan',
  className = '',
  imageClassName = '',
  direction = 'up',
  delay = 0,
  duration = 0.95,
  shape = 'rounded',
  showGleam = true,
  hoverZoom = true,
  aspectRatioClass = '',
  onClick,
  children,
}) => {
  const resolvedFallback = fallbackSrc ? resolveExternalMediaUrl(fallbackSrc) : FALLBACK_WEDDING_IMG;
  const [currentSrc, setCurrentSrc] = useState(() => resolveExternalMediaUrl(src) || resolvedFallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.05,
    rootMargin: '0px 0px -15px 0px',
    triggerOnce: true,
  });

  useEffect(() => {
    const nextSrc = resolveExternalMediaUrl(src) || resolvedFallback;
    setCurrentSrc(nextSrc);
    setIsLoaded(false);
    setHasError(false);
  }, [src, resolvedFallback]);

  const handleImageError = () => {
    if (currentSrc !== resolvedFallback) {
      setCurrentSrc(resolvedFallback);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  // Determine initial and reveal transforms based on direction
  const getMotionVariants = () => {
    switch (direction) {
      case 'left':
        return {
          initial: { opacity: 0, x: -45, scale: 1.1, filter: 'blur(8px)' },
          animate: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
        };
      case 'right':
        return {
          initial: { opacity: 0, x: 45, scale: 1.1, filter: 'blur(8px)' },
          animate: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 1.18, filter: 'blur(8px)' },
          animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        };
      case 'curtain':
        return {
          initial: { opacity: 0, y: 30, scale: 1.08, filter: 'blur(6px)' },
          animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
        };
      case 'up':
      default:
        return {
          initial: { opacity: 0, y: 40, scale: 1.06, filter: 'blur(8px)' },
          animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
        };
    }
  };

  const variants = getMotionVariants();

  const shapeStyles =
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'arch'
      ? 'rounded-t-[100px] rounded-b-2xl'
      : 'rounded-2xl sm:rounded-3xl';

  return (
    <div
      ref={elementRef}
      onClick={onClick}
      className={`group relative overflow-hidden select-none ${shapeStyles} ${aspectRatioClass} ${className}`}
      style={{
        transform: 'translateZ(0)',
        contain: 'paint layout',
        isolation: 'isolate',
      }}
    >
      {/* Background Skeleton Shimmer while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-stone-400 opacity-40 animate-bounce" />
        </div>
      )}

      {/* Motion Picture Container with Smooth Cubic-Bezier Physics */}
      <motion.div
        initial={variants.initial}
        animate={isIntersecting ? variants.animate : variants.initial}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1], // Luxury deceleration curve (ultra-smooth)
        }}
        className="relative w-full h-full"
      >
        <img
          src={currentSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            hoverZoom ? 'group-hover:scale-108' : ''
          } ${imageClassName}`}
          style={{
            willChange: 'transform, opacity, filter',
          }}
        />

        {/* Ambient Subtle Vignette on edges for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Cinematic Glaze / Sunlight Gleam Sweep passing over image on reveal */}
        {showGleam && isIntersecting && (
          <motion.div
            initial={{ x: '-120%', opacity: 0 }}
            animate={{
              x: '150%',
              opacity: [0, 0.8, 0],
            }}
            transition={{
              delay: delay + 0.35,
              duration: 1.3,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 w-2/3 h-full pointer-events-none skew-x-[-22deg] bg-gradient-to-r from-transparent via-white/35 to-transparent z-10"
            style={{
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Optional Overlay / Children Content */}
        {children}
      </motion.div>
    </div>
  );
};
