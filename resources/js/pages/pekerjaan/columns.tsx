"use client";

import { ColumnDef, Row, Table, Column } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pekerjaan, Kegiatan, Kecamatan, Desa, Meta } from "./types";

interface FormData {
  nama_paket: string;
  kegiatan_id: number;
  kecamatan_id: number | null;
  desa_id: number | null;
  pagu: number;
  pengawas1_id: number | null;
  pengawas2_id: number | null;
}

interface PekerjaanActionsCellProps {
  pekerjaan: Pekerjaan;
  kegiatanList: Kegiatan[];
  kecamatanList: Kecamatan[];
  desaList: Desa[];
  tahun: number;
  updateTableData: (data: Pekerjaan | null, isCreate?: boolean) => void;
  searchQuery: string;
  meta: Meta;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  userPermissions: string[];
}

function PekerjaanActionsCell({
  pekerjaan,
  kegiatanList,
  kecamatanList,
  desaList,
  tahun,
  updateTableData,
  searchQuery,
  meta,
  createOpen,
  setCreateOpen,
  userPermissions,
}: PekerjaanActionsCellProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [pengawasModalOpen, setPengawasModalOpen] = useState(false);
  const [pengawasUsers, setPengawasUsers] = useState([]);
  const [pengawasModalMessage, setPengawasModalMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchPengawasUsers = async () => {
      try {
        const response = await fetch(route('pengawas.users'));
        const data = await response.json();
        setPengawasUsers(data);
      } catch (error) {
        console.error('Failed to fetch pengawas users:', error);
      }
    };

    fetchPengawasUsers();
  }, []);

  const form = useForm<FormData>({
    nama_paket: pekerjaan.nama_paket || "",
    kegiatan_id: pekerjaan.kegiatan_id || 0,
    kecamatan_id: pekerjaan.kecamatan_id ?? null,
    desa_id: pekerjaan.desa_id ?? null,
    pagu: pekerjaan.pagu || 0,
    pengawas1_id: pekerjaan.pengawas?.pengawas1_id || null,
    pengawas2_id: pekerjaan.pengawas?.pengawas2_id || null,
  });

  const { data, setData, processing, errors, setError, reset } = form;

  useEffect(() => {
    reset();
    setData({
      nama_paket: pekerjaan.nama_paket || "",
      kegiatan_id: pekerjaan.kegiatan_id || 0,
      kecamatan_id: pekerjaan.kecamatan_id ?? null,
      desa_id: pekerjaan.desa_id ?? null,
      pagu: pekerjaan.pagu || 0,
      pengawas1_id: pekerjaan.pengawas?.pengawas1_id || null,
    pengawas2_id: pekerjaan.pengawas?.pengawas2_id || null,
    });
  }, [pekerjaan, reset, setData]);

  useEffect(() => {
    if (createOpen) {
      reset();
      setData({
        nama_paket: "",
        kegiatan_id: 0,
        kecamatan_id: null,
        desa_id: null,
        pagu: 0,
        pengawas1_id: null,
        pengawas2_id: null,
      });
    }
  }, [createOpen, reset, setData]);

  const filteredDesaList = desaList.filter(
    (desa: Desa) => desa.kecamatan_id === data.kecamatan_id
  );

  const handleKecamatanChange = (value: string) => {
    const newKecamatanId = value === "none" ? null : Number(value);
    setData((prevData) => ({
      ...prevData,
      kecamatan_id: newKecamatanId,
      desa_id: newKecamatanId ? prevData.desa_id : null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.put(route("pekerjaan.update", pekerjaan.id), {
      onSuccess: (page: any) => {
        // console.log("Update response:", page); // Debug
        setEditOpen(false);
        setAlertMessage("Pekerjaan updated successfully.");
        setIsAlertOpen(true);
        const updatedPekerjaan =
          page.props?.pekerjaan ||
          page.pekerjaan ||
          page.data?.pekerjaan;
        if (updatedPekerjaan) {
          updateTableData(updatedPekerjaan);
        } else {
          console.error("No updatedPekerjaan in response");
        }
      },
      onError: (errors: Record<string, string>) => {
        Object.keys(errors).forEach((key) => {
          setError(key as keyof FormData, errors[key]);
        });
        setAlertMessage("Failed to update Pekerjaan.");
        setIsAlertOpen(true);
      },
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route("pekerjaan.store"), {
      onSuccess: (page: any) => {
        // console.log("Create response:", page); // Debug
        setCreateOpen(false);
        setAlertMessage("Pekerjaan created successfully.");
        setIsAlertOpen(true);
        const newPekerjaan =
          page.props?.pekerjaan ||
          page.pekerjaan ||
          page.data?.pekerjaan;
        if (newPekerjaan) {
          updateTableData(newPekerjaan, true);
        } else {
          console.error("No newPekerjaan in response");
        }
        reset();
      },
      onError: (errors: Record<string, string>) => {
        Object.keys(errors).forEach((key) => {
          setError(key as keyof FormData, errors[key]);
        });
        setAlertMessage("Failed to create Pekerjaan.");
        setIsAlertOpen(true);
      },
    });
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    form.delete(route("pekerjaan.destroy", pekerjaan.id), {
      onSuccess: () => {
        setConfirmDeleteOpen(false);
        setAlertMessage("Pekerjaan deleted successfully.");
        setIsAlertOpen(true);
        updateTableData(null);
      },
      onError: () => {
        setConfirmDeleteOpen(false);
        setAlertMessage("Failed to delete Pekerjaan.");
        setIsAlertOpen(true);
      },
    });
  };

  const handleDetail = () => {
    router.visit(route("pekerjaan.show", pekerjaan.id), {
      method: "get",
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleUpdatePengawas = (e: React.FormEvent) => {
    e.preventDefault();
    form.put(route("pekerjaan.updatePengawas", pekerjaan.id), {
      onSuccess: () => {
        setPengawasModalOpen(false);
        setAlertMessage("Pengawas berhasil diperbarui.");
        setIsAlertOpen(true);
      },
      onError: (errors: Record<string, string>) => {
        Object.keys(errors).forEach((key) => {
          setError(key as keyof FormData, errors[key]);
        });
        setAlertMessage("Gagal memperbarui pengawas.");
        setIsAlertOpen(true);
      },
    });
  };

  return (
    <>
      {(userPermissions.includes("edit pekerjaan") ||
        userPermissions.includes("delete pekerjaan") ||
        userPermissions.includes("view pekerjaan")) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userPermissions.includes("view pekerjaan") && (
              <DropdownMenuItem onClick={handleDetail}>
                Detail Pekerjaan
              </DropdownMenuItem>
            )}
            {userPermissions.includes("edit pekerjaan") && (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Edit
              </DropdownMenuItem>
            )}
            {userPermissions.includes("edit pekerjaan") && (
              <DropdownMenuItem onClick={() => setPengawasModalOpen(true)}>
                Atur Pengawas
              </DropdownMenuItem>
            )}
            {userPermissions.includes("delete pekerjaan") && (
              <DropdownMenuItem onClick={handleDelete}>
                Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {userPermissions.includes("edit pekerjaan") && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pekerjaan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nama Paket</label>
                <Input
                  value={data.nama_paket}
                  onChange={(e) => setData("nama_paket", e.target.value)}
                />
                {errors.nama_paket && (
                  <p className="text-sm text-red-500">{errors.nama_paket}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Kegiatan</label>
                <Select
                  value={data.kegiatan_id?.toString() || ""}
                  onValueChange={(value) => setData("kegiatan_id", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kegiatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {kegiatanList.map((kegiatan) => (
                      <SelectItem
                        key={kegiatan.id}
                        value={kegiatan.id.toString()}
                      >
                        {kegiatan.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kegiatan_id && (
                  <p className="text-sm text-red-500">{errors.kegiatan_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Kecamatan</label>
                <Select
                  value={
                    data.kecamatan_id ? data.kecamatan_id.toString() : "none"
                  }
                  onValueChange={handleKecamatanChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {kecamatanList.map((kecamatan) => (
                      <SelectItem
                        key={kecamatan.id}
                        value={kecamatan.id.toString()}
                      >
                        {kecamatan.n_kec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kecamatan_id && (
                  <p className="text-sm text-red-500">{errors.kecamatan_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Desa</label>
                <Select
                  value={data.desa_id ? data.desa_id.toString() : "none"}
                  onValueChange={(value) =>
                    setData("desa_id", value === "none" ? null : Number(value))
                  }
                  disabled={!data.kecamatan_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Desa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {filteredDesaList.map((desa) => (
                      <SelectItem key={desa.id} value={desa.id.toString()}>
                        {desa.n_desa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.desa_id && (
                  <p className="text-sm text-red-500">{errors.desa_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Pagu</label>
                <Input
                  type="number"
                  value={data.pagu}
                  onChange={(e) => setData("pagu", Number(e.target.value))}
                />
                {errors.pagu && (
                  <p className="text-sm text-red-500">{errors.pagu}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {userPermissions.includes("create pekerjaan") && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pekerjaan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nama Paket</label>
                <Input
                  value={data.nama_paket}
                  onChange={(e) => setData("nama_paket", e.target.value)}
                  placeholder="Masukkan nama paket"
                />
                {errors.nama_paket && (
                  <p className="text-sm text-red-500">{errors.nama_paket}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Kegiatan</label>
                <Select
                  value={data.kegiatan_id?.toString() || ""}
                  onValueChange={(value) => setData("kegiatan_id", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kegiatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {kegiatanList.map((kegiatan) => (
                      <SelectItem
                        key={kegiatan.id}
                        value={kegiatan.id.toString()}
                      >
                        {kegiatan.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kegiatan_id && (
                  <p className="text-sm text-red-500">{errors.kegiatan_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Kecamatan</label>
                <Select
                  value={
                    data.kecamatan_id ? data.kecamatan_id.toString() : "none"
                  }
                  onValueChange={handleKecamatanChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {kecamatanList.map((kecamatan) => (
                      <SelectItem
                        key={kecamatan.id}
                        value={kecamatan.id.toString()}
                      >
                        {kecamatan.n_kec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kecamatan_id && (
                  <p className="text-sm text-red-500">{errors.kecamatan_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Desa</label>
                <Select
                  value={data.desa_id ? data.desa_id.toString() : "none"}
                  onValueChange={(value) =>
                    setData("desa_id", value === "none" ? null : Number(value))
                  }
                  disabled={!data.kecamatan_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Desa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {filteredDesaList.map((desa) => (
                      <SelectItem key={desa.id} value={desa.id.toString()}>
                        {desa.n_desa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.desa_id && (
                  <p className="text-sm text-red-500">{errors.desa_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Pagu</label>
                <Input
                  type="number"
                  value={data.pagu}
                  onChange={(e) => setData("pagu", Number(e.target.value))}
                  placeholder="Masukkan pagu"
                />
                {errors.pagu && (
                  <p className="text-sm text-red-500">{errors.pagu}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Informasi</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setIsAlertOpen(false)}>Tutup</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {userPermissions.includes("delete pekerjaan") && (
        <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus pekerjaan "
                {pekerjaan.nama_paket}"? Aksi ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmDeleteOpen(false)}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={processing}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {userPermissions.includes("edit pekerjaan") && (
        <Dialog open={pengawasModalOpen} onOpenChange={setPengawasModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atur Pengawas untuk: {pekerjaan.nama_paket}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdatePengawas} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Pengawas 1</label>
                <Select
                  value={data.pengawas1_id?.toString() || ""}
                  onValueChange={(value) => setData("pengawas1_id", value ? Number(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pengawas 1" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Tidak ada</SelectItem>
                    {pengawasUsers.map((user: any) => (
                      <SelectItem
                        key={user.id}
                        value={user.id.toString()}
                      >
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-1">Pengawas 2</label>
                <Select
                  value={data.pengawas2_id?.toString() || ""}
                  onValueChange={(value) => setData("pengawas2_id", value ? Number(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pengawas 2" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Tidak ada</SelectItem>
                    {pengawasUsers.map((user: any) => (
                      <SelectItem
                        key={user.id}
                        value={user.id.toString()}
                      >
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPengawasModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

interface TableMeta {
  kegiatanList: Kegiatan[];
  kecamatanList: Kecamatan[];
  desaList: Desa[];
  tahun: number;
  updateTableData: (data: Pekerjaan | null, isCreate?: boolean) => void;
  searchQuery: string;
  meta: Meta;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  userPermissions: string[];
  auth: any;
}

export const columns: ColumnDef<Pekerjaan, unknown>[] = [
  {
    accessorKey: "id",
    header: "No",
    size: 60,
    enableSorting: false,
    cell: ({ row, table }: { row: Row<Pekerjaan>, table: Table<Pekerjaan> }) => {
      const meta = table.options.meta as TableMeta;
      const currentPage = meta?.meta?.current_page || 1;
      const perPage = meta?.meta?.per_page || 10;
      const rowNumber = (currentPage - 1) * perPage + row.index + 1;
      return rowNumber;
    },
  },
  {
    accessorKey: "kegiatan",
    header: "Kegiatan",
    cell: ({ row, table }: { row: Row<Pekerjaan>, table: Table<Pekerjaan> }) => {
      const meta = table.options.meta as TableMeta;
      const kegiatanList = meta?.kegiatanList || [];
      const kegiatanId = row.original.kegiatan_id;
      if (!kegiatanId || !kegiatanList.length) return "-";
      const kegiatan = kegiatanList.find((k) => k.id === kegiatanId);
      return kegiatan?.nama || "-";
    },
  },
  {
    accessorKey: "nama_paket",
    header: ({ column }: { column: Column<Pekerjaan> }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Paket
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    size: 300,
  },
  {
    accessorKey: "kecamatan",
    header: "Kecamatan",
    cell: ({ row, table }: { row: Row<Pekerjaan>, table: Table<Pekerjaan> }) => {
      const meta = table.options.meta as TableMeta;
      const kecamatanList = meta?.kecamatanList || [];
      const kecamatanId = row.original.kecamatan_id;
      if (kecamatanId == null || !kecamatanList.length) return "-";
      const kecamatan = kecamatanList.find((k) => k.id === kecamatanId);
      return kecamatan?.n_kec || "-";
    },
  },
  {
    accessorKey: "desa",
    header: "Desa",
    cell: ({ row, table }: { row: Row<Pekerjaan>, table: Table<Pekerjaan> }) => {
      const meta = table.options.meta as TableMeta;
      const desaList = meta?.desaList || [];
      const desaId = row.original.desa_id;
      if (desaId == null || !desaList.length) return "-";
      const desa = desaList.find((d) => d.id === desaId);
      return desa?.n_desa || "-";
    },
  },
  {
    accessorKey: "pagu",
    header: ({ column }: { column: Column<Pekerjaan> }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Pagu (Rp)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: Row<Pekerjaan> }) => {
      const amount = row.getValue<number>("pagu");
      if (amount === null || amount === undefined) return "-";
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
  },
  {
    accessorKey: "jumlah_foto",
    header: "Jumlah Foto",
    cell: ({ row }: { row: Row<Pekerjaan> }) => {
      const jumlahFoto = row.original.jumlah_foto;
      return jumlahFoto !== undefined ? jumlahFoto : "-";
    },
  },
  {
    accessorKey: "jumlah_penerima",
    header: "Jumlah Penerima",
    cell: ({ row }: { row: Row<Pekerjaan> }) => {
      const jumlahPenerima = row.original.jumlah_penerima;
      return jumlahPenerima !== undefined ? jumlahPenerima : "-";
    },
  },
  {
    accessorKey: "progress_fisik_persen",
    header: "Progress Fisik (%)",
    cell: ({ row }: { row: Row<Pekerjaan> }) => {
      const progressFisik = row.original.progress_fisik_persen;
      return progressFisik !== undefined ? `${progressFisik.toFixed(2)}%` : "-";
    },
  },
  {
    accessorKey: "progress_keuangan_persen",
    header: "Progress Keuangan (%)",
    cell: ({ row }: { row: Row<Pekerjaan> }) => {
      const progressKeuangan = row.original.progress_keuangan_persen;
      return progressKeuangan !== undefined ? `${progressKeuangan.toFixed(2)}%` : "-";
    },
  },
  {
    accessorKey: "pengawas1",
    header: "Pengawas 1",
    cell: ({ row }: { row: Row<Pekerjaan> }) => row.original.pengawas?.pengawas1?.name || "-",
  },
  {
    accessorKey: "pengawas2",
    header: "Pengawas 2",
    cell: ({ row }: { row: Row<Pekerjaan> }) => row.original.pengawas?.pengawas2?.name || "-",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }: { row: Row<Pekerjaan>, table: Table<Pekerjaan> }) => {
      const meta = table.options.meta as TableMeta;
      const cellProps: PekerjaanActionsCellProps = {
        pekerjaan: row.original,
        kegiatanList: meta?.kegiatanList || [],
        kecamatanList: meta?.kecamatanList || [],
        desaList: meta?.desaList || [],
        tahun: meta?.tahun || 0,
        updateTableData: meta?.updateTableData || (() => {}),
        searchQuery: meta?.searchQuery || "",
        meta: meta?.meta || {
          current_page: 1,
          last_page: 1,
          from: 0,
          to: 0,
          total: 0,
          per_page: 10,
          links: [],
        },
        createOpen: meta?.createOpen || false,
        setCreateOpen: meta?.setCreateOpen || (() => {}),
        userPermissions: meta?.userPermissions || [],
      };
      return <PekerjaanActionsCell {...cellProps} />;
    },
  },
].filter(column => column.cell !== null);
