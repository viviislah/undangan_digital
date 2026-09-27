import { InvitationData } from '../types/invitation';

/**
 * Returns the reliable public base URL for sharing with customers and guests.
 * In AI Studio environments, dev URLs (ais-dev-) require author authentication,
 * whereas preview URLs (ais-pre-) are publicly accessible by any external guest/phone.
 */
export function getPublicBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;

  // Convert private AI Studio dev preview URL to public shared preview URL
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }

  // Ensure no trailing slash
  return origin.replace(/\/$/, '');
}

/**
 * Builds the canonical public URL for an invitation that works reliably across
 * mobile browsers, WhatsApp in-app browser, Safari, and Chrome.
 */
export function getInvitationPublicUrl(
  invitationOrSlug: InvitationData | string,
  guestName?: string
): string {
  const base = getPublicBaseUrl();
  const slug = typeof invitationOrSlug === 'string'
    ? invitationOrSlug
    : (invitationOrSlug.slug || invitationOrSlug.id);

  const cleanSlug = encodeURIComponent(slug).replace(/%20/g, '-');
  const cleanGuest = (guestName || '').trim();

  // We use the universally supported hash route format: /#invite/slug
  // with query param ?to=Nama
  if (cleanGuest && cleanGuest !== 'Bapak / Ibu Tamu Terhormat' && cleanGuest !== 'Tamu Undangan' && cleanGuest !== 'Bpk/Ibu/Saudara/i') {
    return `${base}/#invite/${cleanSlug}?to=${encodeURIComponent(cleanGuest)}`;
  }

  return `${base}/#invite/${cleanSlug}`;
}
