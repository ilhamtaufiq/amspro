# AMS Pro - Aplikasi Manajemen Proyek Bidang Air Minum dan Sanitasi

AMS Pro adalah aplikasi web untuk manajemen proyek di bidang air minum dan sanitasi, khususnya untuk DISPERKIM Cianjur. Aplikasi ini dibangun menggunakan Laravel sebagai backend dan React dengan Inertia.js untuk frontend yang interaktif.

## Teknologi yang Digunakan

-   Laravel 12
-   React 18
-   TypeScript
-   Inertia.js
-   Tailwind CSS
-   Radix UI Components
-   Vite
-   Meilisearch
-   Spatie Laravel Medialibrary
-   Spatie Laravel Permission

## Persyaratan Sistem

-   Node.js (versi terbaru LTS)
-   npm atau yarn
-   PHP 8.2 atau lebih tinggi
-   Composer

## Instalasi

1.  Clone repositori ini

```bash
git clone [URL_REPOSITORI]
cd amspro
```

2.  Install dependensi

```bash
npm install
# atau
yarn install
```

3.  Install dependensi PHP

```bash
composer install
```

4.  Salin file .env.example ke .env

```bash
cp .env.example .env
```

5.  Generate application key

```bash
php artisan key:generate
```

6.  Jalankan migrasi database

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

-   Manajemen data proyek (Pekerjaan)
-   Manajemen kontrak (Kontrak)
-   Manajemen kegiatan (Kegiatan)
-   Manajemen vendor (Penyedia)
-   Manajemen foto proyek (Foto)
-   Pelacakan progress proyek (Progress)
-   Manajemen output proyek (Output)
-   Manajemen keuangan proyek (Keuangan)
-   Manajemen penerima manfaat proyek (Penerima)
-   Manajemen berkas proyek (Berkas)
-   Autentikasi dan otorisasi pengguna
-   Antarmuka pengguna modern dengan Tailwind CSS dan Radix UI
-   Integrasi peta dengan Leaflet
-   Chat feature

## Struktur Proyek

-   `/resources` - Berisi file-file frontend (React components, styles, dll)
-   `/app` - Berisi kode backend Laravel
-   `/public` - File-file statis
-   `/database` - Migrasi dan seeder database

## Kontribusi

Silakan buat pull request untuk kontribusi. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan perubahan yang diinginkan.

## Lisensi

[Masukkan informasi lisensi di sini]
