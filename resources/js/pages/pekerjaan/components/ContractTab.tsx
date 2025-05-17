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
import { Trash2, File, FileText, Image, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import type { PageProps } from "./types";

interface KontrakFormData {
  id_kegiatan: number;
  id_pekerjaan: number;
  id_penyedia: number | string;
  kode_rup: string;
  kode_paket: string;
  nomor_penawaran: string;
  tanggal_penawaran: string;
  nilai_kontrak: number;
  tgl_sppbj: string;
  tgl_spk: string;
  tgl_spmk: string;
  tgl_selesai: string;
  sppbj: string;
  spk: string;
  spmk: string;
}

interface Berkas {
  id: number;
  pekerjaan_id: number;
  jenis_dokumen: string;
  created_at: string;
  file_url: string;
}

export function ContractTab({ pekerjaan, kontrak, penyediaList, berkasList, errors, flash }: PageProps) {
  const { data: contractData, setData: setContractData, post, put, processing: contractProcessing, errors: contractErrors, reset: resetContract } = useForm<KontrakFormData>({
    id_kegiatan: kontrak?.id_kegiatan || 0,
    id_pekerjaan: pekerjaan.id,
    id_penyedia: kontrak?.id_penyedia || "",
    kode_rup: kontrak?.kode_rup || "",
    kode_paket: kontrak?.kode_paket || "",
    nomor_penawaran: kontrak?.nomor_penawaran || "",
    tanggal_penawaran: kontrak?.tanggal_penawaran || "",
    nilai_kontrak: kontrak?.nilai_kontrak || 0,
    tgl_spmk: kontrak?.tgl_spmk || "",
    tgl_selesai: kontrak?.tgl_selesai || "",
    sppbj: kontrak?.sppbj || "",
    spk: kontrak?.spk || "",
    spmk: kontrak?.spmk || "",
  });

  const { data: berkasData, setData: setBerkasData, post: postBerkas, processing: berkasProcessing, errors: berkasErrors, reset: resetBerkas } = useForm<{
    file: File | null;
    jenis_dokumen: string;
  }>({
    file: null,
    jenis_dokumen: "",
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kontrak) {
      put(route("kontrak.update", kontrak.id), {
        data: {
          ...contractData,
          id_penyedia: Number(contractData.id_penyedia),
        },
        onSuccess: () => {
          alert("Kontrak berhasil diperbarui!");
        },
        onError: (err) => console.error("Error updating contract:", err),
        preserveState: true,
      });
    } else {
      post(route("kontrak.store"), {
        data: {
          ...contractData,
          id_penyedia: Number(contractData.id_penyedia),
        },
        onSuccess: () => {
          resetContract();
          alert("Kontrak berhasil dibuat!");
        },
        onError: (err) => console.error("Error creating contract:", err),
        preserveState: true,
      });
    }
  };

  const handleBerkasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postBerkas(route("berkas.store", pekerjaan.id), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        resetBerkas();
        setPreviewUrl(null);
        if (flash?.success) {
          alert(flash.success);
        }
      },
      onError: (err) => {
        console.error("Error uploading document:", err);
        alert("Gagal mengunggah dokumen: " + JSON.stringify(err));
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBerkasData("file", file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDelete = (berkasId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      router.delete(route("berkas.destroy", [pekerjaan.id, berkasId]), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          if (flash?.success) {
            alert(flash.success);
          }
        },
        onError: (err) => {
          console.error("Error deleting document:", err);
          alert("Gagal menghapus dokumen: " + JSON.stringify(err));
        },
      });
    }
  };

  // Map file extensions to lucide-react icons
  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <File className="w-16 h-16 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-16 h-16 text-blue-500" />;
      case 'jpg':
      case 'png':
        return null; // Use <img> for images
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-16 h-16 text-green-500" />;
      default:
        return <File className="w-16 h-16 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Kontrak</CardTitle>
        <CardDescription>Input dan informasi kontrak serta dokumen proyek</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Contract Form */}
        <form onSubmit={handleContractSubmit} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_penyedia">Penyedia</Label>
              <Select
                value={contractData.id_penyedia.toString()}
                onValueChange={(value) => setContractData("id_penyedia", value)}
                required
              >
                <SelectTrigger id="id_penyedia">
                  <SelectValue placeholder="Pilih Penyedia" />
                </SelectTrigger>
                <SelectContent>
                  {penyediaList.map((penyedia) => (
                    <SelectItem key={penyedia.id} value={penyedia.id.toString()}>
                      {penyedia.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {contractErrors.id_penyedia && <span className="text-red-500 text-sm">{contractErrors.id_penyedia}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kode_rup">Kode RUP</Label>
              <Input
                id="kode_rup"
                value={contractData.kode_rup}
                onChange={(e) => setContractData("kode_rup", e.target.value)}
                required
              />
              {contractErrors.kode_rup && <span className="text-red-500 text-sm">{contractErrors.kode_rup}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kode_paket">Kode Paket</Label>
              <Input
                id="kode_paket"
                value={contractData.kode_paket}
                onChange={(e) => setContractData("kode_paket", e.target.value)}
                required
              />
              {contractErrors.kode_paket && <span className="text-red-500 text-sm">{contractErrors.kode_paket}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomor_penawaran">Nomor Penawaran</Label>
              <Input
                id="nomor_penawaran"
                value={contractData.nomor_penawaran}
                onChange={(e) => setContractData("nomor_penawaran", e.target.value)}
                required
              />
              {contractErrors.nomor_penawaran && <span className="text-red-500 text-sm">{contractErrors.nomor_penawaran}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_penawaran">Tanggal Penawaran</Label>
              <Input
                id="tanggal_penawaran"
                type="date"
                value={contractData.tanggal_penawaran}
                onChange={(e) => setContractData("tanggal_penawaran", e.target.value)}
                required
              />
              {contractErrors.tanggal_penawaran && <span className="text-red-500 text-sm">{contractErrors.tanggal_penawaran}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nilai_kontrak">Nilai Kontrak</Label>
              <Input
                id="nilai_kontrak"
                type="number"
                value={contractData.nilai_kontrak}
                onChange={(e) => setContractData("nilai_kontrak", Number(e.target.value))}
                required
              />
              {contractErrors.nilai_kontrak && <span className="text-red-500 text-sm">{contractErrors.nilai_kontrak}</span>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="tgl_sppbj">Tanggal SPPBJ</Label>
              <Input
                id="tgl_sppbj"
                type="date"
                value={contractData.tgl_sppbj}
                onChange={(e) => setContractData("tgl_sppbj", e.target.value)}
                required
              />
              {contractErrors.tgl_spmk && <span className="text-red-500 text-sm">{contractErrors.tgl_sppbj}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tgl_spk">Tanggal SPK</Label>
              <Input
                id="tgl_spk"
                type="date"
                value={contractData.tgl_spk}
                onChange={(e) => setContractData("tgl_spk", e.target.value)}
                required
              />
              {contractErrors.tgl_spk && <span className="text-red-500 text-sm">{contractErrors.tgl_spk}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tgl_spmk">Tanggal Mulai</Label>
              <Input
                id="tgl_spmk"
                type="date"
                value={contractData.tgl_spmk}
                onChange={(e) => setContractData("tgl_spmk", e.target.value)}
                required
              />
              {contractErrors.tgl_spmk && <span className="text-red-500 text-sm">{contractErrors.tgl_spmk}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tgl_selesai">Tanggal Selesai</Label>
              <Input
                id="tgl_selesai"
                type="date"
                value={contractData.tgl_selesai}
                onChange={(e) => setContractData("tgl_selesai", e.target.value)}
                required
              />
              {contractErrors.tgl_selesai && <span className="text-red-500 text-sm">{contractErrors.tgl_selesai}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sppbj">SPPBJ</Label>
              <Input
                id="sppbj"
                value={contractData.sppbj}
                onChange={(e) => setContractData("sppbj", e.target.value)}
                required
              />
              {contractErrors.sppbj && <span className="text-red-500 text-sm">{contractErrors.sppbj}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="spk">SPK</Label>
              <Input
                id="spk"
                value={contractData.spk}
                onChange={(e) => setContractData("spk", e.target.value)}
                required
              />
              {contractErrors.spk && <span className="text-red-500 text-sm">{contractErrors.spk}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="spmk">SPMK</Label>
              <Input
                id="spmk"
                value={contractData.spmk}
                onChange={(e) => setContractData("spmk", e.target.value)}
                required
              />
              {contractErrors.spmk && <span className="text-red-500 text-sm">{contractErrors.spmk}</span>}
            </div>
          </div>
          <Button type="submit" disabled={contractProcessing}>
            {kontrak ? "Perbarui Kontrak" : "Simpan Kontrak"}
          </Button>
        </form>

        {/* Document Upload Form */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Dokumen Pekerjaan</h3>
          <form onSubmit={handleBerkasSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file">Unggah Dokumen</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  required
                />
                {berkasErrors.file && <span className="text-red-500 text-sm">{berkasErrors.file}</span>}
                {previewUrl && (
                  <div className="mt-2">
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Pratinjau Dokumen
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenis_dokumen">Jenis Dokumen</Label>
                <Input
                  id="jenis_dokumen"
                  value={berkasData.jenis_dokumen}
                  onChange={(e) => setBerkasData("jenis_dokumen", e.target.value)}
                  placeholder="Masukkan jenis dokumen"
                  required
                />
                {berkasErrors.jenis_dokumen && (
                  <span className="text-red-500 text-sm">{berkasErrors.jenis_dokumen}</span>
                )}
              </div>
            </div>
            <Button type="submit" disabled={berkasProcessing}>
              {berkasProcessing ? "Mengunggah..." : "Unggah Dokumen"}
            </Button>
          </form>

          {/* Document List */}
          {berkasList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {berkasList.map((berkas) => (
                <div key={berkas.id} className="space-y-2 relative">
                  <div className="relative w-full h-48 overflow-hidden rounded-lg flex items-center justify-center bg-gray-100">
                    {getFileIcon(berkas.file_url) ? (
                      getFileIcon(berkas.file_url)
                    ) : (
                      <img
                        src={berkas.file_url}
                        alt={berkas.jenis_dokumen}
                        className="object-cover w-full h-full"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleDelete(berkas.id)}
                      disabled={berkasProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {berkas.jenis_dokumen}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Diunggah: {new Date(berkas.created_at).toLocaleDateString()}
                    </p>
                    <a
                      href={berkas.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Lihat Dokumen
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Belum ada dokumen yang diunggah.</p>
          )}
        </div>

        {/* Existing Contract Details */}
        {kontrak && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Detail Kontrak Saat Ini</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Nomor Kontrak</p>
                <p className="text-sm">{kontrak.nomor_penawaran}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Tanggal Kontrak</p>
                <p className="text-sm">{kontrak.tanggal_penawaran}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Nilai Kontrak</p>
                <p className="text-sm font-semibold">{kontrak.nilai_kontrak.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Penyedia</p>
                <p className="text-sm">{penyediaList.find(p => p.id === kontrak.id_penyedia)?.nama || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
