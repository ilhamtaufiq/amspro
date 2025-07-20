import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, ChevronsUpDown, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import type { PageProps } from "./types";

export function PhotosTab({ pekerjaan, fotos, penerimas, outputs, errors, flash }: PageProps) {
    const [isGettingCoordinates, setIsGettingCoordinates] = useState(false);
    const [desaName, setDesaName] = useState<string | null>(null);
    const [kecamatanName, setKecamatanName] = useState<string | null>(null);
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
    const { data, setData, post, processing, reset, errors: formErrors } = useForm<{
        photo: File | null;
        keterangan: string;
        komponen_id: string;
        penerima_id: string | null;
        koordinat: string;
    }>({
        photo: null,
        keterangan: "0%",
        komponen_id: "",
        penerima_id: null,
        koordinat: "",
    });

    // State for Combobox open/closed
    const [keteranganOpen, setKeteranganOpen] = useState(false);
    const [komponenOpen, setKomponenOpen] = useState(false);
    const [penerimaOpen, setPenerimaOpen] = useState(false);

    const keteranganOptions = [
        { value: "0%", label: "0%" },
        { value: "50%", label: "50%" },
        { value: "100%", label: "100%" },
    ];

    const handleGetCoordinates = () => {
        if (!navigator.geolocation) {
            alert("Geolocation tidak didukung oleh browser Anda.");
            return;
        }

        setIsGettingCoordinates(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const coordsString = `${latitude}, ${longitude}`;
                setData("koordinat", coordsString);
                clearErrors('koordinat'); // Clear any previous coordinate errors
                setIsGettingCoordinates(false);

                // Perform reverse geocoding
                setIsGeocodingLoading(true);
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    let foundDesa = null;
                    let foundKecamatan = null;

                    if (data.address) {
                        // Prioritize village/suburb for desa, then city_district for kecamatan
                        foundDesa = data.address.village || data.address.suburb || data.address.hamlet || data.address.town || data.address.city;
                        foundKecamatan = data.address.city_district || data.address.county;
                    }

                    setDesaName(foundDesa || "Tidak ditemukan");
                    setKecamatanName(foundKecamatan || "Tidak ditemukan");

                    // Add validation for desa and kecamatan match
                    if (pekerjaan.desa && foundDesa && pekerjaan.desa.toLowerCase() !== foundDesa.toLowerCase()) {
                        setError('koordinat', `Desa yang terdeteksi (${foundDesa}) tidak sesuai dengan desa pekerjaan (${pekerjaan.desa}).`);
                    } else if (pekerjaan.kecamatan && foundKecamatan && pekerjaan.kecamatan.toLowerCase() !== foundKecamatan.toLowerCase()) {
                        setError('koordinat', `Kecamatan yang terdeteksi (${foundKecamatan}) tidak sesuai dengan kecamatan pekerjaan (${pekerjaan.kecamatan}).`);
                    } else {
                        clearErrors('koordinat'); // Clear any previous coordinate errors if match
                    }
                } catch (error) {
                    console.error("Error during reverse geocoding:", error);
                    setDesaName("Gagal mendapatkan");
                    setKecamatanName("Gagal mendapatkan");
                } finally {
                    setIsGeocodingLoading(false);
                }
            },
            (error) => {
                console.error("Error getting coordinates:", error);
                alert(`Gagal mendapatkan koordinat: ${error.message}`);
                setIsGettingCoordinates(false);
                setError('koordinat', `Gagal mendapatkan koordinat: ${error.message}`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("photo", data.photo || "");
        formData.append("keterangan", data.keterangan);
        formData.append("komponen_id", data.komponen_id);
        formData.append("penerima_id", data.penerima_id || "");
        formData.append("koordinat", data.koordinat);
        formData.append("validasi_koordinat", hasValidationErrors ? "0" : "1"); // 0 for invalid, 1 for valid
        formData.append("validasi_koordinat_message", hasValidationErrors ? (formErrors.koordinat || "Koordinat tidak valid") : "");

        post(route("fotos.store", pekerjaan.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                if (flash?.success) {
                    alert(flash.success);
                }
            },
            onError: (err) => {
                console.error("Error uploading photo:", err);
                alert("Gagal mengunggah foto: " + JSON.stringify(err));
            },
        });
    };

    const handleDelete = (fotoId: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus foto ini?")) {
            router.delete(route("fotos.destroy", [pekerjaan.id, fotoId]), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    if (flash?.success) {
                        alert(flash.success);
                    }
                },
                onError: (err) => {
                    console.error("Error deleting photo:", err);
                    alert("Gagal menghapus foto: " + JSON.stringify(err));
                },
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Foto Kegiatan</CardTitle>
                <CardDescription>Dokumentasi visual progres proyek</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="photo">Unggah Foto</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                onChange={(e) => setData("photo", e.target.files?.[0] || null)}
                                required
                            />
                            {formErrors.photo && <span className="text-red-500 text-sm">{formErrors.photo}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keterangan">Keterangan</Label>
                            <Popover open={keteranganOpen} onOpenChange={setKeteranganOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={keteranganOpen}
                                        className="w-full justify-between"
                                    >
                                        {data.keterangan
                                            ? keteranganOptions.find((opt) => opt.value === data.keterangan)?.label
                                            : "Pilih Keterangan..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari keterangan..." />
                                        <CommandList>
                                            <CommandEmpty>Tidak ada keterangan ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {keteranganOptions.map((opt) => (
                                                    <CommandItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        onSelect={(currentValue) => {
                                                            setData("keterangan", currentValue);
                                                            setKeteranganOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                data.keterangan === opt.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {opt.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {formErrors.keterangan && <span className="text-red-500 text-sm">{formErrors.keterangan}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="komponen_id">Komponen</Label>
                            <Popover open={komponenOpen} onOpenChange={setKomponenOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={komponenOpen}
                                        className="w-full justify-between"
                                    >
                                        {data.komponen_id
                                            ? outputs.find((output) => output.id.toString() === data.komponen_id)?.komponen
                                            : "Pilih Komponen..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari komponen..." />
                                        <CommandList>
                                            <CommandEmpty>Tidak ada komponen ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {outputs.map((output) => (
                                                    <CommandItem
                                                        key={output.id}
                                                        value={output.id.toString()}
                                                        onSelect={(currentValue) => {
                                                            setData("komponen_id", currentValue);
                                                            setKomponenOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                data.komponen_id === output.id.toString() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {output.komponen}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {formErrors.komponen_id && <span className="text-red-500 text-sm">{formErrors.komponen_id}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="penerima_id">Penerima (Opsional)</Label>
                            <Popover open={penerimaOpen} onOpenChange={setPenerimaOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={penerimaOpen}
                                        className="w-full justify-between"
                                    >
                                        {data.penerima_id
                                            ? penerimas.find((penerima) => penerima.id.toString() === data.penerima_id)?.nama
                                            : data.penerima_id === "none"
                                                ? "Tidak Ada"
                                                : "Pilih Penerima..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari penerima..." />
                                        <CommandList>
                                            <CommandEmpty>Tidak ada penerima ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="none"
                                                    onSelect={() => {
                                                        setData("penerima_id", null);
                                                        setPenerimaOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            data.penerima_id === null ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    Tidak Ada
                                                </CommandItem>
                                                {penerimas.map((penerima) => (
                                                    <CommandItem
                                                        key={penerima.id}
                                                        value={penerima.id.toString()}
                                                        onSelect={(currentValue) => {
                                                            setData("penerima_id", currentValue);
                                                            setPenerimaOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                data.penerima_id === penerima.id.toString() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {penerima.nama}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {formErrors.penerima_id && <span className="text-red-500 text-sm">{formErrors.penerima_id}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="koordinat">Koordinat</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="koordinat"
                                    value={data.koordinat}
                                    onChange={(e) => setData("koordinat", e.target.value)}
                                    placeholder="Contoh: -6.786978, 107.167854"
                                    required
                                    disabled // Disable manual input
                                />
                                <Button
                                    type="button"
                                    onClick={handleGetCoordinates}
                                    disabled={isGettingCoordinates || isGeocodingLoading}
                                >
                                    {isGettingCoordinates ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mendapatkan...
                                        </span>
                                    ) : isGeocodingLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mencari Lokasi...
                                        </span>
                                    ) : (
                                        "Dapatkan Koordinat"
                                    )}
                                </Button>
                            </div>
                            {formErrors.koordinat && <span className="text-red-500 text-sm">{formErrors.koordinat}</span>}
                            {(desaName || kecamatanName) && (
                                <div className="text-sm text-muted-foreground mt-2">
                                    {isGeocodingLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mencari Lokasi...
                                        </span>
                                    ) : (
                                        <>
                                            {desaName && <p>Desa: {desaName}</p>}
                                            {kecamatanName && <p>Kecamatan: {kecamatanName}</p>}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Mengunggah..." : "Unggah Foto"}
                    </Button>
                </form>
                {fotos.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Foto</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead>Komponen</TableHead>
                                    <TableHead>Penerima</TableHead>
                                    <TableHead>Koordinat</TableHead>
                                    <TableHead>Status Koordinat</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fotos.map((foto) => (
                                    <TableRow key={foto.id}>
                                        <TableCell>
                                            <img src={foto.photo_url} alt={foto.keterangan} className="w-20 h-20 object-cover rounded-md" />
                                        </TableCell>
                                        <TableCell>{foto.keterangan}</TableCell>
                                        <TableCell>{foto.komponen_nama || "N/A"}</TableCell>
                                        <TableCell>{foto.penerima_nama || "N/A"}</TableCell>
                                        <TableCell>{foto.koordinat}</TableCell>
                                        <TableCell>
                                            {foto.validasi_koordinat === undefined ? (
                                                "N/A"
                                            ) : foto.validasi_koordinat ? (
                                                <span className="text-green-600">Sesuai</span>
                                            ) : (
                                                <span className="text-red-600">{foto.validasi_koordinat_message || "Tidak Sesuai"}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>Aksi</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">Belum ada foto yang diunggah.</p>
                )}
            </CardContent>
        </Card>
    );
}
