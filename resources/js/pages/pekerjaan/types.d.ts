export interface Pekerjaan {
    id: number;
    nama_paket: string;
    kegiatan_id: number;
    kecamatan_id: number | null;
    desa_id: number | null;
    pagu: number;
    jumlah_foto?: number;
    jumlah_penerima?: number;
    progress_fisik_persen?: number;
    progress_keuangan_persen?: number;
    pengawas?: {
        pengawas1_id: number | null;
        pengawas2_id: number | null;
        pengawas1?: {
            id: number;
            name: string;
        };
        pengawas2?: {
            id: number;
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

export interface Meta {
    current_page: number;
    from: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    created_at: string;
    updated_at: string;
}