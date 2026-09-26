import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export type AmbientEffectType =
  | 'petals'
  | 'sparkles'
  | 'hearts'
  | 'butterflies'
  | 'fireflies'
  | 'bubbles'
  | 'none';

interface AmbientEffectOverlayProps {
  effect?: AmbientEffectType;
  primaryColor?: string;
  count?: number;
}

export const AmbientEffectOverlay: React.FC<AmbientEffectOverlayProps> = ({
  effect = 'petals',
  primaryColor = '#D4AF37',
  count = 12,
}) => {
  if (effect === 'none') return null;

  // Stable randomized particles
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 94 + 3,
      size: Math.floor(Math.random() * 14) + 12,
      duration: Math.random() * 6 + 7,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 80,
      rotate: Math.random() * 360,
      opacity: Math.random() * 0.45 + 0.45,
    }));
  }, [count, effect]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
    >
      {particles.map((p) => {
        // 1. PETALS
        if (effect === 'petals') {
          return (
            <motion.div
              key={p.id}
              initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
              animate={{
                y: '105vh',
                x: [0, p.drift, -p.drift / 2, p.drift],
                opacity: [0, p.opacity, p.opacity * 0.9, 0],
                rotate: [0, p.rotate, p.rotate + 180, p.rotate + 360],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size * 1.3}px`,
                borderRadius: '50% 0 50% 50%',
                background: `linear-gradient(135deg, ${primaryColor}dd, #f47290cc)`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
                transformOrigin: 'center center',
              }}
            />
          );
        }

        // 2. SPARKLES (GOLDEN TWINKLE)
        if (effect === 'sparkles') {
          return (
            <motion.div
              key={p.id}
              initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
              animate={{
                y: '-10vh',
                x: [0, p.drift * 0.5, -p.drift * 0.3],
                opacity: [0, p.opacity, 1, p.opacity, 0],
                scale: [0.6, 1.2, 0.7, 1.3, 0.5],
              }}
              transition={{
                duration: p.duration * 0.9,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                color: primaryColor,
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </motion.div>
          );
        }

        // 3. HEARTS (ROMANTIC FLOATING HEARTS)
        if (effect === 'hearts') {
          return (
            <motion.div
              key={p.id}
              initial={{ y: '105vh', opacity: 0, scale: 0.7 }}
              animate={{
                y: '-8vh',
                x: [0, p.drift, -p.drift * 0.7, p.drift * 0.4],
                opacity: [0, p.opacity, p.opacity, 0],
                scale: [0.7, 1.1, 0.9, 1.2],
              }}
              transition={{
                duration: p.duration * 1.1,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                left: `${p.left}%`,
                width: `${p.size + 4}px`,
                height: `${p.size + 4}px`,
                color: '#f43f5e',
                filter: 'drop-shadow(0 3px 6px rgba(244,63,94,0.3))',
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.div>
          );
        }

        // 4. BUTTERFLIES (FLUTTERING BUTTERFLIES)
        if (effect === 'butterflies') {
          return (
            <motion.div
              key={p.id}
              initial={{ y: '105vh', opacity: 0, x: 0 }}
              animate={{
                y: '-10vh',
                x: [0, p.drift * 1.5, -p.drift, p.drift * 1.2],
                opacity: [0, p.opacity, p.opacity, 0],
                rotate: [-15, 20, -10, 15],
              }}
              transition={{
                duration: p.duration * 1.2,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                left: `${p.left}%`,
                width: `${p.size + 8}px`,
                height: `${p.size + 8}px`,
                color: primaryColor,
              }}
            >
              <motion.div
                animate={{ scaleX: [1, 0.4, 1] }}
                transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
                  <path d="M12 7c-1.5-3-5.5-4-8-2-3 2.5-3 8 2 10 2 1 4 0 5-1l1 1 1-1c1 1 3 2 5 1 5-2 5-7.5 2-10-2.5-2-6.5-1-8 2z" />
                </svg>
              </motion.div>
            </motion.div>
          );
        }

        // 5. FIREFLIES (LUMINOUS GLOWING ORBS)
        if (effect === 'fireflies') {
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                y: [0, -p.drift, p.drift, -p.drift * 0.5, 0],
                x: [0, p.drift, -p.drift, p.drift * 0.8, 0],
                opacity: [0.1, 0.9, 0.2, 0.95, 0.1],
                scale: [0.8, 1.4, 0.7, 1.3, 0.8],
              }}
              transition={{
                duration: p.duration * 0.8,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: `${(p.id * 8 + p.left) % 85 + 5}%`,
                left: `${p.left}%`,
                width: `${Math.max(6, p.size * 0.5)}px`,
                height: `${Math.max(6, p.size * 0.5)}px`,
                borderRadius: '50%',
                backgroundColor: '#fef08a',
                boxShadow: `0 0 12px 4px ${primaryColor}aa, 0 0 20px 8px #fef08a88`,
              }}
            />
          );
        }

        // 6. BUBBLES (DREAMY RISING BUBBLES)
        return (
          <motion.div
            key={p.id}
            initial={{ y: '105vh', opacity: 0 }}
            animate={{
              y: '-8vh',
              x: [0, p.drift * 0.8, -p.drift * 0.5, p.drift * 0.6],
              opacity: [0, p.opacity * 0.8, p.opacity, 0],
            }}
            transition={{
              duration: p.duration * 1.1,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              width: `${p.size + 6}px`,
              height: `${p.size + 6}px`,
              borderRadius: '50%',
              border: `1.5px solid ${primaryColor}99`,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), ${primaryColor}22 60%, transparent 100%)`,
              backdropFilter: 'blur(1px)',
              boxShadow: `0 0 8px ${primaryColor}33`,
            }}
          />
        );
      })}
    </div>
  );
};
