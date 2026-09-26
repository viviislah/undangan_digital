import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerThemePreviewView } from './components/CustomerThemePreviewView';
import { LandingPageView } from './views/LandingPageView';
import { DashboardView } from './views/DashboardView';
import { WizardView } from './views/WizardView';
import { EditorView } from './views/EditorView';
import { CustomerAdminView } from './views/CustomerAdminView';
import { InvitationPublicView } from './components/InvitationPublicView';
import {
  InvitationData,
  TemplateDefinition,
  AttendanceStatus,
} from './types/invitation';
import {
  getStoredInvitations,
  saveInvitationToStorage,
  deleteInvitationFromStorage,
  deleteAllDraftsFromStorage,
  deleteAllInvitationsFromStorage,
  loadSampleInvitationsToStorage,
  findInvitationBySlugOrId,
  fetchInvitationBySlugOrIdAsync,
  syncAllInvitationsFromServer,
  addRSVPToInvitation,
  submitRSVPAsync,
  submitRSVPReplyAsync,
  deduplicateRSVPList,
  incrementViewCount,
} from './services/storageService';
import { ArrowLeft, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'wizard' | 'editor' | 'fullscreen' | 'public' | 'customer-admin' | 'customer-theme-preview'>('landing');
  const [customerPreviewThemeId, setCustomerPreviewThemeId] = useState<string>('elegant-gold');
  const [activeInvitation, setActiveInvitation] = useState<InvitationData | null>(null);
  const [wizardTemplate, setWizardTemplate] = useState<TemplateDefinition | undefined>(undefined);

  // Hash-based public invitation state
  const [publicInvitation, setPublicInvitation] = useState<InvitationData | null>(null);
  const [guestNameParam, setGuestNameParam] = useState<string>('Tamu Undangan');

  // Initial load
  useEffect(() => {
    const loaded = getStoredInvitations();
    setInvitations(loaded);

    syncAllInvitationsFromServer().then((synced) => {
      if (synced && synced.length > 0) {
        setInvitations(synced);
      }
    });

    // Check URL hash for direct guest invitation link: #invite/:slug or ?to=...
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#invite/')) {
        const fullHash = hash.replace('#invite/', '');
        // Check if query params exist in hash, e.g. "slug&to=Nama" or "slug?to=Nama"
        let slug = fullHash;
        let guestName = 'Bapak / Ibu Tamu Terhormat';

        if (fullHash.includes('&to=')) {
          const rawTo = fullHash.split('&to=')[1].split('&')[0];
          slug = fullHash.split('&to=')[0];
          guestName = decodeURIComponent(rawTo);
        } else if (fullHash.includes('?to=')) {
          const rawTo = fullHash.split('?to=')[1].split('&')[0];
          slug = fullHash.split('?to=')[0];
          guestName = decodeURIComponent(rawTo);
        } else if (fullHash.includes('&')) {
          slug = fullHash.split('&')[0];
        } else if (fullHash.includes('?')) {
          slug = fullHash.split('?')[0];
        }

        const openInvitation = (inv: InvitationData) => {
          let updatedGuests = inv.guests || [];
          let wasUpdated = false;
          const cleanGuestName = (guestName || '').trim();

          if (cleanGuestName && cleanGuestName !== 'Bapak / Ibu Tamu Terhormat' && cleanGuestName !== 'Tamu Undangan') {
            updatedGuests = updatedGuests.map((g) => {
              if (g.nama.toLowerCase().trim() === cleanGuestName.toLowerCase() && g.statusUndangan !== 'opened') {
                wasUpdated = true;
                return { ...g, statusUndangan: 'opened' as any };
              }
              return g;
            });
          }

          if (wasUpdated) {
            inv.guests = updatedGuests;
            saveInvitationToStorage(inv, true);
            const currentList = getStoredInvitations();
            setInvitations(currentList);
          }

          setPublicInvitation(inv);
          setGuestNameParam(guestName);
          setCurrentView('public');
          incrementViewCount(inv.id);
        };

        const found = findInvitationBySlugOrId(slug);
        if (found) {
          openInvitation(found);
        }

        // Always fetch from server so mobile phone gets the exact custom music URL saved from PC
        fetchInvitationBySlugOrIdAsync(slug).then((serverInv) => {
          if (serverInv) {
            openInvitation(serverInv);
          }
        });
      } else if (hash.startsWith('#manage/')) {
        const slug = hash.replace('#manage/', '');
        const found = findInvitationBySlugOrId(slug);
        if (found) {
          setActiveInvitation(found);
          setCurrentView('customer-admin');
        }
      } else if (hash.startsWith('#theme/') || hash.startsWith('#preview-theme/')) {
        const themeId = hash.startsWith('#theme/')
          ? hash.replace('#theme/', '')
          : hash.replace('#preview-theme/', '');
        setCustomerPreviewThemeId(themeId || 'elegant-gold');
        setCurrentView('customer-theme-preview');
      } else if (hash === '#katalog' || hash === '#templates') {
        setCurrentView('landing');
        setTimeout(() => {
          document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else if (hash === '' && (currentView === 'public' || currentView === 'customer-admin' || currentView === 'customer-theme-preview')) {
        setCurrentView('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handlers
  const handleStartNewInvitation = (template?: TemplateDefinition) => {
    setWizardTemplate(template);
    setCurrentView('wizard');
  };

  const handleFinishWizard = (newInv: InvitationData) => {
    const updatedList = saveInvitationToStorage(newInv, true, (syncedInv) => {
      setActiveInvitation(syncedInv);
    });
    setInvitations(updatedList);
    setActiveInvitation(newInv);
    setCurrentView('editor');
  };

  const handleEditInvitation = (inv: InvitationData) => {
    setActiveInvitation(inv);
    setCurrentView('editor');
  };

  const handleSaveFromEditor = (updatedInv: InvitationData) => {
    const updatedList = saveInvitationToStorage(updatedInv, true, (syncedInv) => {
      setActiveInvitation(syncedInv);
    });
    setInvitations(updatedList);
    setActiveInvitation(updatedInv);
  };

  const handleDeleteInvitation = (id: string) => {
    const remaining = deleteInvitationFromStorage(id);
    setInvitations(remaining);
  };

  const handleDeleteAllDrafts = () => {
    const remaining = deleteAllDraftsFromStorage();
    setInvitations(remaining);
  };

  const handleDeleteAllInvitations = () => {
    const remaining = deleteAllInvitationsFromStorage();
    setInvitations(remaining);
  };

  const handleLoadSampleInvitations = () => {
    const samples = loadSampleInvitationsToStorage();
    setInvitations(samples);
  };

  const handlePreviewFullscreen = (inv: InvitationData) => {
    setActiveInvitation(inv);
    setCurrentView('fullscreen');
  };

  const handleAddPublicRSVP = (rsvp: {
    nama: string;
    status: AttendanceStatus;
    jumlahTamu: number;
    pesanDoa: string;
  }) => {
    if (publicInvitation) {
      const invId = publicInvitation.id || publicInvitation.slug;
      submitRSVPAsync(invId, rsvp).then(({ rsvpList }) => {
        const cleanList = deduplicateRSVPList(rsvpList);
        setPublicInvitation((prev) => (prev ? { ...prev, rsvpList: cleanList } : prev));
        setInvitations((prev) =>
          prev.map((item) =>
            item.id === publicInvitation.id || item.slug === publicInvitation.slug
              ? { ...item, rsvpList: cleanList }
              : item
          )
        );
      });
    }
  };

  const handleAddPublicRSVPReply = (rsvpId: string, reply: { nama: string; pesan: string; isHost?: boolean }) => {
    if (publicInvitation) {
      const invId = publicInvitation.id || publicInvitation.slug;
      submitRSVPReplyAsync(invId, rsvpId, reply).then(({ rsvpList }) => {
        const cleanList = deduplicateRSVPList(rsvpList);
        setPublicInvitation((prev) => (prev ? { ...prev, rsvpList: cleanList } : prev));
        setInvitations((prev) =>
          prev.map((item) =>
            item.id === publicInvitation.id || item.slug === publicInvitation.slug
              ? { ...item, rsvpList: cleanList }
              : item
          )
        );
      });
    }
  };

  // 1. PUBLIC GUEST VIEW (Opened via WhatsApp link e.g. #invite/:slug)
  if (currentView === 'public' && publicInvitation) {
    return (
      <div className="min-h-screen bg-stone-900 flex justify-center">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative">
          <InvitationPublicView
            invitation={publicInvitation}
            guestName={guestNameParam}
            onAddRSVP={handleAddPublicRSVP}
            onAddRSVPReply={handleAddPublicRSVPReply}
          />
        </div>
      </div>
    );
  }

  // 2. FULLSCREEN PREVIEW (Creator testing their invitation)
  if (currentView === 'fullscreen' && activeInvitation) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-start relative">
        {/* Floating Top Control */}
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setCurrentView('editor')}
            className="px-4 py-2 rounded-full bg-black/75 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Editor</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative">
          <InvitationPublicView
            invitation={activeInvitation}
            guestName="Bapak / Ibu Tamu Terhormat"
          />
        </div>
      </div>
    );
  }

  // 2.5. CUSTOMER ADMIN SELF-SERVICE VIEW
  if (currentView === 'customer-admin' && activeInvitation) {
    return (
      <CustomerAdminView
        invitation={activeInvitation}
        onSave={handleSaveFromEditor}
        onBackToDashboard={() => setCurrentView('dashboard')}
      />
    );
  }

  // 2.7. CUSTOMER THEME PREVIEW VIEW (Prospective client previewing theme to order)
  if (currentView === 'customer-theme-preview') {
    return (
      <CustomerThemePreviewView
        templateId={customerPreviewThemeId}
        onSelectAnotherTheme={(newThemeId) => {
          window.location.hash = `#theme/${newThemeId}`;
          setCustomerPreviewThemeId(newThemeId);
        }}
      />
    );
  }

  // 3. EDITOR VIEW
  if (currentView === 'editor' && activeInvitation) {
    return (
      <EditorView
        initialInvitation={activeInvitation}
        onSave={handleSaveFromEditor}
        onBackToDashboard={() => setCurrentView('dashboard')}
        onFullscreenPreview={handlePreviewFullscreen}
      />
    );
  }

  // 4. WIZARD VIEW
  if (currentView === 'wizard') {
    return (
      <WizardView
        initialTemplate={wizardTemplate}
        onFinish={handleFinishWizard}
        onCancel={() => setCurrentView('dashboard')}
      />
    );
  }

  // 5. STANDARD SHELL (NAVBAR + LANDING OR DASHBOARD)
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
        onNewInvitation={() => handleStartNewInvitation()}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <LandingPageView
                onStartNew={(tmpl) => handleStartNewInvitation(tmpl)}
                onGoToDashboard={() => setCurrentView('dashboard')}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <DashboardView
                invitations={invitations}
                onNewInvitation={() => handleStartNewInvitation()}
                onEditInvitation={handleEditInvitation}
                onPreviewInvitation={handlePreviewFullscreen}
                onDeleteInvitation={handleDeleteInvitation}
                onDeleteAllDrafts={handleDeleteAllDrafts}
                onDeleteAllInvitations={handleDeleteAllInvitations}
                onLoadSampleInvitations={handleLoadSampleInvitations}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
