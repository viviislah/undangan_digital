import React, { ReactNode } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface PhoneSimulatorProps {
  children: ReactNode;
  title?: string;
  zoomLevel?: number; // 0.8 to 1.0
  className?: string;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  children,
  title = 'Undangan Digital',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-2 sm:p-4 ${className}`}>
      {/* Phone Hardware Mockup Outer Shell */}
      <div
        id="phone-simulator-frame"
        className="relative bg-stone-900 rounded-[50px] p-3 shadow-2xl border-[5px] border-stone-800 ring-1 ring-stone-900/50 flex flex-col"
        style={{
          width: '390px',
          height: '780px',
          maxWidth: '100%',
        }}
      >
        {/* Physical hardware buttons on side */}
        <div className="absolute -left-[9px] top-28 w-1.5 h-10 bg-stone-700 rounded-l-md" />
        <div className="absolute -left-[9px] top-42 w-1.5 h-12 bg-stone-700 rounded-l-md" />
        <div className="absolute -right-[9px] top-36 w-1.5 h-14 bg-stone-700 rounded-r-md" />

        {/* Screen Bezel & Container */}
        <div
          className="relative flex-1 bg-black rounded-[38px] overflow-hidden flex flex-col border border-stone-950"
          style={{
            transform: 'translateZ(0)',
            contain: 'paint layout',
            isolation: 'isolate',
          }}
        >
          {/* Dynamic Island / Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 h-6 w-28 bg-black rounded-full flex items-center justify-between px-2.5 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-900/80 ring-1 ring-stone-800" />
            <div className="w-2 h-2 rounded-full bg-blue-950 ring-1 ring-blue-900" />
          </div>

          {/* Top Status Bar */}
          <div className="relative z-30 flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-stone-300 select-none bg-gradient-to-b from-black/50 to-transparent">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <span className="text-[10px] font-bold tracking-tight">5G</span>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Scrollable Screen Content */}
          <div
            id="phone-screen-scroll-container"
            className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden relative custom-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-40 w-32 h-1 bg-white/40 rounded-full pointer-events-none backdrop-blur-sm" />
        </div>
      </div>
    </div>
  );
};
