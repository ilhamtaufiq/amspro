import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KegiatanFormProps {
    kegiatan?: {
        id: number;
        nama: string;
        bidang: string;
        tahun_anggaran: string;
    };
}

export default function KegiatanForm({ kegiatan }: KegiatanFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        nama: kegiatan?.nama || "",
        bidang: kegiatan?.bidang || "",
        tahun_anggaran: kegiatan?.tahun_anggaran || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (kegiatan) {
            put(`/kegiatan/${kegiatan.id}`, {
                onSuccess: () => {
                    // Handle success
                },
            });
        } else {
            post("/kegiatan", {
                onSuccess: () => {
                    // Handle success
                },
            });
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{kegiatan ? "Edit Kegiatan" : "Tambah Kegiatan"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="nama">Nama Kegiatan</Label>
                        <Input
                            id="nama"
                            value={data.nama}
                            onChange={(e) => setData("nama", e.target.value)}
                            required
                        />
                        {errors.nama && <p className="text-red-500 text-sm">{errors.nama}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bidang">Bidang</Label>
                        <Input
                            id="bidang"
                            value={data.bidang}
                            onChange={(e) => setData("bidang", e.target.value)}
                            required
                        />
                        {errors.bidang && <p className="text-red-500 text-sm">{errors.bidang}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tahun_anggaran">Tahun Anggaran</Label>
                        <Input
                            id="tahun_anggaran"
                            value={data.tahun_anggaran}
                            onChange={(e) => setData("tahun_anggaran", e.target.value)}
                            required
                        />
                        {errors.tahun_anggaran && (
                            <p className="text-red-500 text-sm">{errors.tahun_anggaran}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? "Menyimpan..." : kegiatan ? "Update Kegiatan" : "Tambah Kegiatan"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 