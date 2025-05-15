import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { FileText } from "lucide-react";
import type { PageProps } from "./types";

export function ProgressTab({ pekerjaan, kontrak, keuangan, progresses, outputs, errors, flash }: PageProps) {
  const { data: progressData, setData: setProgressData, post: postProgress, put: putProgress, processing: progressProcessing, errors: progressErrors, reset: resetProgress } = useForm<{
    id?: number;
    komponen_id: number | string;
    realisasi_fisik: number;
  }>({
    komponen_id: "",
    realisasi_fisik: 0,
  });

  const { data: keuanganData, setData: setKeuanganData, post: postKeuangan, put: putKeuangan, processing: keuanganProcessing, errors: keuanganErrors, reset: resetKeuangan } = useForm<{
    id?: number;
    realisasi: number;
  }>({
    realisasi: keuangan?.realisasi || 0,
  });

  const progressDataPlaceholder = {
    laporan: ["April 2024", "Maret 2024", "Februari 2024"],
  };

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (progressData.id) {
      putProgress(route("progress.update", [pekerjaan.id, progressData.id]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          resetProgress();
          alert("Data progress berhasil diperbarui!");
        },
        onError: (err) => {
          console.error("Error updating progress:", err);
          alert("Gagal memperbarui data progress.");
        },
      });
    } else {
      postProgress(route("progress.store", pekerjaan.id), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          resetProgress();
          alert("Data progress berhasil ditambahkan!");
        },
        onError: (err) => {
          console.error("Error creating progress:", err);
          alert("Gagal menambahkan data progress.");
        },
      });
    }
  };

  const handleEditProgress = (progress: PageProps['progresses'][number]) => {
    setProgressData({
      id: progress.id,
      komponen_id: progress.komponen_id.toString(),
      realisasi_fisik: Number(progress.realisasi_fisik),
    });
  };

  const handleDeleteProgress = (progressId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data progress ini?")) {
      router.delete(route("progress.destroy", [pekerjaan.id, progressId]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          if (flash?.success) {
            alert(flash.success);
          }
        },
        onError: (err) => {
          console.error("Error deleting progress:", err);
          alert("Gagal menghapus data progress.");
        },
      });
    }
  };

  const handleKeuanganSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keuangan?.id) {
      putKeuangan(route("keuangan.update", [pekerjaan.id, keuangan.id]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          resetKeuangan();
          alert("Data keuangan berhasil diperbarui!");
        },
        onError: (err) => {
          console.error("Error updating keuangan:", err);
          alert("Gagal memperbarui data keuangan.");
        },
      });
    } else {
      postKeuangan(route("keuangan.store", pekerjaan.id), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          resetKeuangan();
          alert("Data keuangan berhasil ditambahkan!");
        },
        onError: (err) => {
          console.error("Error creating keuangan:", err);
          alert("Gagal menambahkan data keuangan.");
        },
      });
    }
  };

  const handleDeleteKeuangan = (keuanganId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data keuangan ini?")) {
      router.delete(route("keuangan.destroy", [pekerjaan.id, keuanganId]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          if (flash?.success) {
            alert(flash.success);
          }
        },
        onError: (err) => {
          console.error("Error deleting keuangan:", err);
          alert("Gagal menghapus data keuangan.");
        },
      });
    }
  };

  const calculateOverallProgress = () => {
    if (progresses.length === 0) return 0;
    return progresses.reduce((sum, progress) => {
      const fisikPercent = progress.output_volume && progress.output_volume > 0
        ? (Number(progress.realisasi_fisik) / Number(progress.output_volume)) * 100
        : 0;
      const keuanganPercent = kontrak?.nilai_kontrak && keuangan?.realisasi && kontrak.nilai_kontrak > 0
        ? (Number(keuangan.realisasi) / Number(kontrak.nilai_kontrak)) * 100
        : 0;
      return sum + (fisikPercent + keuanganPercent) / 2;
    }, 0) / progresses.length;
  };

  const calculateFisikProgress = () => {
    if (progresses.length === 0) return 0;
    return progresses.reduce((sum, progress) => {
      const fisikPercent = progress.output_volume && progress.output_volume > 0
        ? (Number(progress.realisasi_fisik) / Number(progress.output_volume)) * 100
        : 0;
      return sum + fisikPercent;
    }, 0) / progresses.length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Progress</CardTitle>
        <CardDescription>Kemajuan pelaksanaan proyek</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleProgressSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="komponen_id">Komponen</Label>
              <Select
                value={progressData.komponen_id.toString()}
                onValueChange={(value) => progressData.id === undefined && setProgressData("komponen_id", value)}
                required
              >
                <SelectTrigger id="komponen_id">
                  <SelectValue placeholder="Pilih Komponen" />
                </SelectTrigger>
                <SelectContent>
                  {outputs
                    .filter((output) =>
                      progressData.id !== undefined
                        ? output.id.toString() === progressData.komponen_id.toString()
                        : !progresses.some((progress) => progress.komponen_id === output.id)
                    )
                    .map((output) => (
                      <SelectItem key={output.id} value={output.id.toString()}>
                        {output.komponen}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {progressErrors.komponen_id && <span className="text-red-500 text-sm">{progressErrors.komponen_id}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="realisasi_fisik">Realisasi Fisik (Volume)</Label>
              <Input
                id="realisasi_fisik"
                type="number"
                step="0.01"
                value={progressData.realisasi_fisik}
                onChange={(e) => setProgressData("realisasi_fisik", Number(e.target.value))}
                required
              />
              {progressErrors.realisasi_fisik && <span className="text-red-500 text-sm">{progressErrors.realisasi_fisik}</span>}
            </div>
          </div>
          <Button type="submit" disabled={progressProcessing}>
            {progressData.id ? "Perbarui Progress" : "Tambah Progress"}
          </Button>
        </form>

        {progresses.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">Daftar Progress</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progresses.map((progress) => (
                <Card key={progress.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{progress.komponen_nama || outputs.find(o => o.id === progress.komponen_id)?.komponen || "N/A"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm">Realisasi Fisik</p>
                        <p className="text-sm">{Number(progress.realisasi_fisik).toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Volume Output</p>
                        <p className="text-sm">{progress.output_volume ? Number(progress.output_volume).toFixed(2) : "N/A"}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Persentase Fisik</p>
                        <p className="text-sm">
                          {progress.output_volume && progress.output_volume > 0
                            ? ((Number(progress.realisasi_fisik) / Number(progress.output_volume)) * 100).toFixed(2)
                            : "0.00"}%
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProgress(progress)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProgress(progress.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Belum ada data progress yang ditambahkan.</p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Progress Keseluruhan</p>
          <div className="flex justify-between">
            <p className="text-sm">Realisasi</p>
            <p className="text-sm">{calculateOverallProgress().toFixed(2)}%</p>
          </div>
          <Progress value={calculateOverallProgress()} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Progress Fisik</p>
            <div className="flex justify-between">
              <p className="text-sm">Realisasi</p>
              <p className="text-sm">{calculateFisikProgress().toFixed(2)}%</p>
            </div>
            <Progress value={calculateFisikProgress()} className="h-2" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Progress Keuangan</p>
            <div className="flex justify-between">
              <p className="text-sm">Realisasi</p>
              <p className="text-sm">
                {keuangan?.realisasi
                  ? Number(keuangan.realisasi).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
                  : "Rp 0,00"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Persentase</p>
              <p className="text-sm">
                {kontrak?.nilai_kontrak && keuangan?.realisasi && kontrak.nilai_kontrak > 0
                  ? ((Number(keuangan.realisasi) / Number(kontrak.nilai_kontrak)) * 100).toFixed(2)
                  : "0.00"}%
              </p>
            </div>
            <Progress
              value={
                kontrak?.nilai_kontrak && keuangan?.realisasi && kontrak.nilai_kontrak > 0
                  ? (Number(keuangan.realisasi) / Number(kontrak.nilai_kontrak)) * 100
                  : 0
              }
              className="h-2"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Realisasi Keuangan</p>
          <form onSubmit={handleKeuanganSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realisasi">Realisasi Keuangan (IDR)</Label>
              <Input
                id="realisasi"
                type="number"
                step="0.01"
                value={keuanganData.realisasi}
                onChange={(e) => setKeuanganData("realisasi", Number(e.target.value))}
                required
              />
              {keuanganErrors.realisasi && <span className="text-red-500 text-sm">{keuanganErrors.realisasi}</span>}
            </div>
            <Button type="submit" disabled={keuanganProcessing}>
              {keuangan?.id ? "Perbarui Keuangan" : "Tambah Keuangan"}
            </Button>
          </form>
          {keuangan && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Detail Keuangan Saat Ini</p>
              <div className="flex justify-between">
                <p className="text-sm">Realisasi</p>
                <p className="text-sm">{Number(keuangan.realisasi).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteKeuangan(keuangan.id)}
              >
                Hapus Keuangan
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Laporan Bulanan</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {progressDataPlaceholder.laporan.map((report, index) => (
              <Button key={index} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Laporan {report}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}