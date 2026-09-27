import React, { useState, useEffect, useCallback } from 'react';
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
import { ArrowLeft, Sparkles, X, HeartHandshake, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParsedRoute {
  view: 'landing' | 'dashboard' | 'wizard' | 'editor' | 'fullscreen' | 'public' | 'customer-admin' | 'customer-theme-preview';
  slug?: string;
  guestName?: string;
  themeId?: string;
}

function parseCurrentRoute(): ParsedRoute {
  if (typeof window === 'undefined') return { view: 'landing' };

  const hash = window.location.hash || '';
  const pathname = window.location.pathname || '';
  const search = window.location.search || '';
  const params = new URLSearchParams(search);

  // Helper to extract query parameter (e.g. to=, guest=, nama=) safely
  const extractGuestName = (str: string): string => {
    try {
      if (params.get('to')) return params.get('to')!.replace(/\+/g, ' ').trim();
      if (params.get('guest')) return params.get('guest')!.replace(/\+/g, ' ').trim();
      if (params.get('nama')) return params.get('nama')!.replace(/\+/g, ' ').trim();

      const toMatch = str.match(/[?&#](?:to|guest|nama)=([^&#]+)/i);
      if (toMatch && toMatch[1]) {
        return decodeURIComponent(toMatch[1].replace(/\+/g, ' ')).trim();
      }
    } catch {
      // fallback
    }
    return 'Bapak / Ibu Tamu Terhormat';
  };

  // Helper to clean slug from slashes, parameters, and fragments
  const cleanSlug = (raw: string): string => {
    return raw
      .split('?')[0]
      .split('&')[0]
      .split('#')[0]
      .replace(/^\/+|\/+$/g, '')
      .trim();
  };

  // 1. Direct invitation link via hash: #invite/, #/invite/, #undangan/, #/undangan/, #view/, #/view/
  const cleanHash = hash.replace(/^#\/?/, ''); // normalizes '#invite/' and '#/invite/' to 'invite/'
  if (
    cleanHash.startsWith('invite/') ||
    cleanHash.startsWith('undangan/') ||
    cleanHash.startsWith('view/')
  ) {
    const prefix = cleanHash.startsWith('invite/')
      ? 'invite/'
      : cleanHash.startsWith('undangan/')
      ? 'undangan/'
      : 'view/';
    const raw = cleanHash.slice(prefix.length);
    const slug = cleanSlug(raw);
    const guest = extractGuestName(hash);
    if (slug) {
      return { view: 'public', slug, guestName: guest };
    }
  }

  // 2. Direct invitation link via path: /invite/:slug or /undangan/:slug or /view/:slug
  const cleanPath = pathname.replace(/^\/+/, '');
  if (
    cleanPath.startsWith('invite/') ||
    cleanPath.startsWith('undangan/') ||
    cleanPath.startsWith('view/')
  ) {
    const prefix = cleanPath.startsWith('invite/')
      ? 'invite/'
      : cleanPath.startsWith('undangan/')
      ? 'undangan/'
      : 'view/';
    const raw = cleanPath.slice(prefix.length);
    const slug = cleanSlug(raw);
    const guest = extractGuestName(search || hash);
    if (slug) {
      return { view: 'public', slug, guestName: guest };
    }
  }

  // 3. Direct invitation query param: ?invite=:slug, ?undangan=:slug, ?slug=:slug
  const queryInvite = params.get('invite') || params.get('undangan') || params.get('slug');
  if (queryInvite) {
    const slug = cleanSlug(queryInvite);
    if (slug) {
      return {
        view: 'public',
        slug,
        guestName: extractGuestName(search || hash),
      };
    }
  }

  // 4. Customer Theme Preview via hash: #theme/:id, #/theme/:id, #preview-theme/:id, #/preview-theme/:id
  if (cleanHash.startsWith('theme/') || cleanHash.startsWith('preview-theme/')) {
    const prefix = cleanHash.startsWith('theme/') ? 'theme/' : 'preview-theme/';
    const raw = cleanHash.slice(prefix.length);
    const rawThemeId = cleanSlug(raw);
    return { view: 'customer-theme-preview', themeId: rawThemeId || 'elegant-gold' };
  }

  // 5. Customer Theme Preview via path: /theme/:id or /preview-theme/:id
  if (cleanPath.startsWith('theme/') || cleanPath.startsWith('preview-theme/')) {
    const prefix = cleanPath.startsWith('theme/') ? 'theme/' : 'preview-theme/';
    const raw = cleanPath.slice(prefix.length);
    const rawThemeId = cleanSlug(raw);
    return { view: 'customer-theme-preview', themeId: rawThemeId || 'elegant-gold' };
  }

  // 6. Customer Admin / Manage: #manage/:slug, #/manage/:slug, /manage/:slug
  if (cleanHash.startsWith('manage/')) {
    const slug = cleanSlug(cleanHash.slice('manage/'.length));
    if (slug) {
      return { view: 'customer-admin', slug };
    }
  }
  if (cleanPath.startsWith('manage/')) {
    const slug = cleanSlug(cleanPath.slice('manage/'.length));
    if (slug) {
      return { view: 'customer-admin', slug };
    }
  }

  // 7. Catalog scroll: #katalog or #templates
  if (cleanHash === 'katalog' || cleanHash === 'templates') {
    return { view: 'landing' };
  }

  return { view: 'landing' };
}

export default function App() {
  const initialRoute = parseCurrentRoute();
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'wizard' | 'editor' | 'fullscreen' | 'public' | 'customer-admin' | 'customer-theme-preview'>(initialRoute.view);
  const [customerPreviewThemeId, setCustomerPreviewThemeId] = useState<string>(initialRoute.themeId || 'elegant-gold');
  const [activeInvitation, setActiveInvitation] = useState<InvitationData | null>(null);
  const [wizardTemplate, setWizardTemplate] = useState<TemplateDefinition | undefined>(undefined);

  // Public invitation state
  const [publicInvitation, setPublicInvitation] = useState<InvitationData | null>(null);
  const [guestNameParam, setGuestNameParam] = useState<string>(initialRoute.guestName || 'Bapak / Ibu Tamu Terhormat');
  const [isLoadingPublicInvitation, setIsLoadingPublicInvitation] = useState<boolean>(initialRoute.view === 'public');

  // Load public invitation by slug
  const loadPublicInvitation = useCallback((slug: string, guestName?: string) => {
    if (!slug) {
      setIsLoadingPublicInvitation(false);
      return;
    }

    setIsLoadingPublicInvitation(true);
    const targetGuest = guestName || 'Bapak / Ibu Tamu Terhormat';
    setGuestNameParam(targetGuest);

    const applyInvitation = (inv: InvitationData) => {
      let updatedGuests = inv.guests || [];
      let wasUpdated = false;
      const cleanGuestName = targetGuest.trim();

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
      setIsLoadingPublicInvitation(false);
      setCurrentView('public');
      incrementViewCount(inv.id);
    };

    // 1. Instant local lookup
    const localFound = findInvitationBySlugOrId(slug);
    if (localFound) {
      applyInvitation(localFound);
    }

    // 2. Fetch from server so cross-device and latest updates apply
    fetchInvitationBySlugOrIdAsync(slug)
      .then((serverInv) => {
        if (serverInv) {
          applyInvitation(serverInv);
        } else if (!localFound) {
          setIsLoadingPublicInvitation(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch public invitation:', err);
        if (!localFound) {
          setIsLoadingPublicInvitation(false);
        }
      });
  }, []);

  // Initial load and URL routing listener
  useEffect(() => {
    const loaded = getStoredInvitations();
    setInvitations(loaded);

    syncAllInvitationsFromServer().then((synced) => {
      if (synced && synced.length > 0) {
        setInvitations(synced);
      }
    });

    const handleRouteChange = () => {
      const route = parseCurrentRoute();

      if (route.view === 'public' && route.slug) {
        loadPublicInvitation(route.slug, route.guestName);
      } else if (route.view === 'customer-admin' && route.slug) {
        const found = findInvitationBySlugOrId(route.slug);
        if (found) {
          setActiveInvitation(found);
          setCurrentView('customer-admin');
        } else {
          fetchInvitationBySlugOrIdAsync(route.slug).then((serverInv) => {
            if (serverInv) {
              setActiveInvitation(serverInv);
              setCurrentView('customer-admin');
            }
          });
        }
      } else if (route.view === 'customer-theme-preview') {
        setCustomerPreviewThemeId(route.themeId || 'elegant-gold');
        setCurrentView('customer-theme-preview');
      } else if (route.view === 'landing') {
        const hash = window.location.hash;
        if (hash === '#katalog' || hash === '#templates') {
          setCurrentView('landing');
          setTimeout(() => {
            document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else if (hash === '' || hash === '#') {
          setCurrentView('landing');
        }
      }
    };

    // If initial load targeted a public invitation, fetch it now
    if (initialRoute.view === 'public' && initialRoute.slug) {
      loadPublicInvitation(initialRoute.slug, initialRoute.guestName);
    } else if (initialRoute.view === 'customer-admin' && initialRoute.slug) {
      handleRouteChange();
    }

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [loadPublicInvitation]);

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

  // 1. PUBLIC GUEST VIEW (Opened via WhatsApp link e.g. #invite/:slug or /invite/:slug)
  if (currentView === 'public') {
    if (isLoadingPublicInvitation && !publicInvitation) {
      return (
        <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-stone-300 text-sm font-medium tracking-wide">
            Membuka Undangan Digital...
          </p>
          <p className="text-stone-500 text-xs mt-1">
            Mohon tunggu sebentar
          </p>
        </div>
      );
    }

    if (publicInvitation) {
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

    // Invitation Not Found fallback screen (never falls back to the builder website!)
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif-display text-2xl font-bold text-stone-900">
              Undangan Tidak Ditemukan
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Mohon maaf, tautan undangan pernikahan ini tidak ditemukan atau belum dipublikasikan. Silakan hubungi pengantin atau vendor untuk mendapatkan tautan terbaru.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              onClick={() => {
                window.location.hash = '';
                window.location.pathname = '/';
                setCurrentView('landing');
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Buka Halaman Utama</span>
            </button>
          </div>
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
