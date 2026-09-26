import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resolveExternalMediaUrl } from '../services/imageService';
import { FALLBACK_WEDDING_IMG } from '../data/weddingAssets';

interface LightboxProps {
  isOpen: boolean;
  images: Array<{ url: string; caption?: string }>;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  // Handle keyboard arrow navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          id="lightbox-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Top Header Bar */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-medium">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{currentIndex + 1} / {images.length}</span>
            </div>

            {/* Close button */}
            <button
              id="lightbox-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="pointer-events-auto p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all shadow-lg"
              aria-label="Tutup foto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              id="lightbox-prev-btn"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 text-white backdrop-blur-md transition-all shadow-xl"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              id="lightbox-next-btn"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 text-white backdrop-blur-md transition-all shadow-xl"
              aria-label="Foto selanjutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image Container with Smooth Zoom & Slide */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[75vh]">
              <img
                src={resolveExternalMediaUrl(currentImage?.url) || FALLBACK_WEDDING_IMG}
                alt={currentImage?.caption || 'Foto Galeri'}
                className="max-h-[72vh] max-w-full object-contain select-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_WEDDING_IMG;
                }}
              />
            </div>

            {currentImage?.caption && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 text-sm text-stone-200 font-light text-center px-4 max-w-lg"
              >
                {currentImage.caption}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
