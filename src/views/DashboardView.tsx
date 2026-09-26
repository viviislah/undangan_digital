import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Eye,
  Share2,
  Trash2,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  Users,
  MessageCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Key,
  QrCode,
} from 'lucide-react';
import { motion } from 'motion/react';
import { InvitationData } from '../types/invitation';
import { TEMPLATES } from '../data/templates';
import { WhatsAppShareModal } from '../components/WhatsAppShareModal';
import { ShareThemeModal } from '../components/ShareThemeModal';
import { InvitationQRCardModal } from '../components/InvitationQRCardModal';

interface DashboardViewProps {
  invitations: InvitationData[];
  onNewInvitation: () => void;
  onEditInvitation: (invitation: InvitationData) => void;
  onPreviewInvitation: (invitation: InvitationData) => void;
  onDeleteInvitation: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invitations,
  onNewInvitation,
  onEditInvitation,
  onPreviewInvitation,
  onDeleteInvitation,
}) => {
  const [selectedForShare, setSelectedForShare] = useState<InvitationData | null>(null);
  const [selectedForQR, setSelectedForQR] = useState<InvitationData | null>(null);
  const [isShareThemeModalOpen, setIsShareThemeModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [guestNames, setGuestNames] = useState<Record<string, string>>({});
  const [guestPhones, setGuestPhones] = useState<Record<string, string>>({});

  const handleCopyLink = (inv: InvitationData) => {
    const guestName = guestNames[inv.id]?.trim() || '';
    const baseUrl = `${window.location.origin}${window.location.pathname}#invite/${inv.slug}`;
    const url = guestName ? `${baseUrl}&to=${encodeURIComponent(guestName)}` : baseUrl;
    
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDirectWhatsApp = (inv: InvitationData) => {
    const guestName = guestNames[inv.id]?.trim() || 'Bpk/Ibu/Saudara/i';
    const rawPhone = guestPhones[inv.id]?.trim() || '';
    
    // Format Indonesian phone: replace leading 0 with 62, remove non-digits
    let formattedPhone = rawPhone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }

    const baseUrl = `${window.location.origin}${window.location.pathname}#invite/${inv.slug}`;
    const guestParam = guestNames[inv.id]?.trim() ? `&to=${encodeURIComponent(guestNames[inv.id].trim())}` : '';
    const invitationUrl = `${baseUrl}${guestParam}`;

    const primaryEvent = inv.events[0];
    const dateFormatted = primaryEvent
      ? new Date(primaryEvent.tanggal).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

    const groomName = inv.mempelaiPria.namaPanggilan;
    const brideName = inv.mempelaiWanita.namaPanggilan;

    const messageContent = `Yth. *${guestName}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri perayaan pernikahan kami:

💍 *${inv.mempelaiPria.namaLengkap}* & *${inv.mempelaiWanita.namaLengkap}*

📅 *Tanggal:* ${dateFormatted}
⏰ *Pukul:* ${primaryEvent?.waktuMulai || '09:00'} ${primaryEvent?.zonaWaktu || 'WIB'}
📍 *Lokasi:* ${primaryEvent?.namaTempat || 'Lokasi Acara'}

Informasi lengkap seputar susunan acara, panduan rute, dan RSVP dapat diakses melalui link undangan berikut:
👉 ${invitationUrl}

Kehadiran dan doa restu Anda adalah kado terindah bagi kami. Terima kasih banyak.

Hormat kami yang berbahagia,
*${groomName} & ${brideName}*`;

    const phoneQuery = formattedPhone ? `phone=${formattedPhone}&` : '';
    const waUrl = `https://api.whatsapp.com/send?${phoneQuery}text=${encodeURIComponent(messageContent)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Action - Slide In */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200"
        >
          <div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              Kelola Undangan Saya
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Pantau status, edit konten, lihat statistik kehadiran, dan bagikan undangan Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsShareThemeModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm shadow-sm transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Kirim Pilihan Tema ke Customer</span>
            </button>

            <button
              id="dash-btn-create"
              onClick={onNewInvitation}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Undangan Baru</span>
            </button>
          </div>
        </motion.div>

        {/* List of Invitations with Staggered Slide-in */}
        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base font-bold text-stone-800"
          >
            Daftar Undangan Aktif
          </motion.h2>

          {invitations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-stone-800">Belum Ada Undangan</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Anda belum memiliki undangan. Mulai sekarang untuk membuat undangan pernikahan impian Anda.
                </p>
              </div>
              <button
                onClick={onNewInvitation}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-medium text-xs shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Buat Undangan</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invitations.map((inv, idx) => {
                const primaryEvent = inv.events[0];
                const eventDate = primaryEvent
                  ? new Date(primaryEvent.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Belum diatur';

                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.25 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Banner */}
                      <div className="relative h-40 bg-stone-100 overflow-hidden">
                        <img
                          src={inv.coverPhotoUrl}
                          alt={inv.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                              inv.isPublished
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {inv.isPublished ? 'Terpublikasi' : 'Draft'}
                          </span>
                        </div>

                        {/* Couple Nicknames in Cover */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-serif-display text-lg font-bold truncate">
                            {inv.mempelaiPria.namaPanggilan} & {inv.mempelaiWanita.namaPanggilan}
                          </h3>
                          <p className="text-[11px] text-stone-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>{eventDate}</span>
                          </p>
                        </div>
                      </div>

                      {/* Info & Stats Body */}
                      <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm text-stone-800 line-clamp-1">
                          {inv.title}
                        </h4>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 py-1.5 border-y border-stone-100">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-stone-400" />
                            <span>{inv.viewsCount || 0} Dilihat</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>{inv.rsvpList?.length || 0} Konfirmasi</span>
                          </div>
                        </div>

                        {/* Salin Link Undangan dengan Opsi Nama & No WhatsApp */}
                        <div className="space-y-3 p-3 bg-stone-50/70 rounded-xl border border-stone-200/80 text-xs">
                          {/* Nama Tamu Field */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                Nama Tamu (Opsional)
                              </label>
                              {guestNames[inv.id] && (
                                <button
                                  type="button"
                                  onClick={() => setGuestNames((prev) => ({ ...prev, [inv.id]: '' }))}
                                  className="text-[10px] text-stone-400 hover:text-stone-600 font-medium cursor-pointer"
                                >
                                  Bersihkan
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Ketik nama tamu (cth: Budi Santoso)..."
                              value={guestNames[inv.id] || ''}
                              onChange={(e) =>
                                setGuestNames((prev) => ({ ...prev, [inv.id]: e.target.value }))
                              }
                              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-stone-800 transition-all placeholder:text-stone-400"
                            />
                          </div>

                          {/* No WhatsApp Field */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                Nomor WhatsApp Tamu (Opsional)
                              </label>
                              {guestPhones[inv.id] && (
                                <button
                                  type="button"
                                  onClick={() => setGuestPhones((prev) => ({ ...prev, [inv.id]: '' }))}
                                  className="text-[10px] text-stone-400 hover:text-stone-600 font-medium cursor-pointer"
                                >
                                  Bersihkan
                                </button>
                              )}
                            </div>
                            <input
                              type="tel"
                              placeholder="Ketik No WA (cth: 08123456789)..."
                              value={guestPhones[inv.id] || ''}
                              onChange={(e) =>
                                setGuestPhones((prev) => ({ ...prev, [inv.id]: e.target.value }))
                              }
                              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-stone-800 transition-all placeholder:text-stone-400"
                            />
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(inv)}
                              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 font-semibold py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                              title="Salin Link Undangan Unik"
                            >
                              {copiedId === inv.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-stone-500" />
                              )}
                              <span>{copiedId === inv.id ? 'Tersalin' : 'Salin Tautan'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDirectWhatsApp(inv)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                              title="Kirim Langsung via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-100" />
                              <span>Kirim WA</span>
                            </button>
                          </div>

                          {guestNames[inv.id] && (
                            <p className="text-[10px] text-stone-400 font-light truncate">
                              Link: #invite/{inv.slug || inv.id}&to={encodeURIComponent(guestNames[inv.id])}
                            </p>
                          )}

                          {/* Akses Admin Customer (WhatsApp Share) */}
                          <div className="pt-2 border-t border-stone-200/60 mt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const manageLink = `${window.location.origin}${window.location.pathname}#manage/${inv.slug || inv.id}`;
                                const text = `Halo, ini adalah link akses admin khusus untuk mengelola daftar tamu & mengirim undangan Anda sendiri via WhatsApp.\n\nSilakan klik link di bawah ini:\n${manageLink}\n\nTerima kasih!`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="w-full bg-stone-900 hover:bg-stone-800 text-amber-100 text-[11px] py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all active:scale-95 shadow-sm cursor-pointer border border-amber-500/20"
                              title="Bagikan link admin tamu ke customer via WhatsApp"
                            >
                              <Key className="w-3.5 h-3.5 text-amber-400" />
                              <span>Bagikan Akses Admin ke Customer (WhatsApp)</span>
                            </button>
                          </div>

                          {/* Cetak QR Code & Kartu Cetak Fisik */}
                          <div className="pt-1.5 border-t border-stone-200/60 mt-1">
                            <button
                              type="button"
                              onClick={() => setSelectedForQR(inv)}
                              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
                              title="Buat & Cetak Kartu Sisipan QR Code untuk Petunjuk Arah & RSVP"
                            >
                              <QrCode className="w-3.5 h-3.5 text-amber-700" />
                              <span>Cetak QR Card (Petunjuk Arah & RSVP)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar Footer */}
                    <div className="p-4 bg-stone-50/70 border-t border-stone-100 grid grid-cols-5 gap-1.5">
                      <button
                        onClick={() => onEditInvitation(inv)}
                        className="py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors col-span-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onPreviewInvitation(inv)}
                        className="py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center transition-colors"
                        title="Pratinjau Undangan"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedForQR(inv)}
                        className="py-2 rounded-xl bg-amber-100/70 hover:bg-amber-200/80 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-center transition-colors"
                        title="Generator QR Code & Kartu Cetak Fisik"
                      >
                        <QrCode className="w-4 h-4 text-amber-700" />
                      </button>

                      <button
                        onClick={() => setSelectedForShare(inv)}
                        className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center transition-colors"
                        title="Bagikan ke WhatsApp"
                      >
                        <Share2 className="w-4 h-4 text-emerald-600" />
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(inv.id)}
                        className="py-2 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-600 text-xs font-semibold flex items-center justify-center transition-colors col-span-5 mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Hapus Undangan</span>
                      </button>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {confirmDeleteId === inv.id && (
                      <div className="p-3 bg-rose-50 border-t border-rose-200 text-xs space-y-2">
                        <p className="text-rose-800 font-medium">Hapus undangan ini secara permanen?</p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 rounded bg-white text-stone-600 border border-stone-300"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => {
                              onDeleteInvitation(inv.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium"
                          >
                            Ya, Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Share Modal */}
      {selectedForShare && (
        <WhatsAppShareModal
          isOpen={true}
          invitation={selectedForShare}
          onClose={() => setSelectedForShare(null)}
          defaultGuestName={guestNames[selectedForShare.id] || ''}
        />
      )}

      {/* QR Code & Printable Physical Card Modal */}
      {selectedForQR && (
        <InvitationQRCardModal
          isOpen={Boolean(selectedForQR)}
          invitation={selectedForQR}
          onClose={() => setSelectedForQR(null)}
          defaultGuestName={guestNames[selectedForQR.id] || ''}
        />
      )}

      {/* Share Theme to Customer Modal */}
      <ShareThemeModal
        isOpen={isShareThemeModalOpen}
        onClose={() => setIsShareThemeModalOpen(false)}
        templates={TEMPLATES}
      />
    </div>
  );
};
