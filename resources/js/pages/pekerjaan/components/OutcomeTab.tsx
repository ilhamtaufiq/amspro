import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PageProps } from "./types";

export function OutcomeTab({ pekerjaan, penerimas, auth, errors, flash }: PageProps) {
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
    if (data.id && canEditPenerima) {
      put(route("penerima.update", [pekerjaan.id, data.id]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          reset();
          if (flash?.success) {
            alert(flash.success); // Use backend flash message
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
    if (canDeletePenerima && confirm("Apakah Anda yakin ingin menghapus data penerima ini?")) {
      router.delete(route("penerima.destroy", [pekerjaan.id, penerimaId]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          if (flash?.success) {
            alert(flash.success);
          } else {
            alert("Data penerima berhasil dihapus!");
          }
        },
        onError: (err) => {
          console.error("Error deleting penerima:", err);
          alert("Gagal menghapus data penerima: " + JSON.stringify(err));
        },
      });
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
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {penerimas.map((penerima) => (
                <Card key={penerima.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{penerima.nama}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm">Jumlah Jiwa</p>
                        <p className="text-sm">{penerima.jumlah_jiwa}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">NIK</p>
                        <p className="text-sm">{penerima.nik}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Alamat</p>
                        <p className="text-sm">{penerima.alamat || "N/A"}</p>
                      </div>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
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
    </Card>
  );
}