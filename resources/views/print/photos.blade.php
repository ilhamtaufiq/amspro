<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Format File Foto Komponen Sambungan Rumah/Tangki Septik Individu</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background-color: #d4ac6a;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .form-section {
            background-color: white;
            border: 2px solid #333;
            padding: 15px;
            margin-bottom: 20px;
        }
        .form-title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 14px;
        }
        .form-fields {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        .form-fields label {
            font-weight: bold;
        }
        .form-fields input {
            border: none;
            border-bottom: 1px solid #333;
            padding: 5px;
            background: transparent;
        }
        .main-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #333;
            background-color: white;
        }
        .main-table th, .main-table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: center;
            vertical-align: middle;
        }
        .main-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .photo-cell {
            width: 150px;
            height: 110px;
            position: relative;
        }
        .photo-cell img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .photo-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        .photo-placeholder::before {
            content: '';
            position: absolute;
            top: 10px;
            right: 15px;
            width: 20px;
            height: 20px;
            background-color: white;
            border-radius: 50%;
        }
        
        .photo-placeholder::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60%;
            background: linear-gradient(to top, #4682B4, transparent);
            clip-path: polygon(0 100%, 30% 60%, 60% 80%, 100% 40%, 100% 100%);
        }
        .number-col {
            width: 50px;
        }
        .name-col {
            width: 200px;
        }
        .nik-col {
            width: 150px;
        }
        .empty-row {
            height: 80px;
        }
        .empty-row td {
            background-color: #f9f9f9;
        }
        @media print {
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <!-- <div class="header">
        Format file foto komponen Sambungan Rumah/Tangki Septik Individu
    </div> -->

    <div class="form-section">
        <div class="form-title">Foto Progres Kegiatan</div>
        <div class="form-fields">
            <label>Menu:</label>
            <input type="text" name="menu" value="{{ $pekerjaan->kegiatan->nama ?? 'N/A' }}" readonly>

            <label>Rincian Menu:</label>
            <input type="text" name="rincian_menu" value="{{ $pekerjaan->nama_paket }}" readonly>

            <label>Pemerintah Daerah:</label>
            <input type="text" name="pemerintah_daerah" value="Kabupaten Cianjur" readonly>

            <label>Kecamatan:</label>
            <input type="text" name="kecamatan" value="{{ $pekerjaan->kecamatan->n_kec ?? 'N/A' }}" readonly>

            <label>Desa/Kelurahan:</label>
            <input type="text" name="desa_kelurahan" value="{{ $pekerjaan->desa->n_desa ?? 'N/A' }}" readonly>

            <label>Komponen:</label>
            <input type="text" name="komponen" value="{{ $komponenName ?? 'N/A' }}" readonly>
        </div>

        <table class="main-table">
            <thead>
                <tr>
                    <th rowspan="2" class="number-col">No.</th>
                    <th rowspan="2" class="name-col">Nama Penerima Manfaat</th>
                    <th rowspan="2" class="nik-col">NIK</th>
                    <th colspan="5">Foto</th>
                </tr>
                <tr>
                    <th class="photo-cell">0%</th>
                    <th class="photo-cell">25%</th>
                    <th class="photo-cell">50%</th>
                    <th class="photo-cell">75%</th>
                    <th class="photo-cell">100%</th>
                </tr>
            </thead>
            <tbody>
                @foreach($groupedFotos as $index => $data)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td style="text-align: left; padding-left: 10px;">{{ $data['nama'] }}</td>
                        <td>{{ $data['nik'] }}</td>
                        <td class="photo-cell">
                            @if($data['fotos']['0%'])
                                <img src="{{ $data['fotos']['0%'] }}" alt="0% Photo">
                            @endif
                        </td>
                        <td class="photo-cell">
                            @if($data['fotos']['25%'])
                                <img src="{{ $data['fotos']['25%'] }}" alt="25% Photo">
                            @endif
                        </td>
                        <td class="photo-cell">
                            @if($data['fotos']['50%'])
                                <img src="{{ $data['fotos']['50%'] }}" alt="50% Photo">
                            @endif
                        </td>
                        <td class="photo-cell">
                            @if($data['fotos']['75%'])
                                <img src="{{ $data['fotos']['75%'] }}" alt="75% Photo">
                            @endif
                        </td>
                        <td class="photo-cell">
                            @if($data['fotos']['100%'])
                                <img src="{{ $data['fotos']['100%'] }}" alt="100% Photo">
                            @endif
                        </td>
                    </tr>
                @endforeach
                @php
                    $remainingRows = 5 - count($groupedFotos);
                @endphp
                @for ($i = 0; $i < $remainingRows; $i++)
                    <tr class="empty-row">
                        <td>...</td>
                        <td></td>
                        <td>...</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                @endfor
            </tbody>
        </table>
    </div>

    <div style="text-align: center; margin-top: 20px;">
        <button class="print-button" onclick="window.print()">Print Halaman Ini</button>
    </div>
</body>
</html>
