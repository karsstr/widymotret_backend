# Widymotret Studio - Photography Portfolio & Admin Panel

Proyek website fotografi dengan panel admin untuk mengelola daftar harga (pricelist) dan galeri portfolio.

## Struktur Proyek

- `/` : Frontend (SolidJS + Vite + TailwindCSS)
- `/server` : Backend (Node.js + Express + Prisma + MySQL)

## Cara Instalasi & Menjalankan

### 1. Backend (Server)

1. Masuk ke folder server:
   ```bash
   cd server
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi Database:
   - Salin `.env.example` menjadi `.env`
   - Sesuaikan `DATABASE_URL` dengan konfigurasi MySQL Anda.
4. Setup Database (Prisma):
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Seed Data (Admin default & Paket awal):
   ```bash
   npx ts-node src/seed.ts
   ```
   *Admin default: `admin` / `admin123`*
6. Jalankan server:
   ```bash
   npm run dev
   ```
   *Server akan berjalan di http://localhost:5000*

### 2. Frontend

1. Pastikan Anda berada di folder utama (root).
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
   *Aplikasi akan berjalan di http://localhost:3000*

## Fitur Utama

- **Pricelist Dinamis**: Mengambil data paket langsung dari database.
- **Admin Panel**: Kelola konten teks, daftar harga, dan upload gambar.
- **Image Upload**: Upload gambar paket dengan penyimpanan lokal di server.
- **Responsive Design**: Tampilan yang rapi di berbagai perangkat.

## Keamanan & Pengunggahan ke GitHub

File `.gitignore` sudah dikonfigurasi untuk mengabaikan:
- `node_modules/`
- `.env` (berisi rahasia database)
- `server/uploads/` (gambar hasil testing)

Pastikan Anda tidak menghapus konfigurasi tersebut untuk menjaga keamanan data Anda.
