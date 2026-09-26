import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Smartphone,
  Music,
  Share2,
  BookOpen,
  Palette,
  Heart,
  Shield,
  Layers,
  X,
  RotateCcw,
  MessageCircle,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TEMPLATES } from '../data/templates';
import { TemplateDefinition } from '../types/invitation';
import { getThemeVisuals } from '../data/weddingAssets';
import { getThemeOpeningAnimation } from '../data/themeAnimations';
import { PhoneSimulator } from '../components/PhoneSimulator';
import { InvitationPublicView } from '../components/InvitationPublicView';
import { createNewInvitationFromTemplate } from '../services/storageService';
import { FacthLogo } from '../components/FacthLogo';
import { ShareThemeModal } from '../components/ShareThemeModal';

interface LandingPageViewProps {
  onStartNew: (template?: TemplateDefinition) => void;
  onGoToDashboard: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartNew,
  onGoToDashboard,
}) => {
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [previewAnimKey, setPreviewAnimKey] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalTemplateId, setShareModalTemplateId] = useState<string | undefined>(undefined);

  const handleOpenShareModal = (templateId?: string) => {
    setShareModalTemplateId(templateId);
    setIsShareModalOpen(true);
  };

  const previewInvitationData = selectedPreviewTemplate
    ? createNewInvitationFromTemplate(selectedPreviewTemplate, {
        title: `The Wedding (${selectedPreviewTemplate.name})`,
        isPublished: true,
      })
    : null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-stone-200 bg-gradient-to-b from-amber-50/60 via-stone-50 to-white">
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-rose-200/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy - Staggered Slide-in */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Mini Canva Khusus Undangan Digital</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]"
              >
                Buat Undangan Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500">
                  dengan Mudah & Elegan
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Platform pembuat undangan web pernikahan dan acara spesial yang interaktif, modern, dan mobile-first. Pilih template mewah, sesuaikan data pengantin, unggah foto, dan bagikan langsung ke WhatsApp dalam hitungan menit.
              </motion.p>

              {/* Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
              >
                <button
                  id="hero-btn-start"
                  onClick={() => onStartNew()}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-base shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Buat Undangan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-btn-templates"
                  onClick={() => {
                    document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold text-base transition-colors"
                >
                  Lihat Pilihan Template
                </button>
              </motion.div>

              {/* Feature Highlights Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-500 font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Langsung Aktif & Siap Sebar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Musik Latar Romantis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Buku Tamu & RSVP Online</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Hero Mobile Mockup Preview - Slide-in from Right */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-[340px] transform hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-rose-400 rounded-[50px] blur-xl opacity-30 -z-10" />
                <div className="bg-stone-900 rounded-[44px] p-2.5 shadow-2xl border-4 border-stone-800">
                  <div className="rounded-[36px] overflow-hidden bg-stone-950 aspect-[9/18] relative shadow-inner">
                    <img
                      src="/images/Salinan-foto-profil.png"
                      alt="Preview Undangan"
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex flex-col justify-end p-6 text-center text-white">
                      <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold mb-1">
                        The Wedding Celebration
                      </span>
                      <h3 className="font-serif-display text-2xl font-bold text-amber-100">
                        Rizky & Amanda
                      </h3>
                      <p className="text-[11px] text-stone-300 mt-1">Sabtu, 25 Oktober 2025</p>
                      <div className="mt-4 py-2.5 px-4 rounded-full bg-amber-600 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>Buka Undangan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TEMPLATES SECTION */}
      <section id="templates-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-stone-200"
        >
          <div className="space-y-2 max-w-2xl text-left">
            <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full">
              Koleksi Eksklusif
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              Pilihan Template Desain Undangan
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Pilih dari berbagai gaya desain yang dirancang khusus untuk memancarkan aura sakral, kemewahan, dan kehangatan hari bahagia Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleOpenShareModal()}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs shadow-lg shadow-emerald-700/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Kirim Pilihan Tema ke Customer</span>
            </button>
          </div>
        </motion.div>

        {/* Templates Grid with Staggered Slide-in */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((tmpl, idx) => {
            const tmplVisuals = getThemeVisuals(tmpl.id);

            return (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: (idx % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                  <img
                    src={tmpl.thumbnail}
                    alt={tmpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-stone-800 text-[11px] font-bold shadow-sm">
                      {tmpl.accentBadge}
                    </span>
                  </div>

                  {/* Palette Swatch Preview Pill */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/65 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: tmplVisuals.palette.primary }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: tmplVisuals.palette.secondary }}
                    />
                    <span className="text-[10px] text-white font-medium pl-0.5">
                      {tmplVisuals.isDark ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>

                  {/* Hover overlay with action buttons */}
                  <div className="absolute inset-0 bg-stone-900/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-3.5 gap-2 backdrop-blur-[2px]">
                    <button
                      onClick={() => setSelectedPreviewTemplate(tmpl)}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-700" />
                      <span>Lihat Pratinjau</span>
                    </button>
                    <button
                      onClick={() => handleOpenShareModal(tmpl.id)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>Kirim ke Customer</span>
                    </button>
                    <button
                      onClick={() => onStartNew(tmpl)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gunakan Template Ini</span>
                    </button>
                  </div>
                </div>

              {/* Template Info Card */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-display font-bold text-lg text-stone-900">
                      {tmpl.name}
                    </h3>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>

                {/* Features tags */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium inline-flex items-center gap-1 border border-purple-200/60">
                    <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                    <span>{getThemeOpeningAnimation(tmpl.id).badge}</span>
                  </span>
                  {tmpl.previewFeatures.slice(0, 1).map((feat, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium truncate max-w-[130px]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Direct Action Buttons (Desktop & Mobile) */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => setSelectedPreviewTemplate(tmpl)}
                    className="py-1.5 px-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-[11px] font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                    title="Lihat Pratinjau Tema"
                  >
                    <Eye className="w-3 h-3 text-stone-500" />
                    <span>Pratinjau</span>
                  </button>
                  <button
                    onClick={() => handleOpenShareModal(tmpl.id)}
                    className="py-1.5 px-1.5 rounded-lg border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                    title="Kirim Tema ke WhatsApp Customer"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                    <span>Kirim WA</span>
                  </button>
                  <button
                    onClick={() => onStartNew(tmpl)}
                    className="py-1.5 px-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold text-center flex items-center justify-center gap-1 shadow-sm transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Pilih</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>
      </section>

      {/* 3. KEY FEATURES SECTION */}
      <section className="py-20 bg-stone-100/80 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="text-center space-y-3 max-w-2xl mx-auto mb-16"
          >
            <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full">
              Fitur Lengkap
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              Segala yang Anda Butuhkan untuk Undangan Sempurna
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Dibuat dengan teknologi mutakhir untuk memberikan pengalaman membaca undangan yang mulus bagi seluruh tamu undangan Anda.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Palette,
                title: 'Editor Mini Canva yang Mudah',
                desc: 'Ubah teks, ganti warna aksen, unggah foto, dan susun kisah cinta tanpa perlu keahlian desain teknis.',
              },
              {
                icon: Smartphone,
                title: 'Live Mobile Simulator',
                desc: 'Lihat perubahan secara instan pada mockup smartphone 390x844px persis seperti yang akan dilihat oleh para tamu.',
              },
              {
                icon: BookOpen,
                title: 'RSVP & Buku Tamu Interaktif',
                desc: 'Tamu dapat langsung mengonfirmasi jumlah kehadiran dan menuliskan doa restu yang tersimpan otomatis di buku tamu.',
              },
              {
                icon: Music,
                title: 'Alunan Musik Latar Harmonis',
                desc: 'Dilengkapi arpeggio akustik romantis yang langsung menyala lembut saat tamu membuka amplop undangan.',
              },
              {
                icon: Share2,
                title: 'Integrasi Berbagi WhatsApp',
                desc: 'Generate format pesan undangan sopan dengan nama tamu spesifik dalam satu klik siap kirim via WhatsApp.',
              },
              {
                icon: Shield,
                title: 'Amplop & Kado Digital Aman',
                desc: 'Fasilitasi tamu yang ingin memberikan tanda kasih secara cashless dengan fitur salin rekening & konfirmasi alamat paket.',
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.6, delay: (i % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-stone-900">{feat.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-8 sm:p-12 text-white overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
              Mulai Dalam 2 Menit
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold leading-tight">
              Siap Membuat Undangan Impian Anda Hari Ini?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Jadikan momen bahagia Anda semakin berkesan dengan undangan digital yang memukau keluarga dan para sahabat.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => onStartNew()}
                className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-transform active:scale-95"
              >
                <span>Buat Undangan Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onGoToDashboard}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                Kelola Undangan Saya
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. MODAL PREVIEW TEMPLATE with AnimatePresence */}
      <AnimatePresence>
        {selectedPreviewTemplate && previewInvitationData && (
          <motion.div
            id="modal-preview-template-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPreviewTemplate(null)}
          >
            <motion.div
              id="modal-preview-template-box"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative bg-stone-900 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-stone-800 flex flex-col md:flex-row gap-6 max-h-[92vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPreviewTemplate(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left: Phone Simulator */}
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="w-full flex justify-end max-w-sm">
                  <button
                    onClick={() => setPreviewAnimKey((k) => k + 1)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Replay Buka Undangan</span>
                  </button>
                </div>
                <PhoneSimulator>
                  <InvitationPublicView
                    key={`landing-preview-${previewAnimKey}`}
                    invitation={previewInvitationData}
                    guestName="Bapak / Ibu Tamu Terhormat"
                    isSimulator
                    animationKey={previewAnimKey}
                    showFloatingContrastButton={false}
                  />
                </PhoneSimulator>
              </div>

              {/* Right: Template Description & Action */}
              <div className="w-full md:w-80 flex flex-col justify-between py-2 text-stone-200 space-y-4">
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                    Pratinjau Template
                  </span>
                  <h3 className="font-serif-display text-2xl font-bold text-white">
                    {selectedPreviewTemplate.name}
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {selectedPreviewTemplate.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="p-3 rounded-xl bg-stone-800/80 border border-purple-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Animasi Buka Undangan: {getThemeOpeningAnimation(selectedPreviewTemplate.id).badge}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-snug">
                        {getThemeOpeningAnimation(selectedPreviewTemplate.id).description}
                      </p>
                    </div>

                    <p className="text-xs font-semibold text-stone-300 pt-1">Fitur Desain:</p>
                    <ul className="space-y-1.5 text-xs text-stone-400">
                      {selectedPreviewTemplate.previewFeatures.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800 space-y-2.5">
                  <button
                    onClick={() => {
                      const tmplId = selectedPreviewTemplate.id;
                      handleOpenShareModal(tmplId);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Kirim Tema Ini ke Customer (WhatsApp)</span>
                  </button>
                  <button
                    onClick={() => {
                      const tmpl = selectedPreviewTemplate;
                      setSelectedPreviewTemplate(null);
                      onStartNew(tmpl);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Gunakan Template Ini Sekarang</span>
                  </button>
                  <button
                    onClick={() => setSelectedPreviewTemplate(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs transition-colors"
                  >
                    Tutup Pratinjau
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. SHARE THEMES TO CUSTOMER MODAL */}
      <ShareThemeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialTemplateId={shareModalTemplateId}
        templates={TEMPLATES}
        onOpenPreview={(tmpl) => {
          setIsShareModalOpen(false);
          setSelectedPreviewTemplate(tmpl);
        }}
      />

      {/* FOOTER */}
      <footer className="bg-stone-900 border-t border-stone-800 py-12 text-center text-xs text-stone-400 space-y-4">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <FacthLogo size="md" theme="dark" className="h-14 sm:h-16 opacity-95" />
          <span className="text-amber-400 text-[10px] uppercase tracking-widest font-semibold mt-1">
            Undangan Digital Premium
          </span>
        </div>
        <p className="max-w-md mx-auto text-stone-500 pt-2 border-t border-stone-800">
          Aplikasi Pembuat Undangan Digital Modern, Elegan & Profesional
        </p>
        <p className="text-[11px] text-stone-600">© 2026 Facth Printing. Hak cipta dilindungi.</p>
      </footer>
    </div>
  );
};
