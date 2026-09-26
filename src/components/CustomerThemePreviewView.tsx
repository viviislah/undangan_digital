import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageCircle,
  Sparkles,
  Layers,
  RotateCcw,
  CheckCircle2,
  X,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  ChevronRight,
  Contrast,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TEMPLATES } from '../data/templates';
import { InvitationPublicView } from './InvitationPublicView';
import { createNewInvitationFromTemplate } from '../services/storageService';
import { getThemeOpeningAnimation } from '../data/themeAnimations';
import { getThemeVisuals } from '../data/weddingAssets';
import { FacthLogo } from './FacthLogo';

export const VENDOR_PHONE_NUMBER = '081383750998';
export const VENDOR_PHONE_INTERNATIONAL = '6281383750998';

interface CustomerThemePreviewViewProps {
  templateId: string;
  onSelectAnotherTheme: (templateId: string) => void;
}

export const CustomerThemePreviewView: React.FC<CustomerThemePreviewViewProps> = ({
  templateId,
  onSelectAnotherTheme,
}) => {
  const isKatalogDefault = templateId === 'katalog';
  const effectiveTemplateId = isKatalogDefault ? 'elegant-gold' : templateId;

  const [animKey, setAnimKey] = useState(0);
  const [showThemeDrawer, setShowThemeDrawer] = useState(isKatalogDefault);
  const [desktopViewMode, setDesktopViewMode] = useState<'phone' | 'full'>('full');
  const [hideControls, setHideControls] = useState(false);

  // Global High Contrast state for accessibility
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const val = localStorage.getItem('vhistetic_high_contrast');
        if (val !== null) return val === 'true';
      } catch {
        // ignore
      }
    }
    return false;
  });

  const handleToggleHighContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vhistetic_high_contrast', String(nextVal));
        window.dispatchEvent(new CustomEvent('vhistetic_high_contrast_change', { detail: nextVal }));
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail !== undefined) {
        setHighContrast(Boolean(e.detail));
      }
    };
    window.addEventListener('vhistetic_high_contrast_change', handler);
    return () => window.removeEventListener('vhistetic_high_contrast_change', handler);
  }, []);

  // If URL changes to another theme or katalog
  useEffect(() => {
    if (templateId === 'katalog') {
      setShowThemeDrawer(true);
    }
  }, [templateId]);

  const template = useMemo(() => {
    return TEMPLATES.find((t) => t.id === effectiveTemplateId) || TEMPLATES[0];
  }, [effectiveTemplateId]);

  const openingAnim = useMemo(() => {
    return getThemeOpeningAnimation(template.id);
  }, [template.id]);

  const sampleInvitation = useMemo(() => {
    return createNewInvitationFromTemplate(template, {
      title: `The Wedding of Farhan & Nabila (${template.name})`,
      mempelaiPria: {
        namaLengkap: 'Farhan Maulana, S.T.',
        namaPanggilan: 'Farhan',
        orangTua: 'Putra tercinta Bpk. Ahmad Dahlan & Ibu Nurhayati',
        anakKe: 'Putra Pertama',
        instagram: 'farhan.maulana',
        fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      },
      mempelaiWanita: {
        namaLengkap: 'Nabila Safira, S.Psi.',
        namaPanggilan: 'Nabila',
        orangTua: 'Putri tercinta Bpk. Wahyu Hidayat & Ibu Sri Mulyani',
        anakKe: 'Putri Kedua',
        instagram: 'nabila.safira',
        fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      },
      events: [
        {
          id: 'evt-demo-1',
          namaAcara: 'Akad Nikah',
          tanggal: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          waktuMulai: '08:30',
          waktuSelesai: '10:30',
          zonaWaktu: 'WIB',
          namaTempat: 'Gedung Serbaguna Puri Asri',
          alamat: 'Jl. Merdeka No. 88, Menteng, Jakarta Pusat',
          linkGoogleMaps: 'https://maps.google.com/?q=Jakarta',
        },
        {
          id: 'evt-demo-2',
          namaAcara: 'Resepsi Pernikahan',
          tanggal: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          waktuMulai: '11:00',
          waktuSelesai: '14:00',
          zonaWaktu: 'WIB',
          namaTempat: 'Grand Ballroom Puri Asri',
          alamat: 'Jl. Merdeka No. 88, Menteng, Jakarta Pusat',
          linkGoogleMaps: 'https://maps.google.com/?q=Jakarta',
        },
      ],
      isPublished: true,
    });
  }, [template]);

  const handleOrderViaWhatsApp = () => {
    const text = `Halo Facth Printing! ✨\n\nSaya tertarik dan ingin memesan undangan digital pernikahan dengan tema:\n💎 *Tema: ${template.name}* (${template.category})\n🆔 *ID Tema:* ${template.id}\n\nMohon info detail paket, harga, dan langkah pemesanannya ya. Terima kasih! 🙏`;
    const url = `https://wa.me/${VENDOR_PHONE_INTERNATIONAL}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full bg-stone-950 text-stone-100 flex flex-col overflow-x-hidden selection:bg-amber-500/30">
      {/* 1. FLOATING TOP CONTROLS (Glassmorphism Pill) */}
      {!hideControls && (
        <header className="fixed top-3 inset-x-3 sm:inset-x-6 z-50 pointer-events-none flex items-center justify-between gap-2">
          {/* Left pill: Theme Info & Facth Branding (No back button so customer cannot navigate to beranda) */}
          <div className="pointer-events-auto flex items-center gap-2 bg-stone-900/90 backdrop-blur-md border border-stone-800/90 rounded-full px-3 py-1.5 shadow-xl">
            <FacthLogo size="xs" theme="dark" className="h-5 sm:h-5.5" />
            <span className="w-px h-3.5 bg-stone-700 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-400 hidden sm:inline">Tema:</span>
              <span className="font-serif-display font-bold text-amber-300 text-xs sm:text-sm">
                {template.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold hidden lg:inline">
                {template.category}
              </span>
            </div>
          </div>

          {/* Right pill: Actions */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md border border-stone-800/90 rounded-full px-2.5 py-1.5 shadow-xl">
            {/* Re-open envelope animation */}
            <button
              onClick={() => setAnimKey((k) => k + 1)}
              className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 transition-colors text-xs flex items-center gap-1"
              title="Buka ulang amplop animasi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Buka Amplop</span>
            </button>

            {/* High Contrast Accessibility Toggle */}
            <button
              onClick={handleToggleHighContrast}
              className={`p-1.5 rounded-full transition-colors flex items-center gap-1 text-xs ${
                highContrast
                  ? 'bg-amber-400 text-black font-bold ring-2 ring-amber-300'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
              title={
                highContrast
                  ? 'Mode Kontras Tinggi Aktif (Solid Black/White). Klik untuk mematikan.'
                  : 'Aktifkan Mode Kontras Tinggi untuk keterbacaan teks maksimal'
              }
            >
              <Contrast className={`w-3.5 h-3.5 ${highContrast ? 'text-black' : 'text-amber-400'}`} />
              <span className="hidden md:inline text-[11px]">{highContrast ? 'Kontras: ON' : 'Kontras'}</span>
            </button>

            {/* Desktop mode switch: phone simulator vs full screen */}
            <button
              onClick={() => setDesktopViewMode(desktopViewMode === 'full' ? 'phone' : 'full')}
              className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 transition-colors hidden sm:flex items-center gap-1"
              title={desktopViewMode === 'full' ? 'Beralih ke Tampilan Ponsel' : 'Beralih ke Layar Penuh'}
            >
              {desktopViewMode === 'full' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-stone-300" />
                  <span className="hidden lg:inline text-[11px]">Mode Ponsel</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-stone-300" />
                  <span className="hidden lg:inline text-[11px]">Layar Penuh</span>
                </>
              )}
            </button>

            {/* Change Theme Drawer Toggle */}
            <button
              onClick={() => setShowThemeDrawer(true)}
              className="py-1 px-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ganti Tema ({TEMPLATES.length})</span>
            </button>

            {/* Hide controls for pure full screen view */}
            <button
              onClick={() => setHideControls(true)}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Sembunyikan menu pratinjau (Layar Penuh Murni)"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* Floating button to unhide controls if hidden */}
      {hideControls && (
        <button
          onClick={() => setHideControls(false)}
          className="fixed top-3 right-3 z-50 p-2.5 rounded-full bg-stone-900/90 text-stone-300 hover:text-white border border-stone-700 shadow-xl flex items-center gap-1.5 text-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          title="Tampilkan menu pratinjau tema"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-medium pr-1">Tampilkan Menu</span>
        </button>
      )}

      {/* 2. MAIN FULL SCREEN PREVIEW AREA */}
      <main className="flex-1 w-full flex items-center justify-center relative">
        <div
          className={`w-full transition-all duration-300 ${
            desktopViewMode === 'phone'
              ? 'max-w-[420px] my-6 min-h-[90vh] shadow-2xl rounded-[36px] overflow-hidden border-4 border-stone-800 bg-stone-950 relative'
              : 'min-h-screen w-full bg-stone-950'
          }`}
        >
          <InvitationPublicView
            key={`cust-theme-${template.id}-${animKey}`}
            invitation={sampleInvitation}
            guestName="Bapak / Ibu Tamu Terhormat"
            isSimulator={desktopViewMode === 'phone'}
            animationKey={animKey}
            highContrast={highContrast}
            onToggleHighContrast={setHighContrast}
            showFloatingContrastButton={false}
          />
        </div>
      </main>

      {/* 3. FLOATING BOTTOM WHATSAPP CTA BAR (Direct to 081383750998) */}
      <footer className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:left-auto z-40 flex flex-col items-center sm:items-end gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Quick theme trigger on bottom */}
          <button
            onClick={() => setShowThemeDrawer(true)}
            className="py-2.5 px-3.5 rounded-full bg-stone-900/95 hover:bg-stone-800 text-stone-200 border border-stone-700 shadow-xl backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 sm:hidden"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Pilih Tema</span>
          </button>

          {/* Primary WhatsApp Order Button to 081383750998 */}
          <button
            onClick={handleOrderViaWhatsApp}
            className="group py-3 px-5 sm:px-6 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-600/50 flex items-center gap-2.5 border border-emerald-300/40 transition-all hover:scale-[1.03] active:scale-95 animate-pulse hover:animate-none"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-white font-bold">
                Pesan Tema Ini via WhatsApp
              </span>
              <span className="block text-[10px] text-emerald-100 font-normal">
                Nomor Resmi Facth: 0813-8375-0998
              </span>
            </div>
          </button>
        </div>
      </footer>

      {/* 4. THEME SELECTOR DRAWER / MODAL */}
      <AnimatePresence>
        {showThemeDrawer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="bg-stone-900 border border-stone-800 w-full max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
                <div className="flex items-center gap-3">
                  <FacthLogo size="xs" theme="dark" className="h-8 sm:h-9" />
                  <div className="border-l border-stone-800 pl-3">
                    <h3 className="font-serif-display font-bold text-sm sm:text-base text-amber-100 leading-tight">
                      Pilihan Tema Undangan Digital
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Klik salah satu tema di bawah untuk langsung mencoba tampilan layar penuh
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowThemeDrawer(false)}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Grid */}
              <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {TEMPLATES.map((tmpl) => {
                  const visuals = getThemeVisuals(tmpl.id);
                  const isCurrent = tmpl.id === template.id;

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        onSelectAnotherTheme(tmpl.id);
                        setShowThemeDrawer(false);
                      }}
                      className={`group relative rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-500/30 shadow-lg'
                          : 'border-stone-800 bg-stone-900/60 hover:border-stone-700 hover:bg-stone-800/50'
                      }`}
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-950 mb-2.5">
                          <img
                            src={tmpl.thumbnail}
                            alt={tmpl.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-amber-300 border border-amber-400/30">
                            {tmpl.accentBadge}
                          </div>
                          {isCurrent && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center gap-1 shadow-md">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Sedang Dilihat</span>
                            </div>
                          )}
                        </div>

                        {/* Title & Category */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-serif-display font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors">
                            {tmpl.name}
                          </h4>
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                            style={{ backgroundColor: visuals.palette.primary }}
                          />
                        </div>
                        <p className="text-[11px] text-stone-400 mb-2">{tmpl.category}</p>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>

                      {/* Select Button */}
                      <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-amber-400/80 font-medium">
                          {tmpl.previewFeatures[0]}
                        </span>
                        <span className="font-semibold text-stone-300 group-hover:text-amber-300 flex items-center gap-1">
                          <span>{isCurrent ? 'Sedang Aktif' : 'Coba Tema Ini'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-3.5 sm:p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
                <span>
                  Ingin tanya paket & diskon? Hubungi{' '}
                  <strong className="text-white">0813-8375-0998</strong>
                </span>
                <button
                  onClick={handleOrderViaWhatsApp}
                  className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                  <span>Chat Admin</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
