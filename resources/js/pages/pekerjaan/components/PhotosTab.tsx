import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Check, ChevronsUpDown } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <Input
                id="koordinat"
                value={data.koordinat}
                onChange={(e) => setData("koordinat", e.target.value)}
                placeholder="Contoh: -6.786978, 107.167854"
                required
              />
              {formErrors.koordinat && <span className="text-red-500 text-sm">{formErrors.koordinat}</span>}
            </div>
          </div>
          <Button type="submit" disabled={processing}>
            {processing ? "Mengunggah..." : "Unggah Foto"}
          </Button>
        </form>
        {fotos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fotos.map((foto) => (
              <div key={foto.id} className="space-y-2 relative">
                <div className="relative w-full h-48 overflow-hidden rounded-lg">
                  <img
                    src={foto.photo_url}
                    alt={foto.keterangan}
                    className="object-cover w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleDelete(foto.id)}
                    disabled={processing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <p className="font-medium text-sm">{foto.komponen_nama || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{foto.keterangan}</p>
                  <p className="text-sm text-muted-foreground">Penerima: {foto.penerima_nama || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Belum ada foto yang diunggah.</p>
        )}
      </CardContent>
    </Card>
  );
}