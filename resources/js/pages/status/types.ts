export interface Status {
  id: number;
  pekerjaan_id: number;
  nama_pekerjaan: string;
  mulai: string;
  selesai: string;
  penyedia: string;
  pagu: number;
  nilai_kontrak: number;
  kontrak: boolean;
  nphd: boolean;
  review: boolean;
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
