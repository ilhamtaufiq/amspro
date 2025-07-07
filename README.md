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
-   Dukungan lokalisasi tanggal dan angka (Bahasa Indonesia)
-   Pencetakan PDF cover kontrak dengan format khusus (logo, terbilang, masa pelaksanaan)

## Custom Helpers

### `terbilang()` Function

Fungsi `terbilang()` tersedia untuk mengonversi nilai numerik menjadi representasi teks dalam Bahasa Indonesia. Fungsi ini didefinisikan di `app/Helpers/GlobalHelper.php` dan dimuat secara otomatis melalui `composer.json`.

**Penggunaan:**

```php
terbilang(1234567);
// Output: satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh
```

## Struktur Proyek

-   `/resources` - Berisi file-file frontend (React components, styles, dll)
-   `/app` - Berisi kode backend Laravel
-   `/public` - File-file statis
-   `/database` - Migrasi dan seeder database

## Kontribusi

Silakan buat pull request untuk kontribusi. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan perubahan yang diinginkan.

## Lisensi

MIT License

Copyright (c) 2025 ilhamtopiq

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
