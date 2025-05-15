import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PageProps } from "./types";

export function OutputTab({ pekerjaan, outputs, auth, errors }: PageProps) {
  const { data, setData, post, put, processing, errors: outputErrors, reset } = useForm<{
    id?: number;
    komponen: string;
    satuan: string;
    volume: number;
  }>({
    komponen: "",
    satuan: "",
    volume: 0,
  });

  // Check permissions
  const canCreateOutput = auth.user?.permissions?.includes("create kegiatan") ?? false;
  const canEditOutput = auth.user?.permissions?.includes("edit kegiatan") ?? false;
  const canDeleteOutput = auth.user?.permissions?.includes("delete kegiatan") ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.id && canEditOutput) {
      put(route("outputs.update", [pekerjaan.id, data.id]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          reset();
          alert("Data output berhasil diperbarui!");
        },
        onError: (err) => {
          console.error("Error updating output:", err);
          alert("Gagal memperbarui data output.");
        },
      });
    } else if (canCreateOutput) {
      post(route("outputs.store", pekerjaan.id), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          reset();
          alert("Data output berhasil ditambahkan!");
        },
        onError: (err) => {
          console.error("Error creating output:", err);
          alert("Gagal menambahkan data output.");
        },
      });
    }
  };

  const handleEdit = (output: PageProps['outputs'][number]) => {
    if (canEditOutput) {
      setData({
        id: output.id,
        komponen: output.komponen,
        satuan: output.satuan,
        volume: Number(output.volume),
      });
    }
  };

  const handleDelete = (outputId: number) => {
    if (canDeleteOutput && confirm("Apakah Anda yakin ingin menghapus data output ini?")) {
      router.delete(route("outputs.destroy", [pekerjaan.id, outputId]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          alert("Data output berhasil dihapus!");
        },
        onError: (err) => {
          console.error("Error deleting output:", err);
          alert("Gagal menghapus data output.");
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Realisasi Output</CardTitle>
        <CardDescription>Pencapaian output proyek</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(canCreateOutput || canEditOutput) ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="output_komponen">Komponen</Label>
                <Select
                  value={data.komponen}
                  onValueChange={(value) => setData("komponen", value)}
                  required
                >
                  <SelectTrigger id="output_komponen">
                    <SelectValue placeholder="Pilih Komponen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IPAL">IPAL</SelectItem>
                    <SelectItem value="Tangki Septik Inividu">Tangki Septik Inividu</SelectItem>
                    <SelectItem value="Tangki Septik Komunal">Tangki Septik Komunal</SelectItem>
                    <SelectItem value="Kloset">Kloset</SelectItem>
                    <SelectItem value="Jamban">Jamban</SelectItem>
                    <SelectItem value="Sambungan Rumah">Sambungan Rumah</SelectItem>
                  </SelectContent>
                </Select>
                {outputErrors.komponen && <span className="text-red-500 text-sm">{outputErrors.komponen}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="satuan">Satuan</Label>
                <Input
                  id="satuan"
                  value={data.satuan}
                  onChange={(e) => setData("satuan", e.target.value)}
                  placeholder="Contoh: Unit, m³"
                  required
                />
                {outputErrors.satuan && <span className="text-red-500 text-sm">{outputErrors.satuan}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">Volume</Label>
                <Input
                  id="volume"
                  type="number"
                  step="0.01"
                  value={data.volume}
                  onChange={(e) => setData("volume", Number(e.target.value))}
                  required
                />
                {outputErrors.volume && <span className="text-red-500 text-sm">{outputErrors.volume}</span>}
              </div>
              </div>
            <Button type="submit" disabled={Boolean(processing || (!canCreateOutput && !data.id) || (!canEditOutput && data.id))}>
              {data.id ? "Perbarui Output" : "Tambah Output"}
            </Button>
          </form>
        ) : null}

        {outputs.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">Daftar Output</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outputs.map((output) => (
                <Card key={output.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{output.komponen}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm">Satuan</p>
                        <p className="text-sm">{output.satuan}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Volume</p>
                        <p className="text-sm">{Number(output.volume).toFixed(2)}</p>
                      </div>
                      {(canEditOutput || canDeleteOutput) && (
                        <div className="flex gap-2">
                          {canEditOutput && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(output)}
                            >
                              Edit
                            </Button>
                          )}
                          {canDeleteOutput && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(output.id)}
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
          <p className="text-center text-muted-foreground">Belum ada data output yang ditambahkan.</p>
        )}

        {!(canCreateOutput || canEditOutput || canDeleteOutput) && outputs.length === 0 && (
          <p className="text-center text-muted-foreground">
            Anda tidak memiliki izin untuk mengelola data output.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
