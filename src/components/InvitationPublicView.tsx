import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Volume2,
  VolumeX,
  Send,
  Mail,
  Gift,
  Check,
  Copy,
  Instagram,
  UserCheck,
  UserX,
  HelpCircle,
  Sparkles,
  CalendarPlus,
  ShieldCheck,
  Music,
  ZoomIn,
  Loader2,
  Share2,
  Compass,
  CornerDownRight,
  MessageSquare,
  Reply,
  Contrast,
  QrCode,
  Navigation,
  X as CloseIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { InvitationData, AttendanceStatus, RSVPRecord, RSVPReply } from '../types/invitation';
import { romanticAudio } from '../services/audioService';
import { fetchRSVPListAsync, submitRSVPReplyAsync, deduplicateRSVPList } from '../services/storageService';
import { Lightbox } from './Lightbox';
import { CountdownFlip } from './CountdownFlip';
import { FloatingPetals } from './FloatingPetals';
import { AmbientEffectOverlay } from './AmbientEffectOverlay';
import { AttachedStickersOverlay } from './AttachedStickersOverlay';
import { getThemeVisuals, FALLBACK_WEDDING_IMG, FALLBACK_GROOM_IMG, FALLBACK_BRIDE_IMG } from '../data/weddingAssets';
import { CinematicImageReveal } from './CinematicImageReveal';
import { IntersectionSection } from './IntersectionSection';
import { ThemeTopOrnament, ThemeBismillahHeader } from './ThemeOrnaments';
import { getThemeOpeningAnimation, getTemplateTransition } from '../data/themeAnimations';
import { AnimatedCoverContainer } from './AnimatedCoverContainer';
import { InteractiveEventMap } from './InteractiveEventMap';
import { resolveExternalMediaUrl } from '../services/imageService';

interface InvitationPublicViewProps {
  invitation: InvitationData;
  guestName?: string;
  onAddRSVP?: (rsvp: { nama: string; status: AttendanceStatus; jumlahTamu: number; pesanDoa: string }) => void;
  onAddRSVPReply?: (rsvpId: string, reply: { nama: string; pesan: string; isHost?: boolean }) => void;
  isSimulator?: boolean;
  forceOpened?: boolean;
  onOpenedChange?: (opened: boolean) => void;
  animationKey?: number;
  highContrast?: boolean;
  onToggleHighContrast?: (enabled: boolean) => void;
  showFloatingContrastButton?: boolean;
}

export const InvitationPublicView: React.FC<InvitationPublicViewProps> = ({
  invitation,
  guestName = 'Bapak / Ibu Tamu Terhormat',
  onAddRSVP,
  onAddRSVPReply,
  isSimulator = false,
  forceOpened,
  onOpenedChange,
  animationKey,
  highContrast: highContrastProp,
  onToggleHighContrast,
  showFloatingContrastButton = true,
}) => {
  const [isOpened, setIsOpened] = useState(forceOpened ?? false);
  const [isOpeningSequence, setIsOpeningSequence] = useState(false);

  // Global high contrast accessibility toggle state with localStorage persistence
  const [internalHighContrast, setInternalHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vhistetic_high_contrast');
        if (stored !== null) return stored === 'true';
      } catch {
        // ignore
      }
    }
    return false;
  });

  const isHighContrast = highContrastProp !== undefined ? highContrastProp : internalHighContrast;

  const handleToggleHighContrast = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const nextVal = !isHighContrast;
    setInternalHighContrast(nextVal);
    if (onToggleHighContrast) {
      onToggleHighContrast(nextVal);
    }
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
      if (e?.detail !== undefined && highContrastProp === undefined) {
        setInternalHighContrast(Boolean(e.detail));
      }
    };
    window.addEventListener('vhistetic_high_contrast_change', handler);
    return () => window.removeEventListener('vhistetic_high_contrast_change', handler);
  }, [highContrastProp]);

  useEffect(() => {
    if (forceOpened !== undefined) {
      setIsOpened(forceOpened);
    }
  }, [forceOpened, animationKey]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Quick QR Code modals for Directions & RSVP
  const [activeDirectionsQrEvent, setActiveDirectionsQrEvent] = useState<typeof invitation.events[0] | null>(null);
  const [isRsvpQrModalOpen, setIsRsvpQrModalOpen] = useState(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);

  // Auto-open & smooth scroll if guest scanned a physical card targeting RSVP or Directions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const full = `${hash} ${search}`.toLowerCase();

    if (full.includes('action=rsvp') || hash.includes('#rsvp')) {
      setIsOpened(true);
      setTimeout(() => {
        const el = document.getElementById('section-rsvp');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    } else if (
      full.includes('action=directions') ||
      full.includes('action=lokasi') ||
      hash.includes('#lokasi') ||
      hash.includes('#directions')
    ) {
      setIsOpened(true);
      setTimeout(() => {
        const el = document.getElementById('section-events');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, []);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // RSVP Form state
  const [rsvpName, setRsvpName] = useState(guestName !== 'Bapak / Ibu Tamu Terhormat' && guestName !== 'Tamu Undangan' ? guestName : '');
  const [rsvpStatus, setRsvpStatus] = useState<AttendanceStatus>('attending');
  const [rsvpCount, setRsvpCount] = useState<number>(2);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [liveRsvpList, setLiveRsvpList] = useState<RSVPRecord[]>(() => deduplicateRSVPList(invitation.rsvpList || []));

  // Reply state
  const [replyingToRsvpId, setReplyingToRsvpId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState(guestName !== 'Bapak / Ibu Tamu Terhormat' && guestName !== 'Tamu Undangan' ? guestName : '');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Synchronize live RSVP list whenever prop changes
  useEffect(() => {
    if (invitation.rsvpList) {
      setLiveRsvpList(deduplicateRSVPList(invitation.rsvpList));
    }
  }, [invitation.rsvpList]);

  // Periodic poll to ensure wishes submitted by anyone on any device appear live and never disappear
  useEffect(() => {
    const targetId = invitation.slug || invitation.id;
    if (!targetId || isSimulator) return;

    fetchRSVPListAsync(targetId).then((list) => {
      if (list && Array.isArray(list) && list.length > 0) {
        setLiveRsvpList(deduplicateRSVPList(list));
      }
    });

    const timer = setInterval(() => {
      fetchRSVPListAsync(targetId).then((list) => {
        if (list && Array.isArray(list) && list.length > 0) {
          setLiveRsvpList(deduplicateRSVPList(list));
        }
      });
    }, 8000);

    return () => clearInterval(timer);
  }, [invitation.id, invitation.slug, isSimulator]);

  // Countdown timer state
  const targetDateStr = invitation.events[0]?.tanggal || '2026-11-02';
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTime = new Date(`${targetDateStr}T09:00:00`).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      romanticAudio.pause();
    };
  }, []);

  // Attempt auto-play on first user interaction (highly compliant with all modern browser policies)
  useEffect(() => {
    if (!invitation.music.enabled || isSimulator) return;

    const startAudioOnInteraction = () => {
      if (!isPlayingAudio && invitation.music.audioUrl) {
        romanticAudio.play('', invitation.music.audioUrl);
        setIsPlayingAudio(true);
      }
      // Remove listeners once triggered
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      window.removeEventListener('scroll', startAudioOnInteraction);
    };

    window.addEventListener('click', startAudioOnInteraction, { passive: true });
    window.addEventListener('touchstart', startAudioOnInteraction, { passive: true });
    window.addEventListener('scroll', startAudioOnInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      window.removeEventListener('scroll', startAudioOnInteraction);
    };
  }, [invitation.music, isPlayingAudio, isSimulator]);

  // Format Indonesian Date
  const formatIndonesianDate = (dateStr?: string) => {
    if (!dateStr) return '02 November 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formattedMainDate = formatIndonesianDate(invitation.events[0]?.tanggal);

  // Ripple effect handler for premium tactile click feedback
  const handleRipple = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-wave');

    const prevRipple = button.getElementsByClassName('ripple-wave')[0];
    if (prevRipple) {
      prevRipple.remove();
    }
    button.appendChild(circle);
  };

  const templateVisuals = getThemeVisuals(invitation.theme?.templateId);
  const isDarkTheme = Boolean(
    templateVisuals.isDark ||
    invitation.theme?.bgColor === '#0D0D11' ||
    invitation.theme?.bgColor === '#000000' ||
    invitation.theme?.bgColor === '#121212' ||
    invitation.theme?.templateId === 'luxury-black' ||
    (templateVisuals.palette.bg && (templateVisuals.palette.bg.startsWith('#0') || templateVisuals.palette.bg.startsWith('#1')))
  );

  const baseThemeVisuals = {
    ...templateVisuals,
    fontDisplay: invitation.theme?.fontDisplay || templateVisuals.fontDisplay,
    coverBlur: invitation.theme?.coverBlur ?? 0,
    headingSizeClass:
      invitation.theme?.headingSize === 'compact'
        ? 'text-2xl sm:text-3xl'
        : invitation.theme?.headingSize === 'large'
        ? 'text-4xl sm:text-5xl'
        : invitation.theme?.headingSize === 'xlarge'
        ? 'text-5xl sm:text-6xl'
        : 'text-3xl sm:text-4xl',
    bodySizeClass:
      invitation.theme?.bodySize === 'compact'
        ? 'text-xs'
        : invitation.theme?.bodySize === 'large'
        ? 'text-base'
        : 'text-sm',
    palette: {
      ...templateVisuals.palette,
      primary: invitation.theme?.primaryColor || templateVisuals.palette.primary,
      bg: invitation.theme?.bgColor || templateVisuals.palette.bg,
      text: invitation.theme?.textColor || templateVisuals.palette.text,
      heading: invitation.theme?.headingColor || invitation.theme?.primaryColor || templateVisuals.palette.primary,
      quote: invitation.theme?.quoteColor || invitation.theme?.textColor || templateVisuals.palette.text,
      secondary: invitation.theme?.secondaryColor || templateVisuals.palette.secondary,
      cardBorder: invitation.theme?.primaryColor 
        ? `${invitation.theme.primaryColor}40` 
        : templateVisuals.palette.cardBorder,
      glow: invitation.theme?.primaryColor 
        ? `${invitation.theme.primaryColor}30` 
        : templateVisuals.palette.glow,
    }
  };

  // When high contrast accessibility is active, enforce maximum WCAG AAA legibility (solid black / white)
  const themeVisuals = React.useMemo(() => {
    if (!isHighContrast) return baseThemeVisuals;

    if (isDarkTheme) {
      return {
        ...baseThemeVisuals,
        palette: {
          ...baseThemeVisuals.palette,
          primary: '#FFE600', // Solid High-Contrast Yellow/Gold
          secondary: '#FFFFFF', // Pure White
          bg: '#000000', // Pitch Black canvas
          cardBg: '#0D0D12', // Solid opaque card
          cardBorder: '#FFFFFF', // Solid 100% White border
          text: '#FFFFFF', // Solid Pure White text
          heading: '#FFFFFF', // Solid Pure White heading
          quote: '#FFFFFF', // Solid Pure White quote
          accentLight: '#1F2937',
          glow: 'rgba(255, 255, 255, 0.4)',
        },
        button: {
          gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
          textColor: '#000000',
          shadow: '0 8px 25px rgba(255, 255, 255, 0.35)',
        },
        countdown: {
          cardBg: '#000000',
          cardBorder: '#FFFFFF',
          primaryColor: '#FFE600',
          labelColor: '#FFFFFF',
        },
      };
    } else {
      return {
        ...baseThemeVisuals,
        palette: {
          ...baseThemeVisuals.palette,
          primary: '#000000', // Solid Pure Black
          secondary: '#18181B', // Solid Jet Black
          bg: '#FFFFFF', // Pure White canvas
          cardBg: '#FFFFFF', // Pure White card
          cardBorder: '#000000', // Solid 100% Black border
          text: '#000000', // Solid Pure Black text
          heading: '#000000', // Solid Pure Black heading
          quote: '#000000', // Solid Pure Black quote
          accentLight: '#F4F4F5',
          glow: 'none',
        },
        button: {
          gradient: 'linear-gradient(135deg, #000000 0%, #18181B 100%)',
          textColor: '#FFFFFF',
          shadow: '0 8px 25px rgba(0, 0, 0, 0.35)',
        },
        countdown: {
          cardBg: '#FFFFFF',
          cardBorder: '#000000',
          primaryColor: '#000000',
          labelColor: '#000000',
        },
      };
    }
  }, [baseThemeVisuals, isHighContrast, isDarkTheme]);
  const themeAnimation = getThemeOpeningAnimation(
    invitation.theme?.templateId,
    invitation.theme?.openingAnimationOverride
  );
  const templateTransition = getTemplateTransition(invitation.theme?.templateId);

  // Luxury opening animation sequence (theme-specific physics and timing)
  const handleOpenInvitation = (e: React.MouseEvent<HTMLElement>) => {
    handleRipple(e);
    setIsOpeningSequence(true);

    // Play custom user audio URL (Google Drive / Dropbox / Direct MP3)
    if (invitation.music.enabled && invitation.music.audioUrl) {
      romanticAudio.play('', invitation.music.audioUrl);
      setIsPlayingAudio(true);
    }

    // Dynamic sequence timing based on template animation physics
    const durationMs = Math.round((themeAnimation.duration || 1.1) * 1000);
    setTimeout(() => {
      setIsOpened(true);
      setIsOpeningSequence(false);
    }, durationMs);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      romanticAudio.pause();
      setIsPlayingAudio(false);
    } else if (invitation.music.audioUrl) {
      romanticAudio.play('', invitation.music.audioUrl);
      setIsPlayingAudio(true);
    }
  };

  const handleCopyBank = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2500);
  };

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  // Helper for calendar (.ics)
  const handleDownloadCalendar = (eventItem: typeof invitation.events[0]) => {
    const startDate =
      eventItem.tanggal.replace(/-/g, '') +
      'T' +
      (eventItem.waktuMulai.includes(':') ? eventItem.waktuMulai.replace(':', '') : '0900') +
      '00';
    const endDate =
      eventItem.tanggal.replace(/-/g, '') +
      'T' +
      (eventItem.waktuSelesai.includes(':') ? eventItem.waktuSelesai.replace(':', '') : '1800') +
      '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vhistetic//Undangan Digital//ID',
      'BEGIN:VEVENT',
      `SUMMARY:${invitation.title} - ${eventItem.namaAcara}`,
      `DESCRIPTION:${invitation.heroSubtitle}`,
      `LOCATION:${eventItem.namaTempat}, ${eventItem.alamat}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${invitation.slug}-${eventItem.namaAcara}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpMessage || isSubmittingRSVP) return;

    const trimmedName = rsvpName.trim();
    const trimmedMessage = rsvpMessage.trim();
    if (!trimmedName || !trimmedMessage) return;

    // Check if an identical wish was already submitted recently
    const isDuplicate = liveRsvpList.some(
      (r) =>
        r.nama.trim().toLowerCase() === trimmedName.toLowerCase() &&
        r.pesanDoa.trim().toLowerCase() === trimmedMessage.toLowerCase()
    );

    if (isDuplicate) {
      setRsvpSubmitted(true);
      setRsvpMessage('');
      return;
    }

    setIsSubmittingRSVP(true);

    const newRecord: RSVPRecord = {
      id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      invitationId: invitation.id,
      nama: trimmedName,
      status: rsvpStatus,
      jumlahTamu: rsvpStatus === 'attending' ? rsvpCount : 0,
      pesanDoa: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    // Instant local wishes wall update so the submitted wish is never lost, deduplicated
    setLiveRsvpList((prev) => deduplicateRSVPList([newRecord, ...prev]));

    if (onAddRSVP) {
      try {
        await onAddRSVP({
          nama: trimmedName,
          status: rsvpStatus,
          jumlahTamu: rsvpStatus === 'attending' ? rsvpCount : 0,
          pesanDoa: trimmedMessage,
        });
      } catch (err) {
        console.warn('Error sending RSVP:', err);
      }
    }

    setRsvpSubmitted(true);
    setRsvpMessage('');

    // Safety cooldown to guarantee no accidental double clicks
    setTimeout(() => {
      setIsSubmittingRSVP(false);
    }, 2500);
  };

  const handleSendReply = async (rsvpId: string) => {
    const trimmedName = (replyName || rsvpName || (guestName !== 'Bapak / Ibu Tamu Terhormat' && guestName !== 'Tamu Undangan' ? guestName : '')).trim();
    const trimmedMessage = replyMessage.trim();

    if (!trimmedName || !trimmedMessage || isSubmittingReply) return;

    setIsSubmittingReply(true);
    const replyData = {
      nama: trimmedName,
      pesan: trimmedMessage,
    };

    const newReplyRecord: RSVPReply = {
      id: 'reply-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      rsvpId,
      nama: trimmedName,
      pesan: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    // Immediate optimistic update so it shows instantly
    setLiveRsvpList((prev) =>
      prev.map((r) => {
        if (r.id === rsvpId) {
          const replies = r.replies || [];
          const exists = replies.some(
            (rep) =>
              rep.nama.trim().toLowerCase() === trimmedName.toLowerCase() &&
              rep.pesan.trim().toLowerCase() === trimmedMessage.toLowerCase()
          );
          return exists ? r : { ...r, replies: [...replies, newReplyRecord] };
        }
        return r;
      })
    );

    const targetId = invitation.slug || invitation.id;
    try {
      if (onAddRSVPReply) {
        // App.tsx handles synchronization
        onAddRSVPReply(rsvpId, replyData);
      } else {
        const res = await submitRSVPReplyAsync(targetId, rsvpId, replyData);
        if (res && Array.isArray(res.rsvpList)) {
          setLiveRsvpList(deduplicateRSVPList(res.rsvpList));
        }
      }
    } catch (err) {
      console.warn('Error submitting reply:', err);
    } finally {
      setIsSubmittingReply(false);
      setReplyMessage('');
      setReplyingToRsvpId(null);
    }
  };

  const { theme } = invitation;

  const effectiveCoverPhoto = resolveExternalMediaUrl(invitation.coverPhotoUrl) || FALLBACK_WEDDING_IMG;

  return (
    <div
      id="invitation-container"
      className={`w-full relative transition-colors duration-500 selection:bg-amber-400/30 overflow-x-hidden ${theme.fontBody} ${themeVisuals.bodySizeClass} ${
        !isOpened
          ? 'h-screen h-[100dvh] max-h-screen max-h-[100dvh] overflow-hidden'
          : 'min-h-full overflow-y-auto'
      } ${isHighContrast ? `vhistetic-high-contrast ${isDarkTheme ? 'vhistetic-hc-dark' : 'vhistetic-hc-light'}` : ''}`}
      style={{
        backgroundColor: themeVisuals.palette.bg,
        color: themeVisuals.palette.text,
        height: !isOpened ? (isSimulator ? '100%' : '100dvh') : undefined,
        maxHeight: !isOpened ? (isSimulator ? '100%' : '100dvh') : undefined,
        overflow: !isOpened ? 'hidden' : undefined,
      }}
    >
      {/* Cover High-Contrast Toggle (discreet unobtrusive mini button at bottom right corner) */}
      {!isOpened && showFloatingContrastButton && (
        <div className={`${isSimulator ? 'absolute' : 'fixed'} bottom-4 right-4 z-50 pointer-events-auto`}>
          <motion.button
            id="btn-high-contrast-toggle-cover"
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleHighContrast}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 active:scale-90 ${
              isHighContrast
                ? 'bg-amber-300 text-black border-white ring-2 ring-amber-400/30'
                : 'bg-black/60 hover:bg-black/85 text-amber-400 border-white/20 backdrop-blur-md'
            }`}
            title={isHighContrast ? 'Mode Kontras: Aktif' : 'Mode Kontras Tinggi'}
            aria-label="Toggle Mode Kontras"
          >
            <Contrast className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Ambient Particle Animation (Petals, Sparkles, Hearts, Butterflies, Fireflies, Bubbles) */}
      <AmbientEffectOverlay
        effect={invitation.theme?.ambientEffect || 'petals'}
        primaryColor={themeVisuals.palette.primary}
      />

      {/* 1. OPENING FULLSCREEN COVER MODAL */}
      <AnimatePresence>
        {!isOpened && (
          <div id="invitation-cover-modal" className="absolute inset-0 z-40 w-full h-full overflow-hidden">
            <AnimatedCoverContainer
              type={themeAnimation.type}
              isOpeningSequence={isOpeningSequence}
              coverPhotoUrl={effectiveCoverPhoto}
              themeVisuals={themeVisuals}
            >
              {/* Attached Animated Sticker Icons on Cover */}
              <AttachedStickersOverlay
                stickers={invitation.theme?.attachedStickers?.filter(s => s.position !== 'floating-bottom-right')}
                isCover={true}
                themePrimary={themeVisuals.palette.primary}
              />
              {/* Elegant Corner Floral SVGs */}
              <div className="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none opacity-50">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-amber-200">
                  <path d="M0,0 Q30,0 50,20 Q20,30 20,50 Q0,30 0,0" fill="currentColor" fillOpacity="0.3" />
                  <path d="M5,5 Q40,5 60,30 Q30,40 30,60 Q5,40 5,5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
                  <circle cx="25" cy="25" r="3" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none opacity-50 scale-x-[-1]">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-amber-200">
                  <path d="M0,0 Q30,0 50,20 Q20,30 20,50 Q0,30 0,0" fill="currentColor" fillOpacity="0.3" />
                  <path d="M5,5 Q40,5 60,30 Q30,40 30,60 Q5,40 5,5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
                  <circle cx="25" cy="25" r="3" fill="currentColor" />
                </svg>
              </div>

              {/* Top Theme Crest & Title (Fade-in + Slide-down) */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                className="pt-1 sm:pt-3 flex flex-col items-center space-y-1 sm:space-y-1.5 z-10 w-full shrink-0"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 sm:w-8 h-[1px]"
                    style={{ background: `linear-gradient(to right, transparent, ${themeVisuals.palette.secondary})` }}
                  />
                  <span
                    className={`text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold ${
                      isHighContrast ? 'text-white' : ''
                    }`}
                    style={{ color: isHighContrast ? '#FFFFFF' : themeVisuals.palette.secondary }}
                  >
                    {themeVisuals.tagline || 'The Wedding'}
                  </span>
                  <div
                    className="w-5 sm:w-8 h-[1px]"
                    style={{ background: `linear-gradient(to left, transparent, ${themeVisuals.palette.secondary})` }}
                  />
                </div>

                <h1
                  className={`${themeVisuals.fontDisplay} text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide drop-shadow-md leading-tight pt-0.5`}
                  style={{ color: '#FFFFFF' }}
                >
                  <span>{invitation.mempelaiPria.namaPanggilan}</span>
                  <span
                    className="inline-block text-xl sm:text-2xl mx-2 font-serif"
                    style={{ color: isHighContrast ? '#FFE600' : themeVisuals.palette.secondary }}
                  >
                    &
                  </span>
                  <span>{invitation.mempelaiWanita.namaPanggilan}</span>
                </h1>

                <p className={`text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-light ${
                  isHighContrast ? 'text-white font-bold' : 'text-stone-200/90'
                }`}>
                  {formattedMainDate}
                </p>
              </motion.div>

              {/* Middle Guest Recipient Glass Box (Fade-in + Slide-up) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.35, ease: 'easeOut' }}
                className={`w-full max-w-[280px] sm:max-w-xs mx-auto p-4 sm:p-5 ${themeVisuals.cardShapeClass} backdrop-blur-xl border shadow-2xl space-y-2 my-auto z-10 relative overflow-hidden shrink-0`}
                style={{
                  backgroundColor: isHighContrast
                    ? 'rgba(0, 0, 0, 0.92)'
                    : (themeVisuals.id === 'luxury-black' ? 'rgba(18, 18, 24, 0.85)' : 'rgba(255, 255, 255, 0.18)'),
                  borderColor: isHighContrast ? '#FFFFFF' : themeVisuals.palette.cardBorder,
                  borderWidth: isHighContrast ? '2px' : '1px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                }}
              >
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

                <p className={`text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium ${
                  isHighContrast ? 'text-white font-bold' : 'text-stone-200/90'
                }`}>
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </p>

                <div
                  className={`py-2 px-3.5 rounded-xl border backdrop-blur-sm ${isHighContrast ? 'border-2' : ''}`}
                  style={{
                    backgroundColor: isHighContrast ? '#111827' : themeVisuals.palette.accentLight,
                    borderColor: isHighContrast ? '#FFFFFF' : themeVisuals.palette.cardBorder,
                  }}
                >
                  <h2
                    className={`text-base sm:text-lg font-bold tracking-wide line-clamp-1 ${themeVisuals.fontDisplay}`}
                    style={{ color: isHighContrast ? '#FFFFFF' : (themeVisuals.palette.secondary || '#FFFFFF') }}
                  >
                    {guestName}
                  </h2>
                </div>

                <p className={`text-[10px] sm:text-[11px] leading-relaxed ${
                  isHighContrast ? 'text-white font-medium' : 'text-stone-200/85 font-light'
                }`}>
                  Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir memberikan doa restu.
                </p>
              </motion.div>

              {/* Bottom Button "BUKA UNDANGAN" with Ripple, Glow & Envelope Icon */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.55, ease: 'easeOut' }}
                className="pb-2 sm:pb-4 w-full max-w-[270px] sm:max-w-xs flex flex-col items-center space-y-1.5 sm:space-y-2 z-10 shrink-0"
              >
                <button
                  id="btn-open-invitation"
                  onClick={handleOpenInvitation}
                  className={`group relative w-full py-3.5 px-6 rounded-full font-semibold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 active:scale-95 ${
                    isHighContrast ? 'border-2 border-black font-extrabold' : ''
                  }`}
                  style={{
                    background: themeVisuals.button.gradient,
                    color: themeVisuals.button.textColor,
                    boxShadow: themeVisuals.button.shadow,
                  }}
                >
                  {/* Glowing light pulse */}
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <Mail className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" />
                  <span className={`tracking-wide uppercase font-bold text-xs font-cinzel ${
                    isHighContrast ? 'text-black font-extrabold' : ''
                  }`}>
                    {isOpeningSequence ? 'Membuka Undangan...' : 'Buka Undangan'}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
                </button>

                <p className="text-[9px] sm:text-[10px] text-stone-300/80 tracking-wider">
                  *Sentuh untuk membuka lembaran & memutar alunan musik
                </p>
              </motion.div>

              {/* Light burst flash effect on opening */}
              {isOpeningSequence && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.85, 0] }}
                  transition={{ duration: 1.0 }}
                  className="absolute inset-0 bg-white z-50 pointer-events-none"
                />
              )}
            </AnimatedCoverContainer>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Controls Dock (Music + High Contrast in one neat unobtrusive bottom-right spot) */}
      {isOpened && (invitation.music.enabled || showFloatingContrastButton) && (
        <div className={`${isSimulator ? 'absolute' : 'fixed'} bottom-6 right-5 z-40 flex items-center gap-2 pointer-events-auto`}>
          {isPlayingAudio && invitation.music.title && (
            <motion.div
              initial={{ opacity: 0, x: 15, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 15, scale: 0.9 }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/85 backdrop-blur-md border border-white/20 text-white text-[11px] shadow-2xl pointer-events-none"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <span className="font-medium truncate max-w-[160px]">{invitation.music.title}</span>
            </motion.div>
          )}

          {/* High-Contrast Mini Circular Button (Matching audio button size, never blocks text!) */}
          {showFloatingContrastButton && (
            <motion.button
              id="btn-high-contrast-toggle"
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, delay: 0.25 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleHighContrast}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 active:scale-90 ${
                isHighContrast
                  ? isDarkTheme
                    ? 'bg-amber-300 text-black border-white ring-4 ring-amber-400/30'
                    : 'bg-black text-white border-black ring-4 ring-black/25'
                  : 'bg-black/75 hover:bg-stone-900 text-stone-300 hover:text-amber-400 border-white/20 backdrop-blur-md'
              }`}
              title={
                isHighContrast
                  ? 'Mode Kontras Tinggi: Aktif (Klik untuk kembali normal)'
                  : 'Aktifkan Mode Kontras Tinggi'
              }
              aria-label="Toggle Mode Kontras"
            >
              <Contrast
                className={`w-5 h-5 shrink-0 ${
                  isHighContrast ? (isDarkTheme ? 'text-black' : 'text-amber-400') : 'text-amber-400'
                }`}
              />
            </motion.button>
          )}

          {invitation.music.enabled && (
            <motion.button
              id="btn-floating-music"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, delay: 0.35 }}
              onClick={handleToggleAudio}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 active:scale-90 ${
                isPlayingAudio
                  ? 'bg-amber-600/90 text-white border-amber-300 ring-4 ring-amber-500/20 backdrop-blur-md'
                  : 'bg-black/75 text-stone-300 border-white/20 backdrop-blur-md'
              }`}
              title={isPlayingAudio ? `Jeda Musik: ${invitation.music.title || 'Musik'}` : 'Putar Musik'}
              aria-label="Kontrol Musik"
            >
              <div className={isPlayingAudio ? 'animate-spin-slow' : ''}>
                <Music className="w-5 h-5" />
              </div>
            </motion.button>
          )}
        </div>
      )}

      {/* Attached Floating Animated Sticker Badge */}
      <AttachedStickersOverlay
        stickers={invitation.theme?.attachedStickers?.filter(s => s.position === 'floating-bottom-right')}
        isCover={false}
        themePrimary={themeVisuals.palette.primary}
      />

      {isOpened && (
        <motion.div
          id="invitation-opened-content"
          variants={templateTransition.variants}
          initial="initial"
          animate="animate"
          transition={templateTransition.transition as any}
          className="w-full flex flex-col"
        >
          {/* 2. HERO / FOTO COVER SECTION WITH INTERSECTION OBSERVER */}
          <IntersectionSection
        as="section"
        id="section-hero"
        slideDistance={45}
        duration={0.95}
        className="relative min-h-[620px] flex flex-col justify-center items-center text-center px-4 py-8 sm:p-6 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 12, 10, 0.4) 0%, rgba(15, 12, 10, 0.65) 60%, ${themeVisuals.palette.bg} 100%), url(${
            effectiveCoverPhoto
          })`,
        }}
      >
        {/* Subtle Ken Burns zoom effect */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center -z-10 pointer-events-none opacity-40"
          style={{
            backgroundImage: `url(${effectiveCoverPhoto})`,
            filter: themeVisuals?.coverBlur ? `blur(${themeVisuals.coverBlur}px)` : 'none',
          }}
        />

        <div className="space-y-4 max-w-md mx-auto pt-6 text-white w-full flex flex-col items-center">
          {/* Islamic Bismillah Header if applicable */}
          <ThemeBismillahHeader theme={themeVisuals} />

          <span
            className="text-[11px] uppercase tracking-[0.35em] font-semibold"
            style={{ color: themeVisuals.palette.secondary || '#FDE68A' }}
          >
            {invitation.greetingTitle || themeVisuals.tagline}
          </span>

          <h1
            className={`${themeVisuals.fontDisplay} ${themeVisuals.headingSizeClass} font-normal tracking-tight leading-tight drop-shadow-md`}
            style={{ color: themeVisuals.palette.heading || '#FFFFFF' }}
          >
            {invitation.mempelaiPria.namaPanggilan}
            <span
              className="block text-2xl sm:text-3xl font-serif my-1"
              style={{ color: themeVisuals.palette.secondary || themeVisuals.palette.primary }}
            >
              &
            </span>
            {invitation.mempelaiWanita.namaPanggilan}
          </h1>

          <p 
            className="text-xs sm:text-sm font-light max-w-xs mx-auto leading-relaxed pt-1 opacity-90"
            style={{ color: themeVisuals.palette.text }}
          >
            {invitation.heroSubtitle}
          </p>

          <p
            className="text-xs tracking-[0.2em] uppercase font-medium pt-2"
            style={{ color: themeVisuals.palette.secondary || '#FDE68A' }}
          >
            {formattedMainDate}
          </p>

          {/* COUNTDOWN SECTION WITH INTERSECTION OBSERVER & THEMED CARDS */}
          <IntersectionSection
            as="div"
            id="section-countdown"
            slideDistance={32}
            delay={0.15}
            duration={0.9}
            className="pt-5 w-full flex flex-col items-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2.5">
              <div
                className="w-5 sm:w-8 h-[1px]"
                style={{ background: `linear-gradient(to right, transparent, ${themeVisuals.palette.secondary})` }}
              />
              <p
                className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase font-cinzel select-none"
                style={{ color: themeVisuals.palette.secondary || '#FFFFFF' }}
              >
                Menuju Hari Bahagia
              </p>
              <div
                className="w-5 sm:w-8 h-[1px]"
                style={{ background: `linear-gradient(to left, transparent, ${themeVisuals.palette.secondary})` }}
              />
            </div>
            <CountdownFlip
              days={timeLeft.days}
              hours={timeLeft.hours}
              minutes={timeLeft.minutes}
              seconds={timeLeft.seconds}
              primaryColor={themeVisuals.countdown.primaryColor}
              cardBg={themeVisuals.countdown.cardBg}
              cardBorder={themeVisuals.countdown.cardBorder}
              labelColor={themeVisuals.countdown.labelColor}
            />
          </IntersectionSection>
        </div>
      </IntersectionSection>

      {/* 3. QUOTE / AYAT SUCI SECTION WITH INTERSECTION OBSERVER */}
      {invitation.quoteText && (
        <IntersectionSection
          as="section"
          id="section-quote"
          slideDistance={35}
          delay={0.08}
          className="py-12 px-6 text-center max-w-md mx-auto"
        >
          <div
            className={`p-7 ${themeVisuals.cardShapeClass} backdrop-blur-md border shadow-xl relative overflow-hidden space-y-4`}
            style={{
              backgroundColor: themeVisuals.palette.cardBg,
              borderColor: themeVisuals.palette.cardBorder,
              boxShadow: `0 15px 35px ${themeVisuals.palette.glow}`,
            }}
          >
            {/* Top Flourish */}
            <div
              className="w-10 h-10 mx-auto rounded-full flex items-center justify-center shadow-inner"
              style={{
                backgroundColor: themeVisuals.palette.accentLight,
                color: themeVisuals.palette.primary,
              }}
            >
              <ThemeTopOrnament theme={themeVisuals} size="sm" />
            </div>

            <ThemeBismillahHeader theme={themeVisuals} />

            <p
              className="text-xs sm:text-sm italic leading-relaxed font-serif px-2"
              style={{ color: themeVisuals.palette.quote || themeVisuals.palette.text }}
            >
              "{invitation.quoteText}"
            </p>

            {invitation.quoteSource && (
              <p
                className="text-[11px] font-bold tracking-[0.2em] uppercase pt-1"
                style={{ color: themeVisuals.palette.heading || themeVisuals.palette.primary }}
              >
                — {invitation.quoteSource}
              </p>
            )}
          </div>
        </IntersectionSection>
      )}

      {/* 4. COUPLE PROFILES SECTION WITH INTERSECTION OBSERVER */}
      <IntersectionSection
        as="section"
        id="section-couple"
        slideDistance={40}
        duration={0.9}
        className="py-12 px-5 max-w-md mx-auto space-y-8 overflow-hidden"
      >
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center mb-1">
            <ThemeTopOrnament theme={themeVisuals} size="sm" />
          </div>
          <span
            className="text-[10px] uppercase tracking-[0.3em] font-semibold"
            style={{ color: themeVisuals.palette.primary }}
          >
            Mempelai yang Berbahagia
          </span>
          <h2
            className={`${themeVisuals.fontDisplay} text-2xl sm:text-3xl font-bold tracking-tight`}
            style={{ color: themeVisuals.palette.heading }}
          >
            Dua Insan yang Bersatu
          </h2>
          <div
            className="w-10 h-0.5 mx-auto my-1"
            style={{ backgroundColor: themeVisuals.palette.primary, opacity: 0.5 }}
          />
        </div>

        {/* Mempelai Pria (Groom - Slides from Left) */}
        <IntersectionSection
          as="div"
          direction="left"
          slideDistance={40}
          delay={0.1}
          duration={0.85}
          className={`group flex flex-col items-center text-center space-y-4 p-5 sm:p-7 ${themeVisuals.cardShapeClass} backdrop-blur-sm border shadow-lg transition-transform hover:-translate-y-1`}
          style={{
            backgroundColor: themeVisuals.palette.cardBg,
            borderColor: themeVisuals.palette.cardBorder,
          }}
        >
          {/* Framed Photo with Grand Portrait Frame (Large & Clear, Not Round) */}
          <div
            className={`relative p-2 sm:p-2.5 border-2 shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-all duration-700 bg-white/15 backdrop-blur-xs ${
              (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'arch'
                ? 'w-52 h-72 sm:w-60 sm:h-84 max-w-[85vw] rounded-t-[54px] sm:rounded-t-[68px] rounded-b-2xl sm:rounded-b-3xl'
                : (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'dome'
                ? 'w-52 h-72 sm:w-60 sm:h-84 max-w-[85vw] rounded-t-full rounded-b-2xl sm:rounded-b-3xl'
                : (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'square'
                ? 'w-52 h-52 sm:w-60 sm:h-60 max-w-[85vw] rounded-2xl'
                : 'w-52 h-72 sm:w-60 sm:h-84 max-w-[85vw] rounded-2xl sm:rounded-3xl'
            }`}
            style={{
              borderColor: themeVisuals.palette.primary,
              boxShadow: `0 12px 35px ${themeVisuals.palette.glow}`,
            }}
          >
            <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden relative">
              <CinematicImageReveal
                src={invitation.mempelaiPria.fotoUrl || FALLBACK_GROOM_IMG}
                alt={invitation.mempelaiPria.namaLengkap}
                direction="left"
                shape={
                  (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'arch' ||
                  (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'dome'
                    ? 'arch'
                    : 'rounded'
                }
                duration={1.05}
                className="w-full h-full"
                imageClassName="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                showGleam={true}
                hoverZoom={true}
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <h3
              className={`${themeVisuals.fontDisplay} text-xl font-bold`}
              style={{ color: themeVisuals.palette.heading }}
            >
              {invitation.mempelaiPria.namaLengkap}
            </h3>
            <p
              className="text-xs font-semibold tracking-wide"
              style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }}
            >
              ({invitation.mempelaiPria.namaPanggilan})
            </p>
          </div>

          <p className={`text-xs max-w-xs leading-relaxed ${isHighContrast ? (isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold') : 'text-stone-500 dark:text-stone-400'}`}>
            {invitation.mempelaiPria.orangTua}
          </p>

          {invitation.mempelaiPria.instagram && (
            <a
              href={`https://instagram.com/${invitation.mempelaiPria.instagram}`}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                isHighContrast ? (isDarkTheme ? 'border border-white font-bold' : 'border border-black font-bold') : ''
              }`}
              style={{
                backgroundColor: isHighContrast ? (isDarkTheme ? '#1F2937' : '#F4F4F5') : themeVisuals.palette.accentLight,
                color: isHighContrast ? (isDarkTheme ? '#FFFFFF' : '#000000') : themeVisuals.palette.primary,
              }}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{invitation.mempelaiPria.instagram}</span>
            </a>
          )}
        </IntersectionSection>

        {/* Ampersand Divider with Glow & Scale */}
        <IntersectionSection
          as="div"
          direction="zoom"
          slideDistance={0}
          delay={0.15}
          duration={0.65}
          className="flex items-center justify-center"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center font-serif text-2xl font-bold border shadow-lg ${
              isHighContrast ? 'border-2' : ''
            }`}
            style={{
              backgroundColor: isHighContrast ? (isDarkTheme ? '#000000' : '#FFFFFF') : themeVisuals.palette.cardBg,
              borderColor: isHighContrast ? (isDarkTheme ? '#FFFFFF' : '#000000') : themeVisuals.palette.cardBorder,
              color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary,
              boxShadow: `0 8px 25px ${themeVisuals.palette.glow}`,
            }}
          >
            &
          </div>
        </IntersectionSection>

        {/* Mempelai Wanita (Bride - Slides from Right) */}
        <IntersectionSection
          as="div"
          direction="right"
          slideDistance={40}
          delay={0.2}
          duration={0.85}
          className={`group flex flex-col items-center text-center space-y-4 p-5 sm:p-7 ${themeVisuals.cardShapeClass} backdrop-blur-sm border shadow-lg transition-transform hover:-translate-y-1 ${
            isHighContrast ? 'border-2' : ''
          }`}
          style={{
            backgroundColor: themeVisuals.palette.cardBg,
            borderColor: themeVisuals.palette.cardBorder,
          }}
        >
          {/* Framed Photo with Grand Portrait Frame (Large & Clear, Not Round) */}
          <div
            className={`relative p-2 sm:p-2.5 border-2 shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-all duration-700 bg-white/15 backdrop-blur-xs ${
              (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'arch'
                ? 'w-52 h-72 sm:w-60 sm:h-84 max-w-[85vw] rounded-t-[54px] sm:rounded-t-[68px] rounded-b-2xl sm:rounded-b-3xl'
                : (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'dome'
                ? 'w-52 h-72 sm:w-60 sm:h-84 max-w-[85vw] rounded-t-full rounded-b-2xl sm:rounded-b-3xl'
                : (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'square'
                ? 'w-52 h-52 sm:w-60 sm:h-60 max-w-[85vw] rounded-2xl'
                : 'w-52 h-72 sm:w-60 sm:h-84 max-w-[85vw] rounded-2xl sm:rounded-3xl'
            }`}
            style={{
              borderColor: themeVisuals.palette.primary,
              boxShadow: `0 12px 35px ${themeVisuals.palette.glow}`,
            }}
          >
            <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden relative">
              <CinematicImageReveal
                src={invitation.mempelaiWanita.fotoUrl || FALLBACK_BRIDE_IMG}
                alt={invitation.mempelaiWanita.namaLengkap}
                direction="right"
                shape={
                  (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'arch' ||
                  (invitation.theme?.couplePhotoShape || themeVisuals.couplePhotoShape) === 'dome'
                    ? 'arch'
                    : 'rounded'
                }
                duration={1.05}
                className="w-full h-full"
                imageClassName="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                showGleam={true}
                hoverZoom={true}
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <h3
              className={`${themeVisuals.fontDisplay} text-xl font-bold`}
              style={{ color: themeVisuals.palette.heading }}
            >
              {invitation.mempelaiWanita.namaLengkap}
            </h3>
            <p
              className="text-xs font-semibold tracking-wide"
              style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }}
            >
              ({invitation.mempelaiWanita.namaPanggilan})
            </p>
          </div>

          <p className={`text-xs max-w-xs leading-relaxed ${isHighContrast ? (isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold') : 'text-stone-500 dark:text-stone-400'}`}>
            {invitation.mempelaiWanita.orangTua}
          </p>

          {invitation.mempelaiWanita.instagram && (
            <a
              href={`https://instagram.com/${invitation.mempelaiWanita.instagram}`}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                isHighContrast ? (isDarkTheme ? 'border border-white font-bold' : 'border border-black font-bold') : ''
              }`}
              style={{
                backgroundColor: isHighContrast ? (isDarkTheme ? '#1F2937' : '#F4F4F5') : themeVisuals.palette.accentLight,
                color: isHighContrast ? (isDarkTheme ? '#FFFFFF' : '#000000') : themeVisuals.palette.primary,
              }}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{invitation.mempelaiWanita.instagram}</span>
            </a>
          )}
        </IntersectionSection>
      </IntersectionSection>

      {/* 5. EVENT DETAILS SECTION WITH INTERSECTION OBSERVER */}
      <IntersectionSection
        as="section"
        id="section-events"
        slideDistance={40}
        duration={0.9}
        className="py-12 px-5 max-w-md mx-auto space-y-6"
      >
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center mb-1">
            <ThemeTopOrnament theme={themeVisuals} size="sm" />
          </div>
          <span
            className="text-[10px] uppercase tracking-[0.3em] font-semibold"
            style={{ color: themeVisuals.palette.primary }}
          >
            Rangkaian Acara
          </span>
          <h2
            className={`${themeVisuals.fontDisplay} text-2xl sm:text-3xl font-bold`}
            style={{ color: themeVisuals.palette.heading }}
          >
            Waktu & Tempat Acara
          </h2>
          <div
            className="w-10 h-0.5 mx-auto my-1"
            style={{ backgroundColor: themeVisuals.palette.primary, opacity: 0.5 }}
          />
        </div>

        <div className="space-y-6">
          {invitation.events.map((eventItem, idx) => {
            const formattedDate = formatIndonesianDate(eventItem.tanggal);

            return (
              <IntersectionSection
                as="div"
                key={eventItem.id}
                slideDistance={35}
                delay={idx * 0.12}
                duration={0.85}
                className={`p-6 ${themeVisuals.cardShapeClass} backdrop-blur-md border shadow-xl space-y-4 text-center relative overflow-hidden ${
                  isHighContrast ? 'border-2' : ''
                }`}
                style={{
                  backgroundColor: themeVisuals.palette.cardBg,
                  borderColor: themeVisuals.palette.cardBorder,
                  boxShadow: `0 12px 35px ${themeVisuals.palette.glow}`,
                }}
              >
                {/* Event Name Badge */}
                <div
                  className="inline-block px-5 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase font-cinzel"
                  style={{
                    backgroundColor: isHighContrast ? (isDarkTheme ? '#000000' : '#000000') : themeVisuals.palette.accentLight,
                    color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#FFFFFF') : themeVisuals.palette.primary,
                    border: isHighContrast ? (isDarkTheme ? '2px solid #FFE600' : '2px solid #000000') : undefined,
                  }}
                >
                  {eventItem.namaAcara}
                </div>

                {/* Date & Time */}
                <div className={`space-y-2 ${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-black') : 'text-stone-700 dark:text-stone-300'}`}>
                  <div className={`flex items-center justify-center gap-2 text-sm ${isHighContrast ? 'font-bold' : 'font-semibold'}`}>
                    <Calendar className="w-4 h-4" style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }} />
                    <span>{formattedDate}</span>
                  </div>
                  <div className={`flex items-center justify-center gap-2 text-xs ${isHighContrast ? (isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold') : 'text-stone-500 dark:text-stone-400'}`}>
                    <Clock className="w-4 h-4" style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }} />
                    <span>
                      {eventItem.waktuMulai} - {eventItem.waktuSelesai} {eventItem.zonaWaktu}
                    </span>
                  </div>
                </div>

                {/* Venue & Location Details */}
                <div className={`pt-2 border-t space-y-1 ${isHighContrast ? (isDarkTheme ? 'border-white' : 'border-black') : 'border-stone-200/60 dark:border-stone-700/60'}`}>
                  <h4 className={`text-sm flex items-center justify-center gap-1.5 ${isHighContrast ? (isDarkTheme ? 'text-white font-extrabold' : 'text-black font-extrabold') : 'font-bold text-stone-900 dark:text-white'}`}>
                    <MapPin className="w-4 h-4" style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }} />
                    {eventItem.namaTempat}
                  </h4>
                  <p className={`text-xs leading-relaxed px-2 ${isHighContrast ? (isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold') : 'text-stone-500 dark:text-stone-400'}`}>
                    {eventItem.alamat}
                  </p>
                </div>

                {/* Interactive Google Maps with Clickable Pin */}
                <div className="pt-2 text-left space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span
                      className="text-[11px] font-bold flex items-center gap-1.5"
                      style={{
                        color: isHighContrast
                          ? (isDarkTheme ? '#FFE600' : '#000000')
                          : themeVisuals.palette.primary,
                      }}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Peta Interaktif Google Maps</span>
                    </span>
                    <span className={`text-[10px] ${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-stone-700') : 'text-stone-400 dark:text-stone-400'}`}>
                      Klik pin untuk detail & rute
                    </span>
                  </div>

                  <InteractiveEventMap
                    eventItem={eventItem}
                    isDarkTheme={isDarkTheme}
                    isHighContrast={isHighContrast}
                    accentColor={themeVisuals.palette.primary}
                    themeVisuals={themeVisuals}
                  />
                </div>

                {/* Action Buttons: Save to Calendar + Scan QR Petunjuk Arah */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadCalendar(eventItem)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-[11px] sm:text-xs font-bold transition-all active:scale-95 shadow-xs ${
                      isHighContrast
                        ? isDarkTheme
                          ? 'bg-black text-white border-2 border-white'
                          : 'bg-white text-black border-2 border-black'
                        : 'border border-stone-300/80 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 bg-white/70 dark:bg-stone-800/70'
                    }`}
                    title="Simpan Acara ke Kalender"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 shrink-0" style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }} />
                    <span className="truncate">Simpan Kalender</span>
                  </button>

                  <button
                    onClick={() => setActiveDirectionsQrEvent(eventItem)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-[11px] sm:text-xs font-bold transition-all active:scale-95 shadow-xs ${
                      isHighContrast
                        ? isDarkTheme
                          ? 'bg-black text-white border-2 border-white'
                          : 'bg-white text-black border-2 border-black'
                        : 'border border-amber-300/80 bg-amber-50/80 hover:bg-amber-100 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200'
                    }`}
                    title="Tampilkan Kode QR Petunjuk Arah"
                  >
                    <QrCode className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="truncate">Petunjuk Arah QR</span>
                  </button>
                </div>
              </IntersectionSection>
            );
          })}
        </div>
      </IntersectionSection>

      {/* 6. LOVE STORY TIMELINE SECTION WITH INTERSECTION OBSERVER */}
      {invitation.loveStories && invitation.loveStories.length > 0 && (
        <IntersectionSection
          as="section"
          id="section-love-story"
          slideDistance={40}
          duration={0.9}
          className="py-12 px-5 max-w-md mx-auto space-y-6"
        >
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center mb-1">
              <ThemeTopOrnament theme={themeVisuals} size="sm" />
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ color: invitation.theme?.storyYearColor || invitation.theme?.storyHeadingColor || themeVisuals.palette.primary }}
            >
              Perjalanan Kasih
            </span>
            <h2
              className={`${themeVisuals.fontDisplay} text-2xl sm:text-3xl font-bold`}
              style={{ color: invitation.theme?.storyHeadingColor || themeVisuals.palette.heading }}
            >
              Kisah Cinta Kami
            </h2>
            <div
              className="w-10 h-0.5 mx-auto my-1"
              style={{ backgroundColor: invitation.theme?.storyYearColor || invitation.theme?.storyHeadingColor || themeVisuals.palette.primary, opacity: 0.5 }}
            />
          </div>

          <div
            className="relative border-l-2 ml-4 space-y-8 pl-6 my-4"
            style={{ borderColor: invitation.theme?.storyYearColor || invitation.theme?.storyHeadingColor || themeVisuals.palette.primary, opacity: 0.85 }}
          >
            {invitation.loveStories.map((story, sIndex) => (
              <IntersectionSection
                as="div"
                key={story.id}
                slideDistance={30}
                delay={sIndex * 0.12}
                duration={0.8}
                className="relative group space-y-2"
              >
                {/* Glowing Dot Marker */}
                <div
                  className="absolute -left-[31px] top-1 w-4 h-4 rounded-full shadow-md"
                  style={{
                    backgroundColor: story.tahunColor || invitation.theme?.storyYearColor || themeVisuals.palette.primary,
                    boxShadow: `0 0 10px ${themeVisuals.palette.glow}`,
                  }}
                />

                <span
                  className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold font-cinzel"
                  style={{
                    backgroundColor: story.badgeBgColor || invitation.theme?.storyBadgeBgColor || themeVisuals.palette.accentLight,
                    color: story.tahunColor || invitation.theme?.storyYearColor || themeVisuals.palette.primary,
                  }}
                >
                  {story.tahun}
                </span>

                <h4 
                  className={`font-bold text-sm sm:text-base pt-0.5 leading-snug ${themeVisuals.fontDisplay}`}
                  style={{ color: story.judulColor || invitation.theme?.storyHeadingColor || themeVisuals.palette.heading }}
                >
                  {story.judul}
                </h4>

                <p 
                  className="text-xs sm:text-sm leading-relaxed font-light"
                  style={{ color: story.ceritaColor || invitation.theme?.storyTextColor || themeVisuals.palette.text }}
                >
                  {story.cerita}
                </p>

                {story.fotoUrl && (
                  <div className={`mt-2.5 ${themeVisuals.cardShapeClass} overflow-hidden shadow-md max-w-xs border border-white/20`}>
                    <CinematicImageReveal
                      src={story.fotoUrl}
                      alt={story.judul}
                      direction="zoom"
                      delay={sIndex * 0.12}
                      duration={0.95}
                      className="w-full h-44"
                      imageClassName="w-full h-44 object-cover"
                      showGleam={true}
                      hoverZoom={true}
                    />
                  </div>
                )}
              </IntersectionSection>
            ))}
          </div>
        </IntersectionSection>
      )}

      {/* 7. EDITORIAL WEDDING GALLERY SECTION WITH INTERSECTION OBSERVER */}
      {invitation.gallery && invitation.gallery.length > 0 && (
        <IntersectionSection
          as="section"
          id="section-gallery"
          slideDistance={40}
          duration={0.9}
          className="py-12 px-5 max-w-md mx-auto space-y-6"
        >
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center mb-1">
              <ThemeTopOrnament theme={themeVisuals} size="sm" />
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ color: themeVisuals.palette.primary }}
            >
              Momen Abadi
            </span>
            <h2
              className={`${themeVisuals.fontDisplay} text-2xl sm:text-3xl font-bold`}
              style={{ color: themeVisuals.palette.heading }}
            >
              Galeri Prewedding
            </h2>
            <div
              className="w-10 h-0.5 mx-auto my-1"
              style={{ backgroundColor: themeVisuals.palette.primary, opacity: 0.5 }}
            />
          </div>

          {/* Asymmetric Editorial Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {invitation.gallery.map((photo, index) => {
              const isLarge = index % 3 === 0;

              return (
                <IntersectionSection
                  as="div"
                  key={photo.id}
                  slideDistance={30}
                  delay={(index % 4) * 0.08}
                  duration={0.85}
                  onClick={() => setLightboxIndex(index)}
                  className={`group relative ${themeVisuals.cardShapeClass} overflow-hidden bg-stone-200 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-stone-200/50 dark:border-white/10 ${
                    isLarge ? 'col-span-2 h-64' : 'h-48'
                  }`}
                >
                  <CinematicImageReveal
                    src={photo.url || FALLBACK_WEDDING_IMG}
                    alt={photo.caption || 'Foto Prewedding'}
                    direction="curtain"
                    delay={(index % 4) * 0.08}
                    duration={1.0}
                    className="w-full h-full"
                    imageClassName="w-full h-full object-cover"
                    showGleam={true}
                    hoverZoom={true}
                  >
                    {/* Soft Vignette Overlay & Zoom Icon */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white z-20">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium line-clamp-1">{photo.caption || 'Buka Foto'}</p>
                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-md">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </CinematicImageReveal>
                </IntersectionSection>
              );
            })}
          </div>
        </IntersectionSection>
      )}

      {/* 8. DIGITAL ENVELOPE / WEDDING GIFT SECTION WITH INTERSECTION OBSERVER */}
      {invitation.bankAccounts && invitation.bankAccounts.length > 0 && (
        <IntersectionSection
          as="section"
          id="section-gift"
          slideDistance={40}
          duration={0.9}
          className="py-12 px-5 max-w-md mx-auto space-y-6 text-center"
        >
          <div className="space-y-1">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 shadow-sm"
              style={{
                backgroundColor: themeVisuals.palette.accentLight,
                color: themeVisuals.palette.primary,
              }}
            >
              <Gift className="w-6 h-6" />
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ color: themeVisuals.palette.primary }}
            >
              Tanda Kasih
            </span>
            <h2
              className={`${themeVisuals.fontDisplay} text-2xl sm:text-3xl font-bold`}
              style={{ color: themeVisuals.palette.heading }}
            >
              Amplop & Kado Digital
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed pt-1 font-light">
              Doa restu Anda merupakan karunia terindah bagi kami. Namun apabila Anda ingin memberikan tanda kasih secara digital:
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {invitation.bankAccounts.map((bank, idx) => {
              return (
                <IntersectionSection
                  as="div"
                  key={bank.id}
                  slideDistance={25}
                  delay={idx * 0.1}
                  duration={0.75}
                  className={`p-5 sm:p-6 ${themeVisuals.cardShapeClass} border-2 shadow-xl space-y-3 text-left relative overflow-hidden`}
                  style={{
                    backgroundColor: isHighContrast
                      ? (isDarkTheme ? '#0F0F14' : '#FFFFFF')
                      : (isDarkTheme ? 'rgba(24, 24, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)'),
                    borderColor: isHighContrast
                      ? (isDarkTheme ? '#FFFFFF' : '#000000')
                      : (isDarkTheme ? 'rgba(229, 192, 123, 0.35)' : 'rgba(226, 232, 240, 0.95)'),
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-extrabold text-base tracking-wider font-cinzel"
                      style={{
                        color: isHighContrast
                          ? (isDarkTheme ? '#FFE600' : '#000000')
                          : (isDarkTheme ? '#FDE68A' : themeVisuals.palette.primary),
                      }}
                    >
                      {bank.namaBank}
                    </span>
                    {bank.catatan && (
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: isHighContrast
                            ? (isDarkTheme ? '#000000' : '#FFFFFF')
                            : (isDarkTheme ? '#374151' : '#F5F5F4'),
                          borderColor: isHighContrast
                            ? (isDarkTheme ? '#FFFFFF' : '#000000')
                            : (isDarkTheme ? '#4B5563' : '#E7E5E4'),
                          color: isHighContrast
                            ? (isDarkTheme ? '#FFFFFF' : '#000000')
                            : (isDarkTheme ? '#E5E7EB' : '#57534E'),
                        }}
                      >
                        {bank.catatan}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p
                      className="text-lg sm:text-xl font-mono font-extrabold tracking-wider select-all"
                      style={{
                        color: isHighContrast
                          ? (isDarkTheme ? '#FFFFFF' : '#000000')
                          : (isDarkTheme ? '#FFFFFF' : '#1C1917'),
                      }}
                    >
                      {bank.nomorRekening}
                    </p>
                    <p
                      className="text-xs sm:text-sm font-semibold"
                      style={{
                        color: isHighContrast
                          ? (isDarkTheme ? '#FFFFFF' : '#000000')
                          : (isDarkTheme ? '#D1D5DB' : '#57534E'),
                      }}
                    >
                      a.n <span className="font-bold underline underline-offset-2">{bank.atasNama}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyBank(bank.id, bank.nomorRekening)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95"
                    style={{
                      backgroundColor: copiedBankId === bank.id
                        ? '#059669'
                        : isHighContrast
                        ? isDarkTheme ? '#000000' : '#000000'
                        : isDarkTheme ? '#374151' : '#F5F5F4',
                      borderColor: copiedBankId === bank.id
                        ? '#047857'
                        : isHighContrast
                        ? isDarkTheme ? '#FFFFFF' : '#000000'
                        : isDarkTheme ? '#4B5563' : '#D6D3D1',
                      color: copiedBankId === bank.id
                        ? '#FFFFFF'
                        : isHighContrast
                        ? '#FFFFFF'
                        : isDarkTheme ? '#FFFFFF' : '#1C1917',
                    }}
                  >
                    {copiedBankId === bank.id ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Nomor Rekening Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-stone-500" />
                        <span>Salin Nomor Rekening</span>
                      </>
                    )}
                  </button>
                </IntersectionSection>
              );
            })}
          </div>

          {/* Postal Gift Physical Address */}
          {invitation.giftAddress?.alamatLengkap && (
            <IntersectionSection
              as="div"
              slideDistance={25}
              delay={0.15}
              duration={0.75}
              className={`p-5 sm:p-6 ${themeVisuals.cardShapeClass} border-2 shadow-xl space-y-3 text-left`}
              style={{
                backgroundColor: isHighContrast
                  ? (isDarkTheme ? '#0F0F14' : '#FFFFFF')
                  : (isDarkTheme ? 'rgba(24, 24, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)'),
                borderColor: isHighContrast
                  ? (isDarkTheme ? '#FFFFFF' : '#000000')
                  : (isDarkTheme ? 'rgba(229, 192, 123, 0.35)' : 'rgba(226, 232, 240, 0.95)'),
              }}
            >
              <span
                className="inline-block text-xs font-extrabold uppercase tracking-wider font-cinzel px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: isHighContrast
                    ? (isDarkTheme ? '#000000' : '#FFFFFF')
                    : (isDarkTheme ? '#374151' : '#FEF3C7'),
                  borderColor: isHighContrast
                    ? (isDarkTheme ? '#FFFFFF' : '#000000')
                    : (isDarkTheme ? '#4B5563' : '#FCD34D'),
                  color: isHighContrast
                    ? (isDarkTheme ? '#FFE600' : '#000000')
                    : (isDarkTheme ? '#FDE68A' : '#92400E'),
                }}
              >
                Kirim Kado Fisik
              </span>
              <p
                className="text-xs sm:text-sm font-bold"
                style={{
                  color: isHighContrast
                    ? (isDarkTheme ? '#FFFFFF' : '#000000')
                    : (isDarkTheme ? '#FFFFFF' : '#1C1917'),
                }}
              >
                Penerima: {invitation.giftAddress.penerima} ({invitation.giftAddress.nomorTelepon})
              </p>
              <p
                className="text-xs sm:text-sm leading-relaxed font-normal"
                style={{
                  color: isHighContrast
                    ? (isDarkTheme ? '#FFFFFF' : '#000000')
                    : (isDarkTheme ? '#D1D5DB' : '#44403C'),
                }}
              >
                {invitation.giftAddress.alamatLengkap}
              </p>
              <button
                type="button"
                onClick={() =>
                  handleCopyAddress(`${invitation.giftAddress.penerima} - ${invitation.giftAddress.alamatLengkap}`)
                }
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95 mt-2"
                style={{
                  backgroundColor: copiedAddress
                    ? '#059669'
                    : isHighContrast
                    ? isDarkTheme ? '#000000' : '#000000'
                    : isDarkTheme ? '#374151' : '#F5F5F4',
                  borderColor: copiedAddress
                    ? '#047857'
                    : isHighContrast
                    ? isDarkTheme ? '#FFFFFF' : '#000000'
                    : isDarkTheme ? '#4B5563' : '#D6D3D1',
                  color: copiedAddress
                    ? '#FFFFFF'
                    : isHighContrast
                    ? '#FFFFFF'
                    : isDarkTheme ? '#FFFFFF' : '#1C1917',
                }}
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Alamat Berhasil Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-500" />
                    <span>Salin Alamat Lengkap</span>
                  </>
                )}
              </button>
            </IntersectionSection>
          )}
        </IntersectionSection>
      )}

      {/* 9. RSVP & GUESTBOOK SECTION WITH INTERSECTION OBSERVER */}
      {(() => {
        return (
          <IntersectionSection
            as="section"
            id="section-rsvp"
            slideDistance={40}
            duration={0.9}
            className="py-12 px-5 max-w-md mx-auto space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="text-center space-y-2"
            >
              <div className="flex items-center justify-center mb-1">
                <ThemeTopOrnament theme={themeVisuals} size="sm" />
              </div>
              <span
                className="inline-block px-3.5 py-1 rounded-full text-[11px] uppercase tracking-[0.25em] font-extrabold shadow-sm border"
                style={{
                  backgroundColor: isHighContrast
                    ? (isDarkTheme ? '#000000' : '#FFFFFF')
                    : (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)'),
                  borderColor: isHighContrast
                    ? (isDarkTheme ? '#FFFFFF' : '#000000')
                    : (isDarkTheme ? 'rgba(229, 192, 123, 0.4)' : 'rgba(217, 119, 6, 0.3)'),
                  color: isHighContrast
                    ? (isDarkTheme ? '#FFE600' : '#000000')
                    : (isDarkTheme ? '#FDE68A' : '#B45309'),
                }}
              >
                Konfirmasi Kehadiran
              </span>
              <h2
                className={`${themeVisuals.fontDisplay} text-2xl sm:text-3xl font-extrabold tracking-wide`}
                style={{ color: themeVisuals.palette.heading }}
              >
                RSVP & Ucapan Doa
              </h2>
              <p
                className="text-xs sm:text-sm font-medium leading-relaxed max-w-xs mx-auto"
                style={{
                  color: isHighContrast
                    ? (isDarkTheme ? '#FFFFFF' : '#000000')
                    : (isDarkTheme ? '#D1D5DB' : '#57534E'),
                }}
              >
                Mohon konfirmasi kehadiran serta kirimkan do'a restu terbaik untuk kedua mempelai.
              </p>

              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsRsvpQrModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 shadow-sm cursor-pointer ${
                    isHighContrast
                      ? isDarkTheme
                        ? 'bg-black text-white border-2 border-white'
                        : 'bg-white text-black border-2 border-black'
                      : 'bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-700'
                  }`}
                  title="Tampilkan Kode QR Formulir RSVP"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Scan QR Form RSVP</span>
                </button>
              </div>
            </motion.div>

            {/* Form RSVP with Modern High-Contrast Design */}
            <motion.form
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSubmitRSVP}
              className={`p-6 sm:p-7 ${themeVisuals.cardShapeClass} border-2 shadow-2xl space-y-5`}
              style={{
                backgroundColor: isHighContrast
                  ? (isDarkTheme ? '#0F0F14' : '#FFFFFF')
                  : (isDarkTheme ? 'rgba(24, 24, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)'),
                borderColor: isHighContrast
                  ? (isDarkTheme ? '#FFFFFF' : '#000000')
                  : (isDarkTheme ? 'rgba(229, 192, 123, 0.35)' : 'rgba(226, 232, 240, 0.95)'),
                boxShadow: isDarkTheme
                  ? '0 20px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(229, 192, 123, 0.15)'
                  : '0 20px 45px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Success Checkmark Modal / Card upon submission */}
              {rsvpSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs flex items-center justify-between gap-3 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-xs sm:text-sm text-emerald-900">
                        Konfirmasi & Doa Berhasil Tersimpan!
                      </p>
                      <p className="text-emerald-800 leading-normal text-[11px] sm:text-xs">
                        Terima kasih banyak! Konfirmasi kehadiran dan ucapan do'a Anda telah tercatat rapi di buku tamu.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRsvpSubmitted(false)}
                    className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-800 transition-colors text-xs font-bold cursor-pointer shrink-0"
                    title="Tutup pemberitahuan"
                  >
                    ✕
                  </button>
                </motion.div>
              )}

              {/* Nama Lengkap Input */}
              <div className="space-y-1.5 text-left">
                <label
                  className="text-xs font-extrabold uppercase tracking-wider flex items-center justify-between"
                  style={{
                    color: isHighContrast
                      ? (isDarkTheme ? '#FFFFFF' : '#000000')
                      : (isDarkTheme ? '#F3F4F6' : '#1C1917'),
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <span>Nama Lengkap</span>
                    <span className="text-amber-500 font-bold">*</span>
                  </span>
                  <span className={`text-[10px] font-medium normal-case ${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-black') : 'text-stone-400'}`}>
                    Sesuai nama undangan
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Contoh: Bpk. Bambang & Keluarga"
                  className="w-full px-4 py-3.5 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all focus:outline-none shadow-sm"
                  style={{
                    backgroundColor: isHighContrast
                      ? (isDarkTheme ? '#000000' : '#FFFFFF')
                      : (isDarkTheme ? '#111827' : '#FFFFFF'),
                    borderColor: isHighContrast
                      ? (isDarkTheme ? '#FFFFFF' : '#000000')
                      : (isDarkTheme ? '#374151' : '#D6D3D1'),
                    color: isHighContrast
                      ? (isDarkTheme ? '#FFFFFF' : '#000000')
                      : (isDarkTheme ? '#F9FAFB' : '#1C1917'),
                  }}
                />
              </div>

              {/* Kehadiran Selector Cards */}
              <div className="space-y-2 text-left">
                <label
                  className="text-xs font-extrabold uppercase tracking-wider flex items-center justify-between"
                  style={{
                    color: isHighContrast
                      ? (isDarkTheme ? '#FFFFFF' : '#000000')
                      : (isDarkTheme ? '#F3F4F6' : '#1C1917'),
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <span>Konfirmasi Kehadiran</span>
                    <span className="text-amber-500 font-bold">*</span>
                  </span>
                  <span className={`text-[10px] font-medium normal-case ${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-black') : 'text-stone-400'}`}>
                    Pilih salah satu
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {[
                    {
                      id: 'attending',
                      label: 'Hadir',
                      icon: UserCheck,
                      activeBg: '#059669',
                      activeBorder: '#047857',
                      activeColor: '#FFFFFF',
                    },
                    {
                      id: 'not_attending',
                      label: 'Tidak Hadir',
                      icon: UserX,
                      activeBg: '#E11D48',
                      activeBorder: '#BE123C',
                      activeColor: '#FFFFFF',
                    },
                    {
                      id: 'uncertain',
                      label: 'Masih Ragu',
                      icon: HelpCircle,
                      activeBg: '#D97706',
                      activeBorder: '#B45309',
                      activeColor: '#FFFFFF',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = rsvpStatus === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRsvpStatus(item.id as AttendanceStatus)}
                        className={`relative py-3 px-2 rounded-xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'shadow-md scale-[1.02]'
                            : 'hover:border-stone-400 active:scale-95'
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? isHighContrast
                              ? isDarkTheme ? '#FFE600' : '#000000'
                              : item.activeBg
                            : isHighContrast
                            ? isDarkTheme ? '#000000' : '#FFFFFF'
                            : isDarkTheme
                            ? '#1F2937'
                            : '#F5F5F4',
                          borderColor: isSelected
                            ? isHighContrast
                              ? isDarkTheme ? '#FFFFFF' : '#000000'
                              : item.activeBorder
                            : isHighContrast
                            ? isDarkTheme ? '#FFFFFF' : '#000000'
                            : isDarkTheme
                            ? '#374151'
                            : '#D6D3D1',
                          color: isSelected
                            ? isHighContrast
                              ? isDarkTheme ? '#000000' : '#FFFFFF'
                              : item.activeColor
                            : isHighContrast
                            ? isDarkTheme ? '#FFFFFF' : '#000000'
                            : isDarkTheme
                            ? '#E5E7EB'
                            : '#292524',
                        }}
                      >
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-stone-900 rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span className="text-[11px] sm:text-xs tracking-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jumlah Tamu Selector (Shown only when attending) */}
              {rsvpStatus === 'attending' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5 text-left"
                >
                  <label
                    className="text-xs font-extrabold uppercase tracking-wider flex items-center justify-between"
                    style={{
                      color: isHighContrast
                        ? (isDarkTheme ? '#FFFFFF' : '#000000')
                        : (isDarkTheme ? '#F3F4F6' : '#1C1917'),
                    }}
                  >
                    <span>Jumlah Tamu yang Hadir</span>
                    <span className={`text-[10px] font-medium normal-case ${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-black') : 'text-stone-400'}`}>
                      Termasuk pendamping
                    </span>
                  </label>
                  <select
                    value={rsvpCount}
                    onChange={(e) => setRsvpCount(Number(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all focus:outline-none shadow-sm cursor-pointer"
                    style={{
                      backgroundColor: isHighContrast
                        ? (isDarkTheme ? '#000000' : '#FFFFFF')
                        : (isDarkTheme ? '#111827' : '#FFFFFF'),
                      borderColor: isHighContrast
                        ? (isDarkTheme ? '#FFFFFF' : '#000000')
                        : (isDarkTheme ? '#374151' : '#D6D3D1'),
                      color: isHighContrast
                        ? (isDarkTheme ? '#FFFFFF' : '#000000')
                        : (isDarkTheme ? '#F9FAFB' : '#1C1917'),
                    }}
                  >
                    <option value={1}>1 Orang</option>
                    <option value={2}>2 Orang</option>
                    <option value={3}>3 Orang</option>
                    <option value={4}>4 Orang atau Lebih</option>
                  </select>
                </motion.div>
              )}

              {/* Ucapan Doa Input */}
              <div className="space-y-1.5 text-left">
                <label
                  className="text-xs font-extrabold uppercase tracking-wider flex items-center justify-between"
                  style={{
                    color: isHighContrast
                      ? (isDarkTheme ? '#FFFFFF' : '#000000')
                      : (isDarkTheme ? '#F3F4F6' : '#1C1917'),
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <span>Ucapan Selamat & Doa Restu</span>
                    <span className="text-amber-500 font-bold">*</span>
                  </span>
                  <span className={`text-[10px] font-medium normal-case ${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-black') : 'text-stone-400'}`}>
                    Tampil di Buku Tamu
                  </span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  placeholder="Tuliskan harapan dan doa tulus penuh berkah untuk kedua mempelai..."
                  className="w-full px-4 py-3.5 rounded-xl border-2 text-xs sm:text-sm font-medium leading-relaxed transition-all focus:outline-none shadow-sm"
                  style={{
                    backgroundColor: isHighContrast
                      ? (isDarkTheme ? '#000000' : '#FFFFFF')
                      : (isDarkTheme ? '#111827' : '#FFFFFF'),
                    borderColor: isHighContrast
                      ? (isDarkTheme ? '#FFFFFF' : '#000000')
                      : (isDarkTheme ? '#374151' : '#D6D3D1'),
                    color: isHighContrast
                      ? (isDarkTheme ? '#FFFFFF' : '#000000')
                      : (isDarkTheme ? '#F9FAFB' : '#1C1917'),
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingRSVP}
                onClick={handleRipple}
                className={`relative overflow-hidden w-full py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSubmittingRSVP ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-105 active:scale-[0.98]'
                }`}
                style={{
                  background: isHighContrast
                    ? (isDarkTheme ? 'linear-gradient(135deg, #FFE600 0%, #F59E0B 100%)' : 'linear-gradient(135deg, #000000 0%, #18181B 100%)')
                    : themeVisuals.button.gradient,
                  color: isHighContrast
                    ? (isDarkTheme ? '#000000' : '#FFFFFF')
                    : themeVisuals.button.textColor,
                  boxShadow: themeVisuals.button.shadow || '0 10px 25px rgba(0,0,0,0.2)',
                  border: isHighContrast ? (isDarkTheme ? '2px solid #FFFFFF' : '2px solid #000000') : undefined,
                }}
              >
                {isSubmittingRSVP ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="uppercase tracking-wider font-cinzel font-bold">Mengirimkan Doa...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 shrink-0" />
                    <span className="uppercase tracking-wider font-cinzel font-bold">Kirim Konfirmasi & Doa</span>
                  </>
                )}
              </button>
            </motion.form>

            {/* Wishes Wall (Buku Tamu Card Feed) */}
            {(() => {
              const displayedWishes = deduplicateRSVPList(liveRsvpList);
              return (
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-xs sm:text-sm font-extrabold uppercase tracking-wider font-cinzel"
                        style={{
                          color: isHighContrast
                            ? (isDarkTheme ? '#FFFFFF' : '#000000')
                            : (isDarkTheme ? '#FFFFFF' : '#1C1917'),
                        }}
                      >
                        Untaian Doa Tamu
                      </h4>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border"
                        style={{
                          backgroundColor: isHighContrast
                            ? (isDarkTheme ? '#000000' : '#FFFFFF')
                            : (isDarkTheme ? '#374151' : '#F5F5F4'),
                          borderColor: isHighContrast
                            ? (isDarkTheme ? '#FFFFFF' : '#000000')
                            : (isDarkTheme ? '#4B5563' : '#D6D3D1'),
                          color: isHighContrast
                            ? (isDarkTheme ? '#FFFFFF' : '#000000')
                            : (isDarkTheme ? '#F9FAFB' : '#292524'),
                        }}
                      >
                        {displayedWishes.length}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        color: isHighContrast
                          ? (isDarkTheme ? '#FFFFFF' : '#000000')
                          : (isDarkTheme ? '#9CA3AF' : '#78716C'),
                      }}
                    >
                      Buku Tamu Digital
                    </span>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {displayedWishes.length === 0 ? (
                      <div
                        className="text-center py-10 px-4 rounded-2xl border-2 border-dashed space-y-2"
                        style={{
                          backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          borderColor: isHighContrast ? (isDarkTheme ? '#FFFFFF' : '#000000') : (isDarkTheme ? '#374151' : '#E7E5E4'),
                          color: isHighContrast ? (isDarkTheme ? '#FFFFFF' : '#000000') : (isDarkTheme ? '#9CA3AF' : '#78716C'),
                        }}
                      >
                        <Heart className="w-7 h-7 mx-auto text-amber-500/80 animate-pulse" />
                        <p className="text-xs sm:text-sm font-semibold">
                          Belum ada ucapan doa.
                        </p>
                        <p className="text-[11px] opacity-80">
                          Jadilah orang pertama yang mengirimkan doa restu penuh kehangatan!
                        </p>
                      </div>
                    ) : (
                      displayedWishes.map((rsvp, rIndex) => (
                        <motion.div
                          key={rsvp.id}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: (rIndex % 5) * 0.05 }}
                          className={`p-4 sm:p-5 ${themeVisuals.cardShapeClass} border-2 shadow-sm space-y-3 transition-all`}
                          style={{
                            backgroundColor: isHighContrast
                              ? (isDarkTheme ? '#0F0F14' : '#FFFFFF')
                              : (isDarkTheme ? 'rgba(28, 28, 36, 0.98)' : 'rgba(255, 255, 255, 0.98)'),
                            borderColor: isHighContrast
                              ? (isDarkTheme ? '#FFFFFF' : '#000000')
                              : (isDarkTheme ? 'rgba(229, 192, 123, 0.28)' : 'rgba(226, 232, 240, 0.95)'),
                            boxShadow: isDarkTheme
                              ? '0 4px 20px rgba(0,0,0,0.4)'
                              : '0 4px 15px rgba(0,0,0,0.04)',
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Initials Avatar with High Contrast Badge */}
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold font-cinzel shrink-0 shadow-sm border"
                                style={{
                                  backgroundColor: isHighContrast
                                    ? (isDarkTheme ? '#000000' : '#FFFFFF')
                                    : (isDarkTheme ? '#374151' : '#FEF3C7'),
                                  borderColor: isHighContrast
                                    ? (isDarkTheme ? '#FFFFFF' : '#000000')
                                    : (isDarkTheme ? '#4B5563' : '#FCD34D'),
                                  color: isHighContrast
                                    ? (isDarkTheme ? '#FFE600' : '#000000')
                                    : (isDarkTheme ? '#FDE68A' : '#92400E'),
                                }}
                              >
                                {rsvp.nama.charAt(0).toUpperCase()}
                              </div>
                              <span
                                className="font-extrabold text-xs sm:text-sm tracking-tight truncate"
                                style={{
                                  color: isHighContrast
                                    ? (isDarkTheme ? '#FFFFFF' : '#000000')
                                    : (isDarkTheme ? '#FFFFFF' : '#1C1917'),
                                }}
                              >
                                {rsvp.nama}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <span className="shrink-0">
                              {rsvp.status === 'attending' && (
                                <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full font-extrabold ${
                                  isHighContrast
                                    ? isDarkTheme ? 'bg-black text-emerald-300 border-2 border-emerald-400' : 'bg-white text-black border-2 border-black'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}>
                                  <UserCheck className="w-3 h-3 stroke-[2.5]" />
                                  <span>Hadir</span>
                                </span>
                              )}
                              {rsvp.status === 'uncertain' && (
                                <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full font-extrabold ${
                                  isHighContrast
                                    ? isDarkTheme ? 'bg-black text-amber-300 border-2 border-amber-400' : 'bg-white text-black border-2 border-black'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}>
                                  <HelpCircle className="w-3 h-3 stroke-[2.5]" />
                                  <span>Ragu</span>
                                </span>
                              )}
                              {rsvp.status === 'not_attending' && (
                                <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full font-extrabold ${
                                  isHighContrast
                                    ? isDarkTheme ? 'bg-black text-rose-300 border-2 border-rose-400' : 'bg-white text-black border-2 border-black'
                                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                                }`}>
                                  <UserX className="w-3 h-3 stroke-[2.5]" />
                                  <span>Tidak Hadir</span>
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Message Content with High Contrast and Clear Font */}
                          <p
                            className={`text-xs sm:text-sm leading-relaxed pl-10 ${
                              isHighContrast ? 'font-semibold' : 'font-normal italic'
                            }`}
                            style={{
                              color: isHighContrast
                                ? (isDarkTheme ? '#FFFFFF' : '#000000')
                                : (isDarkTheme ? '#E5E7EB' : '#292524'),
                            }}
                          >
                            "{rsvp.pesanDoa}"
                          </p>

                          {/* Threaded Replies List */}
                          {Array.isArray(rsvp.replies) && rsvp.replies.length > 0 && (
                            <div className="ml-5 pl-3 border-l-2 border-amber-400 space-y-2 pt-1">
                              {rsvp.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="text-xs space-y-1 p-3 rounded-xl border"
                                  style={{
                                    backgroundColor: isDarkTheme ? '#1F2937' : '#F5F5F4',
                                    borderColor: isDarkTheme ? '#374151' : '#E7E5E4',
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className="font-extrabold text-xs"
                                        style={{ color: isDarkTheme ? '#F9FAFB' : '#1C1917' }}
                                      >
                                        {reply.nama}
                                      </span>
                                      {reply.isHost && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-400 text-amber-950 border border-amber-500 shadow-xs">
                                          👑 Mempelai
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-medium text-stone-400">
                                      {new Date(reply.createdAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </span>
                                  </div>
                                  <p
                                    className="text-xs leading-normal font-normal"
                                    style={{ color: isDarkTheme ? '#D1D5DB' : '#44403C' }}
                                  >
                                    {reply.pesan}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Card Footer: Date & Reply Button */}
                          <div
                            className="flex items-center justify-between pt-2 border-t text-[11px]"
                            style={{ borderColor: isDarkTheme ? '#374151' : '#E7E5E4' }}
                          >
                            <span
                              className="font-medium"
                              style={{ color: isDarkTheme ? '#9CA3AF' : '#78716C' }}
                            >
                              {new Date(rsvp.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (replyingToRsvpId === rsvp.id) {
                                  setReplyingToRsvpId(null);
                                } else {
                                  setReplyingToRsvpId(rsvp.id);
                                  if (!replyName) {
                                    setReplyName(
                                      rsvpName ||
                                        (guestName !== 'Bapak / Ibu Tamu Terhormat' &&
                                        guestName !== 'Tamu Undangan'
                                          ? guestName
                                          : '')
                                    );
                                  }
                                }
                              }}
                              className="inline-flex items-center gap-1.5 font-bold text-xs py-1.5 px-3 rounded-lg border transition-all cursor-pointer shadow-xs active:scale-95"
                              style={{
                                backgroundColor: isDarkTheme ? '#374151' : '#F5F5F4',
                                borderColor: isDarkTheme ? '#4B5563' : '#D6D3D1',
                                color: isDarkTheme ? '#FDE68A' : '#92400E',
                              }}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{replyingToRsvpId === rsvp.id ? 'Tutup Balasan' : 'Balas Doa'}</span>
                              {rsvp.replies && rsvp.replies.length > 0 && (
                                <span className="bg-amber-500 text-white rounded-full px-1.5 py-0.2 font-extrabold text-[9px]">
                                  {rsvp.replies.length}
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Inline Reply Form */}
                          <AnimatePresence>
                            {replyingToRsvpId === rsvp.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-2 border-t border-dashed space-y-2.5 p-3.5 rounded-2xl text-left"
                                style={{
                                  backgroundColor: isDarkTheme ? '#1E293B' : '#F8FAFC',
                                  borderColor: isDarkTheme ? '#475569' : '#CBD5E1',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className="text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5"
                                    style={{ color: isDarkTheme ? '#F8FAFC' : '#1E293B' }}
                                  >
                                    <CornerDownRight className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Balas Doa {rsvp.nama}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setReplyingToRsvpId(null)}
                                    className="text-stone-400 hover:text-stone-600 text-xs px-1 cursor-pointer font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Nama Anda..."
                                  value={replyName}
                                  onChange={(e) => setReplyName(e.target.value)}
                                  className="w-full px-3 py-2.5 rounded-xl border-2 text-xs font-semibold focus:outline-none"
                                  style={{
                                    backgroundColor: isDarkTheme ? '#0F172A' : '#FFFFFF',
                                    borderColor: isDarkTheme ? '#334155' : '#CBD5E1',
                                    color: isDarkTheme ? '#F8FAFC' : '#0F172A',
                                  }}
                                />
                                <textarea
                                  rows={2}
                                  placeholder="Tulis balasan ucapan doa..."
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  className="w-full px-3 py-2.5 rounded-xl border-2 text-xs font-medium focus:outline-none"
                                  style={{
                                    backgroundColor: isDarkTheme ? '#0F172A' : '#FFFFFF',
                                    borderColor: isDarkTheme ? '#334155' : '#CBD5E1',
                                    color: isDarkTheme ? '#F8FAFC' : '#0F172A',
                                  }}
                                />
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingToRsvpId(null);
                                      setReplyMessage('');
                                    }}
                                    className="px-3.5 py-1.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!replyName.trim() || !replyMessage.trim() || isSubmittingReply}
                                    onClick={() => handleSendReply(rsvp.id)}
                                    className="px-4 py-1.5 text-xs font-extrabold rounded-xl text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>{isSubmittingReply ? 'Mengirim...' : 'Kirim Balasan'}</span>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}
          </IntersectionSection>
        );
      })()}

      {/* 10. PROTOCOL & CLOSING SECTION WITH INTERSECTION OBSERVER */}
      <IntersectionSection
        as="section"
        id="section-closing"
        slideDistance={40}
        duration={0.9}
        className="py-14 px-6 max-w-md mx-auto text-center space-y-8"
      >
        {invitation.protokolKesehatan && (
          <div
            className={`p-5 ${themeVisuals.cardShapeClass} border space-y-2 text-center ${isHighContrast ? 'border-2' : ''}`}
            style={{
              backgroundColor: isHighContrast ? (isDarkTheme ? '#0F0F14' : '#FFFFFF') : themeVisuals.palette.accentLight,
              borderColor: isHighContrast ? (isDarkTheme ? '#FFFFFF' : '#000000') : themeVisuals.palette.cardBorder,
            }}
          >
            <div
              className="flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider font-cinzel"
              style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Himbauan Kenyamanan Acara</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isHighContrast ? (isDarkTheme ? 'text-white font-medium' : 'text-black font-semibold') : 'text-stone-600 dark:text-stone-300 font-light'}`}>
              Demi kelancaran dan kenyamanan bersama, para tamu dimohon untuk senantiasa menjaga ketertiban serta kesehatan selama seluruh rangkaian acara berlangsung.
            </p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {/* Top closing flourish */}
          <div className="flex items-center justify-center mb-2">
            <ThemeTopOrnament theme={themeVisuals} size="md" />
          </div>

          <p className={`text-xs leading-relaxed font-serif px-4 ${isHighContrast ? (isDarkTheme ? 'text-white font-medium' : 'text-black font-semibold') : 'text-stone-600 dark:text-stone-400'}`}>
            {invitation.pesanPenutup ||
              'Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i sekalian, kami mengucapkan terima kasih yang tak terhingga.'}
          </p>

          <p className={`text-[10px] font-bold uppercase tracking-[0.25em] pt-3 ${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-black') : 'text-stone-800 dark:text-stone-200'}`}>
            Kami Yang Berbahagia,
          </p>
          <h3
            className={`${themeVisuals.fontDisplay} text-2xl font-bold`}
            style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }}
          >
            {invitation.mempelaiPria.namaPanggilan} & {invitation.mempelaiWanita.namaPanggilan}
          </h3>
          <p className={`text-[11px] ${isHighContrast ? (isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold') : 'text-stone-400 font-light'}`}>Beserta Seluruh Keluarga Besar</p>
        </div>

        {/* Elegant Footer Watermark */}
        <div className={`pt-8 border-t text-[10px] space-y-1 ${isHighContrast ? (isDarkTheme ? 'border-white text-white' : 'border-black text-black') : 'border-stone-200/60 dark:border-stone-800 text-stone-400'}`}>
          <div className={`inline-flex items-center justify-center gap-1.5 font-serif text-xs font-bold ${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-black') : 'text-stone-600 dark:text-stone-300'}`}>
            <span className={`${isHighContrast ? (isDarkTheme ? 'text-white' : 'text-black') : 'text-stone-400'} font-sans text-[10px] font-normal`}>Dibuat oleh</span>
            <span>vhistetic</span>
            <span style={{ color: isHighContrast ? (isDarkTheme ? '#FFE600' : '#000000') : themeVisuals.palette.primary }}>Facth Printing</span>
          </div>
        </div>
      </IntersectionSection>
        </motion.div>
      )}

      {/* Lightbox for Gallery Photos */}
      <Lightbox
        isOpen={lightboxIndex !== null}
        images={invitation.gallery}
        currentIndex={lightboxIndex || 0}
        onClose={() => setLightboxIndex(null)}
        onPrev={() =>
          setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : invitation.gallery.length - 1))
        }
        onNext={() =>
          setLightboxIndex((prev) => (prev! < invitation.gallery.length - 1 ? prev! + 1 : 0))
        }
      />

      {/* QUICK MODAL: QR Code Petunjuk Arah Google Maps */}
      {activeDirectionsQrEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-center space-y-4 relative ${
              isHighContrast ? 'border-2' : ''
            }`}
            style={{
              backgroundColor: isDarkTheme ? '#141419' : '#FFFFFF',
              borderColor: isHighContrast
                ? (isDarkTheme ? '#FFFFFF' : '#000000')
                : (isDarkTheme ? '#374151' : '#E5E7EB'),
              color: isDarkTheme ? '#FFFFFF' : '#1F2937',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveDirectionsQrEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Tutup"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">QR Petunjuk Arah</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {activeDirectionsQrEvent.namaAcara} • {activeDirectionsQrEvent.namaTempat}
              </p>
            </div>

            {/* QR Code Canvas */}
            <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 inline-block shadow-inner mx-auto">
              <QRCodeSVG
                value={
                  activeDirectionsQrEvent.linkGoogleMaps &&
                  activeDirectionsQrEvent.linkGoogleMaps.startsWith('http')
                    ? activeDirectionsQrEvent.linkGoogleMaps
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${activeDirectionsQrEvent.namaTempat} ${activeDirectionsQrEvent.alamat}`
                      )}`
                }
                size={180}
                level="H"
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed px-2">
              Scan dengan kamera smartphone Anda untuk langsung memulai panduan rute navigasi di Google Maps.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={
                  activeDirectionsQrEvent.linkGoogleMaps &&
                  activeDirectionsQrEvent.linkGoogleMaps.startsWith('http')
                    ? activeDirectionsQrEvent.linkGoogleMaps
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${activeDirectionsQrEvent.namaTempat} ${activeDirectionsQrEvent.alamat}`
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Buka Maps</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const url =
                    activeDirectionsQrEvent.linkGoogleMaps &&
                    activeDirectionsQrEvent.linkGoogleMaps.startsWith('http')
                      ? activeDirectionsQrEvent.linkGoogleMaps
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${activeDirectionsQrEvent.namaTempat} ${activeDirectionsQrEvent.alamat}`
                        )}`;
                  navigator.clipboard.writeText(url);
                  setCopiedQrUrl(true);
                  setTimeout(() => setCopiedQrUrl(false), 2000);
                }}
                className="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedQrUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODAL: QR Code Formulir RSVP */}
      {isRsvpQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-center space-y-4 relative ${
              isHighContrast ? 'border-2' : ''
            }`}
            style={{
              backgroundColor: isDarkTheme ? '#141419' : '#FFFFFF',
              borderColor: isHighContrast
                ? (isDarkTheme ? '#FFFFFF' : '#000000')
                : (isDarkTheme ? '#374151' : '#E5E7EB'),
              color: isDarkTheme ? '#FFFFFF' : '#1F2937',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsRsvpQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Tutup"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">QR Form Konfirmasi RSVP</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {invitation.mempelaiPria.namaPanggilan} & {invitation.mempelaiWanita.namaPanggilan}
              </p>
            </div>

            {/* QR Code Canvas */}
            <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 inline-block shadow-inner mx-auto">
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}#invite/${invitation.slug || invitation.id}&action=rsvp${
                  guestName && guestName !== 'Bapak / Ibu Tamu Terhormat' && guestName !== 'Tamu Undangan'
                    ? `&to=${encodeURIComponent(guestName)}`
                    : ''
                }`}
                size={180}
                level="H"
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed px-2">
              Scan dengan smartphone lain untuk langsung mengisi konfirmasi kehadiran dan mengirimkan do'a restu.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRsvpQrModalOpen(false);
                  document.getElementById('section-rsvp')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Isi Form Di Sini</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = `${typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}#invite/${invitation.slug || invitation.id}&action=rsvp${
                    guestName && guestName !== 'Bapak / Ibu Tamu Terhormat' && guestName !== 'Tamu Undangan'
                      ? `&to=${encodeURIComponent(guestName)}`
                      : ''
                  }`;
                  navigator.clipboard.writeText(url);
                  setCopiedQrUrl(true);
                  setTimeout(() => setCopiedQrUrl(false), 2000);
                }}
                className="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedQrUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
