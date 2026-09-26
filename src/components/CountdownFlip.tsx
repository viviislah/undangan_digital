import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownFlipProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  primaryColor?: string;
  cardBg?: string;
  cardBorder?: string;
  labelColor?: string;
}

interface TimeUnitProps {
  value: number;
  label: string;
  primaryColor?: string;
  cardBg?: string;
  cardBorder?: string;
  labelColor?: string;
}

const TimeUnit: React.FC<TimeUnitProps> = ({
  value,
  label,
  primaryColor = '#F3E5AB',
  cardBg = 'rgba(255, 255, 255, 0.1)',
  cardBorder = 'rgba(255, 255, 255, 0.25)',
  labelColor = 'rgba(254, 243, 199, 0.9)',
}) => {
  const formatted = String(value).padStart(2, '0');

  return (
    <div className="countdown-item flex flex-col items-center justify-center w-full text-center">
      <div
        className="countdown-card w-full aspect-square max-w-[66px] sm:max-w-[72px] mx-auto rounded-2xl flex flex-col items-center justify-center relative overflow-hidden bg-white/10 backdrop-blur-sm shadow-lg border transition-all"
        style={{
          background: cardBg,
          borderColor: cardBorder,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Subtle glossy highlight on top */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        {/* Subtle center fold divider line */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/30 dark:bg-white/10 z-10 pointer-events-none" />

        {/* Animated digit */}
        <div className="relative h-8 sm:h-9 flex items-center justify-center overflow-hidden z-20">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={formatted}
              initial={{ y: -18, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-2xl font-bold tracking-tight font-cinzel select-none drop-shadow"
              style={{ color: primaryColor }}
            >
              {formatted}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Label underneath - strictly aligned and centered */}
      <span
        className="mt-1.5 text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-center select-none truncate w-full"
        style={{ color: labelColor }}
      >
        {label}
      </span>
    </div>
  );
};

export const CountdownFlip: React.FC<CountdownFlipProps> = ({
  days,
  hours,
  minutes,
  seconds,
  primaryColor = '#F3E5AB',
  cardBg = 'rgba(255, 255, 255, 0.1)',
  cardBorder = 'rgba(255, 255, 255, 0.25)',
  labelColor = 'rgba(254, 243, 199, 0.9)',
}) => {
  return (
    <div
      className="w-full max-w-[320px] mx-auto py-1"
      style={{ maxWidth: '320px', margin: '0 auto', width: '100%' }}
    >
      <div
        id="countdown-container"
        className="countdown-container w-full items-center justify-items-center"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '0.5rem',
        }}
      >
        <TimeUnit
          value={days}
          label="Hari"
          primaryColor={primaryColor}
          cardBg={cardBg}
          cardBorder={cardBorder}
          labelColor={labelColor}
        />
        <TimeUnit
          value={hours}
          label="Jam"
          primaryColor={primaryColor}
          cardBg={cardBg}
          cardBorder={cardBorder}
          labelColor={labelColor}
        />
        <TimeUnit
          value={minutes}
          label="Menit"
          primaryColor={primaryColor}
          cardBg={cardBg}
          cardBorder={cardBorder}
          labelColor={labelColor}
        />
        <TimeUnit
          value={seconds}
          label="Detik"
          primaryColor={primaryColor}
          cardBg={cardBg}
          cardBorder={cardBorder}
          labelColor={labelColor}
        />
      </div>
    </div>
  );
};
