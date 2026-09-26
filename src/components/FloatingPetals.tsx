import React, { useMemo } from 'react';

interface FloatingPetalsProps {
  count?: number;
  color?: 'gold' | 'rose' | 'white' | 'emerald' | 'lilac' | 'terracotta' | 'navy';
}

interface PetalItem {
  id: number;
  left: number; // percentage
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  drift: number; // px horizontal drift
  rotate: number; // degrees
  opacity: number;
}

export const FloatingPetals: React.FC<FloatingPetalsProps> = ({
  count = 10,
  color = 'gold',
}) => {
  // Generate stable petal properties
  const petals = useMemo<PetalItem[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 92 + 4,
      size: Math.floor(Math.random() * 14) + 14,
      duration: Math.random() * 6 + 9,
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 80,
      rotate: Math.random() * 360,
      opacity: Math.random() * 0.4 + 0.5,
    }));
  }, [count]);

  // Determine petal color gradients
  const getPetalGradient = () => {
    switch (color) {
      case 'gold':
        return 'linear-gradient(135deg, rgba(230, 202, 133, 0.85), rgba(197, 160, 89, 0.65))';
      case 'emerald':
        return 'linear-gradient(135deg, rgba(52, 211, 153, 0.75), rgba(15, 118, 110, 0.65))';
      case 'white':
        return 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(226, 232, 240, 0.65))';
      case 'lilac':
        return 'linear-gradient(135deg, rgba(196, 181, 253, 0.85), rgba(139, 92, 246, 0.65))';
      case 'terracotta':
        return 'linear-gradient(135deg, rgba(251, 146, 60, 0.85), rgba(194, 89, 63, 0.65))';
      case 'navy':
        return 'linear-gradient(135deg, rgba(147, 197, 253, 0.85), rgba(30, 58, 138, 0.65))';
      case 'rose':
      default:
        return 'linear-gradient(135deg, rgba(251, 191, 204, 0.85), rgba(244, 114, 142, 0.65))';
    }
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-20"
      style={{ perspective: '600px' }}
    >
      <style>{`
        @keyframes petalFall {
          0% {
            transform: translate3d(0, -50px, 0) rotate(0deg) scale(0.9);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(var(--drift-x), 105vh, 40px) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={
            {
              left: `${p.left}%`,
              top: '-40px',
              width: `${p.size}px`,
              height: `${p.size * 1.3}px`,
              background: getPetalGradient(),
              borderRadius: '60% 40% 70% 30% / 60% 30% 70% 40%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              opacity: p.opacity,
              animation: `petalFall ${p.duration}s cubic-bezier(0.25, 0.1, 0.25, 1) infinite`,
              animationDelay: `${p.delay}s`,
              '--drift-x': `${p.drift}px`,
              filter: 'blur(0.4px)',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
