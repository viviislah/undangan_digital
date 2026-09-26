import { resolveAudioUrl } from './audioStorage';

/**
 * Normalizes Google Drive, Dropbox, and external audio URLs
 * for reliable HTML5 Audio streaming across mobile & desktop browsers.
 */
export function convertDriveUrl(url: string): string {
  if (!url) return '';
  let trimmed = url.trim();

  // If already an IndexedDB reference, return as is
  if (trimmed.startsWith('indexeddb:')) {
    return trimmed;
  }

  // Support relative uploads paths correctly without prepending https://
  if (trimmed.startsWith('/')) {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin + trimmed;
    }
    return trimmed;
  }

  // Ensure valid scheme
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
    trimmed = 'https://' + trimmed;
  }

  // Google Drive format conversions
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = (fileDMatch && fileDMatch[1]) || (idParamMatch && idParamMatch[1]);

    if (fileId) {
      // Use local server proxy route for 100% mobile compatibility, bypassing iOS/Android download prompts
      return `/api/proxy-audio?id=${fileId}`;
    }
  }

  // Dropbox direct streaming conversions
  if (trimmed.includes('dropbox.com')) {
    let cleanDropbox = trimmed
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '?raw=1')
      .replace('&dl=0', '&raw=1');
    if (!cleanDropbox.includes('raw=1') && !cleanDropbox.includes('dl=1')) {
      cleanDropbox += cleanDropbox.includes('?') ? '&raw=1' : '?raw=1';
    }
    return cleanDropbox;
  }

  return trimmed;
}

class RomanticAudioEngine {
  private isPlaying: boolean = false;
  private htmlAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private pendingInteractionPlay: (() => void) | null = null;

  /**
   * Main Play function:
   * Streams the exact URL or uploaded file chosen by the user.
   * Completely excludes synthetic melody presets.
   */
  public async play(_trackId?: string, audioUrl?: string) {
    this.pause();

    const targetUrl = (audioUrl || '').trim();

    if (!targetUrl) {
      console.info('Tidak ada URL musik latar yang dikonfigurasi.');
      this.isPlaying = false;
      return;
    }

    try {
      const resolvedUrl = await resolveAudioUrl(targetUrl);
      const streamUrl = convertDriveUrl(resolvedUrl);

      if (!this.htmlAudio || this.currentAudioUrl !== streamUrl) {
        if (this.htmlAudio) {
          this.htmlAudio.pause();
          this.htmlAudio.src = '';
        }
        this.htmlAudio = new Audio(streamUrl);
        this.htmlAudio.loop = true;
        this.htmlAudio.preload = 'auto';
        this.currentAudioUrl = streamUrl;
      }

      this.isPlaying = true;

      const playPromise = this.htmlAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Pemutaran audio menunggu interaksi ketuk/sentuh pengguna (kebijakan browser HP):', err);

          // If mobile browser autoplay policy blocks, resume immediately on user's first tap
          if (this.pendingInteractionPlay) {
            window.removeEventListener('click', this.pendingInteractionPlay);
            window.removeEventListener('touchstart', this.pendingInteractionPlay);
          }

          this.pendingInteractionPlay = () => {
            if (this.htmlAudio && this.isPlaying) {
              this.htmlAudio.play().catch((e) => console.warn('Gagal memutar audio setelah interaksi:', e));
            }
            if (this.pendingInteractionPlay) {
              window.removeEventListener('click', this.pendingInteractionPlay);
              window.removeEventListener('touchstart', this.pendingInteractionPlay);
              this.pendingInteractionPlay = null;
            }
          };

          window.addEventListener('click', this.pendingInteractionPlay, { once: true, passive: true });
          window.addEventListener('touchstart', this.pendingInteractionPlay, { once: true, passive: true });
        });
      }
    } catch (err) {
      console.error('Kesalahan pemutaran audio URL:', err);
    }
  }

  public pause() {
    this.isPlaying = false;

    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }

    if (this.pendingInteractionPlay) {
      window.removeEventListener('click', this.pendingInteractionPlay);
      window.removeEventListener('touchstart', this.pendingInteractionPlay);
      this.pendingInteractionPlay = null;
    }
  }

  public toggle(_trackId?: string, audioUrl?: string): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play(_trackId, audioUrl);
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public setVolume(vol: number) {
    if (this.htmlAudio) {
      this.htmlAudio.volume = Math.max(0, Math.min(1, vol));
    }
  }
}

export const romanticAudio = new RomanticAudioEngine();
