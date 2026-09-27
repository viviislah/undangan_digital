/**
 * Helper to construct robust public URLs for invitations, theme previews, and admin panels.
 * Works seamlessly across:
 * 1. GitHub Pages (automatically preserves subpaths like /repo-name/)
 * 2. Google AI Studio Cloud Run (maps authenticated ais-dev- to public ais-pre- for guests)
 * 3. Custom domains and local development
 */

export function getBaseAppUrl(): string {
  if (typeof window === 'undefined') return '';

  let origin = window.location.origin;

  // Convert AI Studio development domain to public shared preview domain
  // so external customers can open invitations without logging into Google Cloud / AI Studio
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }

  // Determine subpath (crucial for GitHub Pages repositories like https://user.github.io/wedding-app/)
  let pathname = window.location.pathname || '/';

  // Strip single-page application routes if currently on /manage/..., /invite/..., etc.
  pathname = pathname.replace(/\/(?:manage|invite|undangan|view|theme|preview-theme)(?:\/.*)?$/i, '');

  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }
  if (!pathname.endsWith('/')) {
    pathname = pathname + '/';
  }

  return `${origin}${pathname}`;
}

export function getInvitationPublicUrl(slugOrId: string, guestName?: string): string {
  const base = getBaseAppUrl();
  const cleanSlug = (slugOrId || '').toLowerCase().trim().split('?')[0].split('&')[0].replace(/^\/+|\/+$/g, '');
  const guestParam = guestName && guestName.trim() ? `?to=${encodeURIComponent(guestName.trim())}` : '';
  return `${base}#invite/${cleanSlug}${guestParam}`;
}

export function getCustomerAdminUrl(slugOrId: string): string {
  const base = getBaseAppUrl();
  const cleanSlug = (slugOrId || '').toLowerCase().trim().split('?')[0].split('&')[0].replace(/^\/+|\/+$/g, '');
  return `${base}#manage/${cleanSlug}`;
}

export function getThemePreviewUrl(themeId: string): string {
  const base = getBaseAppUrl();
  const cleanThemeId = (themeId || 'elegant-gold').trim().replace(/^\/+|\/+$/g, '');
  return `${base}#theme/${cleanThemeId}`;
}
