import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Heart,
  Calendar,
  Compass,
  Sparkles,
  X,
  ChevronDown,
  Layers,
  Palette,
  User,
  Sliders,
  Share2,
  Navigation,
  FileText,
  ScanLine,
} from 'lucide-react';
import { InvitationData, EventSchedule } from '../types/invitation';
import { getBaseAppUrl } from '../utils/urlHelper';

export type QRTargetMode = 'directions' | 'rsvp' | 'full';
export type QRCardType = 'insert-card' | 'table-tent' | 'souvenir-tag' | 'raw-qr';

export interface InvitationQRCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: InvitationData;
  initialTarget?: QRTargetMode;
  initialEventIndex?: number;
  defaultGuestName?: string;
}

interface ColorPaletteOption {
  id: string;
  name: string;
  fgColor: string;
  bgColor: string;
  cardBg: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
}

const PALETTE_PRESETS: ColorPaletteOption[] = [
  {
    id: 'classic-luxury',
    name: 'Classic Gold & Ivory',
    fgColor: '#1C1917',
    bgColor: '#FFFFFF',
    cardBg: '#FFFDF9',
    borderColor: '#D4AF37',
    accentColor: '#B45309',
    textColor: '#292524',
  },
  {
    id: 'emerald-garden',
    name: 'Emerald Botanical',
    fgColor: '#064E3B',
    bgColor: '#FFFFFF',
    cardBg: '#F7FCF9',
    borderColor: '#059669',
    accentColor: '#047857',
    textColor: '#064E3B',
  },
  {
    id: 'midnight-navy',
    name: 'Midnight & Gold',
    fgColor: '#0F172A',
    bgColor: '#FFFFFF',
    cardBg: '#F8FAFC',
    borderColor: '#38BDF8',
    accentColor: '#0284C7',
    textColor: '#0F172A',
  },
  {
    id: 'ruby-rose',
    name: 'Romantic Rosewood',
    fgColor: '#4C0519',
    bgColor: '#FFFFFF',
    cardBg: '#FFF5F7',
    borderColor: '#F43F5E',
    accentColor: '#BE123C',
    textColor: '#4C0519',
  },
  {
    id: 'solid-black',
    name: 'Monochrome Scan (WCAG)',
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    cardBg: '#FFFFFF',
    borderColor: '#000000',
    accentColor: '#000000',
    textColor: '#000000',
  },
];

export const InvitationQRCardModal: React.FC<InvitationQRCardModalProps> = ({
  isOpen,
  onClose,
  invitation,
  initialTarget = 'directions',
  initialEventIndex = 0,
  defaultGuestName = '',
}) => {
  // Target mode: directions (petunjuk arah), rsvp (konfirmasi kehadiran), full (buka undangan)
  const [targetMode, setTargetMode] = useState<QRTargetMode>(initialTarget);
  const [selectedEventIdx, setSelectedEventIdx] = useState<number>(initialEventIndex);
  const [directionsMethod, setDirectionsMethod] = useState<'maps' | 'invitation'>('maps');
  
  // Guest personalization
  const [guestName, setGuestName] = useState<string>(defaultGuestName);
  const [isManualBlankName, setIsManualBlankName] = useState<boolean>(!defaultGuestName);
  
  // Card template type
  const [cardType, setCardType] = useState<QRCardType>('insert-card');
  
  // QR Visual Customization
  const [selectedPalette, setSelectedPalette] = useState<ColorPaletteOption>(PALETTE_PRESETS[0]);
  const [centerIconType, setCenterIconType] = useState<'auto' | 'pin' | 'heart' | 'none'>('auto');
  const [errorCorrection, setErrorCorrection] = useState<'M' | 'Q' | 'H'>('H');
  const [qrSize, setQrSize] = useState<number>(200);

  // Status feedback
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Hidden canvas ref for generating standalone QR code PNG
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Printable card container ref
  const printCardRef = useRef<HTMLDivElement | null>(null);

  // Reset target mode if initialTarget prop changes
  useEffect(() => {
    if (isOpen) {
      setTargetMode(initialTarget);
      if (initialEventIndex !== undefined) {
        setSelectedEventIdx(initialEventIndex);
      }
      if (defaultGuestName) {
        setGuestName(defaultGuestName);
        setIsManualBlankName(false);
      }
    }
  }, [isOpen, initialTarget, initialEventIndex, defaultGuestName]);

  if (!isOpen) return null;

  const currentEvent: EventSchedule | undefined =
    invitation.events && invitation.events.length > 0
      ? invitation.events[selectedEventIdx] || invitation.events[0]
      : undefined;

  // Base URL calculation (compatible with GitHub Pages subpaths and Cloud Run)
  const baseUrl = getBaseAppUrl();

  // Build target destination URL
  let targetUrl = '';
  const guestParam = guestName && !isManualBlankName ? `?to=${encodeURIComponent(guestName.trim())}` : '';

  if (targetMode === 'directions') {
    if (directionsMethod === 'maps') {
      if (currentEvent?.linkGoogleMaps && currentEvent.linkGoogleMaps.startsWith('http')) {
        targetUrl = currentEvent.linkGoogleMaps;
      } else {
        const query = currentEvent
          ? `${currentEvent.namaTempat} ${currentEvent.alamat}`
          : 'Lokasi Acara Pernikahan';
        targetUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      }
    } else {
      // Direct to digital invitation's events section
      const sep = guestParam ? '&' : '?';
      targetUrl = `${baseUrl}#invite/${invitation.slug || invitation.id}${guestParam}${sep}action=directions`;
    }
  } else if (targetMode === 'rsvp') {
    // Direct to digital invitation's RSVP form
    const sep = guestParam ? '&' : '?';
    targetUrl = `${baseUrl}#invite/${invitation.slug || invitation.id}${guestParam}${sep}action=rsvp`;
  } else {
    // Full digital invitation
    targetUrl = `${baseUrl}#invite/${invitation.slug || invitation.id}${guestParam}`;
  }

  // Calculate icon overlay
  let effectiveCenterIcon: 'pin' | 'heart' | 'none' = 'none';
  if (centerIconType === 'auto') {
    if (targetMode === 'directions') effectiveCenterIcon = 'pin';
    else if (targetMode === 'rsvp') effectiveCenterIcon = 'heart';
    else effectiveCenterIcon = 'none';
  } else {
    effectiveCenterIcon = centerIconType;
  }

  // Format event date
  const eventDateFormatted = currentEvent
    ? new Date(currentEvent.tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  // Copy target URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // fallback
    }
  };

  // Direct Browser Print
  const handleDirectPrint = () => {
    window.print();
  };

  // Download Standalone QR Code as PNG
  const handleDownloadQRPng = () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    // Create high-res clone
    const exportCanvas = document.createElement('canvas');
    const scale = 3; // 3x high-res
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const image = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `qr-${targetMode}-${invitation.slug || 'undangan'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render & Download the entire Card as PNG using 2D Canvas
  const handleDownloadCardPng = async () => {
    setIsDownloading(true);
    try {
      const qrCanvas = hiddenCanvasRef.current;
      if (!qrCanvas) return;

      // Card dimensions for high-res export (300 DPI ready)
      let cardWidth = 1200;
      let cardHeight = 1600; // 3:4 ratio for insert-card
      if (cardType === 'table-tent') {
        cardWidth = 1200;
        cardHeight = 1800; // 2:3 ratio
      } else if (cardType === 'souvenir-tag') {
        cardWidth = 1200;
        cardHeight = 1200; // 1:1 ratio
      } else if (cardType === 'raw-qr') {
        cardWidth = 1000;
        cardHeight = 1200;
      }

      const canvas = document.createElement('canvas');
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw Card Background
      ctx.fillStyle = selectedPalette.cardBg;
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // 2. Decorative Double Outer Border
      ctx.strokeStyle = selectedPalette.borderColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, cardWidth - 72, cardHeight - 72);

      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, cardWidth - 96, cardHeight - 96);

      // Corner Accents
      const drawCorner = (x: number, y: number, rot: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = selectedPalette.accentColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(60, 60, 0);
      drawCorner(cardWidth - 60, 60, Math.PI / 2);
      drawCorner(cardWidth - 60, cardHeight - 60, Math.PI);
      drawCorner(60, cardHeight - 60, -Math.PI / 2);

      // 3. Header Texts
      ctx.textAlign = 'center';

      // Header Tagline
      ctx.fillStyle = selectedPalette.accentColor;
      ctx.font = 'bold 24px sans-serif';
      const headerTag =
        targetMode === 'directions'
          ? 'PETUNJUK ARAH & PETA LOKASI'
          : targetMode === 'rsvp'
          ? 'KONFIRMASI KEHADIRAN & RSVP'
          : 'UNDANGAN DIGITAL PERNIKAHAN';
      ctx.fillText(headerTag, cardWidth / 2, 120);

      // Couple Names (Serif)
      ctx.fillStyle = selectedPalette.textColor;
      ctx.font = 'bold 64px "Playfair Display", "Times New Roman", serif';
      const coupleNames = `${invitation.mempelaiPria.namaPanggilan} & ${invitation.mempelaiWanita.namaPanggilan}`;
      ctx.fillText(coupleNames, cardWidth / 2, 200);

      // Wedding Date & Venue
      ctx.fillStyle = '#6B7280';
      ctx.font = '500 26px sans-serif';
      ctx.fillText(eventDateFormatted || 'Hari Bahagia Kami', cardWidth / 2, 250);

      if (currentEvent?.namaTempat && cardType !== 'souvenir-tag') {
        ctx.font = '600 24px sans-serif';
        ctx.fillStyle = selectedPalette.textColor;
        ctx.fillText(`📍 ${currentEvent.namaTempat}`, cardWidth / 2, 290);
      }

      // Divider Line with diamond
      ctx.strokeStyle = selectedPalette.borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardWidth / 2 - 120, 330);
      ctx.lineTo(cardWidth / 2 + 120, 330);
      ctx.stroke();

      // Guest Name Badge (if applicable)
      let qrYStart = 380;
      if (cardType === 'insert-card' || cardType === 'table-tent') {
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = selectedPalette.accentColor;
        ctx.fillText('KEPADA YTH. BAPAK/IBU/SAUDARA/I:', cardWidth / 2, 380);

        ctx.font = 'italic bold 32px "Playfair Display", serif';
        ctx.fillStyle = selectedPalette.textColor;
        const displayGuest = !isManualBlankName && guestName.trim()
          ? guestName.trim()
          : '__________________________________';
        ctx.fillText(displayGuest, cardWidth / 2, 425);

        qrYStart = 470;
      }

      // 4. Draw QR Code Box (Crisp centered)
      const qrBoxSize = cardType === 'souvenir-tag' ? 480 : 540;
      const qrX = (cardWidth - qrBoxSize) / 2;
      const qrY = qrYStart + 20;

      // QR Code Background Container
      ctx.fillStyle = selectedPalette.bgColor;
      ctx.fillRect(qrX - 16, qrY - 16, qrBoxSize + 32, qrBoxSize + 32);
      ctx.strokeStyle = selectedPalette.borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX - 16, qrY - 16, qrBoxSize + 32, qrBoxSize + 32);

      // Draw QR Canvas
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qrCanvas, qrX, qrY, qrBoxSize, qrBoxSize);

      // 5. Instructions below QR
      const instructionY = qrY + qrBoxSize + 70;
      ctx.fillStyle = selectedPalette.textColor;
      ctx.font = 'bold 28px sans-serif';
      const mainInstruction =
        targetMode === 'directions'
          ? 'SCAN DENGAN KAMERA UNTUK PETUNJUK RUTE GOOGLE MAPS'
          : targetMode === 'rsvp'
          ? 'SCAN DENGAN KAMERA UNTUK KONFIRMASI KEHADIRAN (RSVP)'
          : 'SCAN DENGAN KAMERA UNTUK MEMBUKA UNDANGAN';
      ctx.fillText(mainInstruction, cardWidth / 2, instructionY);

      ctx.fillStyle = '#6B7280';
      ctx.font = '22px sans-serif';
      ctx.fillText(
        'Arahkan kamera smartphone Anda ke kode QR di atas tanpa perlu aplikasi khusus',
        cardWidth / 2,
        instructionY + 40
      );

      // 6. Footer Note
      const footerY = cardHeight - 110;
      ctx.font = 'italic 22px serif';
      ctx.fillStyle = selectedPalette.textColor;
      ctx.fillText(
        'Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran & doa restu Anda',
        cardWidth / 2,
        footerY
      );

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = selectedPalette.accentColor;
      ctx.fillText('Beserta Seluruh Keluarga Besar', cardWidth / 2, footerY + 36);

      // Export canvas to downloadable PNG
      const cardDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = cardDataUrl;
      link.download = `kartu-undangan-cetak-${targetMode}-${invitation.slug || 'wedding'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      {/* PRINT-ONLY CSS RULES: Isolate card during window.print() */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-qr-card, #printable-qr-card * {
            visibility: visible !important;
          }
          #printable-qr-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 24px !important;
            box-shadow: none !important;
            border-width: 3px !important;
            page-break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Dialog Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                  Generator QR Code & Kartu Cetak Fisik
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Siap Cetak
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Buat kode QR scannable untuk petunjuk arah Google Maps atau konfirmasi RSVP pada kartu undangan fisik.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Settings | Right Live Card Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SISI KIRI: PENGATURAN QR & KARTU (Col 7) */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-5 no-print">
            {/* 1. Pilih Tujuan / Fungsi Scan QR */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                <span>1. Fungsi & Tujuan Saat QR Di-Scan</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Petunjuk Arah / Maps */}
                <button
                  type="button"
                  onClick={() => setTargetMode('directions')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    targetMode === 'directions'
                      ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/30'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        targetMode === 'directions'
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    {targetMode === 'directions' && (
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      Petunjuk Arah
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                      Navigasi Google Maps lokasi acara
                    </p>
                  </div>
                </button>

                {/* RSVP / Konfirmasi Kehadiran */}
                <button
                  type="button"
                  onClick={() => setTargetMode('rsvp')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    targetMode === 'rsvp'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        targetMode === 'rsvp'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                    </div>
                    {targetMode === 'rsvp' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      Konfirmasi RSVP
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                      Langsung lompat ke form RSVP tamu
                    </p>
                  </div>
                </button>

                {/* Undangan Penuh */}
                <button
                  type="button"
                  onClick={() => setTargetMode('full')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    targetMode === 'full'
                      ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/30'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        targetMode === 'full'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    {targetMode === 'full' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      Undangan Digital
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                      Halaman pembuka lengkap
                    </p>
                  </div>
                </button>
              </div>

              {/* Sub-option if targetMode === 'directions' */}
              {targetMode === 'directions' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5 text-xs">
                  {/* Select Event (if multiple) */}
                  {invitation.events && invitation.events.length > 1 && (
                    <div>
                      <label className="text-[11px] font-bold text-amber-950 block mb-1">
                        Pilih Acara untuk Petunjuk Arah:
                      </label>
                      <div className="flex gap-2">
                        {invitation.events.map((ev, idx) => (
                          <button
                            key={ev.id || idx}
                            type="button"
                            onClick={() => setSelectedEventIdx(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              selectedEventIdx === idx
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            {ev.namaAcara}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Directions Method Toggle */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-950 block mb-1">
                      Metode Tautan Navigasi:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDirectionsMethod('maps')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                          directionsMethod === 'maps'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-stone-700 border-stone-200'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Google Maps Langsung</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectionsMethod('invitation')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                          directionsMethod === 'invitation'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-stone-700 border-stone-200'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Ke Bagian Lokasi Undangan</span>
                      </button>
                    </div>
                  </div>

                  {/* Location Preview info */}
                  {currentEvent && (
                    <div className="text-[11px] text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-200/50 space-y-0.5">
                      <p className="font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        <span>{currentEvent.namaTempat}</span>
                      </p>
                      <p className="text-stone-600 line-clamp-1">{currentEvent.alamat}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Format Kartu Fisik Cetak */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Format & Layout Kartu Cetak Fisik</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  {
                    id: 'insert-card',
                    name: 'Kartu Sisipan',
                    desc: 'Standar amplop cetak (9x13cm)',
                  },
                  {
                    id: 'table-tent',
                    name: 'Standing Meja',
                    desc: 'Table tent resepsi (10x15cm)',
                  },
                  {
                    id: 'souvenir-tag',
                    name: 'Tag Souvenir',
                    desc: 'Kotak mini / stiker (7x7cm)',
                  },
                  {
                    id: 'raw-qr',
                    name: 'QR Saja',
                    desc: 'Export vektor resolusi tinggi',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCardType(item.id as QRCardType)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      cardType === item.id
                        ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-500/40'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <p className="text-xs leading-tight">{item.name}</p>
                    <p className="text-[10px] text-stone-400 font-normal mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Personalisasi Nama Tamu pada Kartu */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. Nama Tamu / Penerima</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualBlankName(!isManualBlankName);
                      if (!isManualBlankName) setGuestName('');
                    }}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      isManualBlankName
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {isManualBlankName ? '✓ Mode Garis Tulis Tangan' : 'Mode Garis Kosong'}
                  </button>
                </div>
              </div>

              {!isManualBlankName ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Contoh: dr. H. Bambang & Rekan / Bpk. Rahmat Santoso"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all placeholder:text-stone-400"
                  />
                  <p className="text-[10px] text-stone-400">
                    Nama akan dicetak otomatis di kartu dan otomatis terisi saat tamu membuka form RSVP.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 flex items-center justify-between">
                  <span>Kartu dicetak dengan garis kosong untuk ditulis nama tamu dengan pena / kaligrafi.</span>
                </div>
              )}
            </div>

            {/* 4. Palet Warna & Ikon Tengah QR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Palette */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  <span>Warna Tema Kartu</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {PALETTE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPalette(p)}
                      title={p.name}
                      className={`h-9 rounded-xl border flex items-center justify-center p-1 transition-all cursor-pointer ${
                        selectedPalette.id === p.id
                          ? 'ring-2 ring-amber-600 ring-offset-1 scale-105 shadow-sm'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: p.cardBg, borderColor: p.borderColor }}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-inner"
                        style={{ backgroundColor: p.fgColor }}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 truncate">
                  Aktif: {selectedPalette.name}
                </p>
              </div>

              {/* Ikon Tengah */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ikon Tengah QR</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'auto', label: 'Otomatis' },
                    { id: 'pin', label: 'Peta Pin' },
                    { id: 'heart', label: 'Hati' },
                    { id: 'none', label: 'Polos' },
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setCenterIconType(ic.id as any)}
                      className={`py-2 px-1 rounded-xl text-center border text-[11px] font-semibold cursor-pointer transition-all ${
                        centerIconType === ic.id
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {ic.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400">
                  Mode polos menjamin scan kamera tercepat di segala pencahayaan.
                </p>
              </div>
            </div>

            {/* Target URL Info box with Copy & Test */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Tautan Sasaran QR Code:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-500" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                    title="Uji coba buka link target di tab baru"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Uji Scan</span>
                  </a>
                </div>
              </div>
              <p className="text-[11px] font-mono text-stone-600 break-all bg-white p-2 rounded-xl border border-stone-200/70 select-all">
                {targetUrl}
              </p>
            </div>
          </div>

          {/* SISI KANAN: PRATINJAU LANGSUNG KARTU CETAK (Col 5) */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-start space-y-4">
            <div className="w-full flex items-center justify-between no-print">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
                <ScanLine className="w-4 h-4 text-amber-600" />
                <span>Pratinjau Kartu Siap Cetak</span>
              </div>
              <span className="text-[11px] text-stone-400 font-medium">
                {cardType === 'insert-card'
                  ? 'Ukuran Sisipan (9x13cm)'
                  : cardType === 'table-tent'
                  ? 'Standing Meja (10x15cm)'
                  : cardType === 'souvenir-tag'
                  ? 'Stiker / Tag (7x7cm)'
                  : 'QR Resolusi Tinggi'}
              </span>
            </div>

            {/* THE PRINTABLE CARD COMPONENT */}
            <div
              id="printable-qr-card"
              ref={printCardRef}
              className="w-full max-w-[360px] rounded-3xl border-2 p-5 sm:p-6 shadow-xl transition-all relative flex flex-col items-center justify-between text-center print:shadow-none print:max-w-none print:w-full print:rounded-none"
              style={{
                backgroundColor: selectedPalette.cardBg,
                borderColor: selectedPalette.borderColor,
                color: selectedPalette.textColor,
                minHeight: cardType === 'souvenir-tag' ? '380px' : '480px',
              }}
            >
              {/* Corner Decorative Borders */}
              <div
                className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 pointer-events-none"
                style={{ borderColor: selectedPalette.accentColor }}
              />
              <div
                className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 pointer-events-none"
                style={{ borderColor: selectedPalette.accentColor }}
              />
              <div
                className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 pointer-events-none"
                style={{ borderColor: selectedPalette.accentColor }}
              />
              <div
                className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 pointer-events-none"
                style={{ borderColor: selectedPalette.accentColor }}
              />

              {/* Card Header */}
              <div className="w-full space-y-1 pt-1">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-[0.25em] block"
                  style={{ color: selectedPalette.accentColor }}
                >
                  {targetMode === 'directions'
                    ? 'PETUNJUK ARAH & PETA LOKASI'
                    : targetMode === 'rsvp'
                    ? 'KONFIRMASI KEHADIRAN (RSVP)'
                    : 'THE WEDDING INVITATION'}
                </span>

                <h3
                  className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight"
                  style={{ color: selectedPalette.textColor }}
                >
                  {invitation.mempelaiPria.namaPanggilan} &{' '}
                  {invitation.mempelaiWanita.namaPanggilan}
                </h3>

                <p className="text-[11px] text-stone-500 font-medium">
                  {eventDateFormatted}
                </p>

                {currentEvent?.namaTempat && cardType !== 'souvenir-tag' && (
                  <p
                    className="text-[11px] font-bold truncate px-2"
                    style={{ color: selectedPalette.textColor }}
                  >
                    📍 {currentEvent.namaTempat}
                  </p>
                )}
              </div>

              {/* Guest Personalization Slot */}
              {(cardType === 'insert-card' || cardType === 'table-tent') && (
                <div className="w-full py-2 border-y border-dashed border-stone-300/80 my-2 space-y-0.5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider block"
                    style={{ color: selectedPalette.accentColor }}
                  >
                    Kepada Yth. Bapak/Ibu/Saudara/i:
                  </span>
                  <p
                    className={`text-xs font-serif ${
                      !isManualBlankName && guestName.trim()
                        ? 'font-bold'
                        : 'font-normal italic text-stone-400'
                    }`}
                    style={{
                      color:
                        !isManualBlankName && guestName.trim()
                          ? selectedPalette.textColor
                          : undefined,
                    }}
                  >
                    {!isManualBlankName && guestName.trim()
                      ? guestName.trim()
                      : '...................................................'}
                  </p>
                </div>
              )}

              {/* QR Code Container */}
              <div className="my-2 p-3 rounded-2xl bg-white border shadow-sm relative flex items-center justify-center"
                   style={{ borderColor: selectedPalette.borderColor }}>
                {/* SVG for crisp screen rendering & print */}
                <QRCodeSVG
                  value={targetUrl}
                  size={cardType === 'souvenir-tag' ? 140 : 170}
                  level={errorCorrection}
                  bgColor={selectedPalette.bgColor}
                  fgColor={selectedPalette.fgColor}
                  includeMargin={false}
                />

                {/* Center Emblem/Icon Overlay */}
                {effectiveCenterIcon !== 'none' && (
                  <div
                    className="absolute w-9 h-9 rounded-full bg-white border-2 flex items-center justify-center shadow-md"
                    style={{ borderColor: selectedPalette.accentColor }}
                  >
                    {effectiveCenterIcon === 'pin' && (
                      <MapPin
                        className="w-4 h-4 stroke-[2.5]"
                        style={{ color: selectedPalette.accentColor }}
                      />
                    )}
                    {effectiveCenterIcon === 'heart' && (
                      <Heart
                        className="w-4 h-4 fill-current stroke-[2]"
                        style={{ color: selectedPalette.accentColor }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Hidden Canvas used exclusively for PNG export */}
              <div className="hidden">
                <QRCodeCanvas
                  ref={hiddenCanvasRef}
                  value={targetUrl}
                  size={500} // Extra high-res canvas
                  level="H"
                  bgColor={selectedPalette.bgColor}
                  fgColor={selectedPalette.fgColor}
                  includeMargin={true}
                />
              </div>

              {/* Scan Prompt Instructions */}
              <div className="w-full space-y-1 pb-1">
                <p
                  className="text-xs font-bold leading-tight"
                  style={{ color: selectedPalette.textColor }}
                >
                  {targetMode === 'directions'
                    ? 'Scan QR untuk Membuka Rute Google Maps'
                    : targetMode === 'rsvp'
                    ? 'Scan QR untuk Konfirmasi Kehadiran RSVP'
                    : 'Scan QR untuk Membuka Undangan Digital'}
                </p>
                <p className="text-[10px] text-stone-500 leading-snug px-3">
                  Arahkan kamera HP Anda ke kode QR di atas untuk navigasi langsung secara praktis.
                </p>
              </div>

              {/* Footer Note */}
              <div className="pt-2 text-[9px] text-stone-400 border-t border-stone-200/60 w-full">
                <span>Merupakan suatu kehormatan atas kehadiran & do'a restu Anda</span>
              </div>
            </div>

            {/* Quick Action Buttons for Export */}
            <div className="w-full space-y-2 no-print">
              {/* Direct Print Button */}
              <button
                type="button"
                onClick={handleDirectPrint}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Kartu Fisik Langsung (Print)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Download Full Card as Image */}
                <button
                  type="button"
                  onClick={handleDownloadCardPng}
                  disabled={isDownloading}
                  className="bg-stone-900 hover:bg-stone-800 text-amber-100 font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95 cursor-pointer border border-amber-500/20 disabled:opacity-50"
                  title="Unduh seluruh kartu undangan cetak sebagai gambar PNG resolusi tinggi"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isDownloading ? 'Menyiapkan...' : 'Unduh Gambar Kartu'}</span>
                </button>

                {/* Download Standalone QR Code */}
                <button
                  type="button"
                  onClick={handleDownloadQRPng}
                  className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95 cursor-pointer"
                  title="Unduh hanya file gambar QR Code PNG resolusi tinggi"
                >
                  <QrCode className="w-3.5 h-3.5 text-stone-600" />
                  <span>Unduh QR Saja</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500 no-print">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mendukung cetak kertas jasmin, art carton, linen, & amplop fisik</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-300 hover:bg-white text-stone-700 font-semibold transition-colors cursor-pointer text-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
