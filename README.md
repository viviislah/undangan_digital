# Facth Printing - Aplikasi Undangan Digital Premium

Aplikasi web modern untuk pembuatan, kustomisasi, pratinjau live, dan pembagian undangan digital pernikahan eksklusif dengan tema interaktif, animasi pembuka amplop, audio latar, integrasi RSVP & ucapan doa, Google Maps interaktif, amplop digital, dan ekspor kartu cetak QR.

---

## 💡 Solusi Mengatasi Layar Putih (Blank White Page) di GitHub Pages

Layar putih terjadi karena GitHub sebelumnya menyarankan template **"Static HTML"** yang hanya mengunggah file mentah (`path: '.'`). Karena aplikasi ini dibuat dengan **React & Vite**, browser tidak bisa membaca file TypeScript (`/src/main.tsx`) secara langsung tanpa proses *compile/build*.

Aplikasi ini kini telah diperbaiki dengan konfigurasi:
1. **GitHub Actions otomatis (`.github/workflows/static.yml`)**: Otomatis menjalankan `npm run build` dan mengunggah folder hasil kompilasi `./dist`.
2. **Relative Path (`base: './'`)** di `vite.config.ts`: Memastikan aset JS, CSS, dan gambar terbaca dengan benar di sub-folder GitHub Pages.
3. **Penyelarasan dependensi**: Menghilangkan konflik versi esbuild pada pipeline build.

---

## 🚀 Cara Membuka & Mengunggah Aplikasi ke GitHub Pages

### Opsi A: Otomatis via GitHub Actions (Sangat Disarankan)

1. **Commit dan Push File Terbaru ke GitHub**:
   Jalankan perintah ini di terminal / Command Prompt folder proyek:
   ```bash
   git add .
   git commit -m "fix: update workflow to build vite dist for github pages"
   git push origin main
   ```
   *(Jika branch Anda bernama `master`, gunakan `git push origin master`)*.

2. **Aktifkan GitHub Pages**:
   - Buka repositori Anda di GitHub.
   - Klik tab **Settings** (kanan atas) > klik menu **Pages** di sebelah kiri.
   - Di bagian **Build and deployment** > **Source**, pilih **GitHub Actions**.
   - Klik tab **Actions** di bagian atas untuk melihat proses build (memerlukan waktu ~1 menit).
   - Setelah centang hijau selesai, buka tautan yang muncul (misalnya `https://USERNAME.github.io/NAMA-REPO/`).
   - Aplikasi akan langsung terbuka sempurna tanpa layar putih!

---

### Opsi B: Menggunakan 1 Perintah CLI (`npm run deploy`)

Jika Anda lebih suka deploy langsung dari terminal tanpa menunggu GitHub Actions:

```bash
# 1. Jalankan perintah deploy
npm run deploy
```

Perintah di atas akan otomatis mengkompilasi file (`npm run build`) dan mengunggahnya ke branch `gh-pages`.
Lalu di **Settings > Pages** di GitHub:
- Pilih **Source**: **Deploy from a branch**
- Pilih **Branch**: `gh-pages` / `/(root)`
- Klik **Save**.

---

## 💻 Menjalankan Aplikasi Secara Lokal (Development)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Jalankan server lokal
npm run dev

# 3. Akses di browser
http://localhost:3000
```

---

## 🛠️ Fitur Utama Aplikasi

- **Katalog Tema Elegan**: Koleksi tema modern (*Minimalist Sage, Luxury Emerald, Romantic Rose, Royal Velvet, Vintage Botanical, Modern Monochrome*, dll).
- **Animasi Pembuka Amplop Sinematik**: Pilihan efek segel lilin, pita sutra, slide modern, dan amplop tradisional.
- **Auto-Save Real-time**: Menyimpan draft otomatis setiap ada pembaruan form dengan perlindungan anti-hilang data.
- **Audio Latar & Pemutar Musik**: Pemutar musik melayang dengan pilihan lagu romantis bawaan dan unggah MP3 kustom.
- **Google Maps & Navigasi Lokasi**: Peta interaktif dengan tombol buka Google Maps & Waze 1-klik.
- **Konfirmasi RSVP & Ucapan Doa**: Tamu dapat mengonfirmasi kehadiran dan menuliskan doa restu.
- **Amplop Digital & Kado Pernikahan**: Rekening bank, e-wallet, tombol salin nomor rekening, dan alamat kado fisik.
- **Generator QR Code & Kartu Cetak**: Membuat kartu akses undangan fisik ber-QR Code untuk dicetak.
- **Mode Kontras Tinggi**: Keterbacaan teks maksimal tanpa menghalangi desain undangan.
