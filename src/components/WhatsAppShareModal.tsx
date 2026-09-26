import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, ExternalLink, User } from 'lucide-react';
import { InvitationData } from '../types/invitation';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  invitation: InvitationData;
  onClose: () => void;
  defaultGuestName?: string;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  invitation,
  onClose,
  defaultGuestName,
}) => {
  const [guestName, setGuestName] = useState(defaultGuestName || 'Bpk/Ibu/Saudara/i');
  const [copiedType, setCopiedType] = useState<'text' | 'link' | null>(null);
  const [templateTone, setTemplateTone] = useState<'formal' | 'islami' | 'santai'>('formal');

  if (!isOpen) return null;

  // Build clean web URL
  const baseUrl = window.location.origin + window.location.pathname;
  const guestParam = guestName ? `&to=${encodeURIComponent(guestName)}` : '';
  const invitationUrl = `${baseUrl}#invite/${invitation.slug}${guestParam}`;

  const primaryEvent = invitation.events[0];
  const dateFormatted = primaryEvent
    ? new Date(primaryEvent.tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const groomName = invitation.mempelaiPria.namaPanggilan;
  const brideName = invitation.mempelaiWanita.namaPanggilan;

  // Generate message based on selected tone
  let messageContent = '';
  if (templateTone === 'islami') {
    messageContent = `*Assalamu’alaikum Warahmatullahi Wabarakatuh*

Kepada Yth.
*${guestName}*
Di tempat

Dengan memohon rahmat dan ridho Allah SWT, tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

💍 *${invitation.mempelaiPria.namaLengkap}* & *${invitation.mempelaiWanita.namaLengkap}*

📅 *Hari/Tanggal:* ${dateFormatted}
📍 *Tempat:* ${primaryEvent?.namaTempat || 'Lokasi Acara'}

Untuk informasi lengkap agenda acara, lokasi Google Maps, dan konfirmasi kehadiran, silakan klik tautan undangan digital kami:
🔗 ${invitationUrl}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu.

*Wassalamu’alaikum Warahmatullahi Wabarakatuh*
Kami yang berbahagia,
*${groomName} & ${brideName}*
Beserta Keluarga Besar`;
  } else if (templateTone === 'santai') {
    messageContent = `Halo *${guestName}*! 👋

Kabar bahagia untuk kita semua! Kami mengundang kamu untuk hadir dan merayakan hari pernikahan kami:

✨ *${groomName} & ${brideName}* ✨
The Wedding Celebration

📅 ${dateFormatted}
📍 ${primaryEvent?.namaTempat || 'Lokasi Acara'}

Detail acara, live map, dan RSVP bisa kamu cek langsung di link undangan ini ya:
🔗 ${invitationUrl}

Kehadiran dan doa dari kamu sangat berarti bagi kami. Sampai jumpa di hari bahagia kami! ❤️

Salam hangat,
*${groomName} & ${brideName}*`;
  } else {
    messageContent = `Yth. *${guestName}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri perayaan pernikahan kami:

💍 *${invitation.mempelaiPria.namaLengkap}* & *${invitation.mempelaiWanita.namaLengkap}*

📅 *Tanggal:* ${dateFormatted}
⏰ *Pukul:* ${primaryEvent?.waktuMulai || '09:00'} ${primaryEvent?.zonaWaktu || 'WIB'}
📍 *Lokasi:* ${primaryEvent?.namaTempat || 'Lokasi Acara'}

Informasi lengkap seputar susunan acara, panduan rute, dan RSVP dapat diakses melalui link undangan berikut:
👉 ${invitationUrl}

Kehadiran dan doa restu Anda adalah kado terindah bagi kami. Terima kasih banyak.

Hormat kami yang berbahagia,
*${groomName} & ${brideName}*`;
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setCopiedType('text');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedType('link');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageContent)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      id="modal-wa-overlay"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-wa-content"
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 text-stone-800 space-y-4 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-stone-900">Bagikan via WhatsApp</h3>
              <p className="text-xs text-stone-500">Kirim undangan personal langsung ke tamu</p>
            </div>
          </div>
          <button
            id="modal-wa-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Nama Tamu */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-stone-400" />
            Nama Tamu yang Dituju
          </label>
          <input
            id="wa-guest-name-input"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Contoh: Bpk. Ahmad & Keluarga / Sahabat SMA"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-stone-900 bg-stone-50/50"
          />
          <p className="text-[11px] text-stone-500">
            Nama ini akan tercantum di pesan WhatsApp dan cover pembuka undangan.
          </p>
        </div>

        {/* Pilihan Gaya Bahasa */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Gaya Bahasa Pesan
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'formal', label: 'Formal / Sopan' },
              { id: 'islami', label: 'Islami' },
              { id: 'santai', label: 'Santai / Teman' },
            ].map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => setTemplateTone(tone.id as any)}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                  templateTone === tone.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                {tone.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Pesan */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Pratinjau Pesan
            </label>
            <span className="text-[11px] text-stone-400">Siap kirim</span>
          </div>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl max-h-48 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-stone-700 leading-relaxed custom-scrollbar">
            {messageContent}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-2 space-y-2">
          <button
            id="wa-btn-send-whatsapp"
            onClick={handleOpenWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md shadow-emerald-600/25 transition-all duration-150 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Kirim via WhatsApp Sekarang</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-0.5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="wa-btn-copy-text"
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
            >
              {copiedType === 'text' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Salin Pesan Teks</span>
                </>
              )}
            </button>

            <button
              id="wa-btn-copy-link"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
            >
              {copiedType === 'link' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Salin Link Undangan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
