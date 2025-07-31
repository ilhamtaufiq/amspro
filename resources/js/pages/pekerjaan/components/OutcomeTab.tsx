import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/Spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PageProps } from "./types";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function OutcomeTab({ pekerjaan, penerimas, auth, errors, flash }: PageProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [penerimaToDeleteId, setPenerimaToDeleteId] = useState<number | null>(null);

  const { data, setData, post, put, processing, errors: penerimaErrors, reset } = useForm<{
    id?: number;
    nama: string;
    jumlah_jiwa: number;
    nik: string;
    alamat: string;
  }>({
    nama: "",
    jumlah_jiwa: 0,
    nik: "",
    alamat: "",
  });

  const handleConfirmDelete = () => {
    if (penerimaToDeleteId !== null) {
      router.delete(route("penerima.destroy", [pekerjaan.id, penerimaToDeleteId]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          if (flash?.success) {
            alert(flash.success);
          } else {
            alert("Data penerima berhasil dihapus!");
          }
          setIsDeleteDialogOpen(false);
          setPenerimaToDeleteId(null);
        },
        onError: (err) => {
          console.error("Error deleting penerima:", err);
          alert("Gagal menghapus data penerima: " + JSON.stringify(err));
          setIsDeleteDialogOpen(false);
          setPenerimaToDeleteId(null);
        },
      });
    }
  };

  

  // Defensive permission checks
  const permissions = auth?.user?.permissions ?? [];
  const canCreatePenerima = permissions.includes("view pekerjaan");
  const canEditPenerima = permissions.includes("view pekerjaan");
  const canDeletePenerima = permissions.includes("view pekerjaan");

  // Fallback UI if not authenticated
  if (!auth?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Penerima</CardTitle>
          <CardDescription>Informasi penerima manfaat proyek</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Silakan login untuk mengelola data penerima.
          </p>
        </CardContent>
      </Card>
    );
  }

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nama", data.nama);
    formData.append("jumlah_jiwa", data.jumlah_jiwa.toString());
    formData.append("nik", data.nik);
    formData.append("alamat", data.alamat);

    if (data.id && canEditPenerima) {
      put(route("penerima.update", [pekerjaan.id, data.id]), {
        data: formData,
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          reset();
          if (flash?.success) {
            alert(flash.success);
          } else {
            alert("Data penerima berhasil diperbarui!");
          }
        },
        onError: (err) => {
          console.error("Error updating penerima:", err);
          alert("Gagal memperbarui data penerima: " + JSON.stringify(err));
        },
      });
    } else if (canCreatePenerima) {
      post(route("penerima.store", pekerjaan.id), {
        data: formData,
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          reset();
          if (flash?.success) {
            alert(flash.success);
          } else {
            alert("Data penerima berhasil ditambahkan!");
          }
        },
        onError: (err) => {
          console.error("Error creating penerima:", err);
          alert("Gagal menambahkan data penerima: " + JSON.stringify(err));
        },
      });
    }
  };

  const handleEdit = (penerima: PageProps["penerimas"][number]) => {
    if (canEditPenerima) {
      setData({
        id: penerima.id,
        nama: penerima.nama,
        jumlah_jiwa: penerima.jumlah_jiwa,
        nik: penerima.nik,
        alamat: penerima.alamat || "",
      });
    }
  };

  const handleDelete = (penerimaId: number) => {
    if (canDeletePenerima) {
      setPenerimaToDeleteId(penerimaId);
      setIsDeleteDialogOpen(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Penerima</CardTitle>
        <CardDescription>Informasi penerima manfaat proyek</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(canCreatePenerima || canEditPenerima) ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  value={data.nama}
                  onChange={(e) => setData("nama", e.target.value)}
                  required
                />
                {penerimaErrors.nama && <span className="text-red-500 text-sm">{penerimaErrors.nama}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah_jiwa">Jumlah Jiwa</Label>
                <Input
                  id="jumlah_jiwa"
                  type="number"
                  value={data.jumlah_jiwa}
                  onChange={(e) => setData("jumlah_jiwa", Number(e.target.value))}
                  required
                />
                {penerimaErrors.jumlah_jiwa && <span className="text-red-500 text-sm">{penerimaErrors.jumlah_jiwa}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  value={data.nik}
                  onChange={(e) => setData("nik", e.target.value)}
                  required
                />
                {penerimaErrors.nik && <span className="text-red-500 text-sm">{penerimaErrors.nik}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  value={data.alamat}
                  onChange={(e) => setData("alamat", e.target.value)}
                />
                {penerimaErrors.alamat && <span className="text-red-500 text-sm">{penerimaErrors.alamat}</span>}
              </div>
              
            </div>
            
              <Button
                type="submit"
                disabled={processing || (!canCreatePenerima && !Boolean(data.id)) || (!canEditPenerima && Boolean(data.id))}
              >
                {processing ? "Memproses..." : data.id ? "Perbarui Penerima" : "Tambah Penerima"}
              </Button>
          </form>
        ) : null}

        {penerimas.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">Daftar Penerima</p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jumlah Jiwa</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {penerimas.map((penerima) => (
                    <TableRow key={penerima.id}>
                      <TableCell>{penerima.nama}</TableCell>
                      <TableCell>{penerima.jumlah_jiwa}</TableCell>
                      <TableCell>{penerima.nik}</TableCell>
                      <TableCell>{penerima.alamat || "N/A"}</TableCell>
                      <TableCell>
                        {(canEditPenerima || canDeletePenerima) && (
                          <div className="flex gap-2">
                            {canEditPenerima && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(penerima)}
                              >
                                Edit
                              </Button>
                            )}
                            {canDeletePenerima && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(penerima.id)}
                              >
                                Hapus
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Belum ada data penerima yang ditambahkan.</p>
        )}

        {!(canCreatePenerima || canEditPenerima || canDeletePenerima) && penerimas.length === 0 && (
          <p className="text-center text-muted-foreground">
            Anda tidak memiliki izin untuk mengelola data penerima.
          </p>
        )}
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data penerima ini? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} variant="destructive">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
