import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerThemePreviewView } from './components/CustomerThemePreviewView';
import { LandingPageView } from './views/LandingPageView';
import { DashboardView } from './views/DashboardView';
import { WizardView } from './views/WizardView';
import { EditorView } from './views/EditorView';
import { CustomerAdminView } from './views/CustomerAdminView';
import { InvitationPublicView } from './components/InvitationPublicView';
import { InvitationErrorBoundary } from './components/InvitationErrorBoundary';
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
  source?: 'hash' | 'path' | 'query' | 'default';
}

/**
 * Robust helper to extract a URL parameter from window.location.search,
 * window.location.hash query portion, or full URL string.
 */
export function extractUrlParam(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const search = window.location.search || '';
  const hash = window.location.hash || '';

  // 1. Check window.location.search
  try {
    const sp = new URLSearchParams(search);
    const val = sp.get(name);
    if (val !== null && val.trim() !== '') return val.replace(/\+/g, ' ').trim();
  } catch {}

  // 2. Check query string inside hash (#invite/slug?to=...)
  try {
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
      const hp = new URLSearchParams(hash.slice(qIdx));
      const val = hp.get(name);
      if (val !== null && val.trim() !== '') return val.replace(/\+/g, ' ').trim();
    }
  } catch {}

  // 3. Fallback regex searching across search and hash (e.g. &to= or ?to=)
  try {
    const combined = `${search}&${hash}`;
    const pattern = new RegExp(`[?&#]${name}=([^&#]+)`, 'i');
    const match = combined.match(pattern);
    if (match && match[1]) {
      return decodeURIComponent(match[1].replace(/\+/g, ' ')).trim();
    }
  } catch {}

  return null;
}

/**
 * Extracts personalized guest name from any URL parameter (to, guest, nama, for).
 */
export function extractGuestName(): string {
  const paramVal =
    extractUrlParam('to') ||
    extractUrlParam('guest') ||
    extractUrlParam('nama') ||
    extractUrlParam('for');

  if (paramVal && paramVal.trim() !== '') {
    return paramVal.trim();
  }
  return 'Bapak / Ibu Tamu Terhormat';
}

/**
 * Clean slug string safely, removing slashes, query parameters, and fragments.
 */
export function cleanSlug(raw: string): string {
  if (!raw) return '';
  let cleaned = raw;
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {}

  return cleaned
    .split('?')[0]
    .split('&')[0]
    .split('#')[0]
    .replace(/^\/+|\/+$/g, '')
    .trim()
    .toLowerCase();
}

function parseCurrentRoute(): ParsedRoute {
  if (typeof window === 'undefined') return { view: 'landing' };

  const rawHash = window.location.hash || '';
  const pathname = window.location.pathname || '';
  const search = window.location.search || '';

  // Normalize hash variations: #/invite/, #!/invite/, #invite/, #//invite/
  const cleanHash = rawHash.replace(/^#[!/]+/, '');

  // 1. Direct invitation link via hash: #invite/, #/invite/, #undangan/, #/undangan/, #view/, #/view/
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
    const guest = extractGuestName();
    if (slug) {
      return { view: 'public', slug, guestName: guest, source: 'hash' };
    }
  }

  // 2. Direct invitation link via pathname: /invite/:slug or /undangan/:slug or /view/:slug
  // Supports subpaths on GitHub Pages, e.g. /vhistetic-undangan/invite/:slug
  const pathMatch = pathname.match(/\/(?:invite|undangan|view)\/([^/?#&]+)/i);
  if (pathMatch && pathMatch[1]) {
    const slug = cleanSlug(pathMatch[1]);
    const guest = extractGuestName();
    if (slug) {
      return { view: 'public', slug, guestName: guest, source: 'path' };
    }
  }

  // 3. Direct invitation query param: ?invite=:slug, ?undangan=:slug, ?slug=:slug
  const queryInvite = extractUrlParam('invite') || extractUrlParam('undangan') || extractUrlParam('slug');
  if (queryInvite) {
    const slug = cleanSlug(queryInvite);
    if (slug) {
      return { view: 'public', slug, guestName: extractGuestName(), source: 'query' };
    }
  }

  // 4. Customer Theme Preview via hash: #theme/:id, #/theme/:id, #preview-theme/:id, #/preview-theme/:id
  if (cleanHash.startsWith('theme/') || cleanHash.startsWith('preview-theme/')) {
    const prefix = cleanHash.startsWith('theme/') ? 'theme/' : 'preview-theme/';
    const raw = cleanHash.slice(prefix.length);
    const rawThemeId = cleanSlug(raw);
    return { view: 'customer-theme-preview', themeId: rawThemeId || 'elegant-gold', source: 'hash' };
  }

  // 5. Customer Theme Preview via path: /theme/:id or /preview-theme/:id (supports subpaths)
  const themeMatch = pathname.match(/\/(?:theme|preview-theme)\/([^/?#&]+)/i);
  if (themeMatch && themeMatch[1]) {
    const rawThemeId = cleanSlug(themeMatch[1]);
    return { view: 'customer-theme-preview', themeId: rawThemeId || 'elegant-gold', source: 'path' };
  }

  // 6. Customer Admin / Manage: #manage/:slug, #/manage/:slug, /manage/:slug
  if (cleanHash.startsWith('manage/')) {
    const slug = cleanSlug(cleanHash.slice('manage/'.length));
    if (slug) {
      return { view: 'customer-admin', slug, source: 'hash' };
    }
  }
  const manageMatch = pathname.match(/\/manage\/([^/?#&]+)/i);
  if (manageMatch && manageMatch[1]) {
    const slug = cleanSlug(manageMatch[1]);
    if (slug) {
      return { view: 'customer-admin', slug, source: 'path' };
    }
  }

  // 7. Catalog scroll: #katalog or #templates
  if (cleanHash === 'katalog' || cleanHash === 'templates') {
    return { view: 'landing', source: 'hash' };
  }

  return { view: 'landing', source: 'default' };
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

  // Load public invitation by slug with comprehensive diagnostic logging
  const loadPublicInvitation = useCallback((slug: string, guestName?: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    console.log(`[InvitationRouter ${timestamp}] >>> loadPublicInvitation called`, {
      requestedSlug: slug,
      guestNameArg: guestName,
      currentHref: typeof window !== 'undefined' ? window.location.href : '',
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      search: typeof window !== 'undefined' ? window.location.search : '',
    });

    if (!slug) {
      console.warn(`[InvitationRouter ${timestamp}] loadPublicInvitation aborted: slug is empty.`);
      setIsLoadingPublicInvitation(false);
      return;
    }

    setIsLoadingPublicInvitation(true);
    const targetGuest = (guestName && guestName.trim() !== '') ? guestName.trim() : extractGuestName();
    console.log(`[InvitationRouter ${timestamp}] Resolved target guest name: "${targetGuest}"`);
    setGuestNameParam(targetGuest);

    const applyInvitation = (inv: InvitationData, source: 'local' | 'network' | 'preseeded') => {
      console.log(`[InvitationRouter ${timestamp}] Applying invitation data into state from source: "${source}":`, {
        id: inv.id,
        slug: inv.slug,
        title: inv.title,
        isPublished: inv.isPublished,
        themeId: inv.theme?.templateId,
        eventsCount: inv.events?.length || 0,
        photosCount: inv.gallery?.length || 0,
        rsvpCount: inv.rsvpList?.length || 0,
      });

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
        console.log(`[InvitationRouter ${timestamp}] Guest "${cleanGuestName}" marked as opened. Saving to storage.`);
        inv.guests = updatedGuests;
        saveInvitationToStorage(inv, true);
        const currentList = getStoredInvitations();
        setInvitations(currentList);
      }

      setPublicInvitation(inv);
      setIsLoadingPublicInvitation(false);
      setCurrentView('public');
      incrementViewCount(inv.id);
      console.log(`[InvitationRouter ${timestamp}] SUCCESS: InvitationPublicView rendered successfully for slug: "${slug}"`);
    };

    // Step 1: Instant local lookup (Memory, LocalStorage, Bundled Preseeded data)
    console.log(`[InvitationRouter ${timestamp}] Step 1: Performing instant local lookup for slug: "${slug}"...`);
    const localFound = findInvitationBySlugOrId(slug);
    if (localFound) {
      console.log(`[InvitationRouter ${timestamp}] Step 1 SUCCESS: Found invitation locally: "${localFound.title}" (slug: ${localFound.slug})`);
      applyInvitation(localFound, 'local');
    } else {
      const stored = getStoredInvitations();
      console.log(`[InvitationRouter ${timestamp}] Step 1 NOTICE: Not in local storage. Available stored slugs: [${stored.map((i) => i.slug).join(', ')}]`);
    }

    // Step 2: Async server / static JSON lookup (Cross-device persistence & GitHub Pages static bundle)
    console.log(`[InvitationRouter ${timestamp}] Step 2: Fetching invitation asynchronously from server / static endpoints...`);
    fetchInvitationBySlugOrIdAsync(slug)
      .then((serverInv) => {
        if (serverInv) {
          console.log(`[InvitationRouter ${timestamp}] Step 2 SUCCESS: Server / static fetch found: "${serverInv.title}" (slug: ${serverInv.slug})`);
          applyInvitation(serverInv, 'network');
        } else if (!localFound) {
          console.warn(`[InvitationRouter ${timestamp}] Step 2 FAILED: Invitation for slug "${slug}" not found on server or static storage.`);
          setIsLoadingPublicInvitation(false);
        } else {
          console.log(`[InvitationRouter ${timestamp}] Step 2 COMPLETE: Server fetch returned nothing new, keeping locally resolved invitation.`);
        }
      })
      .catch((err) => {
        console.error(`[InvitationRouter ${timestamp}] Step 2 ERROR: Network fetch failed for slug "${slug}":`, err);
        if (!localFound) {
          setIsLoadingPublicInvitation(false);
        }
      });
  }, []);

  // Initial load and URL routing listener
  useEffect(() => {
    const loaded = getStoredInvitations();
    setInvitations(loaded);
    console.log('[InvitationRouter] Root useEffect mounted. Loaded stored invitations:', loaded.length);

    syncAllInvitationsFromServer()
      .then((synced) => {
        console.log('[InvitationRouter] syncAllInvitationsFromServer finished. Count:', synced?.length || 0);
        if (synced && synced.length > 0) {
          setInvitations(synced);
          const currentRoute = parseCurrentRoute();
          if (currentRoute.view === 'public' && currentRoute.slug) {
            console.log('[InvitationRouter] Background sync complete. Re-evaluating public route for slug:', currentRoute.slug);
            loadPublicInvitation(currentRoute.slug, currentRoute.guestName);
          }
        }
      })
      .catch((err) => {
        console.warn('[InvitationRouter] Background sync warning:', err);
      });

    const handleRouteChange = () => {
      const route = parseCurrentRoute();
      console.log('[InvitationRouter] handleRouteChange triggered:', route);

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
      console.log('[InvitationRouter] Initial route is public view. Triggering loadPublicInvitation:', initialRoute);
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
        <InvitationErrorBoundary
          fallbackSlug={publicInvitation.slug || publicInvitation.id}
          onReset={() => {
            loadPublicInvitation(publicInvitation.slug || publicInvitation.id, guestNameParam);
          }}
        >
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
        </InvitationErrorBoundary>
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
          <div className="pt-2 flex flex-col gap-2.5 justify-center">
            {(() => {
              const available = getStoredInvitations().find((i) => i.isPublished);
              if (available) {
                return (
                  <button
                    onClick={() => {
                      loadPublicInvitation(available.slug || available.id);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Buka Undangan ({available.mempelaiPria.namaPanggilan} & {available.mempelaiWanita.namaPanggilan})</span>
                  </button>
                );
              }
              return null;
            })()}

            <button
              onClick={() => {
                window.location.hash = '';
                window.location.pathname = '/';
                setCurrentView('landing');
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all active:scale-95 cursor-pointer border border-stone-200"
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
