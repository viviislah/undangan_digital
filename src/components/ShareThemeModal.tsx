import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  Eye,
  Send,
  ExternalLink,
  MessageCircle,
  Phone,
  User,
  Layers,
  Palette,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TemplateDefinition } from '../types/invitation';
import { getThemeVisuals } from '../data/weddingAssets';
import { getThemeOpeningAnimation } from '../data/themeAnimations';
import { getBaseAppUrl, getThemePreviewUrl } from '../utils/urlHelper';

interface ShareThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateId?: string;
  templates: TemplateDefinition[];
  onOpenPreview?: (template: TemplateDefinition) => void;
}

export const ShareThemeModal: React.FC<ShareThemeModalProps> = ({
  isOpen,
  onClose,
  initialTemplateId,
  templates,
  onOpenPreview,
}) => {
  const [shareMode, setShareMode] = useState<'single' | 'catalog'>(
    initialTemplateId ? 'single' : 'catalog'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId || templates[0]?.id || 'elegant-gold'
  );
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>(() =>
    templates.map((t) => t.id)
  );
  const [customerName, setCustomerName] = useState<string>('');
  const DEFAULT_VENDOR_PHONE = '081383750998';

  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [vendorPhone, setVendorPhone] = useState<string>(() => {
    const saved = localStorage.getItem('facth_vendor_phone');
    if (!saved || saved === '081234567890') {
      localStorage.setItem('facth_vendor_phone', DEFAULT_VENDOR_PHONE);
      return DEFAULT_VENDOR_PHONE;
    }
    return saved;
  });
  const [showVendorSetting, setShowVendorSetting] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync initial template when prop changes
  useEffect(() => {
    if (initialTemplateId) {
      setSelectedTemplateId(initialTemplateId);
      setShareMode('single');
    }
  }, [initialTemplateId]);

  // Save vendor phone
  const handleSaveVendorPhone = (val: string) => {
    setVendorPhone(val);
    localStorage.setItem('facth_vendor_phone', val);
  };

  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const singleThemeLink = useMemo(() => {
    return getThemePreviewUrl(currentTemplate?.id || 'elegant-gold');
  }, [currentTemplate]);

  const catalogLink = useMemo(() => {
    return `${getBaseAppUrl()}#theme/katalog`;
  }, []);

  // Toggle selection for catalog mode
  const toggleCatalogId = (id: string) => {
    setSelectedCatalogIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllCatalog = () => {
    setSelectedCatalogIds(templates.map((t) => t.id));
  };

  const deselectAllCatalog = () => {
    setSelectedCatalogIds([]);
  };

  // Build WhatsApp text with strictly ONE link
  const whatsappMessage = useMemo(() => {
    const greeting = customerName.trim()
      ? `Halo ${customerName.trim()}! ✨`
      : 'Halo Kak! ✨';

    if (shareMode === 'single' && currentTemplate) {
      const anim = getThemeOpeningAnimation(currentTemplate.id);
      return `${greeting}

Berikut rekomendasi tema undangan digital pernikahan eksklusif dari *Facth Printing*:

💎 *Tema: ${currentTemplate.name}* (${currentTemplate.category})
💡 *Deskripsi:* ${currentTemplate.description}
✨ *Fitur:* ${currentTemplate.previewFeatures.join(', ')}
🎬 *Animasi Buka:* ${anim.badge} (${anim.description})

📱 *Buka & Coba Pratinjau Tema (Layar Penuh):*
${singleThemeLink}

_Klik 1 tautan di atas untuk melihat undangan langsung dalam layar penuh. Untuk pemesanan atau konsultasi, Kakak bisa langsung klik tombol pesan di undangan atau hubungi WhatsApp kami 081383750998._ 🙏💍`;
    }

    // Catalog Mode: strictly ONE link!
    const chosenTemplates = templates.filter((t) => selectedCatalogIds.includes(t.id));
    const itemsText = chosenTemplates
      .map((t, idx) => `${idx + 1}. *${t.name}* — ${t.category} (${t.accentBadge})`)
      .join('\n');

    return `${greeting}

Terima kasih telah tertarik dengan undangan pernikahan digital dari *Facth Printing*.
Berikut pilihan tema terbaik kami yang dapat Kakak pilih untuk hari bahagia nanti:

${itemsText}

📱 *Buka & Coba Semua Tema di Layar Penuh:*
${catalogLink}

_Silakan klik 1 tautan di atas untuk melihat dan mencoba setiap tema di layar penuh smartphone Kakak. Bila sudah menemukan tema yang disukai, Kakak bisa langsung klik tombol pesan di dalam undangan atau hubungi WhatsApp kami di 081383750998._ 🙏💍`;
  }, [
    customerName,
    shareMode,
    currentTemplate,
    templates,
    selectedCatalogIds,
    singleThemeLink,
    catalogLink,
  ]);

  // Format phone to WhatsApp international format
  const formatPhoneForWA = (raw: string) => {
    let clean = raw.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = formatPhoneForWA(customerPhone);
    const encoded = encodeURIComponent(whatsappMessage);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleCopyLink = () => {
    const linkToCopy = shareMode === 'single' ? singleThemeLink : catalogLink;
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-amber-50 via-stone-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-lg text-stone-900 leading-tight">
                Kirim Pilihan Tema ke Calon Customer
              </h2>
              <p className="text-xs text-stone-500">
                Bagikan rekomendasi tema atau seluruh katalog langsung via WhatsApp & Tautan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setShareMode('single')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                shareMode === 'single'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span>Kirim 1 Tema Spesifik</span>
            </button>
            <button
              onClick={() => setShareMode('catalog')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                shareMode === 'catalog'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Kirim Pilihan / Seluruh Katalog</span>
            </button>
          </div>

          {/* Mode 1: Single Template Selector */}
          {shareMode === 'single' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Pilih Tema yang Ingin Dikirim:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {templates.map((tmpl) => {
                  const visuals = getThemeVisuals(tmpl.id);
                  const isSelected = tmpl.id === selectedTemplateId;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center text-center transition-all ${
                        isSelected
                          ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/50 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative mb-1.5 bg-stone-100">
                        <img
                          src={tmpl.thumbnail}
                          alt={tmpl.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 flex gap-0.5 bg-black/60 px-1 py-0.5 rounded">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: visuals.palette.primary }}
                          />
                        </div>
                      </div>
                      <span className="font-serif-display text-xs font-bold text-stone-800 line-clamp-1">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] text-stone-500 line-clamp-1">
                        {tmpl.category}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Selected Template Badge Summary */}
              {currentTemplate && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-stone-800">{currentTemplate.name}</span>
                      <span className="text-stone-600"> — {currentTemplate.category}</span>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {currentTemplate.description}
                      </p>
                    </div>
                  </div>
                  {onOpenPreview && (
                    <button
                      onClick={() => onOpenPreview(currentTemplate)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-[11px] font-semibold flex items-center gap-1 shrink-0"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Cek Pratinjau</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Multi Template Catalog Selector */}
          {shareMode === 'catalog' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Centang Tema yang Ingin Dimasukkan ke Daftar:
                </label>
                <div className="flex gap-2 text-[11px]">
                  <button
                    onClick={selectAllCatalog}
                    className="text-amber-700 hover:underline font-semibold"
                  >
                    Pilih Semua ({templates.length})
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={deselectAllCatalog}
                    className="text-stone-500 hover:underline font-semibold"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {templates.map((tmpl) => {
                  const isChecked = selectedCatalogIds.includes(tmpl.id);
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => toggleCatalogId(tmpl.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500/20'
                          : 'border-stone-200 hover:bg-stone-50 opacity-60'
                      }`}
                    >
                      <div className="text-amber-600">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 fill-amber-600 text-white" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                      <img
                        src={tmpl.thumbnail}
                        alt={tmpl.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-800 truncate">
                          {tmpl.name}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate">{tmpl.category}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer Personalization Fields */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Data Penerima / Calon Pemesan (Opsional):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-stone-600 font-semibold block mb-1">
                  Nama Customer / Calon Pengantin:
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Kak Dinda & Mas Rian"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-stone-600 font-semibold block mb-1">
                  Nomor WhatsApp Customer:
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081383750998 (bisa kosong)"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Vendor WhatsApp number config */}
            <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-stone-500">
              <span>
                Nomor WhatsApp Toko (Penerima Pesanan):{' '}
                <strong className="text-stone-800">{vendorPhone || '081383750998'}</strong>
              </span>
              <button
                onClick={() => setShowVendorSetting(!showVendorSetting)}
                className="text-amber-700 hover:underline font-semibold"
              >
                {showVendorSetting ? 'Tutup Pengaturan' : 'Ganti Nomor Toko'}
              </button>
            </div>

            {showVendorSetting && (
              <div className="p-2.5 rounded-lg bg-white border border-amber-200 mt-2 space-y-1.5">
                <label className="text-[10px] font-bold text-stone-700 block">
                  Nomor WhatsApp Anda / Admin Facth Printing:
                </label>
                <input
                  type="text"
                  value={vendorPhone}
                  onChange={(e) => handleSaveVendorPhone(e.target.value)}
                  placeholder="081383750998"
                  className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-stone-400">
                  Nomor ini akan otomatis dihubungi ketika calon customer mengklik tombol &quot;Pesan
                  Tema Ini via WhatsApp&quot; dari link pratinjau yang Anda kirimkan.
                </p>
              </div>
            )}
          </div>

          {/* Real-time Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pratinjau Pesan WhatsApp:</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-100 transition-colors"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  <span>{copiedLink ? 'Link Tersalin!' : 'Salin Tautan'}</span>
                </button>
                <button
                  onClick={handleCopyMessage}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-50 transition-colors"
                >
                  {copiedMessage ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>{copiedMessage ? 'Teks Tersalin!' : 'Salin Semua Teks'}</span>
                </button>
              </div>
            </div>

            <div className="bg-emerald-950/5 border border-emerald-800/15 rounded-xl p-3 text-xs text-stone-700 font-sans whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed border-l-4 border-l-emerald-600">
              {whatsappMessage}
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-stone-500 text-center sm:text-left">
            Customer akan langsung dapat membuka pratinjau tema dan mengklik tombol pesan.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopyMessage}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {copiedMessage ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-stone-500" />
              )}
              <span>{copiedMessage ? 'Teks Tersalin' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Kirim via WhatsApp</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
