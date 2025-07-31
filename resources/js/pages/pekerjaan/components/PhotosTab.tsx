import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, ChevronsUpDown, Trash2, Loader2, FileDown } from "lucide-react";
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
import { Dialog, DialogContent, DialogOverlay, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import MapSelector from "@/components/MapSelector";
import type { PageProps } from "./types";


export function PhotosTab({ pekerjaan, fotos, penerimas, outputs, errors, flash, initialLat, initialLng }: PageProps & { initialLat?: number; initialLng?: number; }) {
    const [isGettingCoordinates, setIsGettingCoordinates] = useState(false);
    const [desaName, setDesaName] = useState<string | null>(null);
    const [kecamatanName, setKecamatanName] = useState<string | null>(null);
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null); // State for image preview
    const [isMapSelectionOpen, setIsMapSelectionOpen] = useState(false); // State for map selection dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
    const [fotoToDeleteId, setFotoToDeleteId] = useState<number | null>(null); // State to store the ID of the photo to be deleted

    const { data, setData, post, processing, reset, errors: formErrors, setError, clearErrors } = useForm({
        photo: null as File | null,
        keterangan: "0%",
        komponen_id: "",
        penerima_id: null as string | null,
        koordinat: "",
        validasi_koordinat: true,
        validasi_koordinat_message: "",
    });

    const handleConfirmDelete = () => {
        if (fotoToDeleteId !== null) {
            router.delete(route("fotos.destroy", [pekerjaan.id, fotoToDeleteId]), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    if (flash?.success) {
                        alert(flash.success);
                    }
                    setIsDeleteDialogOpen(false);
                    setFotoToDeleteId(null);
                },
                onError: (err) => {
                    console.error("Error deleting photo:", err);
                    alert("Gagal menghapus foto: " + JSON.stringify(err));
                    setIsDeleteDialogOpen(false);
                    setFotoToDeleteId(null);
                },
            });
        }
    };

    // State for Combobox open/closed
    const [keteranganOpen, setKeteranganOpen] = useState(false);
    const [komponenOpen, setKomponenOpen] = useState(false);
    const [penerimaOpen, setPenerimaOpen] = useState(false);

    const keteranganOptions = [
        { value: "0%", label: "0%" },
        { value: "25%", label: "25%" },
        { value: "50%", label: "50%" },
        { value: "75%", label: "75%" },
        { value: "100%", label: "100%" },
    ];

    // Komponen yang membuat penerima opsional
    const komponenOpsional = [
      'IPAL',
      'Tangki Septik Komunal',
      'Broncaptering',
      'Reservoir',
      'Pompa',
      'Sumur Bor',
    ];

    // Cek apakah penerima opsional
    const isPenerimaOptional = () => {
      const selectedKomponen = outputs.find((output) => output.id.toString() === data.komponen_id)?.komponen || '';
      return komponenOpsional.some((nama) => selectedKomponen.toLowerCase().includes(nama.toLowerCase()));
    };

    const performGeocodingAndValidation = async (latitude: number, longitude: number) => {
        setIsGeocodingLoading(true);
        try {
            const response = await fetch(
                `/reverse-geocode?lat=${latitude}&lon=${longitude}`
            );
            const geocodingData = await response.json();

            let foundDesa = geocodingData.desa;
            let foundKecamatan = geocodingData.kecamatan;

            setDesaName(foundDesa || "Tidak ditemukan");
            setKecamatanName(foundKecamatan || "Tidak ditemukan");

            // Validasi kecocokan desa dan kecamatan
            let validasiSesuai = true;
            let validationError = '';
            if (pekerjaan.desa && (!foundDesa || pekerjaan.desa.toLowerCase() !== foundDesa.toLowerCase())) {
              validasiSesuai = false;
              validationError += `Desa yang terdeteksi (${foundDesa || 'tidak ditemukan'}) tidak sesuai dengan desa pekerjaan (${pekerjaan.desa}).`;
            }
            if (pekerjaan.kecamatan && (!foundKecamatan || pekerjaan.kecamatan.toLowerCase() !== foundKecamatan.toLowerCase())) {
              validasiSesuai = false;
              if (validationError) validationError += ' ';
              validationError += `Kecamatan yang terdeteksi (${foundKecamatan || 'tidak ditemukan'}) tidak sesuai dengan kecamatan pekerjaan (${pekerjaan.kecamatan}).`;
            }
            setData(data => ({
              ...data,
              validasi_koordinat: validasiSesuai,
              validasi_koordinat_message: validasiSesuai ? 'Sesuai' : validationError
            }));
        } catch (error) {
            console.error("Error during reverse geocoding:", error);
            setDesaName("Gagal mendapatkan");
            setKecamatanName("Gagal mendapatkan");
        } finally {
            setIsGeocodingLoading(false);
        }
    };

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
                performGeocodingAndValidation(latitude, longitude);
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
        // Validasi penerima jika diperlukan
        if (!isPenerimaOptional() && !data.penerima_id) {
          setError('penerima_id', 'Penerima harus dipilih untuk komponen ini.');
          return;
        }
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
        setFotoToDeleteId(fotoId);
        setIsDeleteDialogOpen(true);
    };

    const [keteranganFilter, setKeteranganFilter] = useState<string | null>(null);
    const [isKeteranganFilterOpen, setIsKeteranganFilterOpen] = useState(false);
    const [komponenFilter, setKomponenFilter] = useState<string | null>(null);
    const [isKomponenFilterOpen, setIsKomponenFilterOpen] = useState(false);

    const filteredFotos = fotos.filter((foto) => {
        const matchesKeterangan = keteranganFilter ? foto.keterangan === keteranganFilter : true;
        const matchesKomponen = komponenFilter ? foto.komponen_id.toString() === komponenFilter : true;
        return matchesKeterangan && matchesKomponen;
    });

    const [isPrinting, setIsPrinting] = useState(false);

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
                            <Label htmlFor="penerima_id">Penerima {isPenerimaOptional() ? '(Opsional)' : '(Wajib)'}</Label>
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsMapSelectionOpen(true)}
                                >
                                    Pilih di Peta
                                </Button>
                            </div>
                            {formErrors.koordinat && <span className="text-red-500 text-sm">{formErrors.koordinat}</span>}
                            {/* Hapus validasi lokasi global (hijau/merah) yang lama, hanya tampilkan validasi per field */}
                            {(desaName || kecamatanName) && (
                              <>
                                {/* Pesan validasi jika ada yang tidak sesuai */}
                                {(
                                  (pekerjaan.desa && desaName && pekerjaan.desa.toLowerCase() !== desaName.toLowerCase()) ||
                                  (pekerjaan.kecamatan && kecamatanName && pekerjaan.kecamatan.toLowerCase() !== kecamatanName.toLowerCase())
                                ) && (
                                  <div className="text-red-600 flex items-center gap-2 mt-2">
                                    <span>❌</span>
                                    <span>
                                      {pekerjaan.desa && desaName && pekerjaan.desa.toLowerCase() !== desaName.toLowerCase() && (
                                        <>Desa yang terdeteksi (<b>{desaName}</b>) tidak sesuai dengan desa pekerjaan (<b>{pekerjaan.desa}</b>).</>
                                      )}
                                      {pekerjaan.kecamatan && kecamatanName && pekerjaan.kecamatan.toLowerCase() !== kecamatanName.toLowerCase() && (
                                        <>
                                          {pekerjaan.desa && desaName && pekerjaan.desa.toLowerCase() !== desaName.toLowerCase() && <br />}
                                          Kecamatan yang terdeteksi (<b>{kecamatanName}</b>) tidak sesuai dengan kecamatan pekerjaan (<b>{pekerjaan.kecamatan}</b>).
                                        </>
                                      )}
                                    </span>
                                  </div>
                                )}

                                {/* Validasi per field */}
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span>Desa/Kelurahan:</span>
                                    <span className="font-semibold">{desaName || '-'}</span>
                                    {pekerjaan.desa && desaName ? (
                                      pekerjaan.desa.toLowerCase() === desaName.toLowerCase() ? (
                                        <span className="text-green-600">✔</span>
                                      ) : (
                                        <span className="text-red-600">❌</span>
                                      )
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>Kecamatan:</span>
                                    <span className="font-semibold">{kecamatanName || '-'}</span>
                                    {pekerjaan.kecamatan && kecamatanName ? (
                                      pekerjaan.kecamatan.toLowerCase() === kecamatanName.toLowerCase() ? (
                                        <span className="text-green-600">✔</span>
                                      ) : (
                                        <span className="text-red-600">❌</span>
                                      )
                                    ) : null}
                                  </div>
                                </div>
                              </>
                            )}
                            {(desaName || kecamatanName) && (
                                <div className="text-sm text-muted-foreground mt-2">
                                    {isGeocodingLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mencari Lokasi...
                                        </span>
                                    ) : (
                                        <>
                                            {/* {desaName && <p>Desa: {desaName}</p>}
                                            {kecamatanName && <p>Kecamatan: {kecamatanName}</p>} */}
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

                {fotos.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="keterangan-filter" className="mb-0">Filter:</Label>
                            <Popover open={isKeteranganFilterOpen} onOpenChange={setIsKeteranganFilterOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isKeteranganFilterOpen}
                                        className="w-full md:w-auto justify-between"
                                    >
                                        {keteranganFilter
                                            ? keteranganOptions.find((opt) => opt.value === keteranganFilter)?.label
                                            : "Semua Keterangan"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari keterangan..." />
                                        <CommandList>
                                            <CommandEmpty>Tidak ada keterangan ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    onSelect={() => {
                                                        setKeteranganFilter(null);
                                                        setIsKeteranganFilterOpen(false);
                                                    }}
                                                >
                                                    Semua Keterangan
                                                </CommandItem>
                                                {keteranganOptions.map((opt) => (
                                                    <CommandItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        onSelect={(currentValue) => {
                                                            setKeteranganFilter(currentValue);
                                                            setIsKeteranganFilterOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                keteranganFilter === opt.value ? "opacity-100" : "opacity-0"
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
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="komponen-filter" className="mb-0">Komponen:</Label>
                            <Popover open={isKomponenFilterOpen} onOpenChange={setIsKomponenFilterOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isKomponenFilterOpen}
                                        className="w-full md:w-auto justify-between"
                                    >
                                        {komponenFilter
                                            ? outputs.find((output) => output.id.toString() === komponenFilter)?.komponen
                                            : "Semua Komponen"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari komponen..." />
                                        <CommandList>
                                            <CommandEmpty>Tidak ada komponen ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    onSelect={() => {
                                                        setKomponenFilter(null);
                                                        setIsKomponenFilterOpen(false);
                                                    }}
                                                >
                                                    Semua Komponen
                                                </CommandItem>
                                                {outputs.map((output) => (
                                                    <CommandItem
                                                        key={output.id}
                                                        value={output.id.toString()}
                                                        onSelect={(currentValue) => {
                                                            setKomponenFilter(currentValue);
                                                            setIsKomponenFilterOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                komponenFilter === output.id.toString() ? "opacity-100" : "opacity-0"
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
                        </div>
                        <a href={route('fotos.print', { pekerjaan: pekerjaan.id, keterangan: keteranganFilter || '', komponen: komponenFilter || '' })} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                <FileDown className="h-4 w-4 mr-2" />
                                Cetak Foto
                            </Button>
                        </a>
                    </div>
                )}

                {filteredFotos.length > 0 ? (
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
                                {filteredFotos.map((foto) => (
                                    <TableRow key={foto.id}>
                                        <TableCell>
                                            <img
                                                src={foto.photo_url}
                                                alt={foto.keterangan}
                                                className="w-20 h-20 object-cover rounded-md cursor-pointer"
                                                onClick={() => setPreviewImage(foto.photo_url)}
                                            />
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
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(foto.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                                }
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">Belum ada foto yang diunggah.</p>
                )}
            </CardContent>

            {/* Image Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-3xl p-0">
                    {previewImage && (
                        <img src={previewImage} alt="Preview" className="w-full h-auto object-contain" />
                    )}
                </DialogContent>
            </Dialog>

            {/* Map Selection Dialog */}
            <Dialog open={isMapSelectionOpen} onOpenChange={setIsMapSelectionOpen}>
                <DialogContent className="max-w-4xl p-0">
                    <DialogHeader className="p-4">
                        <DialogTitle>Pilih Lokasi di Peta</DialogTitle>
                    </DialogHeader>
                    <div className="h-[500px] w-full">
                        <MapSelector
                            onSelectLocation={(lat, lng) => {
                                const coordsString = `${lat}, ${lng}`;
                                setData("koordinat", coordsString);
                                clearErrors('koordinat');
                                setIsMapSelectionOpen(false);
                                performGeocodingAndValidation(lat, lng);
                            }}
                            initialLat={initialLat || -6.8106} // Use existing pekerjaan lat/lng or default
                            initialLng={initialLng || 107.1439} // Use existing pekerjaan lat/lng or default
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                    </DialogHeader>
                    <p>Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}