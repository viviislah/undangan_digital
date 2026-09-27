import React, { useState, useEffect } from 'react';
import {
  Users,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  MessageSquare,
  FileSpreadsheet,
  ArrowLeft,
  Share2,
  Calendar,
  Sparkles,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  X,
  BookOpen,
  Smartphone,
  CornerDownRight,
  QrCode,
} from 'lucide-react';
import { InvitationData, GuestRecord, RSVPRecord, AttendanceStatus, RSVPReply } from '../types/invitation';
import { fetchRSVPListAsync, submitRSVPReplyAsync, deduplicateRSVPList } from '../services/storageService';
import { InvitationQRCardModal } from '../components/InvitationQRCardModal';
import { getInvitationPublicUrl, getCustomerAdminUrl } from '../utils/urlHelper';

const LOCAL_CONTACTS_MOCK = [
  { nama: 'Ahmad Fauzi', tel: '081234567890' },
  { nama: 'Siti Rahmawati', tel: '085211223344' },
  { nama: 'Rian Hidayat', tel: '081987654321' },
  { nama: 'Amanda Lestari (Rekan Kantor)', tel: '087788990011' },
  { nama: 'Keluarga Om Iwan', tel: '081344556677' },
  { nama: 'Dinda Kirana', tel: '089811223344' },
  { nama: 'Bambang Sugiharto', tel: '081122334455' },
  { nama: 'Citra Kirana', tel: '082211443355' },
  { nama: 'Eko Prasetyo', tel: '081288990022' },
  { nama: 'Hendra Wijaya', tel: '085377889900' },
  { nama: 'Larasati Putri', tel: '081922334455' },
  { nama: 'Muhammad Rizky', tel: '081255667788' },
];

interface CustomerAdminViewProps {
  invitation: InvitationData;
  onSave: (updated: InvitationData) => void;
  onBackToDashboard?: () => void;
}

export const CustomerAdminView: React.FC<CustomerAdminViewProps> = ({
  invitation,
  onSave,
  onBackToDashboard,
}) => {
  const [guestName, setGuestName] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [salutation, setSalutation] = useState('Yth. Bapak/Ibu');
  const [connectorWord, setConnectorWord] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isQRCardModalOpen, setIsQRCardModalOpen] = useState(false);
  const [qrCardTargetGuest, setQrCardTargetGuest] = useState<string>('');
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactTel, setNewContactTel] = useState('');
  
  // Selected guests checkbox selection state
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  
  // Bulk Sending Queue and Template Preset States
  const [bulkQueue, setBulkQueue] = useState<GuestRecord[]>([]);
  const [bulkQueueIndex, setBulkQueueIndex] = useState<number>(0);
  const [activeTemplatePreset, setActiveTemplatePreset] = useState<'formal' | 'islami' | 'santai'>('formal');
  
  const [localContacts, setLocalContacts] = useState<{ id: string; nama: string; tel: string }[]>(() => {
    const saved = localStorage.getItem(`customer_contacts_${invitation.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return LOCAL_CONTACTS_MOCK.map((item, index) => ({
      id: `lc-mock-${index}`,
      nama: item.nama,
      tel: item.tel,
    }));
  });

  React.useEffect(() => {
    localStorage.setItem(`customer_contacts_${invitation.id}`, JSON.stringify(localContacts));
  }, [localContacts, invitation.id]);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Message Template Presets
  const TEMPLATE_PRESETS = {
    formal: `Kepada {panggilan} {nama_tamu},\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri acara pernikahan kami.\n\nBerikut link undangan digital resmi kami:\n{link_undangan}\n\nMerupakan suatu kebahagiaan bagi kami apabila {nama_tamu} berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`,
    islami: `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nDengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang {panggilan} {nama_tamu} untuk menghadiri hari bahagia pernikahan kami.\n\nDetail undangan dapat diakses melalui tautan resmi berikut:\n{link_undangan}\n\nKesan mendalam akan terukir di hati kami apabila {nama_tamu} berkenan hadir dan memberikan doa restu bagi keluarga baru kami.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`,
    santai: `Halo {nama_tamu}!\n\nAda kabar bahagia nih! Kami bakal melangsungkan pernikahan dan sangat berharap kamu bisa datang merayakan bareng kami di hari spesial ini.\n\nYuk intip info lengkap & isi RSVP kamu di link undangan digital kami di sini:\n{link_undangan}\n\nSampai ketemu di sana ya! Doa restu kamu sangat berarti buat kami. Thank you!`
  };

  const [messageTemplate, setMessageTemplate] = useState(TEMPLATE_PRESETS.formal);

  const handleSelectPreset = (key: 'formal' | 'islami' | 'santai') => {
    setActiveTemplatePreset(key);
    setMessageTemplate(TEMPLATE_PRESETS[key]);
    showToast(`📝 Template diganti ke gaya bahasa: ${key === 'formal' ? 'Formal/Sopan' : key === 'islami' ? 'Islami' : 'Santai/Teman'}`);
  };

  const guestsList: GuestRecord[] = invitation.guests || [];
  const [liveRsvpList, setLiveRsvpList] = useState<RSVPRecord[]>(() => deduplicateRSVPList(invitation.rsvpList || []));

  useEffect(() => {
    if (invitation.rsvpList) {
      setLiveRsvpList(deduplicateRSVPList(invitation.rsvpList));
    }
  }, [invitation.rsvpList]);

  // Live polling for customer self-service dashboard
  useEffect(() => {
    const targetId = invitation.slug || invitation.id;
    if (!targetId) return;

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
  }, [invitation.id, invitation.slug]);

  const rsvpList: RSVPRecord[] = deduplicateRSVPList(liveRsvpList);

  // Host reply state
  const defaultHostName = `${invitation.mempelaiPria.namaPanggilan} & ${invitation.mempelaiWanita.namaPanggilan} (Mempelai)`;
  const [adminReplyingId, setAdminReplyingId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyHostName, setAdminReplyHostName] = useState(defaultHostName);
  const [isAdminSubmittingReply, setIsAdminSubmittingReply] = useState(false);

  const handleAdminSendReply = async (rsvpId: string) => {
    if (!adminReplyText.trim() || isAdminSubmittingReply) return;
    setIsAdminSubmittingReply(true);

    const replyData = {
      nama: adminReplyHostName.trim() || defaultHostName,
      pesan: adminReplyText.trim(),
      isHost: true,
    };

    const targetId = invitation.slug || invitation.id;
    try {
      const res = await submitRSVPReplyAsync(targetId, rsvpId, replyData);
      if (res && Array.isArray(res.rsvpList)) {
        setLiveRsvpList(res.rsvpList);
      }
      showToast('✓ Balasan doa berhasil dikirimkan!');
      setAdminReplyText('');
      setAdminReplyingId(null);
    } catch (err) {
      console.warn('Failed to send host reply:', err);
    } finally {
      setIsAdminSubmittingReply(false);
    }
  };

  // Statistics
  const totalInvited = guestsList.length;
  const totalRSVP = rsvpList.length;
  const attendingCount = rsvpList.filter((r) => r.status === 'attending').length;
  const uncertainCount = rsvpList.filter((r) => r.status === 'uncertain').length;
  const absentCount = rsvpList.filter((r) => r.status === 'not_attending').length;

  // Count how many guests have opened the link, or who are registered in the RSVP response list
  const openedCount = guestsList.filter((g) => {
    const hasRSVP = rsvpList.some((r) => r.nama.toLowerCase().trim() === g.nama.toLowerCase().trim());
    return g.statusUndangan === 'opened' || hasRSVP;
  }).length;

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Generate Personalized Invitation Link
  const generateInviteLink = (name: string) => {
    return getInvitationPublicUrl(invitation.slug || invitation.id, name);
  };

  // Send Invitation via WhatsApp
  const handleSendWhatsApp = (guest: { nama: string; panggilan: string; whatsApp?: string }) => {
    const link = generateInviteLink(guest.nama);
    
    // Replace template variables
    let text = messageTemplate
      .replace(/{panggilan}/g, guest.panggilan)
      .replace(/{nama_tamu}/g, guest.nama)
      .replace(/{link_undangan}/g, link);

    const encodedText = encodeURIComponent(text);
    
    // Clean WhatsApp phone number (must be numeric, start with 62 or 08)
    let phoneClean = (guest.whatsApp || '').replace(/\D/g, '');
    if (phoneClean.startsWith('08')) {
      phoneClean = '628' + phoneClean.slice(2);
    } else if (phoneClean.startsWith('8')) {
      phoneClean = '628' + phoneClean.slice(1);
    }

    if (!phoneClean) {
      showToast('⚠️ Nomor WhatsApp kosong, silakan salin link saja');
      return;
    }

    // Open WhatsApp API in new window
    window.open(`https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodedText}`, '_blank');
  };

  // Add Single Guest
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const fullGuestName = guestName.trim() + (connectorWord.trim() ? ' ' + connectorWord.trim() : '');

    const newGuest: GuestRecord = {
      id: 'g-' + Date.now(),
      nama: fullGuestName,
      panggilan: salutation.trim() || 'Yth. Bapak/Ibu',
      whatsApp: whatsApp.trim(),
      statusUndangan: 'sent',
      createdAt: new Date().toISOString(),
    };

    const updatedInvitation = {
      ...invitation,
      guests: [newGuest, ...guestsList],
    };

    onSave(updatedInvitation);
    handleSendWhatsApp(newGuest);
    
    setGuestName('');
    setWhatsApp('');
    setConnectorWord(''); // Reset connector word after add
    showToast(`🎉 Sukses menambahkan & mengirim undangan ke ${newGuest.nama}!`);
  };

  // Add Bulk Guests (Comma/Newline separated)
  const handleAddBulkGuests = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const newGuests: GuestRecord[] = [];

    lines.forEach((line, i) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Check if it has a comma separator for phone e.g. "Budi, 0812345"
      let name = cleanLine;
      let phone = '';

      if (cleanLine.includes(',')) {
        const parts = cleanLine.split(',');
        name = parts[0].trim();
        phone = parts[1].trim();
      }

      newGuests.push({
        id: `g-bulk-${Date.now()}-${i}`,
        nama: name,
        panggilan: 'Yth. Bapak/Ibu',
        whatsApp: phone,
        statusUndangan: 'pending',
        createdAt: new Date().toISOString(),
      });
    });

    if (newGuests.length > 0) {
      const updatedInvitation = {
        ...invitation,
        guests: [...newGuests, ...guestsList],
      };
      onSave(updatedInvitation);
      showToast(`🎉 Berhasil mengimpor ${newGuests.length} tamu sekaligus!`);
      setBulkText('');
      setShowBulkModal(false);
    }
  };

  // Native Phone Contact Picker integration
  const handleNativeContactPicker = async () => {
    try {
      if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const contacts = await (navigator as any).contacts.select(props, opts);
        
        if (contacts && contacts.length > 0) {
          const imported = contacts.map((c: any, i: number) => {
            const rawName = c.name?.[0] || 'Tamu Kontak';
            const rawPhone = c.tel?.[0] || '';
            return {
              id: `lc-native-${Date.now()}-${i}`,
              nama: rawName,
              tel: rawPhone,
            };
          }).filter((c: any) => c.tel);

          if (imported.length > 0) {
            setLocalContacts((prev) => [...imported, ...prev]);
            setSelectedContacts((prev) => Array.from(new Set([...prev, ...imported.map((c: any) => c.tel)])));
            showToast(`📱 Berhasil menambahkan ${imported.length} kontak dari HP ke Buku Telepon!`);
          }
        }
      } else {
        showToast('📱 Fitur kontak bawaan browser tidak didukung di perangkat ini. Silakan pilih kontak dari simulasi buku telepon di bawah!');
      }
    } catch (err) {
      console.error(err);
      showToast('⚠️ Gagal mengambil kontak HP: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Check if phone number is already invited in the guests list
  const isPhoneAlreadyInvited = (tel: string) => {
    const cPhone = tel.replace(/\D/g, '');
    if (!cPhone) return false;
    return guestsList.some((g) => {
      const gPhone = (g.whatsApp || '').replace(/\D/g, '');
      return gPhone && (gPhone === cPhone || gPhone.endsWith(cPhone) || cPhone.endsWith(gPhone));
    });
  };

  // Toggle single mock contact selection
  const handleToggleContact = (tel: string) => {
    if (isPhoneAlreadyInvited(tel)) return; // Ignore already invited contacts
    if (selectedContacts.includes(tel)) {
      setSelectedContacts(selectedContacts.filter((t) => t !== tel));
    } else {
      setSelectedContacts([...selectedContacts, tel]);
    }
  };

  // Toggle select all filtered mock contacts
  const handleSelectAllContacts = (filtered: { id: string; nama: string; tel: string }[]) => {
    const available = filtered.filter((c) => !isPhoneAlreadyInvited(c.tel));
    const availableTels = available.map((c) => c.tel);
    if (availableTels.length === 0) return;

    const allSelected = availableTels.every((tel) => selectedContacts.includes(tel));

    if (allSelected) {
      // Uncheck all available
      setSelectedContacts(selectedContacts.filter((tel) => !availableTels.includes(tel)));
    } else {
      // Check all available (merge with existing)
      const merged = Array.from(new Set([...selectedContacts, ...availableTels]));
      setSelectedContacts(merged);
    }
  };

  // Import selected mock contacts
  const handleImportMockContacts = (autoQueue: boolean = false) => {
    if (selectedContacts.length === 0) return;

    const chosen = localContacts.filter((c) => selectedContacts.includes(c.tel));
    const newGuests: GuestRecord[] = chosen.map((c, i) => ({
      id: `g-contact-${Date.now()}-${i}`,
      nama: c.nama,
      panggilan: 'Yth. Bapak/Ibu',
      whatsApp: c.tel,
      statusUndangan: 'pending',
      createdAt: new Date().toISOString(),
    }));

    const updatedInvitation = {
      ...invitation,
      guests: [...newGuests, ...guestsList],
    };
    onSave(updatedInvitation);

    if (autoQueue) {
      setBulkQueue(newGuests);
      setBulkQueueIndex(0);
      showToast(`🚀 ${newGuests.length} kontak diimpor ke daftar tamu & antrean pengiriman WhatsApp siap!`);
    } else {
      showToast(`🎉 Sukses mengimpor ${newGuests.length} kontak terpilih ke daftar tamu!`);
    }

    setSelectedContacts([]);
    setShowContactsModal(false);
  };

  // Delete Guest
  const handleDeleteGuest = (id: string) => {
    const updatedInvitation = {
      ...invitation,
      guests: guestsList.filter((g) => g.id !== id),
    };
    onSave(updatedInvitation);
    setSelectedGuests((prev) => prev.filter((gId) => gId !== id));
    showToast('🗑️ Tamu berhasil dihapus dari daftar');
  };

  // Bulk Send WhatsApp to all selected guests (Load into interactive batch sending queue assistant to bypass browser popup blockers)
  const handleBulkSendWhatsApp = () => {
    if (selectedGuests.length === 0) {
      showToast('⚠️ Silakan pilih minimal 1 tamu terlebih dahulu');
      return;
    }
    
    const targets = guestsList.filter((g) => selectedGuests.includes(g.id));
    if (targets.length === 0) return;

    // Load into the premium bulk sending queue assistant
    setBulkQueue(targets);
    setBulkQueueIndex(0);
    
    // Clear selections
    setSelectedGuests([]);

    // Scroll smoothly to top so user sees the active queue assistant card immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showToast(`🚀 ${targets.length} tamu masuk antrean kirim! Sila ketuk tombol "Kirim WA Sekarang" di atas.`);
  };

  // Bulk Delete multiple selected guests
  const handleBulkDeleteGuests = () => {
    if (selectedGuests.length === 0) return;
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus ${selectedGuests.length} tamu terpilih sekaligus?`);
    if (!confirmDelete) return;

    const updatedInvitation = {
      ...invitation,
      guests: guestsList.filter((g) => !selectedGuests.includes(g.id)),
    };
    onSave(updatedInvitation);
    setSelectedGuests([]);
    showToast(`🗑️ Sukses menghapus ${selectedGuests.length} tamu terpilih sekaligus!`);
  };

  // Copy invitation link to clipboard
  const handleCopyLink = (guest: GuestRecord) => {
    const link = generateInviteLink(guest.nama);
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    showToast(`📋 Link undangan untuk ${guest.nama} disalin ke papan klip!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find RSVP Status for a specific guest
  const getRSVPStatus = (name: string): AttendanceStatus | 'no_response' => {
    const found = rsvpList.find(
      (r) => r.nama.toLowerCase().trim() === name.toLowerCase().trim()
    );
    return found ? found.status : 'no_response';
  };

  // Filtered guests list by search query
  const filteredGuests = guestsList.filter((g) =>
    g.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 pb-16 select-none font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-amber-100 text-xs py-3 px-5 rounded-full shadow-2xl font-semibold border border-amber-500/30 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner Cover Photo Header */}
      <div className="relative h-44 sm:h-52 bg-stone-900 overflow-hidden shadow-md">
        <img
          src={invitation.coverPhotoUrl}
          alt="Banner"
          className="w-full h-full object-cover opacity-50 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
        
        {/* Navigation & Title */}
        <div className="absolute inset-x-0 bottom-4 px-4 sm:px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/25 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-400/20">
                Akses Khusus Customer
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {invitation.mempelaiPria.namaPanggilan} & {invitation.mempelaiWanita.namaPanggilan}
            </h1>
            <p className="text-xs text-stone-300">
              Kelola daftar tamu dan bagikan surat undangan resmi dengan mudah & cepat.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setQrCardTargetGuest('');
                setIsQRCardModalOpen(true);
              }}
              className="bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-400/30 text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all active:scale-95 cursor-pointer shadow-md"
              title="Cetak Kartu Sisipan & QR Code Fisik untuk Petunjuk Arah & RSVP"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak QR Card</span>
            </button>

            <button
              onClick={() => {
                const adminLink = getCustomerAdminUrl(invitation.slug || invitation.id);
                navigator.clipboard.writeText(adminLink);
                showToast('📋 Link Akses Admin disalin! Bagikan ke pasangan atau keluarga.');
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Akses Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Stats & New invitation sender */}
        <div className="lg:col-span-1 space-y-6">
          
           {/* STATS CARD */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Statistik Undangan</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-amber-50/50 p-2.5 rounded-2xl border border-amber-100 text-center">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-tight">Tamu Diundang</span>
                <p className="text-xl font-black text-amber-800 mt-0.5">{totalInvited}</p>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded-2xl border border-blue-100 text-center">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-tight">Sudah Melihat</span>
                <p className="text-xl font-black text-blue-800 mt-0.5">{openedCount}</p>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-100 text-center">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-tight">Tamu yang Merespon</span>
                <p className="text-xl font-black text-emerald-800 mt-0.5">{totalRSVP}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
              <div className="flex justify-between items-center text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Hadir ({attendingCount})</span>
                </div>
                <span className="font-bold">{totalRSVP ? Math.round((attendingCount / totalRSVP) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Ragu-ragu ({uncertainCount})</span>
                </div>
                <span className="font-bold">{totalRSVP ? Math.round((uncertainCount / totalRSVP) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Tidak Hadir ({absentCount})</span>
                </div>
                <span className="font-bold">{totalRSVP ? Math.round((absentCount / totalRSVP) * 100) : 0}%</span>
              </div>
            </div>
          </div>

          {/* SENDER FORM CARD */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-600" />
              <span>Kirim Undangan Baru</span>
            </h3>

            <form onSubmit={handleAddGuest} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase">Nama Lengkap Tamu</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budi Santoso & Keluarga"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">Panggilan Sopan</label>
                  <input
                    type="text"
                    placeholder="e.g. Yth. Bapak/Ibu"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Yth. Bapak/Ibu', 'Yth. Kakak', 'Yth. Sahabat', 'Dear', 'Spesial'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSalutation(p)}
                        className="text-[9px] font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">Kata Hubung / Suffix (Bisa Diedit)</label>
                  <input
                    type="text"
                    placeholder="e.g. di tempat"
                    value={connectorWord}
                    onChange={(e) => setConnectorWord(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      { label: '📍 di tempat', val: 'di tempat' },
                      { label: '👩‍❤️‍👨 & Istri', val: '& Istri' },
                      { label: '👥 dan kawan-kawan', val: 'dan kawan-kawan' },
                      { label: '💼 & Partner', val: '& Partner' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setConnectorWord(item.val)}
                        className="text-[9px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-100 transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">Nomor WhatsApp</label>
                <input
                  type="tel"
                  placeholder="e.g. 08123456789"
                  value={whatsApp}
                  onChange={(e) => setWhatsApp(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    // Pre-select all available local contacts when launching modal
                    setSelectedContacts(localContacts.map(c => c.id));
                    setShowContactsModal(true);
                  }}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold border border-emerald-200/60 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Pilih dari Kontak & Buku Telepon</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-stone-900 hover:bg-stone-800 text-white text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Kirim & Tambahkan Tamu</span>
              </button>
            </form>
          </div>

          {/* TEMPLATE MESSAGE CARD */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Template Pesan WhatsApp</span>
              </h3>
            </div>

            {/* Style Selector Tabs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Gaya Bahasa Pesan:</span>
              <div className="grid grid-cols-3 gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-100">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('formal')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                    activeTemplatePreset === 'formal'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  👔 Formal
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('islami')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                    activeTemplatePreset === 'islami'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-emerald-50'
                  }`}
                >
                  🕌 Islami
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('santai')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                    activeTemplatePreset === 'santai'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
                  }`}
                >
                  😊 Santai/Teman
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono resize-none leading-relaxed"
            />
            <div className="text-[10px] text-stone-400 leading-relaxed space-y-1">
              <p className="font-semibold text-stone-500">🏷️ Tag Dinamis (Jangan diubah):</p>
              <div className="grid grid-cols-3 gap-1 text-center font-mono font-bold">
                <span className="bg-stone-100 p-0.5 rounded text-stone-600">&#123;panggilan&#125;</span>
                <span className="bg-stone-100 p-0.5 rounded text-stone-600">&#123;nama_tamu&#125;</span>
                <span className="bg-stone-100 p-0.5 rounded text-stone-600">&#123;link_undangan&#125;</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Guest list and bulk import */}
        <div className="lg:col-span-2 space-y-6">

          {/* BULK WA SENDER QUEUE WIDGET */}
          {bulkQueue.length > 0 && bulkQueueIndex < bulkQueue.length && (
            <div className="bg-emerald-950 text-white rounded-3xl border border-emerald-800 shadow-xl p-5 space-y-4 animate-pulse-subtle">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                    🟢 Antrean Kirim Undangan Masal
                  </span>
                  <h4 className="font-bold text-sm text-emerald-50">
                    Sisa Antrean: {bulkQueue.length - bulkQueueIndex} Tamu Lagi
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBulkQueue([]);
                    setBulkQueueIndex(0);
                    showToast('🛑 Antrean pengiriman masal dibatalkan');
                  }}
                  className="text-emerald-400 hover:text-white transition-colors text-xs font-bold bg-emerald-900/40 hover:bg-emerald-900 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  Batal / Selesai
                </button>
              </div>

              {/* Queue progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-emerald-300 font-semibold">
                  <span>Progres Pengiriman</span>
                  <span>{bulkQueueIndex} / {bulkQueue.length} Terkirim</span>
                </div>
                <div className="w-full bg-emerald-900/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${(bulkQueueIndex / bulkQueue.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current target detail card */}
              {(() => {
                const currentGuest = bulkQueue[bulkQueueIndex];
                if (!currentGuest) return null;

                return (
                  <div className="bg-emerald-900/40 border border-emerald-800/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">Sedang Mengirim Ke:</span>
                      <span className="font-bold text-sm block text-white">{currentGuest.nama}</span>
                      <span className="text-xs text-emerald-300 font-mono block">{currentGuest.whatsApp || 'Tanpa No WA'}</span>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQueueIndex(bulkQueueIndex + 1);
                          showToast('⏭️ Tamu dilewati');
                        }}
                        className="flex-1 sm:flex-initial bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white text-xs px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer border border-emerald-800/40"
                      >
                        Lewati
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Trigger WhatsApp open
                          handleSendWhatsApp(currentGuest);
                          
                          // Mark as sent in database
                          const updatedGuests = guestsList.map((g) => {
                            if (g.nama === currentGuest.nama) {
                              return { ...g, statusUndangan: 'sent' as const };
                            }
                            return g;
                          });

                          onSave({
                            ...invitation,
                            guests: updatedGuests,
                          });

                          // Advance queue
                          setBulkQueueIndex(bulkQueueIndex + 1);
                          showToast(`✅ Undangan untuk ${currentGuest.nama} disiapkan!`);
                        }}
                        className="flex-2 sm:flex-initial bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs px-5 py-2.5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-950" />
                        <span>Kirim WA Sekarang ➔</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* RECENT PRAYERS & WISHES LIST */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Kumpulan Ucapan Doa & Kehadiran Tamu ({rsvpList.length})</span>
            </h3>

            {rsvpList.length === 0 ? (
              <div className="text-center p-8 text-stone-400 text-xs">
                Belum ada tamu yang mengirim ucapan atau merespon RSVP.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {rsvpList.map((rsvp) => (
                  <div key={rsvp.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-800">{rsvp.nama}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rsvp.status === 'attending' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : rsvp.status === 'uncertain'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {rsvp.status === 'attending' ? `Hadir (${rsvp.jumlahTamu} Tamu)` : rsvp.status === 'uncertain' ? 'Ragu' : 'Absen'}
                      </span>
                    </div>

                    {rsvp.pesanDoa ? (
                      <p className="text-stone-600 italic">"{rsvp.pesanDoa}"</p>
                    ) : (
                      <p className="text-stone-400 italic">Tidak menulis pesan doa.</p>
                    )}

                    {/* Replies list in admin view */}
                    {Array.isArray(rsvp.replies) && rsvp.replies.length > 0 && (
                      <div className="ml-3 pl-2.5 border-l-2 border-amber-300 space-y-1.5 pt-1">
                        {rsvp.replies.map((reply) => (
                          <div key={reply.id} className="bg-white p-2 rounded-xl border border-stone-200/80 text-[11px] space-y-0.5">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-800">{reply.nama}</span>
                                {reply.isHost && (
                                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                    Mempelai
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-stone-400">
                                {new Date(reply.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p className="text-stone-600 leading-tight">{reply.pesan}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[9px] text-stone-400">
                      <span>Merespon: {new Date(rsvp.createdAt).toLocaleString('id-ID')}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (adminReplyingId === rsvp.id) {
                            setAdminReplyingId(null);
                          } else {
                            setAdminReplyingId(rsvp.id);
                            setAdminReplyText(`Aamiin ya rabbal'alamin, terima kasih banyak atas doa restu dan perhatian ${rsvp.nama}! 🙏✨`);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 py-1 px-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{adminReplyingId === rsvp.id ? 'Tutup Balasan' : 'Balas Doa Ini'}</span>
                      </button>
                    </div>

                    {/* Inline Host Reply Form */}
                    {adminReplyingId === rsvp.id && (
                      <div className="mt-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-900">
                          <span className="flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-amber-600" /> Balas sebagai Mempelai
                          </span>
                          <button
                            type="button"
                            onClick={() => setAdminReplyingId(null)}
                            className="text-stone-400 hover:text-stone-600"
                          >
                            ✕
                          </button>
                        </div>
                        <input
                          type="text"
                          value={adminReplyHostName}
                          onChange={(e) => setAdminReplyHostName(e.target.value)}
                          placeholder="Nama Pengirim (Mempelai)..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <textarea
                          rows={2}
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="Tulis balasan ucapan doa..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAdminReplyingId(null)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-stone-500 hover:text-stone-700"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={!adminReplyText.trim() || isAdminSubmittingReply}
                            onClick={() => handleAdminSendReply(rsvp.id)}
                            className="px-3 py-1 text-[11px] font-bold rounded-lg text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isAdminSubmittingReply ? 'Mengirim...' : 'Kirim Balasan'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* BULK IMPORT MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-stone-800 text-sm">Impor Tamu Massal (Salin & Tempel)</h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-stone-600 leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
              <p className="font-bold text-amber-800">💡 Cara Pengisian:</p>
              <p>Tulis atau tempel daftar nama tamu Anda. Satu baris untuk satu tamu.</p>
              <p className="font-mono text-[10px] text-stone-500">
                Format: [Nama Tamu], [No WhatsApp]<br/>
                Contoh:<br/>
                Budi Santoso, 08123456789<br/>
                Rian Pratama & Partner, 08522334455<br/>
                Siti Aminah (Keluarga)
              </p>
            </div>

            <textarea
              rows={8}
              placeholder="Masukkan daftar nama tamu di sini..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowBulkModal(false)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAddBulkGuests}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer shadow-md"
              >
                Impor Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEVICE CONTACTS IMPORT MODAL */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-stone-800 text-sm">Pilih dari Kontak & Buku Telepon</h3>
                  <p className="text-[10px] text-stone-400">Pilih satu, semua, atau tambah kontak mandiri Anda</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowContactsModal(false);
                  setSelectedContacts([]);
                }}
                className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Premium Native Contact Button */}
            {typeof navigator !== 'undefined' && 'contacts' in navigator && (
              <button
                type="button"
                onClick={handleNativeContactPicker}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>📱 Ambil dari Kontak HP Asli Saya (Android/iOS)</span>
              </button>
            )}

            {/* Quick Add Form inside Modal */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 space-y-2">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">➕ Tambah Kontak Baru ke Buku Telepon</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Nama Kontak..."
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="No WhatsApp..."
                  value={newContactTel}
                  onChange={(e) => setNewContactTel(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newContactName.trim() || !newContactTel.trim()) {
                      showToast('⚠️ Nama dan No WA wajib diisi!');
                      return;
                    }
                    const newContact = {
                      id: `lc-custom-${Date.now()}`,
                      nama: newContactName.trim(),
                      tel: newContactTel.trim(),
                    };
                    setLocalContacts([newContact, ...localContacts]);
                    setSelectedContacts([...selectedContacts, newContact.tel]);
                    setNewContactName('');
                    setNewContactTel('');
                    showToast(`👤 ${newContact.nama} berhasil disimpan ke Buku Telepon!`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  Simpan
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau nomor di buku telepon..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Select All Toggle Bar */}
              {(() => {
                const filtered = localContacts.filter((c) =>
                  c.nama.toLowerCase().includes(contactSearch.toLowerCase()) ||
                  c.tel.includes(contactSearch)
                );
                const allSelected = filtered.length > 0 && filtered.every((c) => selectedContacts.includes(c.tel));

                return (
                  <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => handleSelectAllContacts(filtered)}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                      />
                      <span>Pilih Semua Kontak ({filtered.length})</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-semibold">
                      {selectedContacts.length} Terpilih
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Contact Items List */}
            <div className="divide-y divide-stone-100 max-h-[220px] overflow-y-auto border border-stone-200 rounded-2xl">
              {(() => {
                const filtered = localContacts.filter((c) =>
                  c.nama.toLowerCase().includes(contactSearch.toLowerCase()) ||
                  c.tel.includes(contactSearch)
                );

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-stone-400">
                      Buku telepon kosong atau tidak ditemukan
                    </div>
                  );
                }

                return filtered.map((contact) => {
                  const isChecked = selectedContacts.includes(contact.tel);
                  const isAlreadyInvited = isPhoneAlreadyInvited(contact.tel);
                  return (
                    <div
                      key={contact.id}
                      className={`flex items-center justify-between p-3 transition-colors text-xs ${
                        isAlreadyInvited ? 'bg-stone-50/70 text-stone-400' : 'hover:bg-stone-50/50'
                      }`}
                    >
                      <label className={`flex items-center gap-2.5 flex-1 select-none ${isAlreadyInvited ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          checked={isAlreadyInvited ? false : isChecked}
                          disabled={isAlreadyInvited}
                          onChange={() => handleToggleContact(contact.tel)}
                          className={`rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 ${
                            isAlreadyInvited ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold block ${isAlreadyInvited ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                              {contact.nama}
                            </span>
                            {isAlreadyInvited && (
                              <span className="bg-stone-200/80 text-stone-500 font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                                Sudah Diundang
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400 block font-mono">{contact.tel}</span>
                        </div>
                      </label>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isAlreadyInvited}
                          onClick={() => {
                            if (isAlreadyInvited) return;
                            setGuestName(contact.nama);
                            setWhatsApp(contact.tel);
                            setShowContactsModal(false);
                            showToast(`✍️ Mengisi formulir dengan: ${contact.nama}`);
                          }}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                            isAlreadyInvited
                              ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer'
                          }`}
                        >
                          Pilih
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLocalContacts(localContacts.filter((c) => c.id !== contact.id));
                            setSelectedContacts(selectedContacts.filter((t) => t !== contact.tel));
                            showToast('🗑️ Kontak dihapus dari Buku Telepon');
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus dari Buku Telepon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setShowContactsModal(false);
                  setSelectedContacts([]);
                }}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleImportMockContacts(false)}
                disabled={selectedContacts.length === 0}
                className="bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 text-xs px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-center"
              >
                Impor Saja ({selectedContacts.length})
              </button>
              <button
                type="button"
                onClick={() => handleImportMockContacts(true)}
                disabled={selectedContacts.length === 0}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white disabled:text-stone-500 text-xs px-5 py-2.5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md text-center active:scale-95"
              >
                <Send className="w-3 h-3 text-white" />
                <span>Impor & Kirim WA ({selectedContacts.length})</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QR Code & Printable Card Modal */}
      {isQRCardModalOpen && (
        <InvitationQRCardModal
          isOpen={isQRCardModalOpen}
          invitation={invitation}
          defaultGuestName={qrCardTargetGuest}
          onClose={() => setIsQRCardModalOpen(false)}
        />
      )}
    </div>
  );
};
