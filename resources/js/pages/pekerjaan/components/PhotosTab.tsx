import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, ChevronsUpDown, Trash2, Loader2, FileDown, Pencil } from "lucide-react";
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
import { useState, useEffect } from "react";
import MapSelector from "@/components/MapSelector";
import type { PageProps, Foto, Output } from "./types";


export function PhotosTab({ pekerjaan, fotos, penerimas, outputs, errors, flash, initialLat, initialLng }: PageProps & { initialLat?: number; initialLng?: number; }) {
    const [isGettingCoordinates, setIsGettingCoordinates] = useState(false);
    const [desaName, setDesaName] = useState<string | null>(null);
    const [kecamatanName, setKecamatanName] = useState<string | null>(null);
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null); // State for image preview
    const [isMapSelectionOpen, setIsMapSelectionOpen] = useState(false); // State for map selection dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
    const [fotoToDeleteId, setFotoToDeleteId] = useState<number | null>(null); // State to store the ID of the photo to be deleted
    const [editingFoto, setEditingFoto] = useState<Foto | null>(null); // State for editing foto
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State for edit dialog
    const [selectedOutput, setSelectedOutput] = useState<Output | null>(null);

    const { data, setData, post, processing, reset, errors: formErrors, setError, clearErrors } = useForm({
        photo: null as File | null,
        keterangan: "0%",
        komponen_id: "",
        penerima_id: null as string | null,
        unit: "",
        koordinat: "",
        validasi_koordinat: true,
        validasi_koordinat_message: "",
    });

    const { data: editData, setData: setEditData, post: updatePost, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm({
        photo: null as File | null,
        keterangan: "",
        komponen_id: "",
        penerima_id: null as string | null,
        unit: "",
        koordinat: "",
        validasi_koordinat: true,
        validasi_koordinat_message: "",
        _method: 'PUT'
    });

    useEffect(() => {
        const output = outputs.find(o => o.id.toString() === data.komponen_id) || null;
        setSelectedOutput(output);
    }, [data.komponen_id, outputs]);

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

    const handleEdit = (foto: Foto) => {
        setEditingFoto(foto);
        setEditData("photo", null);
        setEditData("keterangan", foto.keterangan);
        setEditData("komponen_id", foto.komponen_id.toString());
        setEditData("penerima_id", foto.penerima_id?.toString() || null);
        setEditData("unit", foto.unit || "");
        setEditData("koordinat", foto.koordinat);
        setEditData("validasi_koordinat", foto.validasi_koordinat ?? true);
        setEditData("validasi_koordinat_message", foto.validasi_koordinat_message ?? "");
        setIsEditDialogOpen(true);
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFoto) return;

        const isEditPenerimaOptional = isPenerimaOptional(editData.komponen_id);

        // Create a new FormData object to handle file upload properly
        const formData = new FormData();
        
        // Only add photo if a new one is selected
        if (editData.photo) {
            formData.append('photo', editData.photo);
        }
        
        // Add other fields
        formData.append('keterangan', editData.keterangan);
        formData.append('komponen_id', editData.komponen_id);
        
        if (isEditPenerimaOptional) {
            formData.append('penerima_id', ''); // Send empty string or null if optional
            formData.append('unit', editData.unit);
        } else {
            if (editData.penerima_id) {
                formData.append('penerima_id', editData.penerima_id);
            } else {
                // Set error if penerima is not optional and not selected
                setEditData('penerima_id', ''); // Clear penerima_id to trigger validation
                alert('Penerima harus dipilih untuk komponen ini.'); // Or use a more sophisticated error display
                return;
            }
            formData.append('unit', ''); // Clear unit if not optional
        }

        formData.append('koordinat', editData.koordinat);
        formData.append('validasi_koordinat', editData.validasi_koordinat ? '1' : '0');
        formData.append('validasi_koordinat_message', editData.validasi_koordinat_message);
        formData.append('_method', 'PUT');

        // Use router.post instead of updatePost to handle FormData
        router.post(route("fotos.update", [pekerjaan.id, editingFoto.id]), formData, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                resetEditForm();
            },
            onError: (err) => {
                console.error("Error updating photo:", err);
                alert("Gagal memperbarui foto: " + JSON.stringify(err));
            }
        });
    };

    // State for Combobox open/closed
    const [keteranganOpen, setKeteranganOpen] = useState(false);
    const [komponenOpen, setKomponenOpen] = useState(false);
    const [penerimaOpen, setPenerimaOpen] = useState(false);
    
    // State for Edit Dialog Combobox open/closed
    const [editKeteranganOpen, setEditKeteranganOpen] = useState(false);
    const [editKomponenOpen, setEditKomponenOpen] = useState(false);
    const [editPenerimaOpen, setEditPenerimaOpen] = useState(false);

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
    const isPenerimaOptional = (komponenId: string | null) => {
      const selectedKomponen = outputs.find((output) => output.id.toString() === komponenId)?.komponen || '';
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

        const dataToSubmit = {
            ...data,
            penerima_id: isPenerimaOptional(data.komponen_id) ? null : data.penerima_id,
            unit: isPenerimaOptional(data.komponen_id) ? data.unit : "",
        };

        if (!isPenerimaOptional(data.komponen_id) && !dataToSubmit.penerima_id) {
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
            onError: (err: any) => {
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

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // You can adjust this value

    const filteredFotos = fotos.filter((foto) => {
        const matchesKeterangan = keteranganFilter ? foto.keterangan === keteranganFilter : true;
        const matchesKomponen = komponenFilter ? foto.komponen_id.toString() === komponenFilter : true;
        return matchesKeterangan && matchesKomponen;
    });

    // Calculate total pages
    const totalPages = Math.ceil(filteredFotos.length / itemsPerPage);

    // Get current page photos
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFotos = filteredFotos.slice(indexOfFirstItem, indexOfLastItem);

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
                            <Label htmlFor="penerima_id">Penerima {isPenerimaOptional(data.komponen_id) ? '(Opsional)' : '(Wajib)'}</Label>
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
                        {isPenerimaOptional(data.komponen_id) && (
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit (Opsional)</Label>
                                <Input
                                    id="unit"
                                    value={data.unit}
                                    onChange={(e) => setData("unit", e.target.value)}
                                    placeholder="Contoh: Unit A, Unit B, dll"
                                />
                                {formErrors.unit && <span className="text-red-500 text-sm">{formErrors.unit}</span>}
                            </div>
                        )}
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
                                {currentFotos.map((foto) => (
                                    <TableRow key={foto.id}>
                                        <TableCell>
                                            <img
                                                src={foto.photo_base64 || foto.photo_thumb_url}
                                                alt={foto.keterangan}
                                                className="w-20 h-20 object-cover rounded-md cursor-pointer"
                                                onClick={() => setPreviewImage(foto.photo_base64 || foto.photo_medium_url)}
                                            />
                                        </TableCell>
                                        <TableCell>{foto.keterangan}</TableCell>
                                        <TableCell>{foto.komponen_nama || "N/A"}</TableCell>
                                        <TableCell>{foto.penerima_nama || foto.unit || "N/A"}</TableCell>
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
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(foto)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
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

                {/* Pagination Controls */}
                {filteredFotos.length > itemsPerPage && (
                    <div className="flex justify-center items-center space-x-2 mt-4">
                        <Button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                        >
                            Previous
                        </Button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <Button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                        >
                            Next
                        </Button>
                    </div>
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

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Foto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-photo">Ubah Foto (Opsional)</Label>
                                <Input
                                    id="edit-photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={(e) => setEditData("photo", e.target.files?.[0] || null)}
                                />
                                {editErrors.photo && <span className="text-red-500 text-sm">{editErrors.photo}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-keterangan">Keterangan (Opsional)</Label>
                                <Popover open={editKeteranganOpen} onOpenChange={setEditKeteranganOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={editKeteranganOpen}
                                            className="w-full justify-between"
                                        >
                                            {editData.keterangan
                                                ? keteranganOptions.find((opt) => opt.value === editData.keterangan)?.label
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
                                                                setEditData("keterangan", currentValue);
                                                                setEditKeteranganOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    editData.keterangan === opt.value ? "opacity-100" : "opacity-0"
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
                                {editErrors.keterangan && <span className="text-red-500 text-sm">{editErrors.keterangan}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-komponen">Komponen (Opsional)</Label>
                                <Popover open={editKomponenOpen} onOpenChange={setEditKomponenOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={editKomponenOpen}
                                            className="w-full justify-between"
                                        >
                                            {editData.komponen_id
                                                ? outputs.find((output) => output.id.toString() === editData.komponen_id)?.komponen
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
                                                                setEditData("komponen_id", currentValue);
                                                                setEditKomponenOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    editData.komponen_id === output.id.toString() ? "opacity-100" : "opacity-0"
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
                                {editErrors.komponen_id && <span className="text-red-500 text-sm">{editErrors.komponen_id}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-penerima">Penerima {isPenerimaOptional(editData.komponen_id) ? '(Opsional)' : '(Wajib)'}</Label>
                                <Popover open={editPenerimaOpen} onOpenChange={setEditPenerimaOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={editPenerimaOpen}
                                            className="w-full justify-between"
                                        >
                                            {editData.penerima_id
                                                ? penerimas.find((penerima) => penerima.id.toString() === editData.penerima_id)?.nama
                                                : editData.penerima_id === "none"
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
                                                            setEditData("penerima_id", null);
                                                            setEditPenerimaOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                editData.penerima_id === null ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        Tidak Ada
                                                    </CommandItem>
                                                    {penerimas.map((penerima) => (
                                                        <CommandItem
                                                            key={penerima.id}
                                                            value={penerima.id.toString()}
                                                            onSelect={(currentValue) => {
                                                                setEditData("penerima_id", currentValue);
                                                                setEditPenerimaOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    editData.penerima_id === penerima.id.toString() ? "opacity-100" : "opacity-0"
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
                                {editErrors.penerima_id && <span className="text-red-500 text-sm">{editErrors.penerima_id}</span>}
                            </div>
                            {isPenerimaOptional(editData.komponen_id) && (
                                <div className="space-y-2">
                                    <Label htmlFor="edit-unit">Unit (Opsional)</Label>
                                    <Input
                                        id="edit-unit"
                                        value={editData.unit || ""}
                                        onChange={(e) => setEditData("unit", e.target.value)}
                                        placeholder="Contoh: Unit A, Unit B, dll"
                                    />
                                    {editErrors.unit && <span className="text-red-500 text-sm">{editErrors.unit}</span>}
                                </div>
                            )}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="edit-koordinat">Koordinat</Label>
                                <div className="flex gap-2">
                                <Input
                                    id="edit-koordinat"
                                    value={editData.koordinat}
                                        placeholder="Contoh: -6.786978, 107.167854"
                                        disabled
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
                                {editErrors.koordinat && <span className="text-red-500 text-sm">{editErrors.koordinat}</span>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={editProcessing}>
                                {editProcessing ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}