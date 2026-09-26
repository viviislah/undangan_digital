import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Upload,
  Link as LinkIcon,
  Volume2,
  FileAudio,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { MusicConfig } from '../types/invitation';
import { romanticAudio } from '../services/audioService';

interface MusicSelectorProps {
  music: MusicConfig;
  onChange: (updated: MusicConfig) => void;
  compact?: boolean;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({
  music,
  onChange,
  compact = false,
}) => {
  // Only 2 source options: 'url' (Link Audio / Google Drive / Dropbox) or 'upload' (Unggah MP3)
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>(
    music.audioUrl && (music.audioUrl.startsWith('data:') || music.audioUrl.startsWith('indexeddb:'))
      ? 'upload'
      : 'url'
  );
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop any audio preview when component unmounts
  useEffect(() => {
    return () => {
      romanticAudio.pause();
    };
  }, []);

  const handleTogglePreview = (audioUrl?: string) => {
    const url = (audioUrl || music.audioUrl || '').trim();
    if (!url) return;

    if (isPlayingPreview) {
      romanticAudio.pause();
      setIsPlayingPreview(false);
    } else {
      romanticAudio.play('custom-preview', url);
      setIsPlayingPreview(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file musik maksimal 10 MB agar undangan dapat dimuat dengan lancar di handphone.');
      return;
    }

    setFileName(file.name);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        ...music,
        title: cleanTitle,
        artist: 'Musik Pribadi',
        audioUrl: dataUrl,
      });
      if (isPlayingPreview) {
        romanticAudio.pause();
        setIsPlayingPreview(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com') || cleanUrl.includes('.')) {
        cleanUrl = 'https://' + cleanUrl;
      }
    }
    onChange({
      ...music,
      audioUrl: cleanUrl,
      title: music.title || 'Lagu Pernikahan',
      artist: music.artist || 'Musik Pilihan',
    });
    if (isPlayingPreview) {
      romanticAudio.pause();
      setIsPlayingPreview(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Master Toggle */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Aktifkan Musik Latar</h4>
            <p className="text-[11px] text-stone-500">
              Alunan musik pilihan diputar saat tamu membuka undangan
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="toggle-enable-music"
            type="checkbox"
            checked={music.enabled}
            onChange={(e) => {
              const enabled = e.target.checked;
              if (!enabled && isPlayingPreview) {
                romanticAudio.pause();
                setIsPlayingPreview(false);
              }
              onChange({ ...music, enabled });
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
        </label>
      </div>

      {/* Music Configuration Options when enabled */}
      {music.enabled && (
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-stone-200/90 space-y-4 transition-all">
          {/* Source Tabs: URL Musik & Unggah MP3 */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl text-xs font-semibold">
            <button
              id="tab-music-url"
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-stone-900 shadow-sm ring-1 ring-black/5'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Link URL Musik (Drive / Dropbox / MP3)</span>
            </button>

            <button
              id="tab-music-upload"
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-stone-900 shadow-sm ring-1 ring-black/5'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>Unggah File MP3</span>
            </button>
          </div>

          {/* TAB 1: CUSTOM URL LINK (PRIMARY) */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  URL / Tautan File Audio Lagu
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={music.audioUrl || ''}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... atau https://dropbox.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-mono"
                  />
                  {music.audioUrl && music.audioUrl.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleTogglePreview(music.audioUrl)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm ${
                        isPlayingPreview
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {isPlayingPreview ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Berhenti</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Tes Putar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {music.audioUrl && music.audioUrl.trim().length > 0 && (
                  <p className="text-[10px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Tautan audio tersimpan. Lagu ini yang akan diputar saat undangan dibuka di handphone.</span>
                  </p>
                )}

                {/* Petunjuk Penggunaan Link */}
                <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl text-[11px] text-stone-700 mt-3 space-y-2.5">
                  <div>
                    <p className="font-extrabold text-amber-950 flex items-center gap-1">
                      <span>💡 Cara Menggunakan Link Google Drive:</span>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-600 text-[10px] pl-1">
                      <li>Buka file audio lagu di Google Drive Anda.</li>
                      <li>Klik <b>Bagikan (Share)</b> &rarr; ubah Akses Umum menjadi <b>"Siapa saja yang memiliki link"</b> (*Anyone with the link*).</li>
                      <li>Salin link lalu tempelkan ke kolom URL di atas.</li>
                      <li>Sistem otomatis menghubungkan jalur streaming langsung khusus handphone tanpa jeda!</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60">
                    <p className="font-extrabold text-stone-800 flex items-center gap-1">
                      <span>🚀 Rekomendasi Link Dropbox / Direct MP3:</span>
                    </p>
                    <p className="text-stone-600 text-[10px] pl-1 mt-0.5 leading-relaxed">
                      Anda juga dapat menggunakan link berbagi dari <b>Dropbox</b> atau link berkas <b>.mp3</b> langsung. Sistem otomatis memastikan kompatibilitas pemutar audio di semua tipe handphone (Android & iPhone).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD CUSTOM MP3 FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-5 text-center bg-white cursor-pointer transition-all hover:bg-amber-50/30 group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <FileAudio className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-800">
                  {music.audioUrl && (music.audioUrl.startsWith('data:') || music.audioUrl.startsWith('indexeddb:'))
                    ? `File Terpasang: ${music.title || fileName || 'Musik Pribadi'}`
                    : 'Pilih File Musik dari Perangkat'}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Format MP3, WAV, M4A didukung (Maksimal 10 MB)
                </p>
                <button
                  type="button"
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-amber-600 transition-colors"
                >
                  Jelajahi File
                </button>
              </div>

              {/* Uploaded File Info & Play Preview */}
              {music.audioUrl && (music.audioUrl.startsWith('data:') || music.audioUrl.startsWith('indexeddb:')) && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <Volume2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span className="font-semibold text-stone-900 truncate">
                      {music.title || 'Lagu Kustom'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(music.audioUrl)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold flex items-center gap-1 hover:bg-amber-700 transition-colors flex-shrink-0"
                  >
                    {isPlayingPreview ? (
                      <>
                        <Pause className="w-3 h-3 fill-current" />
                        <span>Berhenti</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Tes Putar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Track Metadata (Title & Artist) Editor */}
          <div className="pt-2 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Judul Lagu Ditampilkan
              </label>
              <input
                type="text"
                value={music.title}
                onChange={(e) => onChange({ ...music, title: e.target.value })}
                placeholder="Contoh: Janji Suci - Yovie & Nuno"
                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Artis / Penyanyi
              </label>
              <input
                type="text"
                value={music.artist}
                onChange={(e) => onChange({ ...music, artist: e.target.value })}
                placeholder="Contoh: Yovie & Nuno"
                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* AutoPlay Toggle */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-stone-700 font-medium">
              Putar otomatis begitu undangan dibuka oleh tamu
            </span>
            <input
              type="checkbox"
              checked={music.autoPlay}
              onChange={(e) => onChange({ ...music, autoPlay: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
