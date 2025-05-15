export interface Pekerjaan {
  id: number;
  kode_rekening: string;
  nama_paket: string;
  kegiatan: string | null;
  kecamatan: string | null;
  desa: string | null;
  kegiatan_id: number;
  kecamatan_id: number | null;
  desa_id: number | null;
  pagu: number;
  created_at: string | null;
  updated_at: string | null;
  tahun_anggaran?: number;
}

export interface Penyedia {
  id: number;
  nama: string;
}

export interface Kontrak {
  id: number;
  id_kegiatan: number;
  id_pekerjaan: number;
  id_penyedia: number;
  kode_rup: string;
  kode_paket: string;
  nomor_penawaran: string;
  tanggal_penawaran: string;
  nilai_kontrak: number;
  mulai: string;
  selesai: string;
  sppbj: string;
  spk: string;
  spmk: string;
}

export interface Keuangan {
  id: number;
  pekerjaan_id: number;
  realisasi: number;
  created_at: string;
  updated_at: string;
}

export interface Foto {
  id: number;
  pekerjaan_id: number;
  komponen_id: number;
  penerima_id: number | null;
  keterangan: string;
  koordinat: string;
  created_at: string;
  photo_url: string;
  komponen_nama: string | null;
  penerima_nama: string | null;
}

export interface Progress {
  id: number;
  pekerjaan_id: number;
  komponen_id: number;
  komponen_nama: string | null;
  realisasi_fisik: number;
  output_volume: number | null;
  created_at: string;
}

export interface Output {
  id: number;
  pekerjaan_id: number;
  komponen: string;
  satuan: string;
  volume: number;
  created_at: string;
}

export interface OutcomeData {
  waktuTempuh: {
    target: string;
    baseline: string;
    proyeksi: string;
    realisasi: string;
    persentase: number;
  };
  volumeKendaraan: {
    target: string;
    baseline: string;
    realisasi: string;
    persentase: number;
  };
  tenagaKerja: {
    target: string;
    realisasi: string;
    persentase: number;
  };
  umkm: {
    target: string;
    realisasi: string;
    persentase: number;
  };
  investasi: {
    target: string;
    realisasi: string;
    persentase: number;
  };
}

export interface Penerima {
  id: number;
  pekerjaan_id: number;
  nama: string;
  jumlah_jiwa: number;
  nik: string;
  alamat: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface Berkas {
  id: number;
  pekerjaan_id: number;
  jenis_dokumen: string;
  created_at: string;
  file_url: string;
}

export interface PageProps {
  auth: {
    user: {
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
    } | null;
  };
  pekerjaan: Pekerjaan;
  penyediaList: Penyedia[];
  kontrak?: Kontrak;
  keuangan?: Keuangan;
  fotos: Foto[];
  progresses: Progress[];
  outputs: Output[];
  penerimas: Penerima[];
  berkasList: Berkas[]; // Add this
  flash?: {
    success?: string;
    error?: string;
  };
  errors?: Record<string, string>;
  [key: string]: any;
}
