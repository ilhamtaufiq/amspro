export interface Pekerjaan {
  id: number;
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
  kode_rekening?: string;
  tahun_anggaran?: number;
  jumlah_foto?: number;
  progress_fisik_persen?: number;
  progress_keuangan_persen?: number;
  jumlah_penerima?: number;
  pengawas?: {
    pengawas1_id?: number;
    pengawas2_id?: number;
    pengawas1?: {
      name: string;
    };
    pengawas2?: {
      name: string;
    };
  };
}

export interface Kegiatan {
  id: number;
  nama: string;
}

export interface Kecamatan {
  id: number;
  n_kec: string;
}

export interface Desa {
  id: number;
  n_desa: string;
  kecamatan_id: number;
}

export interface Foto {
  id: number;
  photo_url: string;
  photo_thumb_url: string;
  photo_medium_url: string;
  keterangan: string;
  komponen_nama: string | null;
  penerima_nama: string | null;
  koordinat: string;
  validasi_koordinat: boolean;
  validasi_koordinat_message?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Meta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
  per_page: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
}