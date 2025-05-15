export interface Permission {
    id: number;
    name: string;
}

export interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    kegiatan_id?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    roles: { id: number; name: string }[];
    permissions?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface Kegiatan {
    id: number;
    nama_kegiatan: string;
    tahun_anggaran: number;
}

export interface Penyedia {
    id: number;
    nama: string;
    direktur: string;
    no_akta: string;
    notaris: string;
    tanggal_akta: string | null;
    alamat: string;
    bank: string | null;
    norek: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    [key: string]: any;
};
