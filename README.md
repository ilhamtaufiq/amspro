# AMS Pro

AMS Pro adalah aplikasi web modern yang dibangun menggunakan React, TypeScript, dan Inertia.js.

## Teknologi yang Digunakan

- React 18
- TypeScript
- Inertia.js
- Tailwind CSS
- Radix UI Components
- Vite
- Laravel (Backend)

## Persyaratan Sistem

- Node.js (versi terbaru LTS)
- npm atau yarn
- PHP 8.1 atau lebih tinggi
- Composer

## Instalasi

1. Clone repositori ini
```bash
git clone [URL_REPOSITORI]
cd amspro
```

2. Install dependensi
```bash
npm install
# atau
yarn install
```

3. Install dependensi PHP
```bash
composer install
```

4. Salin file .env.example ke .env
```bash
cp .env.example .env
```

5. Generate application key
```bash
php artisan key:generate
```

6. Jalankan migrasi database
```bash
php artisan migrate
```

## Pengembangan

Untuk menjalankan server pengembangan:

```bash
npm run dev
# atau
yarn dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Build untuk Produksi

Untuk membuat build produksi:

```bash
npm run build
# atau
yarn build
```

## Fitur Utama

- Antarmuka pengguna modern dengan Tailwind CSS
- Komponen UI yang dapat diakses menggunakan Radix UI
- Integrasi peta dengan Leaflet
- Grafik dan visualisasi data dengan Recharts
- Manajemen tema gelap/terang
- Tabel data yang dapat dikustomisasi
- Notifikasi toast
- Dan banyak lagi...

## Struktur Proyek

- `/resources` - Berisi file-file frontend (React components, styles, dll)
- `/app` - Berisi kode backend Laravel
- `/public` - File-file statis
- `/database` - Migrasi dan seeder database

## Kontribusi

Silakan buat pull request untuk kontribusi. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan perubahan yang diinginkan.

## Lisensi

[Masukkan informasi lisensi di sini]
