import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Globe,
  Share2,
  Eye,
  ArrowLeft,
  Smartphone,
  Sliders,
  Heart,
  Calendar,
  Image as ImageIcon,
  Palette,
  Gift,
  Music,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Link2,
  RotateCcw,
  Download,
  Upload,
  X,
  Type,
  Maximize2,
  Layers,
  Smile,
  Stamp,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Pipette,
  Contrast,
  QrCode,
  MapPin,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  InvitationData,
  EventSchedule,
  LoveStoryStep,
  GalleryPhoto,
  BankAccount,
  TemplateDefinition,
  AttachedIconSticker,
} from '../types/invitation';
import { TEMPLATES } from '../data/templates';
import { getThemeVisuals, FALLBACK_GROOM_IMG, FALLBACK_BRIDE_IMG } from '../data/weddingAssets';
import { getThemeOpeningAnimation, ALL_OPENING_ANIMATIONS_LIST } from '../data/themeAnimations';
import { PhoneSimulator } from '../components/PhoneSimulator';
import { InvitationPublicView } from '../components/InvitationPublicView';
import { WhatsAppShareModal } from '../components/WhatsAppShareModal';
import { MusicSelector } from '../components/MusicSelector';
import { InvitationQRCardModal, QRTargetMode } from '../components/InvitationQRCardModal';
import { InteractiveEventMap, parseCoordinatesFromUrl } from '../components/InteractiveEventMap';
import { fetchRSVPListAsync, deduplicateRSVPList } from '../services/storageService';
import { compressImageFile, uploadImageToServer, resolveExternalMediaUrl } from '../services/imageService';

export const COLOR_PRESETS = [
  {
    name: 'Emas Kerajaan',
    desc: 'Elegan Mewah',
    headingColor: '#C5A059',
    textColor: '#2C2723',
    quoteColor: '#8C6D37',
    bgColor: '#FAF7F2',
    primaryColor: '#C5A059',
  },
  {
    name: 'Hitam Noir',
    desc: 'Obsidian Glamour',
    headingColor: '#D4AF37',
    textColor: '#E5E7EB',
    quoteColor: '#E2D9F3',
    bgColor: '#121212',
    primaryColor: '#D4AF37',
  },
  {
    name: 'Hijau Zamrud',
    desc: 'Botanikal Segar',
    headingColor: '#065F46',
    textColor: '#1F2937',
    quoteColor: '#047857',
    bgColor: '#F4F9F6',
    primaryColor: '#059669',
  },
  {
    name: 'Marun Anggun',
    desc: 'Burgundy Romantis',
    headingColor: '#881337',
    textColor: '#374151',
    quoteColor: '#9F1239',
    bgColor: '#FFF5F5',
    primaryColor: '#BE123C',
  },
  {
    name: 'Rose Gold',
    desc: 'Lembut Manis',
    headingColor: '#B45309',
    textColor: '#33272A',
    quoteColor: '#BE185D',
    bgColor: '#FFF9F9',
    primaryColor: '#DB838B',
  },
  {
    name: 'Biru Royal',
    desc: 'Aristokrat Megah',
    headingColor: '#1E3A8A',
    textColor: '#1E293B',
    quoteColor: '#2563EB',
    bgColor: '#F0F7FF',
    primaryColor: '#1D4ED8',
  },
  {
    name: 'Monokrom Bersih',
    desc: 'Minimalis Modern',
    headingColor: '#111827',
    textColor: '#374151',
    quoteColor: '#4B5563',
    bgColor: '#FFFFFF',
    primaryColor: '#111827',
  },
];

export const HEADING_FONT_OPTIONS = [
  { id: 'font-cinzel', label: 'Cinzel (Royal Elegan)', sample: 'R & A' },
  { id: 'font-serif-display', label: 'Playfair (Klasik Mewah)', sample: 'R & A' },
  { id: 'font-script', label: 'Great Vibes (Kaligrafi)', sample: 'R & A' },
  { id: 'font-brush', label: 'Alex Brush (Kuas Anggun)', sample: 'R & A' },
  { id: 'font-italiana', label: 'Italiana (Minimalis Chic)', sample: 'R & A' },
  { id: 'font-parisienne', label: 'Parisienne (Klasik Cursive)', sample: 'R & A' },
  { id: 'font-garamond', label: 'Garamond (Sastra Mewah)', sample: 'R & A' },
  { id: 'font-sacramento', label: 'Sacramento (Manis Ramping)', sample: 'R & A' },
];

export const BODY_FONT_OPTIONS = [
  { id: 'font-sans-clean', label: 'Plus Jakarta Sans', desc: 'Modern, Jernih & Rapi' },
  { id: 'font-garamond', label: 'Cormorant Garamond', desc: 'Klasik Puitis & Sastra Mewah' },
  { id: 'font-serif-display', label: 'Playfair Display', desc: 'Serif Anggun Berkelas' },
  { id: 'font-italiana', label: 'Italiana', desc: 'Chic Elegan & Ramping' },
];

export const STORY_COLOR_PRESETS = [
  {
    name: 'Emas Mewah',
    desc: 'Elegan Berkilau',
    heading: '#C5A059',
    text: '#2C2723',
    year: '#C5A059',
    badgeBg: '#FDF6E9',
  },
  {
    name: 'Hitam & Emas',
    desc: 'Obsidian Elegan',
    heading: '#D4AF37',
    text: '#E5E7EB',
    year: '#D4AF37',
    badgeBg: '#1F2937',
  },
  {
    name: 'Hijau Zamrud',
    desc: 'Botani Segar',
    heading: '#065F46',
    text: '#1F2937',
    year: '#059669',
    badgeBg: '#ECFDF5',
  },
  {
    name: 'Marun Burgundy',
    desc: 'Romantis Mendalam',
    heading: '#881337',
    text: '#374151',
    year: '#BE123C',
    badgeBg: '#FFF1F2',
  },
  {
    name: 'Biru Royal',
    desc: 'Megah & Mewah',
    heading: '#1E3A8A',
    text: '#1E293B',
    year: '#2563EB',
    badgeBg: '#EFF6FF',
  },
  {
    name: 'Monokrom Rapi',
    desc: 'Minimalis Modern',
    heading: '#111827',
    text: '#374151',
    year: '#4B5563',
    badgeBg: '#F3F4F6',
  },
];

interface LocalImageUploaderProps {
  currentUrl: string;
  onUpload: (url: string) => void;
  placeholder?: string;
  prefix?: string;
  cardMode?: boolean;
  label?: string;
}

const LocalImageUploader: React.FC<LocalImageUploaderProps> = ({
  currentUrl,
  onUpload,
  placeholder = "Masukkan URL atau unggah berkas...",
  prefix = "photo",
  cardMode = false,
  label,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // 1. Compress image down to crisp, lightweight size (~150KB) to protect against memory & localStorage quota
      const compressed = await compressImageFile(file, { maxDimension: 1600, quality: 0.82 });
      
      // 2. Upload to server to get permanent /uploads/... URL
      const finalUrl = await uploadImageToServer(compressed, prefix);
      onUpload(finalUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
      // Fallback to basic file reader if canvas compression fails
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          onUpload(base64Url);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTextUrlChange = (val: string) => {
    const trimmed = val.trim();
    const resolved = resolveExternalMediaUrl(trimmed);
    onUpload(resolved);
  };

  const hasPhoto = Boolean(currentUrl && currentUrl.trim() !== '');

  // Card Mode (Used for Mempelai Pria, Mempelai Wanita, and prominent photos):
  // Displays large, clear portrait frame so photos are unmistakably visible and sharp
  if (cardMode) {
    return (
      <div className="w-full space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="w-full max-w-sm mx-auto h-52 sm:h-60 rounded-2xl border-2 border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center gap-2 p-6 text-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="text-xs font-bold text-amber-900">Mengunggah & Mengoptimasi Foto...</span>
            <span className="text-[11px] text-amber-700">Menjadikan foto jernih, tajam & proporsional</span>
          </div>
        ) : hasPhoto ? (
          <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-stone-900 relative group transition-all">
            {/* Grand Large Portrait Image Preview */}
            <div className="w-full h-56 sm:h-64 bg-stone-800 relative overflow-hidden flex items-center justify-center">
              <img
                src={resolveExternalMediaUrl(currentUrl)}
                alt="Preview Foto"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    prefix === 'wanita' ? FALLBACK_BRIDE_IMG : FALLBACK_GROOM_IMG;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/40 pointer-events-none" />

              {/* Status Badge Top Left */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600/95 backdrop-blur-xs text-white text-[11px] font-bold shadow flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Foto Terpasang & Jelas
                </span>
              </div>

              {/* Action Buttons Top Right */}
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-stone-800 text-xs font-bold shadow-md flex items-center gap-1 transition-transform active:scale-95 cursor-pointer backdrop-blur-xs"
                  title="Ganti berkas foto"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-700" />
                  <span>Ganti</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpload('')}
                  className="p-1.5 rounded-lg bg-rose-600/95 hover:bg-rose-700 text-white shadow-md transition-transform active:scale-95 cursor-pointer backdrop-blur-xs"
                  title="Hapus foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Details & Change Link */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] z-10">
                <span className="truncate max-w-[210px] font-mono bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs border border-white/10">
                  {currentUrl.startsWith('data:') ? 'Disimpan Lokal (Tersimpan)' : currentUrl.split('/').pop() || 'Foto'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-amber-300 hover:text-amber-200 font-semibold underline text-[11px] cursor-pointer"
                >
                  {showUrlInput ? 'Tutup URL' : 'Edit URL'}
                </button>
              </div>
            </div>

            {/* Optional URL input toggle */}
            {showUrlInput && (
              <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
                <span className="text-[11px] text-stone-500 font-semibold shrink-0">URL:</span>
                <input
                  type="text"
                  value={currentUrl.startsWith('data:') ? 'Foto Terunggah Lokal (Tersimpan Aman)' : currentUrl}
                  onChange={(e) => handleTextUrlChange(e.target.value)}
                  disabled={currentUrl.startsWith('data:') || isUploading}
                  placeholder={placeholder}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 truncate"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-sm mx-auto space-y-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 sm:h-52 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 transition-all cursor-pointer flex flex-col items-center justify-center p-5 text-center group active:scale-[0.99] shadow-xs"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 group-hover:bg-amber-200 text-amber-700 flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-stone-800 group-hover:text-amber-900">
                Klik untuk Pilih / Unggah Foto
              </span>
              <span className="text-[11px] text-stone-500 mt-1 max-w-[240px]">
                Foto tampil besar, tegak/portrait, dan tajam (tidak terpotong bulat)
              </span>
              <span className="mt-2 text-[10px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                Format JPG, PNG, WebP
              </span>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input
                type="text"
                value=""
                onChange={(e) => handleTextUrlChange(e.target.value)}
                placeholder="Atau tempel link tautan URL foto di sini..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-800"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard inline mode (Used for Gallery, Love Story, etc.)
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center gap-2">
        {/* Preview thumbnail if photo exists (larger, clear preview) */}
        {hasPhoto && (
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-300 shrink-0 bg-stone-100 shadow-2xs relative group">
            <img
              src={resolveExternalMediaUrl(currentUrl)}
              alt="Preview"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  prefix === 'wanita'
                    ? FALLBACK_BRIDE_IMG
                    : prefix === 'pria'
                    ? FALLBACK_GROOM_IMG
                    : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80';
              }}
            />
          </div>
        )}

        <input
          type="text"
          value={currentUrl.startsWith('data:') ? 'Foto Terunggah Lokal (Tersimpan)' : currentUrl}
          onChange={(e) => handleTextUrlChange(e.target.value)}
          placeholder={placeholder}
          disabled={currentUrl.startsWith('data:') || isUploading}
          className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-800 disabled:bg-stone-50 disabled:text-stone-500 disabled:font-medium disabled:italic truncate"
        />
        
        {isUploading ? (
          <button
            type="button"
            disabled
            className="bg-amber-100 text-amber-800 px-3 py-2 text-xs rounded-lg flex items-center gap-1.5 font-semibold shrink-0 cursor-not-allowed"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Memproses...</span>
          </button>
        ) : hasPhoto ? (
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-2 text-xs rounded-lg flex items-center gap-1 transition-all font-semibold active:scale-95 cursor-pointer shadow-2xs border border-stone-200"
              title="Ganti Foto"
            >
              <Upload className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Ganti</span>
            </button>
            <button
              type="button"
              onClick={() => onUpload('')}
              className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 px-2.5 py-2 text-xs rounded-lg flex items-center gap-1 transition-all font-semibold active:scale-95 cursor-pointer shadow-2xs"
              title="Hapus foto"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 text-xs rounded-lg flex items-center gap-1.5 transition-all font-semibold active:scale-95 cursor-pointer shrink-0 shadow-2xs"
            title="Unggah Foto dari Galeri HP/Laptop"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah</span>
          </button>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

// Helper to extract form data payload ignoring volatile metadata timestamps
const serializeFormPayload = (inv: InvitationData): string => {
  const { updatedAt, viewsCount, ...rest } = inv;
  return JSON.stringify(rest);
};

interface EditorViewProps {
  initialInvitation: InvitationData;
  onSave: (invitation: InvitationData) => void;
  onBackToDashboard: () => void;
  onFullscreenPreview: (invitation: InvitationData) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  initialInvitation,
  onSave,
  onBackToDashboard,
  onFullscreenPreview,
}) => {
  const [invitation, setInvitation] = useState<InvitationData>(initialInvitation);
  const [activeTab, setActiveTab] = useState<
    'mempelai' | 'acara' | 'desain' | 'galeri' | 'kado' | 'rsvp'
  >('mempelai');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrModalTarget, setQrModalTarget] = useState<QRTargetMode>('directions');
  const [selectedEventQrIdx, setSelectedEventQrIdx] = useState<number>(0);
  const [saveToast, setSaveToast] = useState(false);
  const [publishToast, setPublishToast] = useState(false);
  const [previewOpened, setPreviewOpened] = useState(false);
  const [previewAnimationKey, setPreviewAnimationKey] = useState(0);

  // Auto-Save feature state & refs
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const lastSavedPayloadRef = useRef<string>(serializeFormPayload(initialInvitation));
  const latestInvitationRef = useRef<InvitationData>(invitation);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRenderRef = useRef<boolean>(true);

  // Keep latest invitation in ref for unmount flush & immediate handlers
  useEffect(() => {
    latestInvitationRef.current = invitation;
  }, [invitation]);

  // Debounced auto-save effect triggered on any invitation form data change
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const currentPayload = serializeFormPayload(invitation);
    if (currentPayload === lastSavedPayloadRef.current) {
      return;
    }

    setAutoSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      lastSavedPayloadRef.current = serializeFormPayload(invitation);
      onSave(invitation);
      setAutoSaveStatus('saved');
      debounceTimerRef.current = null;
    }, 700);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [invitation, onSave]);

  // Flush any pending auto-save on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        const currentPayload = serializeFormPayload(latestInvitationRef.current);
        if (currentPayload !== lastSavedPayloadRef.current) {
          lastSavedPayloadRef.current = currentPayload;
          onSave(latestInvitationRef.current);
        }
      }
    };
  }, [onSave]);

  const [previewHighContrast, setPreviewHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('vhistetic_high_contrast') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isSuratStylingOpen, setIsSuratStylingOpen] = useState(true);
  const [isStoryStylingOpen, setIsStoryStylingOpen] = useState(true);
  const [expandedStoryColorId, setExpandedStoryColorId] = useState<string | null>(null);

  // Apply unified theme color palette preset
  const handleApplyColorPreset = (preset: (typeof COLOR_PRESETS)[0]) => {
    updateProp('theme', {
      ...invitation.theme,
      headingColor: preset.headingColor,
      textColor: preset.textColor,
      quoteColor: preset.quoteColor,
      bgColor: preset.bgColor,
      primaryColor: preset.primaryColor,
    });
  };

  // Apply story font color preset
  const handleApplyStoryPreset = (preset: (typeof STORY_COLOR_PRESETS)[0]) => {
    updateProp('theme', {
      ...invitation.theme,
      storyHeadingColor: preset.heading,
      storyTextColor: preset.text,
      storyYearColor: preset.year,
      storyBadgeBgColor: preset.badgeBg,
    });
  };

  // Sync story colors with current main theme colors
  const handleSyncStoryWithMainTheme = () => {
    updateProp('theme', {
      ...invitation.theme,
      storyHeadingColor: invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059',
      storyTextColor: invitation.theme.textColor || '#2C2723',
      storyYearColor: invitation.theme.primaryColor || '#C5A059',
      storyBadgeBgColor: '#FAF7F2',
    });
  };

  // Update root invitation properties
  const updateProp = <K extends keyof InvitationData>(key: K, value: InvitationData[K]) => {
    setInvitation((prev) => ({ ...prev, [key]: value }));
  };

  // Sync latest incoming RSVPs from server so they are visible in editor live
  useEffect(() => {
    const targetId = invitation.slug || invitation.id;
    if (!targetId) return;

    fetchRSVPListAsync(targetId).then((list) => {
      if (list && Array.isArray(list) && list.length > 0) {
        setInvitation((prev) => ({ ...prev, rsvpList: list }));
      }
    });

    const timer = setInterval(() => {
      fetchRSVPListAsync(targetId).then((list) => {
        if (list && Array.isArray(list) && list.length > 0) {
          setInvitation((prev) => ({ ...prev, rsvpList: list }));
        }
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [invitation.id, invitation.slug]);

  // Keep local state in sync when server returns permanent uploaded URLs
  useEffect(() => {
    if (initialInvitation && initialInvitation.id === invitation.id) {
      if (initialInvitation.updatedAt !== invitation.updatedAt) {
        setInvitation((prev) => {
          const nextInv = {
            ...prev,
            coverPhotoUrl: initialInvitation.coverPhotoUrl || prev.coverPhotoUrl,
            mempelaiPria: {
              ...prev.mempelaiPria,
              fotoUrl: initialInvitation.mempelaiPria?.fotoUrl || prev.mempelaiPria.fotoUrl,
            },
            mempelaiWanita: {
              ...prev.mempelaiWanita,
              fotoUrl: initialInvitation.mempelaiWanita?.fotoUrl || prev.mempelaiWanita.fotoUrl,
            },
            gallery: initialInvitation.gallery && initialInvitation.gallery.length > 0 ? initialInvitation.gallery : prev.gallery,
            loveStories: initialInvitation.loveStories && initialInvitation.loveStories.length > 0 ? initialInvitation.loveStories : prev.loveStories,
            isPublished: initialInvitation.isPublished !== undefined ? initialInvitation.isPublished : prev.isPublished,
            updatedAt: initialInvitation.updatedAt,
          };
          lastSavedPayloadRef.current = serializeFormPayload(nextInv);
          return nextInv;
        });
      }
    }
  }, [initialInvitation]);

  const handleSaveDraft = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const draft = { ...invitation, isPublished: false };
    setInvitation(draft);
    lastSavedPayloadRef.current = serializeFormPayload(draft);
    onSave(draft);
    setAutoSaveStatus('saved');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handlePublish = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const updated = { ...invitation, isPublished: true };
    setInvitation(updated);
    lastSavedPayloadRef.current = serializeFormPayload(updated);
    onSave(updated);
    setAutoSaveStatus('saved');
    setPublishToast(true);
    setTimeout(() => setPublishToast(false), 3000);
  };

  const handleBackToDashboard = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const currentPayload = serializeFormPayload(latestInvitationRef.current);
    if (currentPayload !== lastSavedPayloadRef.current) {
      lastSavedPayloadRef.current = currentPayload;
      onSave(latestInvitationRef.current);
    }
    onBackToDashboard();
  };

  const handleFullscreenPreview = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const currentPayload = serializeFormPayload(latestInvitationRef.current);
    if (currentPayload !== lastSavedPayloadRef.current) {
      lastSavedPayloadRef.current = currentPayload;
      onSave(latestInvitationRef.current);
    }
    onFullscreenPreview(latestInvitationRef.current);
  };

  const handleExportCSV = () => {
    if (!invitation.rsvpList || invitation.rsvpList.length === 0) return;

    // CSV Headers
    const headers = ['Nama', 'Status Kehadiran', 'Jumlah Tamu', 'Pesan & Doa Restu', 'Tanggal Konfirmasi'];

    // Map rows and escape commas/quotes properly
    const rows = invitation.rsvpList.map((r) => {
      const statusText = r.status === 'attending' 
        ? 'Hadir' 
        : r.status === 'not_attending' 
        ? 'Tidak Hadir' 
        : 'Ragu-ragu';
      
      const escape = (val: string | number) => {
        const str = String(val ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      };

      return [
        escape(r.nama),
        escape(statusText),
        escape(r.jumlahTamu),
        escape(r.pesanDoa),
        escape(r.createdAt ? new Date(r.createdAt).toLocaleString('id-ID') : '-')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RSVP_${invitation.slug || 'undangan'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSwitchTemplate = (tmpl: TemplateDefinition) => {
    const visuals = getThemeVisuals(tmpl.id);
    const updated: InvitationData = {
      ...invitation,
      templateId: tmpl.id,
      theme: {
        ...invitation.theme,
        templateId: tmpl.id,
        fontDisplay: tmpl.defaultTheme.fontDisplay,
        fontBody: tmpl.defaultTheme.fontBody,
        primaryColor: tmpl.defaultTheme.primaryColor,
        secondaryColor: tmpl.defaultTheme.secondaryColor,
        bgColor: tmpl.defaultTheme.bgColor,
        textColor: tmpl.defaultTheme.textColor,
        borderStyle: tmpl.defaultTheme.borderStyle,
        ornamentStyle: tmpl.defaultTheme.ornamentStyle,
      },
    };
    setInvitation(updated);
    setPreviewOpened(false);
    setPreviewAnimationKey((prev) => prev + 1);
  };

  // Preset photos for quick picking
  const PRESET_COVERS = [
    resolveExternalMediaUrl('/images/Salinan-foto-profil.png'),
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* 1. TOP ACTION BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            id="editor-btn-back"
            onClick={handleBackToDashboard}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Kembali ke Dashboard (Perubahan tersimpan otomatis)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={invitation.title}
                onChange={(e) => updateProp('title', e.target.value)}
                className="font-bold text-sm text-stone-900 bg-transparent hover:bg-stone-50 focus:bg-stone-50 px-1.5 py-0.5 rounded border border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-none max-w-xs sm:max-w-sm truncate"
              />
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  invitation.isPublished
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {invitation.isPublished ? 'Terbit' : 'Draft'}
              </span>

              {/* Desktop Auto-Save Live Status Indicator */}
              <div className="hidden sm:flex items-center">
                {autoSaveStatus === 'saving' && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium shadow-xs"
                    title="Menyimpan perubahan form otomatis ke App state & penyimpanan..."
                  >
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                    <span>Menyimpan otomatis...</span>
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium shadow-xs transition-all duration-300"
                    title="Semua perubahan form telah tersimpan otomatis ke App state & penyimpanan"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersimpan otomatis</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 pl-1.5">
              <p className="text-[11px] text-stone-400">
                URL: #invite/{invitation.slug}
              </p>
              {/* Mobile Auto-Save Indicator */}
              <div className="sm:hidden flex items-center">
                {autoSaveStatus === 'saving' && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-600" />
                    <span>Menyimpan...</span>
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Tersimpan</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Mobile Toggle View Switcher */}
        <div className="lg:hidden flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setMobileTab('editor')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              mobileTab === 'editor' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            Edit Konten
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              mobileTab === 'preview' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            Live Preview
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Fullscreen Preview */}
          <button
            id="editor-btn-fullscreen"
            onClick={handleFullscreenPreview}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
          >
            <Eye className="w-4 h-4 text-stone-500" />
            <span>Pratinjau Penuh</span>
          </button>

          {/* QR Code & Printable Card */}
          <button
            id="editor-btn-qr-card"
            onClick={() => {
              setQrModalTarget('directions');
              setIsQRModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Generator QR Code & Kartu Cetak Fisik"
          >
            <QrCode className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">Cetak QR Card</span>
          </button>

          {/* Share WhatsApp */}
          <button
            id="editor-btn-share"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Bagikan WhatsApp</span>
          </button>

          {/* Save Draft */}
          <button
            id="editor-btn-save-draft"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
          >
            <Save className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Simpan</span>
          </button>

          {/* Publish */}
          <button
            id="editor-btn-publish"
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Globe className="w-4 h-4" />
            <span>Publikasikan</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-16 right-4 z-50 bg-stone-900 text-white px-4 py-2 rounded-xl shadow-lg text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Draft berhasil disimpan!</span>
        </div>
      )}

      {publishToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Globe className="w-4 h-4" />
          <span>Undangan berhasil dipublikasikan & aktif!</span>
        </div>
      )}

      {/* 2. SPLIT LAYOUT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* SISI KIRI: CONTROL PANEL (TABS & FORMS) */}
        <div
          className={`w-full lg:w-[540px] xl:w-[580px] bg-white border-r border-stone-200 flex flex-col h-[calc(100vh-61px)] ${
            mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Sub Navigation Tabs */}
          <div className="flex items-center border-b border-stone-200 bg-stone-50 px-2 overflow-x-auto custom-scrollbar">
            {[
              { id: 'mempelai', label: 'Info Pengantin', icon: Heart },
              { id: 'acara', label: 'Acara & Waktu', icon: Calendar },
              { id: 'desain', label: 'Desain & Tema', icon: Palette },
              { id: 'galeri', label: 'Cerita & Galeri', icon: ImageIcon },
              { id: 'kado', label: 'Amplop Kado', icon: Gift },
              { id: 'rsvp', label: 'RSVP & Musik', icon: Music },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-amber-600 text-amber-700 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
            {/* TAB 1: MEMPELAI & SALAM */}
            {activeTab === 'mempelai' && (
              <div className="space-y-6">
                {/* Salam & Kutipan */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Salam Pembuka & Kutipan
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Judul Salam</label>
                    <input
                      type="text"
                      value={invitation.greetingTitle}
                      onChange={(e) => updateProp('greetingTitle', e.target.value)}
                      placeholder="Contoh: Walimatul 'Ursy"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Sub-judul Sambutan</label>
                    <textarea
                      rows={2}
                      value={invitation.heroSubtitle}
                      onChange={(e) => updateProp('heroSubtitle', e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Ayat Suci / Kutipan Romantis</label>
                    <textarea
                      rows={2}
                      value={invitation.quoteText}
                      onChange={(e) => updateProp('quoteText', e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Sumber Kutipan</label>
                    <input
                      type="text"
                      value={invitation.quoteSource}
                      onChange={(e) => updateProp('quoteSource', e.target.value)}
                      placeholder="Q.S Ar-Rum: 21"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* KUSTOMISASI FONT & WARNA TEKS SURAT UNDANGAN */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-50/70 via-stone-50 to-stone-100 border-2 border-amber-200/80 p-4 space-y-3.5 shadow-xs">
                  <div
                    onClick={() => setIsSuratStylingOpen(!isSuratStylingOpen)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                        <Type className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Warna & Gaya Font Surat Undangan</span>
                          <span className="text-[10px] lowercase font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                            langsung berubah
                          </span>
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Edit jenis font dan warna teks judul, salam sambutan, paragraf & ayat romantis.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
                    >
                      {isSuratStylingOpen ? (
                        <ChevronUp className="w-4 h-4 text-stone-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-600" />
                      )}
                    </button>
                  </div>

                  {isSuratStylingOpen && (
                    <div className="space-y-4 pt-2 border-t border-amber-200/70">
                      {/* Pilihan Cepat Harmoni Warna Tema (1-Klik) */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                          <span>Palet Warna Harmoni 1-Klik</span>
                          <span className="text-[10px] text-stone-400">Pilih tema warna terpadu</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {COLOR_PRESETS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => handleApplyColorPreset(p)}
                              className="p-2 rounded-xl border border-stone-200 bg-white hover:border-amber-500 hover:shadow-2xs text-left transition-all flex flex-col gap-1"
                            >
                              <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.headingColor }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.textColor }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.bgColor }} />
                              </div>
                              <span className="text-[11px] font-bold text-stone-800 leading-tight truncate">
                                {p.name}
                              </span>
                              <span className="text-[9px] text-stone-400 truncate">
                                {p.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Judul */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                          <span>Font Teks Judul & Nama</span>
                          <span className="text-[10px] text-amber-700 font-medium">
                            {HEADING_FONT_OPTIONS.find((f) => f.id === invitation.theme.fontDisplay)?.label || 'Playfair'}
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {HEADING_FONT_OPTIONS.slice(0, 4).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() =>
                                updateProp('theme', {
                                  ...invitation.theme,
                                  fontDisplay: f.id as any,
                                })
                              }
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                invitation.theme.fontDisplay === f.id
                                  ? 'border-amber-600 bg-white ring-2 ring-amber-500/30 shadow-xs'
                                  : 'border-stone-200 bg-white/70 hover:bg-white'
                              }`}
                            >
                              <span className={`${f.id} text-base font-bold block text-stone-900 leading-tight truncate`}>
                                Walimatul 'Ursy
                              </span>
                              <span className="text-[10px] text-stone-500 block truncate mt-0.5">
                                {f.label}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => setActiveTab('desain')}
                            className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold underline inline-flex items-center gap-1"
                          >
                            <span>Lihat 8 Gaya Font Judul di Tab Desain →</span>
                          </button>
                        </div>
                      </div>

                      {/* Font Teks Isi / Paragraf */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                          <span>Font Teks Isi, Paragraf & Ayat (Body Font)</span>
                          <span className="text-[10px] text-amber-700 font-medium">
                            {BODY_FONT_OPTIONS.find((f) => f.id === (invitation.theme.fontBody || 'font-sans-clean'))?.label || 'Plus Jakarta Sans'}
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {BODY_FONT_OPTIONS.map((bf) => (
                            <button
                              key={bf.id}
                              type="button"
                              onClick={() =>
                                updateProp('theme', {
                                  ...invitation.theme,
                                  fontBody: bf.id as any,
                                })
                              }
                              className={`p-2 rounded-xl border text-left transition-all ${
                                (invitation.theme.fontBody || 'font-sans-clean') === bf.id
                                  ? 'border-amber-600 bg-white ring-2 ring-amber-500/30 shadow-xs'
                                  : 'border-stone-200 bg-white/70 hover:bg-white'
                              }`}
                            >
                              <span className={`${bf.id} text-xs font-semibold block text-stone-900 truncate`}>
                                {bf.label}
                              </span>
                              <span className="text-[9px] text-stone-500 block truncate">
                                {bf.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Warna Teks Individual */}
                      <div className="space-y-3 pt-2 border-t border-amber-200/70">
                        <span className="text-[11px] font-bold text-stone-700 block">
                          Sesuaikan Warna Teks & Latar Belakang
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Warna Judul */}
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200">
                            <label className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">
                              Warna Huruf Judul & Nama
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A85C'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    headingColor: e.target.value,
                                  })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                              />
                              <input
                                type="text"
                                value={invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A85C'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    headingColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {['#C5A059', '#D4AF37', '#1C1917', '#881337', '#065F46', '#1E3A8A', '#FFFFFF'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateProp('theme', { ...invitation.theme, headingColor: c })}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Warna Teks Isi */}
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200">
                            <label className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">
                              Warna Teks Paragraf & Isi
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={invitation.theme.textColor || '#2C2723'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    textColor: e.target.value,
                                  })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                              />
                              <input
                                type="text"
                                value={invitation.theme.textColor || '#2C2723'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    textColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {['#2C2723', '#1C1917', '#374151', '#44403C', '#6B7280', '#D1B87D', '#FFFFFF'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateProp('theme', { ...invitation.theme, textColor: c })}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Warna Teks Ayat */}
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200">
                            <label className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">
                              Warna Ayat Suci & Kutipan
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={invitation.theme.quoteColor || invitation.theme.textColor || '#8C6D37'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    quoteColor: e.target.value,
                                  })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                              />
                              <input
                                type="text"
                                value={invitation.theme.quoteColor || invitation.theme.textColor || '#8C6D37'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    quoteColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {['#8C6D37', '#B45309', '#047857', '#9F1239', '#2563EB', '#1C1917', '#FFFFFF'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateProp('theme', { ...invitation.theme, quoteColor: c })}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Warna Latar Belakang */}
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200">
                            <label className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">
                              Warna Latar Belakang (Kanvas)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={invitation.theme.bgColor || '#FAF7F2'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    bgColor: e.target.value,
                                  })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                              />
                              <input
                                type="text"
                                value={invitation.theme.bgColor || '#FAF7F2'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    bgColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {['#FAF7F2', '#FFFFFF', '#121212', '#F4F9F6', '#FFF5F5', '#FFF9F9', '#F0F7FF'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateProp('theme', { ...invitation.theme, bgColor: c })}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Preview Box */}
                      <div className="pt-2 border-t border-amber-200/70">
                        <span className="text-[11px] font-bold text-stone-700 block mb-1.5">
                          Pratinjau Teks Surat Undangan:
                        </span>
                        <div
                          className="p-4 rounded-xl border border-stone-200/80 shadow-xs text-center space-y-1.5 transition-colors"
                          style={{
                            backgroundColor: invitation.theme.bgColor || '#FAF7F2',
                          }}
                        >
                          <span
                            className={`text-base font-bold block ${invitation.theme.fontDisplay}`}
                            style={{ color: invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059' }}
                          >
                            {invitation.greetingTitle || "Walimatul 'Ursy"}
                          </span>
                          <span
                            className={`text-xl font-bold block ${invitation.theme.fontDisplay}`}
                            style={{ color: invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059' }}
                          >
                            {invitation.mempelaiPria.namaPanggilan || 'Pengantin'} & {invitation.mempelaiWanita.namaPanggilan || 'Pasangan'}
                          </span>
                          <p
                            className={`text-xs italic px-3 line-clamp-2 ${invitation.theme.fontBody || 'font-sans-clean'}`}
                            style={{ color: invitation.theme.quoteColor || invitation.theme.textColor || '#2C2723' }}
                          >
                            "{invitation.quoteText || 'Dan di antara tanda-tanda kebesaran-Nya...'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Foto Sampul */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Foto Sampul / Banner
                  </span>
                  <LocalImageUploader
                    currentUrl={invitation.coverPhotoUrl}
                    onUpload={(url) => updateProp('coverPhotoUrl', url)}
                    placeholder="Masukkan URL foto sampul atau unggah berkas..."
                    prefix="cover"
                  />
                  {/* Preset Covery Selector */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-stone-400">Pilih cepat foto preset:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_COVERS.map((cov, i) => (
                        <div
                          key={i}
                          onClick={() => updateProp('coverPhotoUrl', cov)}
                          className={`h-14 rounded-lg overflow-hidden cursor-pointer border-2 ${
                            invitation.coverPhotoUrl === cov
                              ? 'border-amber-600'
                              : 'border-transparent'
                          }`}
                        >
                          <img src={cov} alt="Preset" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Efek Blur Slider */}
                  <div className="space-y-1.5 pt-2.5 border-t border-stone-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-stone-600">Efek Blur Foto Sampul</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        {invitation.theme.coverBlur || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={invitation.theme.coverBlur || 0}
                      onChange={(e) =>
                        updateProp('theme', {
                          ...invitation.theme,
                          coverBlur: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
                    />
                    <div className="flex justify-between text-[9px] text-stone-400">
                      <span>Tajam (0px)</span>
                      <span>Sedang (10px)</span>
                      <span>Sangat Blur (20px)</span>
                    </div>
                  </div>
                </div>

                {/* Profil Mempelai Pria */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Profil Mempelai Pria
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Nama Lengkap</label>
                      <input
                        type="text"
                        value={invitation.mempelaiPria.namaLengkap}
                        onChange={(e) =>
                          updateProp('mempelaiPria', {
                            ...invitation.mempelaiPria,
                            namaLengkap: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Nama Panggilan</label>
                      <input
                        type="text"
                        value={invitation.mempelaiPria.namaPanggilan}
                        onChange={(e) =>
                          updateProp('mempelaiPria', {
                            ...invitation.mempelaiPria,
                            namaPanggilan: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Nama Orang Tua</label>
                    <input
                      type="text"
                      value={invitation.mempelaiPria.orangTua}
                      onChange={(e) =>
                        updateProp('mempelaiPria', {
                          ...invitation.mempelaiPria,
                          orangTua: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Username Instagram (Opsional)</label>
                    <input
                      type="text"
                      value={invitation.mempelaiPria.instagram || ''}
                      onChange={(e) =>
                        updateProp('mempelaiPria', {
                          ...invitation.mempelaiPria,
                          instagram: e.target.value,
                        })
                      }
                      placeholder="rizky.pratama"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Foto Profil Mempelai Pria (Tampil Besar & Jelas) */}
                  <div className="pt-3 border-t border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-800">
                        Foto Profil Mempelai Pria (Format Potret Besar & Jelas)
                      </label>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200/80">
                        Tidak Terpotong Bulat
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Foto otomatis ditampilkan dalam bingkai potret megah, tajam, dan proporsional di undangan publik.
                    </p>
                    <LocalImageUploader
                      currentUrl={invitation.mempelaiPria.fotoUrl}
                      onUpload={(url) =>
                        updateProp('mempelaiPria', {
                          ...invitation.mempelaiPria,
                          fotoUrl: url,
                        })
                      }
                      placeholder="Masukkan link URL foto pria..."
                      prefix="pria"
                      cardMode={true}
                    />
                  </div>
                </div>

                {/* Profil Mempelai Wanita */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Profil Mempelai Wanita
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Nama Lengkap</label>
                      <input
                        type="text"
                        value={invitation.mempelaiWanita.namaLengkap}
                        onChange={(e) =>
                          updateProp('mempelaiWanita', {
                            ...invitation.mempelaiWanita,
                            namaLengkap: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Nama Panggilan</label>
                      <input
                        type="text"
                        value={invitation.mempelaiWanita.namaPanggilan}
                        onChange={(e) =>
                          updateProp('mempelaiWanita', {
                            ...invitation.mempelaiWanita,
                            namaPanggilan: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Nama Orang Tua</label>
                    <input
                      type="text"
                      value={invitation.mempelaiWanita.orangTua}
                      onChange={(e) =>
                        updateProp('mempelaiWanita', {
                          ...invitation.mempelaiWanita,
                          orangTua: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Username Instagram (Opsional)</label>
                    <input
                      type="text"
                      value={invitation.mempelaiWanita.instagram || ''}
                      onChange={(e) =>
                        updateProp('mempelaiWanita', {
                          ...invitation.mempelaiWanita,
                          instagram: e.target.value,
                        })
                      }
                      placeholder="amanda.lestari"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Foto Profil Mempelai Wanita (Tampil Besar & Jelas) */}
                  <div className="pt-3 border-t border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-800">
                        Foto Profil Mempelai Wanita (Format Potret Besar & Jelas)
                      </label>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200/80">
                        Tidak Terpotong Bulat
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Foto otomatis ditampilkan dalam bingkai potret megah, tajam, dan proporsional di undangan publik.
                    </p>
                    <LocalImageUploader
                      currentUrl={invitation.mempelaiWanita.fotoUrl}
                      onUpload={(url) =>
                        updateProp('mempelaiWanita', {
                          ...invitation.mempelaiWanita,
                          fotoUrl: url,
                        })
                      }
                      placeholder="Masukkan link URL foto wanita..."
                      prefix="wanita"
                      cardMode={true}
                    />
                  </div>
                </div>

                {/* Gaya Bingkai Foto Mempelai (Format Besar & Jelas) */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">
                        Gaya Bingkai Foto Kedua Mempelai
                      </span>
                      <span className="text-[11px] text-amber-700">
                        Semua opsi tampil tegak potret besar & jernih (bebas potongan lingkaran)
                      </span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                      Format Besar
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'portrait', label: 'Portrait Elegan', desc: 'Kotak Rounded Mewah' },
                      { id: 'arch', label: 'Kubah Arch', desc: 'Lengkung Atas Anggun' },
                      { id: 'dome', label: 'Kubah Penuh', desc: 'Kubah Dome Sempurna' },
                    ].map((shape) => {
                      const isSelected = (invitation.theme?.couplePhotoShape || 'portrait') === shape.id;
                      return (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => {
                            updateProp('theme', {
                              ...invitation.theme,
                              couplePhotoShape: shape.id as any,
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="font-bold text-xs">{shape.label}</div>
                          <div className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-amber-100' : 'text-stone-500'}`}>
                            {shape.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACARA & WAKTU */}
            {activeTab === 'acara' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Daftar Agenda Acara
                  </h3>
                  <button
                    onClick={() => {
                      const newEvent: EventSchedule = {
                        id: 'evt-' + Date.now(),
                        namaAcara: 'Acara Baru',
                        tanggal: invitation.events[0]?.tanggal || '2025-10-25',
                        waktuMulai: '13:00',
                        waktuSelesai: '17:00',
                        zonaWaktu: 'WIB',
                        namaTempat: 'Gedung Serbaguna',
                        alamat: 'Jl. Merdeka No. 1, Jakarta',
                        linkGoogleMaps: 'https://maps.google.com/?q=Jakarta',
                      };
                      updateProp('events', [...invitation.events, newEvent]);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Acara</span>
                  </button>
                </div>

                {invitation.events.map((evt, idx) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <span className="text-xs font-bold text-amber-800">
                        Acara #{idx + 1}: {evt.namaAcara}
                      </span>
                      {invitation.events.length > 1 && (
                        <button
                          onClick={() => {
                            updateProp(
                              'events',
                              invitation.events.filter((e) => e.id !== evt.id)
                            );
                          }}
                          className="text-stone-400 hover:text-rose-600 transition-colors"
                          title="Hapus Acara"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Nama Acara</label>
                      <input
                        type="text"
                        value={evt.namaAcara}
                        onChange={(e) => {
                          const updated = [...invitation.events];
                          updated[idx].namaAcara = e.target.value;
                          updateProp('events', updated);
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600">Tanggal Acara</label>
                        <input
                          type="date"
                          value={evt.tanggal}
                          onChange={(e) => {
                            const updated = [...invitation.events];
                            updated[idx].tanggal = e.target.value;
                            updateProp('events', updated);
                          }}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600">Jam Mulai - Selesai</label>
                        <div className="flex gap-1.5 mt-1">
                          <input
                            type="text"
                            value={evt.waktuMulai}
                            onChange={(e) => {
                              const updated = [...invitation.events];
                              updated[idx].waktuMulai = e.target.value;
                              updateProp('events', updated);
                            }}
                            className="w-1/2 px-2 py-2 rounded-lg border border-stone-300 text-xs text-center"
                          />
                          <input
                            type="text"
                            value={evt.waktuSelesai}
                            onChange={(e) => {
                              const updated = [...invitation.events];
                              updated[idx].waktuSelesai = e.target.value;
                              updateProp('events', updated);
                            }}
                            className="w-1/2 px-2 py-2 rounded-lg border border-stone-300 text-xs text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Nama Tempat / Gedung</label>
                      <input
                        type="text"
                        value={evt.namaTempat}
                        onChange={(e) => {
                          const updated = [...invitation.events];
                          updated[idx].namaTempat = e.target.value;
                          updateProp('events', updated);
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Alamat Lengkap</label>
                      <input
                        type="text"
                        value={evt.alamat}
                        onChange={(e) => {
                          const updated = [...invitation.events];
                          updated[idx].alamat = e.target.value;
                          updateProp('events', updated);
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Link Google Maps</label>
                      <input
                        type="text"
                        value={evt.linkGoogleMaps}
                        onChange={(e) => {
                          const updated = [...invitation.events];
                          updated[idx].linkGoogleMaps = e.target.value;
                          // Auto parse coordinates if present in the link
                          const coords = parseCoordinatesFromUrl(e.target.value);
                          if (coords) {
                            updated[idx].latitude = coords.lat;
                            updated[idx].longitude = coords.lng;
                          }
                          updateProp('events', updated);
                        }}
                        placeholder="https://maps.google.com/..."
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Google Maps Coordinates & Live Interactive Preview */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pin Interaktif Google Maps</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const coords = parseCoordinatesFromUrl(evt.linkGoogleMaps);
                            if (coords) {
                              const updated = [...invitation.events];
                              updated[idx].latitude = coords.lat;
                              updated[idx].longitude = coords.lng;
                              updateProp('events', updated);
                            }
                          }}
                          className="text-[10px] font-semibold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                        >
                          Deteksi dari Link
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-500 font-medium">Latitude (Lintang)</label>
                          <input
                            type="number"
                            step="any"
                            value={evt.latitude ?? ''}
                            onChange={(e) => {
                              const updated = [...invitation.events];
                              updated[idx].latitude = e.target.value ? parseFloat(e.target.value) : undefined;
                              updateProp('events', updated);
                            }}
                            placeholder="-6.2088"
                            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 font-medium">Longitude (Bujur)</label>
                          <input
                            type="number"
                            step="any"
                            value={evt.longitude ?? ''}
                            onChange={(e) => {
                              const updated = [...invitation.events];
                              updated[idx].longitude = e.target.value ? parseFloat(e.target.value) : undefined;
                              updateProp('events', updated);
                            }}
                            placeholder="106.8456"
                            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Live Preview of the map in editor */}
                      <div className="pt-1">
                        <div className="text-[10px] font-semibold text-stone-500 mb-1">
                          Pratinjau Pin Peta Langsung:
                        </div>
                        <InteractiveEventMap
                          eventItem={evt}
                          accentColor={invitation.theme?.primaryColor || '#D4AF37'}
                          className="h-44 rounded-xl"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEventQrIdx(idx);
                        setQrModalTarget('directions');
                        setIsQRModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-700" />
                      <span>Buat QR Petunjuk Arah Cetak ({evt.namaAcara})</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: DESAIN & TEMA */}
            {activeTab === 'desain' && (
              <div className="space-y-6">
                {/* Ganti Template Desain */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                        Ganti Desain Template
                      </span>
                      <p className="text-[11px] text-stone-500">
                        Setiap template memiliki identitas visual, ornamen ukir, dan gaya frame yang unik.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                    {TEMPLATES.map((tmpl) => {
                      const isSelected = (invitation.templateId || invitation.theme.templateId) === tmpl.id;
                      const tmplVisuals = getThemeVisuals(tmpl.id);

                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => handleSwitchTemplate(tmpl)}
                          className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all bg-white flex flex-col ${
                            isSelected
                              ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                              : 'border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                            <img
                              src={tmpl.thumbnail}
                              alt={tmpl.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-white/40"
                                style={{ backgroundColor: tmplVisuals.palette.primary }}
                              />
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-white/40"
                                style={{ backgroundColor: tmplVisuals.palette.secondary }}
                              />
                              <span className="text-[9px] text-white font-medium pl-0.5">
                                {tmplVisuals.isDark ? 'Dark' : 'Light'}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-stone-900 truncate">
                                {tmpl.name}
                              </h4>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md inline-block truncate max-w-full font-medium">
                                {tmpl.accentBadge}
                              </span>
                              <span className="text-[9px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 truncate max-w-full font-medium">
                                <Sparkles className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                                <span className="truncate">{getThemeOpeningAnimation(tmpl.id).badge}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Font Title Style */}
                <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Gaya Font Judul (Tipografi Display)
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                      {HEADING_FONT_OPTIONS.find((f) => f.id === invitation.theme.fontDisplay)?.label || 'Playfair'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {HEADING_FONT_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() =>
                          updateProp('theme', {
                            ...invitation.theme,
                            fontDisplay: f.id as any,
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          invitation.theme.fontDisplay === f.id
                            ? 'border-amber-600 bg-amber-50 shadow-sm ring-1 ring-amber-500/20'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <span className={`${f.id} text-lg font-bold block text-stone-900`}>
                          {f.sample}
                        </span>
                        <span className="text-[11px] text-stone-500 mt-1 block">
                          {f.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gaya Font Teks Isi / Paragraf (Body Font) */}
                <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Gaya Font Teks Isi & Surat Undangan (Body Font)
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                      {BODY_FONT_OPTIONS.find((f) => f.id === (invitation.theme.fontBody || 'font-sans-clean'))?.label || 'Plus Jakarta Sans'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Pilih gaya font untuk teks salam, kutipan romantis, rincian acara, cerita, dan buku tamu.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {BODY_FONT_OPTIONS.map((bf) => {
                      const isSelected = (invitation.theme.fontBody || 'font-sans-clean') === bf.id;
                      return (
                        <button
                          key={bf.id}
                          type="button"
                          onClick={() =>
                            updateProp('theme', {
                              ...invitation.theme,
                              fontBody: bf.id as any,
                            })
                          }
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50 shadow-sm ring-1 ring-amber-500/20'
                              : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-stone-900">{bf.label}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <span className={`${bf.id} text-xs text-stone-700 block line-clamp-1`}>
                            {bf.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Size & Colors Controls */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Ukuran & Warna Huruf (Tipografi)
                    </span>
                  </div>

                  {/* Heading Font Size */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone-700 flex items-center justify-between">
                      <span>Ukuran Huruf Judul (Heading)</span>
                      <span className="text-[10px] text-stone-400 capitalize">
                        {invitation.theme.headingSize || 'normal'}
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'compact', label: 'Kecil', desc: 'Ringkas' },
                        { id: 'normal', label: 'Sedang', desc: 'Standar' },
                        { id: 'large', label: 'Besar', desc: 'Mencolok' },
                        { id: 'xlarge', label: 'Jumbo', desc: 'Luxury' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            updateProp('theme', {
                              ...invitation.theme,
                              headingSize: s.id as any,
                            })
                          }
                          className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                            (invitation.theme.headingSize || 'normal') === s.id
                              ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                              : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-xs'
                          }`}
                        >
                          <span className="text-xs block font-bold">{s.label}</span>
                          <span className="text-[9px] opacity-70 block">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Font Size */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone-700 flex items-center justify-between">
                      <span>Ukuran Huruf Teks Isi (Paragraf)</span>
                      <span className="text-[10px] text-stone-400 capitalize">
                        {invitation.theme.bodySize || 'normal'}
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'compact', label: 'Kecil', desc: '12px Compact' },
                        { id: 'normal', label: 'Standar', desc: '14px Normal' },
                        { id: 'large', label: 'Besar', desc: '16px Nyaman' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            updateProp('theme', {
                              ...invitation.theme,
                              bodySize: s.id as any,
                            })
                          }
                          className={`py-2 px-2 rounded-xl border text-center transition-all ${
                            (invitation.theme.bodySize || 'normal') === s.id
                              ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                              : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-xs'
                          }`}
                        >
                          <span className="text-xs block font-bold">{s.label}</span>
                          <span className="text-[9px] opacity-70 block">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Palet Harmoni Warna 1-Klik */}
                  <div className="space-y-2 pt-2 border-t border-stone-200/80">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-stone-700 block">
                        Palet Harmoni Warna 1-Klik
                      </label>
                      <span className="text-[10px] text-stone-400">Instan & terpadu</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => handleApplyColorPreset(p)}
                          className="p-2 rounded-xl border border-stone-200 bg-white hover:border-amber-500 hover:shadow-2xs text-left transition-all flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.headingColor }} />
                            <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.textColor }} />
                            <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.bgColor }} />
                          </div>
                          <span className="text-[11px] font-bold text-stone-800 leading-tight truncate">
                            {p.name}
                          </span>
                          <span className="text-[9px] text-stone-400 truncate">
                            {p.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Heading Color */}
                  <div className="space-y-2 pt-2 border-t border-stone-200/80">
                    <label className="text-[11px] font-semibold text-stone-700 block">
                      Warna Huruf Judul & Nama Pengantin
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A85C'}
                        onChange={(e) =>
                          updateProp('theme', {
                            ...invitation.theme,
                            headingColor: e.target.value,
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                      />
                      <input
                        type="text"
                        value={invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A85C'}
                        onChange={(e) =>
                          updateProp('theme', {
                            ...invitation.theme,
                            headingColor: e.target.value,
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono uppercase"
                        placeholder="#C5A85C"
                      />
                    </div>
                    {/* Quick Color Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'Emas', color: '#D4AF37' },
                        { label: 'Emas Antik', color: '#C5A85C' },
                        { label: 'Hitam Pekat', color: '#111827' },
                        { label: 'Marun Mewah', color: '#881337' },
                        { label: 'Zamrud', color: '#065F46' },
                        { label: 'Biru Royal', color: '#1E3A8A' },
                        { label: 'Rose Gold', color: '#DB838B' },
                        { label: 'Putih Bersih', color: '#FFFFFF' },
                      ].map((chip) => (
                        <button
                          key={chip.color}
                          type="button"
                          onClick={() =>
                            updateProp('theme', {
                              ...invitation.theme,
                              headingColor: chip.color,
                            })
                          }
                          className="px-2 py-0.5 rounded-md border border-stone-200 bg-white text-[10px] text-stone-700 flex items-center gap-1 hover:bg-stone-100"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: chip.color }}
                          />
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Text Color */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200/80">
                    <label className="text-[11px] font-semibold text-stone-700 block">
                      Warna Teks Paragraf & Isi Surat
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={invitation.theme.textColor || '#2C2723'}
                        onChange={(e) =>
                          updateProp('theme', {
                            ...invitation.theme,
                            textColor: e.target.value,
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                      />
                      <input
                        type="text"
                        value={invitation.theme.textColor || '#2C2723'}
                        onChange={(e) =>
                          updateProp('theme', {
                            ...invitation.theme,
                            textColor: e.target.value,
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono uppercase"
                      />
                    </div>
                    {/* Quick Body Color Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'Hitam Elegan', color: '#1C1917' },
                        { label: 'Abu Arang', color: '#374151' },
                        { label: 'Cokelat Hangat', color: '#44403C' },
                        { label: 'Abu Netral', color: '#6B7280' },
                        { label: 'Emas Lembut', color: '#C2A268' },
                        { label: 'Putih Terang', color: '#FFFFFF' },
                      ].map((chip) => (
                        <button
                          key={chip.color}
                          type="button"
                          onClick={() =>
                            updateProp('theme', {
                              ...invitation.theme,
                              textColor: chip.color,
                            })
                          }
                          className="px-2 py-0.5 rounded-md border border-stone-200 bg-white text-[10px] text-stone-700 flex items-center gap-1 hover:bg-stone-100"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: chip.color }}
                          />
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warna Teks Ayat Suci & Kutipan */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200/80">
                    <label className="text-[11px] font-semibold text-stone-700 block">
                      Warna Teks Kutipan Romantis & Ayat Suci
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={invitation.theme.quoteColor || invitation.theme.textColor || '#8C6D37'}
                        onChange={(e) =>
                          updateProp('theme', {
                            ...invitation.theme,
                            quoteColor: e.target.value,
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                      />
                      <input
                        type="text"
                        value={invitation.theme.quoteColor || invitation.theme.textColor || '#8C6D37'}
                        onChange={(e) =>
                          updateProp('theme', {
                            ...invitation.theme,
                            quoteColor: e.target.value,
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono uppercase"
                      />
                    </div>
                    {/* Quick Quote Color Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'Emas Antik', color: '#8C6D37' },
                        { label: 'Amber Mewah', color: '#B45309' },
                        { label: 'Hijau Zamrud', color: '#047857' },
                        { label: 'Marun Cinta', color: '#9F1239' },
                        { label: 'Biru Royal', color: '#2563EB' },
                        { label: 'Hitam Pekat', color: '#1C1917' },
                        { label: 'Putih Bersih', color: '#FFFFFF' },
                      ].map((chip) => (
                        <button
                          key={chip.color}
                          type="button"
                          onClick={() =>
                            updateProp('theme', {
                              ...invitation.theme,
                              quoteColor: chip.color,
                            })
                          }
                          className="px-2 py-0.5 rounded-md border border-stone-200 bg-white text-[10px] text-stone-700 flex items-center gap-1 hover:bg-stone-100"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: chip.color }}
                          />
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warna Latar Belakang Surat Undangan (Kanvas Background) */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200/80">
                    <label className="text-[11px] font-semibold text-stone-700 block">
                      Warna Latar Belakang Surat Undangan (Kanvas Background)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={invitation.theme.bgColor || '#FAF7F2'}
                        onChange={(e) =>
                          updateProp('theme', {
                            ...invitation.theme,
                            bgColor: e.target.value,
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                      />
                      <input
                        type="text"
                        value={invitation.theme.bgColor || '#FAF7F2'}
                        onChange={(e) =>
                          updateProp('theme', {
                            ...invitation.theme,
                            bgColor: e.target.value,
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono uppercase"
                      />
                    </div>
                    {/* Quick Background Color Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'Krem Elegan', color: '#FAF7F2' },
                        { label: 'Putih Marmer', color: '#FFFFFF' },
                        { label: 'Hitam Noir', color: '#121212' },
                        { label: 'Sage Green', color: '#F4F9F6' },
                        { label: 'Burgundy Soft', color: '#FFF5F5' },
                        { label: 'Rose Pastel', color: '#FFF9F9' },
                        { label: 'Blue Ice', color: '#F0F7FF' },
                      ].map((chip) => (
                        <button
                          key={chip.color}
                          type="button"
                          onClick={() =>
                            updateProp('theme', {
                              ...invitation.theme,
                              bgColor: chip.color,
                            })
                          }
                          className="px-2 py-0.5 rounded-md border border-stone-200 bg-white text-[10px] text-stone-700 flex items-center gap-1 hover:bg-stone-100"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: chip.color }}
                          />
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warna Font Khusus Kisah Cinta (Kisah Kami) */}
                  <div className="space-y-2 pt-2 border-t border-stone-200/80">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-stone-700 block">
                        Warna Font Bagian Kisah Kami (Love Story)
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('galeri')}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-medium underline flex items-center gap-0.5"
                      >
                        Buka Tab Cerita & Galeri →
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-500 block mb-0.5">Warna Judul Kisah</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={invitation.theme.storyHeadingColor || invitation.theme.headingColor || '#C5A059'}
                            onChange={(e) =>
                              updateProp('theme', {
                                ...invitation.theme,
                                storyHeadingColor: e.target.value,
                              })
                            }
                            className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                          />
                          <input
                            type="text"
                            value={invitation.theme.storyHeadingColor || invitation.theme.headingColor || '#C5A059'}
                            onChange={(e) =>
                              updateProp('theme', {
                                ...invitation.theme,
                                storyHeadingColor: e.target.value,
                              })
                            }
                            className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block mb-0.5">Warna Teks Isi Kisah</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={invitation.theme.storyTextColor || invitation.theme.textColor || '#2C2723'}
                            onChange={(e) =>
                              updateProp('theme', {
                                ...invitation.theme,
                                storyTextColor: e.target.value,
                              })
                            }
                            className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                          />
                          <input
                            type="text"
                            value={invitation.theme.storyTextColor || invitation.theme.textColor || '#2C2723'}
                            onChange={(e) =>
                              updateProp('theme', {
                                ...invitation.theme,
                                storyTextColor: e.target.value,
                              })
                            }
                            className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Tipografi & Warna */}
                  <div className="pt-2 border-t border-stone-200/80">
                    <span className="text-[11px] font-bold text-stone-700 block mb-1.5">
                      Pratinjau Tipografi & Warna Terpilih:
                    </span>
                    <div
                      className="p-5 rounded-2xl border border-stone-200 shadow-inner text-center space-y-2 transition-all"
                      style={{
                        backgroundColor: invitation.theme.bgColor || '#FAF7F2',
                      }}
                    >
                      <span
                        className="text-[10px] uppercase tracking-[0.25em] font-semibold block"
                        style={{ color: invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059' }}
                      >
                        {invitation.greetingTitle || "Walimatul 'Ursy"}
                      </span>
                      <h3
                        className={`text-2xl sm:text-3xl font-bold block ${invitation.theme.fontDisplay}`}
                        style={{ color: invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059' }}
                      >
                        {invitation.mempelaiPria.namaPanggilan || 'Romeo'} & {invitation.mempelaiWanita.namaPanggilan || 'Juliet'}
                      </h3>
                      <p
                        className={`text-xs italic px-4 line-clamp-3 leading-relaxed ${invitation.theme.fontBody || 'font-sans-clean'}`}
                        style={{ color: invitation.theme.quoteColor || invitation.theme.textColor || '#2C2723' }}
                      >
                        "{invitation.quoteText || 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu...'}"
                      </p>
                      {invitation.quoteSource && (
                        <span
                          className="text-[10px] font-bold tracking-wider uppercase block"
                          style={{ color: invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059' }}
                        >
                          — {invitation.quoteSource}
                        </span>
                      )}

                      {/* Mini Preview Kisah Cinta */}
                      <div className="mt-3 pt-3 border-t border-black/10 text-left px-3">
                        <span
                          className="text-[9px] uppercase tracking-[0.2em] font-bold block"
                          style={{ color: invitation.theme.storyYearColor || invitation.theme.primaryColor || '#C5A059' }}
                        >
                          Kisah Cinta Kami
                        </span>
                        <h4
                          className={`text-xs font-bold ${invitation.theme.fontDisplay}`}
                          style={{ color: invitation.theme.storyHeadingColor || invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059' }}
                        >
                          {invitation.loveStories[0]?.judul || 'Pertemuan Pertama'}
                        </h4>
                        <p
                          className={`text-[10px] leading-relaxed line-clamp-1 ${invitation.theme.fontBody || 'font-sans-clean'}`}
                          style={{ color: invitation.theme.storyTextColor || invitation.theme.textColor || '#2C2723' }}
                        >
                          {invitation.loveStories[0]?.cerita || 'Kisah cinta bermula dari sebuah tatapan sederhana...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ANIMASI MEMBUKA SURAT UNDANGAN */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                        Animasi Membuka Surat Undangan
                      </span>
                    </div>
                    {invitation.theme.openingAnimationOverride && (
                      <button
                        type="button"
                        onClick={() =>
                          updateProp('theme', {
                            ...invitation.theme,
                            openingAnimationOverride: undefined,
                          })
                        }
                        className="text-[10px] text-stone-400 hover:text-amber-700 underline"
                      >
                        Reset ke Bawaan Tema
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Pilih sensasi animasi unik saat tamu menekan tombol "Buka Undangan":
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {ALL_OPENING_ANIMATIONS_LIST.map((anim) => {
                      const currentAnim =
                        invitation.theme.openingAnimationOverride ||
                        getThemeOpeningAnimation(invitation.theme.templateId).type;
                      const isSelected = currentAnim === anim.type;

                      return (
                        <button
                          key={anim.type}
                          type="button"
                          onClick={() =>
                            updateProp('theme', {
                              ...invitation.theme,
                              openingAnimationOverride: anim.type,
                            })
                          }
                          className={`p-3 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/80 ring-1 ring-purple-500 shadow-sm'
                              : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900">{anim.label}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded-md mb-1">
                            {anim.badge}
                          </span>
                          <p className="text-[10px] text-stone-500 leading-tight">
                            {anim.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* EFEK ANIMASI SUASANA LAYAR (PARTIKEL MELAYANG) */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Efek Partikel Suasana Layar
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Animasi partikel lembut yang melayang anggun di layar undangan:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'petals', label: '🌸 Kelopak Mawar', desc: 'Romantis gugur' },
                      { id: 'sparkles', label: '✨ Kilau Bintang', desc: 'Emas berpendar' },
                      { id: 'hearts', label: '💖 Hati Melayang', desc: 'Kasih asmara' },
                      { id: 'butterflies', label: '🦋 Kupu-kupu', desc: 'Kepakan manis' },
                      { id: 'fireflies', label: '💡 Kunang-kunang', desc: 'Pendar bercahaya' },
                      { id: 'bubbles', label: '🫧 Gelembung', desc: 'Melayang lembut' },
                      { id: 'none', label: '🚫 Tanpa Efek', desc: 'Layar hening' },
                    ].map((eff) => (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() =>
                          updateProp('theme', {
                            ...invitation.theme,
                            ambientEffect: eff.id as any,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          (invitation.theme.ambientEffect || 'petals') === eff.id
                            ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-xs block font-semibold">{eff.label}</span>
                        <span className="text-[9px] text-stone-400 block mt-0.5">{eff.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STIKER & IKON ANIMASI TEMPEL DI SURAT UNDANGAN */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stamp className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                        Ikon Animasi Tempel (Stiker Bergerak)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentStickers = invitation.theme.attachedStickers || [];
                        const newSticker: AttachedIconSticker = {
                          id: 'sticker-' + Date.now(),
                          icon: 'rings',
                          label: 'The Wedding',
                          position: 'top-right',
                          animation: 'pulse',
                          color: invitation.theme.primaryColor || '#D4AF37',
                          size: 'medium',
                          enabled: true,
                        };
                        updateProp('theme', {
                          ...invitation.theme,
                          attachedStickers: [...currentStickers, newSticker],
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Stiker</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    Tempelkan stiker ornamen / lencana bergerak pada sampul surat undangan:
                  </p>

                  {(!invitation.theme.attachedStickers || invitation.theme.attachedStickers.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center text-xs text-stone-400">
                      Belum ada stiker animasi yang ditempel. Tekan "+ Tambah Stiker" untuk memasang ornamen bergerak.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invitation.theme.attachedStickers.map((sticker, idx) => (
                        <div
                          key={sticker.id}
                          className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                              <span>Stiker #{idx + 1}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium capitalize">
                                {sticker.icon} • {sticker.position}
                              </span>
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={sticker.enabled !== false}
                                  onChange={(e) => {
                                    const updated = [...(invitation.theme.attachedStickers || [])];
                                    updated[idx] = { ...sticker, enabled: e.target.checked };
                                    updateProp('theme', { ...invitation.theme, attachedStickers: updated });
                                  }}
                                  className="rounded text-amber-600"
                                />
                                <span>Aktif</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (invitation.theme.attachedStickers || []).filter(
                                    (s) => s.id !== sticker.id
                                  );
                                  updateProp('theme', { ...invitation.theme, attachedStickers: updated });
                                }}
                                className="text-stone-400 hover:text-rose-600 p-1"
                                title="Hapus Stiker"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Icon Selector */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-stone-600">Pilih Bentuk Ikon:</label>
                            <div className="grid grid-cols-5 gap-1.5">
                              {[
                                { id: 'rings', label: '💍 Cincin' },
                                { id: 'heart-pulse', label: '💖 Hati' },
                                { id: 'dove', label: '🕊️ Merpati' },
                                { id: 'bismillah', label: '🌙 Bulan' },
                                { id: 'crown', label: '👑 Mahkota' },
                                { id: 'sparkles', label: '✨ Kilau' },
                                { id: 'champagne', label: '🥂 Gelas' },
                                { id: 'rose', label: '🌹 Mawar' },
                                { id: 'butterfly', label: '🦋 Kupu' },
                                { id: 'infinity', label: '♾️ Abadi' },
                              ].map((ic) => (
                                <button
                                  key={ic.id}
                                  type="button"
                                  onClick={() => {
                                    const updated = [...(invitation.theme.attachedStickers || [])];
                                    updated[idx] = { ...sticker, icon: ic.id as any };
                                    updateProp('theme', { ...invitation.theme, attachedStickers: updated });
                                  }}
                                  className={`py-1.5 px-1 rounded-lg border text-center text-[10px] truncate ${
                                    sticker.icon === ic.id
                                      ? 'border-amber-600 bg-amber-50 font-bold text-amber-900'
                                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                                  }`}
                                >
                                  {ic.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Position & Animation */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-stone-600">Posisi Tempel:</label>
                              <select
                                value={sticker.position}
                                onChange={(e) => {
                                  const updated = [...(invitation.theme.attachedStickers || [])];
                                  updated[idx] = { ...sticker, position: e.target.value as any };
                                  updateProp('theme', { ...invitation.theme, attachedStickers: updated });
                                }}
                                className="w-full mt-1 px-2 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-800"
                              >
                                <option value="top-right">Pojok Kanan Atas</option>
                                <option value="top-left">Pojok Kiri Atas</option>
                                <option value="cover-center">Lencana Tengah Sampul</option>
                                <option value="bottom-right">Pojok Kanan Bawah</option>
                                <option value="bottom-left">Pojok Kiri Bawah</option>
                                <option value="floating-bottom-right">Widget Mengambang (Floating)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold text-stone-600">Gaya Gerak Animasi:</label>
                              <select
                                value={sticker.animation}
                                onChange={(e) => {
                                  const updated = [...(invitation.theme.attachedStickers || [])];
                                  updated[idx] = { ...sticker, animation: e.target.value as any };
                                  updateProp('theme', { ...invitation.theme, attachedStickers: updated });
                                }}
                                className="w-full mt-1 px-2 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-800"
                              >
                                <option value="pulse">Berdenyut (Heartbeat Pulse)</option>
                                <option value="bounce">Melompat Halus (Bounce)</option>
                                <option value="float-sway">Mengambang (Float & Sway)</option>
                                <option value="rotate-slow">Berputar Perlahan (360° Spin)</option>
                                <option value="glow">Pendar Berkilau (Radiance Glow)</option>
                              </select>
                            </div>
                          </div>

                          {/* Label & Color */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-stone-600">Teks Label (Opsional):</label>
                              <input
                                type="text"
                                placeholder="Contoh: The Wedding"
                                value={sticker.label || ''}
                                onChange={(e) => {
                                  const updated = [...(invitation.theme.attachedStickers || [])];
                                  updated[idx] = { ...sticker, label: e.target.value };
                                  updateProp('theme', { ...invitation.theme, attachedStickers: updated });
                                }}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-800"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold text-stone-600">Warna Ikon Stiker:</label>
                              <div className="flex items-center gap-1.5 mt-1">
                                <input
                                  type="color"
                                  value={sticker.color || '#D4AF37'}
                                  onChange={(e) => {
                                    const updated = [...(invitation.theme.attachedStickers || [])];
                                    updated[idx] = { ...sticker, color: e.target.value };
                                    updateProp('theme', { ...invitation.theme, attachedStickers: updated });
                                  }}
                                  className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={sticker.color || '#D4AF37'}
                                  onChange={(e) => {
                                    const updated = [...(invitation.theme.attachedStickers || [])];
                                    updated[idx] = { ...sticker, color: e.target.value };
                                    updateProp('theme', { ...invitation.theme, attachedStickers: updated });
                                  }}
                                  className="w-full px-2 py-1 rounded-lg border border-stone-300 text-[11px] font-mono uppercase"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preset Warna Aksen */}
                <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Palet Warna Utama (Aksen)
                  </span>
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {[
                      { name: 'Royal Gold', primary: '#C5A85C', bg: '#FAF7F0', text: '#2C2723' },
                      { name: 'Luxury Black', primary: '#E5C478', bg: '#111111', text: '#F3F4F6' },
                      { name: 'Blush Rose', primary: '#DB838B', bg: '#FDF9F9', text: '#4A3E3F' },
                      { name: 'Emerald Syar\'i', primary: '#0D7A68', bg: '#F0FDF4', text: '#112E29' },
                      { name: 'Terracotta Earth', primary: '#C45B3E', bg: '#FDF8F5', text: '#4A2016' },
                      { name: 'Navy Blue', primary: '#1B3E8F', bg: '#F0F4FF', text: '#0F1E4A' },
                    ].map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() =>
                          updateProp('theme', {
                            ...invitation.theme,
                            primaryColor: col.primary,
                            bgColor: col.bg,
                            textColor: col.text,
                          })
                        }
                        className={`p-2 rounded-xl border text-center transition-all ${
                          invitation.theme.primaryColor === col.primary
                            ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div
                          className="w-full h-7 rounded-lg mb-1 shadow-inner border border-black/10"
                          style={{ backgroundColor: col.primary }}
                        />
                        <span className="text-[10px] font-semibold text-stone-700 block truncate">
                          {col.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Kustomisasi Warna Hex
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Warna Aksen</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={invitation.theme.primaryColor}
                          onChange={(e) =>
                            updateProp('theme', {
                              ...invitation.theme,
                              primaryColor: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300"
                        />
                        <input
                          type="text"
                          value={invitation.theme.primaryColor}
                          onChange={(e) =>
                            updateProp('theme', {
                              ...invitation.theme,
                              primaryColor: e.target.value,
                            })
                          }
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Warna Latar (Background)</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={invitation.theme.bgColor}
                          onChange={(e) =>
                            updateProp('theme', {
                              ...invitation.theme,
                              bgColor: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300"
                        />
                        <input
                          type="text"
                          value={invitation.theme.bgColor}
                          onChange={(e) =>
                            updateProp('theme', {
                              ...invitation.theme,
                              bgColor: e.target.value,
                            })
                          }
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CERITA & GALERI */}
            {activeTab === 'galeri' && (
              <div className="space-y-6">
                {/* KUSTOMISASI WARNA FONT & GAYA KISAH KAMI */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-50/70 via-stone-50 to-stone-100 border-2 border-amber-200/80 p-4 space-y-3.5 shadow-xs">
                  <div
                    onClick={() => setIsStoryStylingOpen(!isStoryStylingOpen)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                        <Heart className="w-4 h-4 fill-white/30" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Warna Font Kisah Kami (Love Story)</span>
                          <span className="text-[10px] lowercase font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                            langsung berubah
                          </span>
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Ubah warna judul momen kisah, teks isi deskripsi cerita, dan badge tahun timeline.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
                    >
                      {isStoryStylingOpen ? (
                        <ChevronUp className="w-4 h-4 text-stone-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-600" />
                      )}
                    </button>
                  </div>

                  {isStoryStylingOpen && (
                    <div className="space-y-4 pt-2 border-t border-amber-200/70">
                      {/* Pilihan Cepat Harmoni Warna Kisah Kami */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-stone-700 block">
                            Palet Harmoni Warna Kisah Cinta 1-Klik
                          </label>
                          <button
                            type="button"
                            onClick={handleSyncStoryWithMainTheme}
                            className="text-[10px] text-amber-800 hover:text-amber-900 font-semibold underline flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Ikuti Tema Utama</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {STORY_COLOR_PRESETS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => handleApplyStoryPreset(p)}
                              className="p-2 rounded-xl border border-stone-200 bg-white hover:border-amber-500 hover:shadow-2xs text-left transition-all flex flex-col gap-1"
                            >
                              <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.heading }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.text }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: p.year }} />
                              </div>
                              <span className="text-[11px] font-bold text-stone-800 leading-tight truncate">
                                {p.name}
                              </span>
                              <span className="text-[9px] text-stone-400 truncate">
                                {p.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Detail Pemilih Warna Font Kisah Kami */}
                      <div className="space-y-3 pt-2 border-t border-amber-200/70">
                        <span className="text-[11px] font-bold text-stone-700 block">
                          Sesuaikan Warna Font Kisah Kami Secara Detail
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* 1. Warna Huruf Judul Momen & Heading */}
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200">
                            <label className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">
                              Warna Judul Kisah & Momen
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={invitation.theme.storyHeadingColor || invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    storyHeadingColor: e.target.value,
                                  })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                              />
                              <input
                                type="text"
                                value={invitation.theme.storyHeadingColor || invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    storyHeadingColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {['#C5A059', '#D4AF37', '#1C1917', '#881337', '#065F46', '#1E3A8A', '#BE123C', '#FFFFFF'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateProp('theme', { ...invitation.theme, storyHeadingColor: c })}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* 2. Warna Huruf Teks Isi / Paragraf Kisah */}
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200">
                            <label className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">
                              Warna Teks Narasi / Isi Cerita
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={invitation.theme.storyTextColor || invitation.theme.textColor || '#2C2723'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    storyTextColor: e.target.value,
                                  })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                              />
                              <input
                                type="text"
                                value={invitation.theme.storyTextColor || invitation.theme.textColor || '#2C2723'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    storyTextColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {['#2C2723', '#1C1917', '#374151', '#44403C', '#6B7280', '#8C6D37', '#E5E7EB', '#FFFFFF'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateProp('theme', { ...invitation.theme, storyTextColor: c })}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* 3. Warna Teks Badge Tahun & Garis Timeline */}
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200">
                            <label className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">
                              Warna Badge Tahun & Penanda Garis
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={invitation.theme.storyYearColor || invitation.theme.primaryColor || '#C5A059'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    storyYearColor: e.target.value,
                                  })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                              />
                              <input
                                type="text"
                                value={invitation.theme.storyYearColor || invitation.theme.primaryColor || '#C5A059'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    storyYearColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {['#C5A059', '#D4AF37', '#059669', '#BE123C', '#2563EB', '#111827', '#FFFFFF'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateProp('theme', { ...invitation.theme, storyYearColor: c })}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* 4. Warna Latar Badge Tahun (Tag Background) */}
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-200">
                            <label className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">
                              Warna Latar Badge Tahun
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={invitation.theme.storyBadgeBgColor || '#FAF7F2'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    storyBadgeBgColor: e.target.value,
                                  })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 shrink-0"
                              />
                              <input
                                type="text"
                                value={invitation.theme.storyBadgeBgColor || '#FAF7F2'}
                                onChange={(e) =>
                                  updateProp('theme', {
                                    ...invitation.theme,
                                    storyBadgeBgColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 rounded border border-stone-300 text-[11px] font-mono uppercase"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {['#FDF6E9', '#FAF7F2', '#FFFFFF', '#1F2937', '#ECFDF5', '#FFF1F2', '#EFF6FF'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateProp('theme', { ...invitation.theme, storyBadgeBgColor: c })}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Mini Preview Kisah Cinta */}
                      <div className="pt-2 border-t border-amber-200/70">
                        <span className="text-[11px] font-bold text-stone-700 block mb-1.5">
                          Pratinjau Tampilan Font & Warna Kisah Kami:
                        </span>
                        <div
                          className="p-4 rounded-xl border border-stone-200/80 shadow-xs transition-colors"
                          style={{
                            backgroundColor: invitation.theme.bgColor || '#FAF7F2',
                          }}
                        >
                          <div className="text-center space-y-1 mb-3">
                            <span
                              className="text-[9px] uppercase tracking-[0.25em] font-semibold block"
                              style={{ color: invitation.theme.storyYearColor || invitation.theme.primaryColor || '#C5A059' }}
                            >
                              Perjalanan Kasih
                            </span>
                            <h3
                              className={`text-lg font-bold block ${invitation.theme.fontDisplay}`}
                              style={{ color: invitation.theme.storyHeadingColor || invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059' }}
                            >
                              Kisah Cinta Kami
                            </h3>
                          </div>

                          {/* Mini Timeline Item */}
                          <div
                            className="relative border-l-2 ml-4 pl-4 space-y-1 my-2"
                            style={{ borderColor: invitation.theme.storyYearColor || invitation.theme.primaryColor || '#C5A059' }}
                          >
                            <div
                              className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full shadow-xs"
                              style={{ backgroundColor: invitation.theme.storyYearColor || invitation.theme.primaryColor || '#C5A059' }}
                            />
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-cinzel"
                              style={{
                                backgroundColor: invitation.theme.storyBadgeBgColor || '#FDF6E9',
                                color: invitation.theme.storyYearColor || invitation.theme.primaryColor || '#C5A059',
                              }}
                            >
                              2024
                            </span>
                            <h4
                              className={`font-bold text-xs pt-0.5 ${invitation.theme.fontDisplay}`}
                              style={{ color: invitation.theme.storyHeadingColor || invitation.theme.headingColor || invitation.theme.primaryColor || '#C5A059' }}
                            >
                              {invitation.loveStories[0]?.judul || 'Pertemuan Pertama'}
                            </h4>
                            <p
                              className={`text-[11px] leading-relaxed line-clamp-2 ${invitation.theme.fontBody || 'font-sans-clean'}`}
                              style={{ color: invitation.theme.storyTextColor || invitation.theme.textColor || '#2C2723' }}
                            >
                              {invitation.loveStories[0]?.cerita || 'Kisah cinta bermula dari sebuah tatapan sederhana yang menumbuhkan komitmen seumur hidup.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kisah Cinta Timeline List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                        Daftar Momen Cerita Cinta ({invitation.loveStories.length})
                      </span>
                      <p className="text-[11px] text-stone-500">
                        Tambahkan momen bersejarah perjalanan cinta Anda bersama pasangan.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newStory: LoveStoryStep = {
                          id: 'story-' + Date.now(),
                          tahun: '2024',
                          judul: 'Momen Indah',
                          cerita: 'Tuliskan momen berharga perjalanan cinta Anda di sini...',
                        };
                        updateProp('loveStories', [...invitation.loveStories, newStory]);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Cerita</span>
                    </button>
                  </div>

                  {invitation.loveStories.map((story, sIdx) => {
                    const isCustomColorExpanded = expandedStoryColorId === story.id;
                    const hasCustomColor = !!(story.judulColor || story.ceritaColor || story.tahunColor);

                    return (
                      <div
                        key={story.id}
                        className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={story.tahun}
                            onChange={(e) => {
                              const updated = [...invitation.loveStories];
                              updated[sIdx].tahun = e.target.value;
                              updateProp('loveStories', updated);
                            }}
                            placeholder="Tahun (contoh: 2021)"
                            className="w-28 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-amber-700"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedStoryColorId(isCustomColorExpanded ? null : story.id)
                              }
                              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                                hasCustomColor
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                              }`}
                              title="Kustom warna font khusus momen ini"
                            >
                              <Pipette className="w-3 h-3" />
                              <span className="hidden sm:inline">Warna Khusus</span>
                              {hasCustomColor && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                updateProp(
                                  'loveStories',
                                  invitation.loveStories.filter((s) => s.id !== story.id)
                                );
                              }}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                              title="Hapus momen cerita"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Opsi Kustom Warna per-Item jika diaktifkan */}
                        {isCustomColorExpanded && (
                          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-950 text-[11px]">
                                Kustom Warna Font Khusus Momen Ini:
                              </span>
                              {hasCustomColor && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...invitation.loveStories];
                                    delete updated[sIdx].judulColor;
                                    delete updated[sIdx].ceritaColor;
                                    delete updated[sIdx].tahunColor;
                                    updateProp('loveStories', updated);
                                  }}
                                  className="text-[10px] text-amber-800 hover:text-rose-700 underline"
                                >
                                  Reset ke Default
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-stone-600 block mb-0.5">Warna Judul Momen</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={story.judulColor || invitation.theme.storyHeadingColor || '#C5A059'}
                                    onChange={(e) => {
                                      const updated = [...invitation.loveStories];
                                      updated[sIdx].judulColor = e.target.value;
                                      updateProp('loveStories', updated);
                                    }}
                                    className="w-6 h-6 rounded cursor-pointer border border-stone-300 shrink-0"
                                  />
                                  <span className="text-[10px] font-mono text-stone-600">
                                    {story.judulColor || 'Default'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] text-stone-600 block mb-0.5">Warna Teks Isi</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={story.ceritaColor || invitation.theme.storyTextColor || '#2C2723'}
                                    onChange={(e) => {
                                      const updated = [...invitation.loveStories];
                                      updated[sIdx].ceritaColor = e.target.value;
                                      updateProp('loveStories', updated);
                                    }}
                                    className="w-6 h-6 rounded cursor-pointer border border-stone-300 shrink-0"
                                  />
                                  <span className="text-[10px] font-mono text-stone-600">
                                    {story.ceritaColor || 'Default'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <input
                          type="text"
                          value={story.judul}
                          onChange={(e) => {
                            const updated = [...invitation.loveStories];
                            updated[sIdx].judul = e.target.value;
                            updateProp('loveStories', updated);
                          }}
                          placeholder="Judul momen..."
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                          style={{
                            color: story.judulColor || invitation.theme.storyHeadingColor || undefined,
                          }}
                        />

                        <textarea
                          rows={2}
                          value={story.cerita}
                          onChange={(e) => {
                            const updated = [...invitation.loveStories];
                            updated[sIdx].cerita = e.target.value;
                            updateProp('loveStories', updated);
                          }}
                          placeholder="Deskripsi cerita cinta..."
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                          style={{
                            color: story.ceritaColor || invitation.theme.storyTextColor || undefined,
                          }}
                        />

                        {/* Foto Momen (Opsional) */}
                        <div className="pt-1">
                          <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                            Foto Momen Kisah (Opsional)
                          </label>
                          <LocalImageUploader
                            currentUrl={story.fotoUrl || ''}
                            onUpload={(url) => {
                              const updated = [...invitation.loveStories];
                              updated[sIdx].fotoUrl = url;
                              updateProp('loveStories', updated);
                            }}
                            placeholder="URL foto kenangan (lamaran, pertama kencan, dll)..."
                            prefix="story"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Galeri Foto Prewedding */}
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Foto Galeri ({invitation.gallery.length})
                    </span>
                    <button
                      onClick={() => {
                        const newPhoto: GalleryPhoto = {
                          id: 'gal-' + Date.now(),
                          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
                          caption: 'Momen Bahagia',
                        };
                        updateProp('gallery', [...invitation.gallery, newPhoto]);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Foto</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {invitation.gallery.map((photo, pIdx) => (
                      <div
                        key={photo.id}
                        className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 relative group"
                      >
                        <div className="h-28 rounded-lg overflow-hidden bg-stone-200">
                          <img
                            src={photo.url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <LocalImageUploader
                          currentUrl={photo.url}
                          onUpload={(url) => {
                            const updated = [...invitation.gallery];
                            updated[pIdx].url = url;
                            updateProp('gallery', updated);
                          }}
                          placeholder="URL Foto..."
                          prefix="gallery"
                        />
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={photo.caption || ''}
                            onChange={(e) => {
                              const updated = [...invitation.gallery];
                              updated[pIdx].caption = e.target.value;
                              updateProp('gallery', updated);
                            }}
                            placeholder="Caption..."
                            className="w-3/4 px-2 py-1 rounded border border-stone-300 text-[11px]"
                          />
                          <button
                            onClick={() => {
                              updateProp(
                                'gallery',
                                invitation.gallery.filter((g) => g.id !== photo.id)
                              );
                            }}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AMPLOP & KADO */}
            {activeTab === 'kado' && (
              <div className="space-y-6">
                {/* Daftar Rekening Bank */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Rekening Bank / e-Wallet
                    </span>
                    <button
                      onClick={() => {
                        const newBank: BankAccount = {
                          id: 'bank-' + Date.now(),
                          namaBank: 'BCA',
                          nomorRekening: '1234567890',
                          atasNama: invitation.mempelaiPria.namaPanggilan,
                          catatan: 'Amplop Digital',
                        };
                        updateProp('bankAccounts', [...invitation.bankAccounts, newBank]);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Rekening</span>
                    </button>
                  </div>

                  {invitation.bankAccounts.map((b, bIdx) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <select
                          value={b.namaBank}
                          onChange={(e) => {
                            const updated = [...invitation.bankAccounts];
                            updated[bIdx].namaBank = e.target.value;
                            updateProp('bankAccounts', updated);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-bold"
                        >
                          <option value="BCA">BCA</option>
                          <option value="Mandiri">Bank Mandiri</option>
                          <option value="BRI">BRI</option>
                          <option value="BNI">BNI</option>
                          <option value="BSI">BSI (Bank Syariah)</option>
                          <option value="GoPay">GoPay</option>
                          <option value="OVO">OVO</option>
                          <option value="Dana">DANA</option>
                          <option value="QRIS">QRIS</option>
                        </select>
                        <button
                          onClick={() => {
                            updateProp(
                              'bankAccounts',
                              invitation.bankAccounts.filter((x) => x.id !== b.id)
                            );
                          }}
                          className="text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-stone-500">Nomor Rekening</label>
                          <input
                            type="text"
                            value={b.nomorRekening}
                            onChange={(e) => {
                              const updated = [...invitation.bankAccounts];
                              updated[bIdx].nomorRekening = e.target.value;
                              updateProp('bankAccounts', updated);
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-stone-500">Atas Nama</label>
                          <input
                            type="text"
                            value={b.atasNama}
                            onChange={(e) => {
                              const updated = [...invitation.bankAccounts];
                              updated[bIdx].atasNama = e.target.value;
                              updateProp('bankAccounts', updated);
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Alamat Kirim Kado Fisik */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Alamat Kirim Kado Fisik
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Nama Penerima & No. HP</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input
                        type="text"
                        value={invitation.giftAddress?.penerima || ''}
                        onChange={(e) =>
                          updateProp('giftAddress', {
                            ...invitation.giftAddress,
                            penerima: e.target.value,
                          })
                        }
                        placeholder="Nama Penerima"
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                      <input
                        type="text"
                        value={invitation.giftAddress?.nomorTelepon || ''}
                        onChange={(e) =>
                          updateProp('giftAddress', {
                            ...invitation.giftAddress,
                            nomorTelepon: e.target.value,
                          })
                        }
                        placeholder="0812-xxxx-xxxx"
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Alamat Lengkap Rumah</label>
                    <textarea
                      rows={2}
                      value={invitation.giftAddress?.alamatLengkap || ''}
                      onChange={(e) =>
                        updateProp('giftAddress', {
                          ...invitation.giftAddress,
                          alamatLengkap: e.target.value,
                        })
                      }
                      placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota..."
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: RSVP & MUSIK */}
            {activeTab === 'rsvp' && (
              <div className="space-y-6">
                {/* QR Code RSVP Cetak Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        Generator QR Code RSVP Kartu Cetak
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        Buat kartu sisipan atau stiker scan QR agar tamu dapat mengisi kehadiran secara cepat dari undangan fisik.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQrModalTarget('rsvp');
                      setIsQRModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Buka Desain & Cetak Kartu QR RSVP</span>
                  </button>
                </div>

                {/* Musik Latar */}
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                    Musik & Audio Latar
                  </h4>
                  <MusicSelector
                    music={invitation.music}
                    onChange={(newMusic) => updateProp('music', newMusic)}
                  />
                </div>

                {/* Pesan Penutup & Protokol */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Pesan Penutup & Himbauan
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Pesan Penutup</label>
                    <textarea
                      rows={3}
                      value={invitation.pesanPenutup}
                      onChange={(e) => updateProp('pesanPenutup', e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-700 font-medium">
                      Tampilkan Himbauan Kenyamanan Acara
                    </span>
                    <input
                      type="checkbox"
                      checked={invitation.protokolKesehatan}
                      onChange={(e) => updateProp('protokolKesehatan', e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                  </div>
                </div>

                {/* Daftar Tamu RSVP Masuk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Daftar Konfirmasi Tamu ({invitation.rsvpList?.length || 0})
                    </span>
                    {invitation.rsvpList && invitation.rsvpList.length > 0 && (
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                        title="Ekspor ke CSV"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ekspor CSV</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                    {invitation.rsvpList.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{r.nama}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              r.status === 'attending'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {r.status === 'attending' ? 'Hadir' : 'Tidak Hadir'} ({r.jumlahTamu} Tamu)
                          </span>
                        </div>
                        <p className="text-stone-500 italic">"{r.pesanDoa}"</p>
                        {Array.isArray(r.replies) && r.replies.length > 0 && (
                          <div className="ml-2 pl-2 border-l-2 border-amber-300 space-y-1 pt-1">
                            {r.replies.map((reply) => (
                              <div key={reply.id} className="text-[11px] text-stone-600 bg-white p-1.5 rounded-lg border border-stone-200/60">
                                <span className="font-semibold text-stone-800">
                                  {reply.nama} {reply.isHost ? '(Mempelai)' : ''}:
                                </span>{' '}
                                {reply.pesan}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* SISI KANAN: LIVE PHONE PREVIEW */}
        <div
          className={`flex-1 bg-stone-200/80 flex flex-col items-center justify-center p-4 overflow-y-auto ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* LIVE PREVIEW TOOLBAR WITH ANIMATION CONTROLS */}
          <div className="flex items-center justify-between gap-2 mb-3 w-full max-w-[390px] px-1 select-none">
            {/* View Mode Toggle: Sampul Depan vs Isi Undangan */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs border border-stone-200">
              <button
                type="button"
                id="btn-preview-cover"
                onClick={() => {
                  setPreviewOpened(false);
                  setPreviewAnimationKey((k) => k + 1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  !previewOpened
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Sampul Depan
              </button>
              <button
                type="button"
                id="btn-preview-inside"
                onClick={() => {
                  setPreviewOpened(true);
                  setPreviewAnimationKey((k) => k + 1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  previewOpened
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Isi Undangan
              </button>
            </div>

            {/* Replay Animation Button */}
            <button
              type="button"
              id="btn-preview-replay"
              onClick={() => {
                setPreviewAnimationKey((k) => k + 1);
              }}
              title="Putar ulang animasi masuk gambar dan lembaran"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 border border-stone-200 shadow-xs text-xs font-semibold transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Replay Animasi</span>
            </button>

            {/* High-Contrast Mode Toggle for Accessibility */}
            <button
              type="button"
              id="btn-editor-high-contrast"
              onClick={() => {
                const nextVal = !previewHighContrast;
                setPreviewHighContrast(nextVal);
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.setItem('vhistetic_high_contrast', String(nextVal));
                    window.dispatchEvent(new CustomEvent('vhistetic_high_contrast_change', { detail: nextVal }));
                  } catch {
                    // ignore
                  }
                }
              }}
              title="Toggle mode kontras tinggi (solid black & white) untuk aksesibilitas teks maksimal"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                previewHighContrast
                  ? 'bg-stone-900 text-white border-black shadow-xs ring-2 ring-stone-900/20'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 shadow-xs'
              }`}
            >
              <Contrast className={`w-3.5 h-3.5 ${previewHighContrast ? 'text-amber-400 rotate-180' : 'text-stone-600'} transition-transform duration-300`} />
              <span>{previewHighContrast ? 'Kontras: ON' : 'Mode Kontras'}</span>
            </button>
          </div>

          <PhoneSimulator>
            <InvitationPublicView
              key={`preview-instance-${previewAnimationKey}`}
              invitation={invitation}
              guestName="Bapak / Ibu Tamu Terhormat"
              forceOpened={previewOpened}
              onOpenedChange={(opened) => setPreviewOpened(opened)}
              animationKey={previewAnimationKey}
              highContrast={previewHighContrast}
              onToggleHighContrast={setPreviewHighContrast}
              showFloatingContrastButton={false}
              onAddRSVP={(newRsvp) => {
                const updatedList = deduplicateRSVPList([
                  {
                    id: 'rsvp-' + Date.now(),
                    invitationId: invitation.id,
                    createdAt: new Date().toISOString(),
                    ...newRsvp,
                  },
                  ...(invitation.rsvpList || []),
                ]);
                updateProp('rsvpList', updatedList);
              }}
              isSimulator
            />
          </PhoneSimulator>
        </div>
      </div>

      {/* WhatsApp Share Modal */}
      {isShareModalOpen && (
        <WhatsAppShareModal
          isOpen={true}
          invitation={invitation}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* QR Code & Printable Card Modal */}
      {isQRModalOpen && (
        <InvitationQRCardModal
          isOpen={isQRModalOpen}
          invitation={invitation}
          initialTarget={qrModalTarget}
          initialEventIndex={selectedEventQrIdx}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}
    </div>
  );
};
