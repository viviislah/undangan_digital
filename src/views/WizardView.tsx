import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  Calendar,
  MapPin,
  Music,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TEMPLATES } from '../data/templates';
import { TemplateDefinition, InvitationData, InvitationCategory, MusicConfig } from '../types/invitation';
import { createNewInvitationFromTemplate } from '../services/storageService';
import { getThemeVisuals } from '../data/weddingAssets';
import { getThemeOpeningAnimation } from '../data/themeAnimations';
import { MusicSelector } from '../components/MusicSelector';
import { romanticAudio } from '../services/audioService';

interface WizardViewProps {
  initialTemplate?: TemplateDefinition;
  onFinish: (invitation: InvitationData) => void;
  onCancel: () => void;
}

export const WizardView: React.FC<WizardViewProps> = ({
  initialTemplate,
  onFinish,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const category: InvitationCategory = 'wedding';
  const [title, setTitle] = useState('The Wedding of Arya & Citra');
  const [slug, setSlug] = useState('arya-citra');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(
    initialTemplate || TEMPLATES[0]
  );

  // Couple / Honoree Info
  const [priaLengkap, setPriaLengkap] = useState('Arya Pratama, S.T.');
  const [priaPanggilan, setPriaPanggilan] = useState('Arya');
  const [priaOrangTua, setPriaOrangTua] = useState('Putra dari Bpk. Bambang & Ibu Retno');

  const [wanitaLengkap, setWanitaLengkap] = useState('Citra Kirana, S.I.Kom.');
  const [wanitaPanggilan, setWanitaPanggilan] = useState('Citra');
  const [wanitaOrangTua, setWanitaOrangTua] = useState('Putri dari Bpk. Hendra & Ibu Siti');

  // Event Info
  const [tanggal, setTanggal] = useState('2025-11-20');
  const [waktu, setWaktu] = useState('09:00');
  const [lokasi, setLokasi] = useState('Ballroom Grand Asri Jakarta');
  const [alamat, setAlamat] = useState('Jl. Sudirman No. 100, Jakarta');

  // Music Configuration State
  const [musicConfig, setMusicConfig] = useState<MusicConfig>({
    enabled: true,
    autoPlay: true,
    presetId: 'romantic-harp',
    title: 'Romantic Acoustic Harp & Chime',
    artist: 'Harmoni Akustik Studio',
    audioUrl: '',
  });

  // Step 1 to 2
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      romanticAudio.pause();
      // Build final invitation object
      const finalInvitation = createNewInvitationFromTemplate(selectedTemplate, {
        title,
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || `undangan-${Date.now()}`,
        category,
        mempelaiPria: {
          namaLengkap: priaLengkap,
          namaPanggilan: priaPanggilan,
          orangTua: priaOrangTua,
          fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        },
        mempelaiWanita: {
          namaLengkap: wanitaLengkap,
          namaPanggilan: wanitaPanggilan,
          orangTua: wanitaOrangTua,
          fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        },
        events: [
          {
            id: 'evt-wizard-1',
            namaAcara: 'Akad Nikah / Pemberkatan',
            tanggal,
            waktuMulai: waktu,
            waktuSelesai: '11:00',
            zonaWaktu: 'WIB',
            namaTempat: lokasi,
            alamat,
            linkGoogleMaps: 'https://maps.google.com/?q=Jakarta',
          },
          {
            id: 'evt-wizard-2',
            namaAcara: 'Resepsi Pernikahan',
            tanggal,
            waktuMulai: '11:30',
            waktuSelesai: '15:00',
            zonaWaktu: 'WIB',
            namaTempat: lokasi,
            alamat,
            linkGoogleMaps: 'https://maps.google.com/?q=Jakarta',
          },
        ],
        music: musicConfig,
      });

      onFinish(finalInvitation);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden flex flex-col"
      >
        {/* Step Progress Bar */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                Langkah {currentStep} dari 4
              </span>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold mt-1 text-white">
                {currentStep === 1 && 'Pilih Kategori & Judul Undangan'}
                {currentStep === 2 && 'Pilih Template Desain'}
                {currentStep === 3 && 'Informasi Mempelai & Acara'}
                {currentStep === 4 && 'Personalisasi & Finalisasi'}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="text-xs text-stone-400 hover:text-white transition-colors"
            >
              Batal
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep >= step ? 'bg-amber-500' : 'bg-stone-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* STEP 1: Judul & Link */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Judul Undangan
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: The Wedding of Arya & Citra"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Link Unik Undangan (URL Slug)
                </label>
                <div className="flex items-center rounded-xl border border-stone-300 px-3 bg-stone-50">
                  <span className="text-xs text-stone-400 font-mono">facthprinting.id/#invite/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="arya-citra"
                    className="flex-1 py-3 px-2 bg-transparent text-sm font-mono text-stone-900 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400">
                  Gunakan huruf kecil dan tanda hubung (-) tanpa spasi.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Pilih Template */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500">
                  Setiap template memiliki gaya ornamen, bentuk bingkai, palet warna, dan kartu countdown tersendiri.
                </p>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {TEMPLATES.length} Gaya Unik
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-h-[440px] overflow-y-auto custom-scrollbar p-1">
                {TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate.id === tmpl.id;
                  const visuals = getThemeVisuals(tmpl.id);

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all bg-white flex flex-col ${
                        isSelected
                          ? 'border-amber-600 ring-2 ring-amber-500/25 shadow-lg -translate-y-0.5'
                          : 'border-stone-200 hover:border-stone-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                        <img
                          src={tmpl.thumbnail}
                          alt={tmpl.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {/* Visual Palette Pill at bottom of thumbnail */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/65 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                            style={{ backgroundColor: visuals.palette.primary }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                            style={{ backgroundColor: visuals.palette.secondary }}
                          />
                          <span className="text-[9px] text-white font-medium pl-0.5">
                            {visuals.isDark ? 'Dark' : 'Light'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 text-left space-y-1 bg-white flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-stone-900 truncate">
                            {tmpl.name}
                          </h4>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {tmpl.category}
                          </span>
                        </div>

                        <div className="pt-1 space-y-1">
                          <span className="text-[9px] font-semibold text-amber-800 bg-amber-50/80 border border-amber-200/60 px-1.5 py-0.5 rounded block truncate text-center">
                            {tmpl.accentBadge}
                          </span>
                          <span className="text-[9px] text-purple-800 bg-purple-50/80 border border-purple-200/60 px-1.5 py-0.5 rounded block truncate text-center flex items-center justify-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                            <span className="truncate">{getThemeOpeningAnimation(tmpl.id).badge}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Informasi Mempelai & Acara */}
          {currentStep === 3 && (
            <div className="space-y-6 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
              {/* Mempelai Pria */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Mempelai Pria
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Nama Lengkap</label>
                    <input
                      type="text"
                      value={priaLengkap}
                      onChange={(e) => setPriaLengkap(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Nama Panggilan</label>
                    <input
                      type="text"
                      value={priaPanggilan}
                      onChange={(e) => setPriaPanggilan(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={priaOrangTua}
                    onChange={(e) => setPriaOrangTua(e.target.value)}
                    placeholder="Contoh: Putra dari Bpk... & Ibu..."
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mempelai Wanita */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Mempelai Wanita
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Nama Lengkap</label>
                    <input
                      type="text"
                      value={wanitaLengkap}
                      onChange={(e) => setWanitaLengkap(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Nama Panggilan</label>
                    <input
                      type="text"
                      value={wanitaPanggilan}
                      onChange={(e) => setWanitaPanggilan(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={wanitaOrangTua}
                    onChange={(e) => setWanitaOrangTua(e.target.value)}
                    placeholder="Contoh: Putri dari Bpk... & Ibu..."
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Acara Utama */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Jadwal & Lokasi Utama
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Tanggal Acara</label>
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Waktu Mulai</label>
                    <input
                      type="time"
                      value={waktu}
                      onChange={(e) => setWaktu(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600">Nama Tempat / Gedung</label>
                  <input
                    type="text"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Personalisasi & Konfirmasi */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Ringkasan Undangan Siap Dibuat!</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Setelah menekan tombol di bawah, Anda akan masuk ke <b>Editor Mini Canva</b> untuk menyempurnakan foto, mengatur urutan kisah cinta, amplop digital, dan langsung membagikan link ke para tamu.
                </p>
              </div>

              {/* Music Selection & Customization */}
              <div className="space-y-2">
                <MusicSelector music={musicConfig} onChange={setMusicConfig} />
              </div>

              {/* Selected Template Badge */}
              <div className="p-4 rounded-2xl border border-stone-200 flex items-center gap-4">
                <img
                  src={selectedTemplate.thumbnail}
                  alt={selectedTemplate.name}
                  className="w-16 h-20 object-cover rounded-xl border border-stone-200"
                />
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">
                    Template Terpilih
                  </span>
                  <h4 className="font-bold text-sm text-stone-900">{selectedTemplate.name}</h4>
                  <p className="text-xs text-stone-500">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => {
                romanticAudio.pause();
                setCurrentStep((prev) => prev - 1);
              }}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <button
              onClick={() => {
                romanticAudio.pause();
                onCancel();
              }}
              className="px-4 py-2.5 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-medium"
            >
              Kembali
            </button>
          )}

          <button
            id="wizard-btn-next"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-600/20 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>{currentStep === 4 ? 'Buka Mini Canva Editor' : 'Lanjutkan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
