<!DOCTYPE html>
<html>
<head>
    <title>Cover Kontrak</title>
    <style>
        @font-face {
            font-family: 'Varela Round';
            font-style: normal;
            font-weight: 400;
            src: url('{{ public_path('fonts/VarelaRound-Regular.ttf') }}') format('truetype');
        }
        /* If you have a bold variant, place VarelaRound-Bold.ttf in public/fonts/ */
        @font-face {
            font-family: 'Varela Round';
            font-style: normal;
            font-weight: 700;
            src: url('{{ public_path('fonts/VarelaRound-Regular.ttf') }}') format('truetype');
        }

        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }
        body {
            font-family: 'Varela Round', sans-serif; /* Applied Varela Round here */
            text-align: center; /* Overall centering for inline content */
        }
        .page-container {
            width: 90%; /* Adjusted width for better centering */
            margin: 0 auto; /* Center the block element */
            padding: 20px; /* Reduced padding to avoid pushing content */
            box-sizing: border-box;
        }
        .header-instansi {
            margin-bottom: 20px;
        }
        .header-instansi h1, .header-instansi h2, .header-instansi h4 {
            margin: 0;
            padding: 0;
            line-height: 1.2;
        }
        .header-instansi h1 { font-size: 1.5em; }
        .header-instansi h2 { font-size: 1.3em; }
        .header-instansi h4 { font-size: 1em; }

        .logo {
            margin: 20px auto;
            text-align: center;
        }
        .logo img {
            max-width: 156px; /* Adjusted by 30% */
            height: auto;
        }

        .title-kontrak {
            margin-top: 30px;
            margin-bottom: 20px;
        }
        .title-kontrak h1 {
            margin: 0 0 10px 0;
            padding: 0;
            font-size: 2em;
            font-weight: bold;
        }
        .title-kontrak h2 {
            margin: 0 0 10px 0;
            padding: 0;
            font-size: 1.8em;
            font-weight: bold;
        }
        .title-kontrak h3 {
            margin: 0 0 5px 0;
            padding: 0;
            font-size: 1em;
        }
        .underlined-label {
            text-decoration: underline;
        }

        .details-table {
            width: 90%; /* Adjusted width for better centering */
            margin: 20px auto;
            text-align: left;
            border-collapse: collapse;
            background-color: #f2f2f2; /* Light grey background */
        }
        .details-table td {
            padding: 5px 0;
            vertical-align: top;
            font-size: 1em;
        }
        .details-table td:first-child {
            width: 30%; /* Adjust label width */
            font-weight: bold;
        }
        .details-table td:nth-child(2) {
            width: 2%; /* Separator */
        }

        .footer-info {
            margin-top: 0px;
            text-align: center;
        }
        .footer-info h5 {
            margin: 5px 0;
            font-size: 1em;
        }

        .pelaksana {
            margin-top: 40px;
        }
        .pelaksana h3 {
            margin: 0;
            padding: 0;
            font-size: 1.5em;
            font-weight: bold;
        }
        .pelaksana h1 {
            margin: 10px 0 0 0;
            padding: 0;
            font-size: 2em;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="header-instansi" style="padding-top: 20px;">
            <h1>Bidang Air Minum dan Sanitasi</h1>
            <h2>Dinas Perumahan dan Kawasan Permukiman</h2>
            <h4>Jl. Adi Sucipta No. 7 - Cianjur</h4>
        </div>

        <div class="logo">
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('cianjurkab-logo.png'))) }}" alt="Kabupaten Cianjur Logo">
        </div>

        <div class="title-kontrak">
            <h1>SURAT PERJANJIAN</h1>
            <h2>( KONTRAK )</h2>
            <h3><span class="underlined-label">Nomor SPK</span><br>{{ $kontrak->spk ?? 'N/A' }}</h3>
            <h3><span class="underlined-label">Tanggal</span><br>{{ \Carbon\Carbon::parse($kontrak->tgl_spk)->translatedFormat('d F Y') ?? 'N/A' }}</h3>
            <h3><span class="underlined-label">Bidang</span><br>{{ $kontrak->pekerjaan->kegiatan->bidang ?? 'N/A' }}</h3>
            <h3><span class="underlined-label">Kegiatan</span><br>{{ $kontrak->pekerjaan->kegiatan->nama ?? 'N/A' }}</h3>
            <h3><span class="underlined-label">Nama Paket</span><br>{{ $kontrak->pekerjaan->nama_paket ?? 'N/A' }}</h3>
        </div>

        <table class="details-table">
            <tr>
                <td>Nilai Kontrak</td>
                <td>:</td>
                <td>Rp {{ number_format($kontrak->nilai_kontrak, 0, ',', '.') ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Terbilang</td>
                <td>:</td>
                <td>{{ terbilang($kontrak->nilai_kontrak) ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Sumber Biaya</td>
                <td>:</td>
                <td>{{ $kontrak->pekerjaan->kegiatan->sumber_dana ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Tahun Anggaran</td>
                <td>:</td>
                <td>{{ $kontrak->pekerjaan->kegiatan->tahun_anggaran ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Masa Pelaksanaan</td>
                <td>:</td>
                <td>
                    {{ \Carbon\Carbon::parse($kontrak->tgl_spmk)->diffInDays(\Carbon\Carbon::parse($kontrak->tgl_selesai)) }} Hari Kalender
                </td>
            </tr>
            <tr>
                <td>Mulai</td>
                <td>:</td>
                <td>{{ \Carbon\Carbon::parse($kontrak->tgl_spmk)->translatedFormat('d F Y') ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Selesai</td>
                <td>:</td>
                <td>{{ \Carbon\Carbon::parse($kontrak->tgl_selesai)->translatedFormat('d F Y') ?? 'N/A' }}</td>
            </tr>
        </table>

        <div class="footer-info">
            <p>Kode RUP: {{ $kontrak->kode_rup ?? 'N/A' }} Kode Paket: {{ $kontrak->kode_paket ?? 'N/A' }}</p>
            <p></p>
        </div>

        <div class="pelaksana">
            <h3>PELAKSANA</h3>
            <h1>{{ $kontrak->penyedia->nama ?? 'N/A' }}</h1>
        </div>
    </div>
</body>
</html>
