import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { PageProps, Progress as ProgressType } from "./types";

export function StatusTab({ pekerjaan, kontrak, keuangan, progresses, outputs }: PageProps) {
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

  const milestones = () => {
    const contractMilestones: { title: string; status: string; date: string }[] = [];
    const outputMilestones: { title: string; status: string; date: string }[] = [];

    if (kontrak) {
      const today = new Date();
      if (kontrak.mulai) {
        try {
          const mulaiDate = new Date(kontrak.mulai);
          if (!isNaN(mulaiDate.getTime())) {
            contractMilestones.push({
              title: "Mulai Proyek",
              status: mulaiDate <= today ? "Selesai" : "Dalam Proses",
              date: mulaiDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            });
          }
        } catch (e) {
          console.warn("Invalid kontrak.mulai date:", kontrak.mulai);
        }
      }

      if (kontrak.selesai) {
        try {
          const selesaiDate = new Date(kontrak.selesai);
          if (!isNaN(selesaiDate.getTime())) {
            contractMilestones.push({
              title: "Target Selesai Proyek",
              status: selesaiDate <= today ? "Selesai" : "Belum Dimulai",
              date: `Target selesai ${selesaiDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}`,
            });
          }
        } catch (e) {
          console.warn("Invalid kontrak.selesai date:", kontrak.selesai);
        }
      }

      if (kontrak.sppbj) {
        try {
          const sppbjDate = kontrak.tanggal_penawaran
            ? new Date(kontrak.tanggal_penawaran)
            : kontrak.mulai
            ? new Date(kontrak.mulai)
            : null;
          if (sppbjDate && !isNaN(sppbjDate.getTime())) {
            contractMilestones.push({
              title: "Penerbitan SPPBJ",
              status: "Selesai",
              date: sppbjDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            });
          }
        } catch (e) {
          console.warn("Invalid date for SPPBJ:", kontrak.tanggal_penawaran || kontrak.mulai);
        }
      }
    }

    outputs.forEach((output) => {
      const relatedProgresses = progresses.filter(
        (progress) => progress.komponen_id === output.id
      );
      const totalRealisasiFisik = relatedProgresses.reduce(
        (sum, progress) => sum + Number(progress.realisasi_fisik),
        0
      );
      const volume = Number(output.volume);
      const completionPercent = volume > 0 ? (totalRealisasiFisik / volume) * 100 : 0;

      let status = "Belum Dimulai";
      let date = "Belum ada progres";

      if (totalRealisasiFisik > 0) {
        status = completionPercent >= 100 ? "Selesai" : "Dalam Proses";
        const latestProgress = relatedProgresses.reduce(
          (latest, progress) =>
            !latest || new Date(progress.created_at) > new Date(latest.created_at)
              ? progress
              : latest,
          null as ProgressType | null
        );
        if (latestProgress) {
          try {
            const progressDate = new Date(latestProgress.created_at);
            if (!isNaN(progressDate.getTime())) {
              date = progressDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            }
          } catch (e) {
            console.warn("Invalid progress.created_at date:", latestProgress.created_at);
          }
        }
      }

      outputMilestones.push({
        title: `Penyelesaian ${output.komponen}`,
        status,
        date,
      });
    });

    contractMilestones.sort((a, b) => {
      const dateA = a.date.includes("Target")
        ? new Date(9999, 0, 1)
        : a.date !== "Tanggal tidak tersedia"
        ? new Date(a.date)
        : new Date(0);
      const dateB = b.date.includes("Target")
        ? new Date(9999, 0, 1)
        : b.date !== "Tanggal tidak tersedia"
        ? new Date(b.date)
        : new Date(0);
      return dateA.getTime() - dateB.getTime() || a.title.localeCompare(b.title);
    });

    outputMilestones.sort((a, b) => {
      const dateA = a.date !== "Belum ada progres" ? new Date(a.date) : new Date(0);
      const dateB = b.date !== "Belum ada progres" ? new Date(b.date) : new Date(0);
      return dateA.getTime() - dateB.getTime() || a.title.localeCompare(b.title);
    });

    return [...contractMilestones, ...outputMilestones];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Status Proyek</CardTitle>
          <CardDescription>Informasi status terkini proyek</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Status Proyek</p>
              <Badge
                className={
                  kontrak != null
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                }
              >
                {kontrak != null ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tanggal Mulai</p>
              <p className="text-sm">{kontrak != null && kontrak.mulai ? kontrak.mulai : "N/A"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tanggal Selesai</p>
              <p className="text-sm">{kontrak != null && kontrak.selesai ? kontrak.selesai : "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Progress Keseluruhan</p>
              <p className="text-sm font-medium">{calculateOverallProgress().toFixed(2)}%</p>
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

          <div className="space-y-2">
            <p className="text-sm font-medium">Catatan Status</p>
            <p className="text-sm text-muted-foreground">
              {kontrak != null
                ? "Proyek berjalan sesuai jadwal."
                : "Proyek belum aktif karena belum ada kontrak yang ditetapkan."}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Milestone Proyek</CardTitle>
          <CardDescription>Pencapaian utama proyek</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones().length > 0 ? (
              milestones().map((milestone, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Badge
                    className={`mt-1 ${
                      milestone.status === "Selesai"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : milestone.status === "Dalam Proses"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {milestone.status}
                  </Badge>
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">{milestone.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada milestone yang tersedia.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}