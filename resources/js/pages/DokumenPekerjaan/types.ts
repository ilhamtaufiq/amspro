export interface Pekerjaan {
    id: number;
    nama_paket: string;
    kecamatan_id: number;
    desa_id: number;
    kecamatan?: { id: number; n_kec: string };
    desa?: { id: number; n_desa: string };
    berkas?: Berkas[];
}

export interface Berkas {
    id: number;
    pekerjaan_id: number;
    jenis_dokumen: string;
    file_url: string;
    created_at: string;
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
