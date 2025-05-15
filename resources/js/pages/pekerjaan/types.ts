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

export interface Meta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
  per_page: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
}
