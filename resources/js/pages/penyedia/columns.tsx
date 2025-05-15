import { Penyedia } from "@/types";

export const columns = [
  { header: "Nama", accessor: "nama" as keyof Penyedia },
  { header: "Direktur", accessor: "direktur" as keyof Penyedia },
  { header: "No Akta", accessor: "no_akta" as keyof Penyedia },
  { header: "Notaris", accessor: "notaris" as keyof Penyedia },
  { header: "Tanggal Akta", accessor: "tanggal_akta" as keyof Penyedia },
  { header: "Alamat", accessor: "alamat" as keyof Penyedia },
  { header: "Bank", accessor: "bank" as keyof Penyedia },
  { header: "No Rekening", accessor: "norek" as keyof Penyedia },
  { header: "Aksi", accessor: "actions" as keyof Penyedia },
];
