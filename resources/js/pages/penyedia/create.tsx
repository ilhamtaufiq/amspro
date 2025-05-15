import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PenyediaCreate: React.FC = () => {
  const { data, setData, post, processing, errors, reset } = useForm({
    nama: "",
    direktur: "",
    no_akta: "",
    notaris: "",
    tanggal_akta: "",
    alamat: "",
    bank: "",
    norek: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form", data); // Debug log
    post(route("penyedia.store"), {
      onSuccess: () => reset(), // Reset form on success
      onError: (err) => console.error("Error:", err), // Debug errors
    });
  };

  return (
    <div className="container mx-auto py-6">
      <Head title="Tambah Penyedia" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nama">Nama</Label>
          <Input
            id="nama"
            value={data.nama}
            onChange={(e) => setData("nama", e.target.value)}
            required
          />
          {errors.nama && <span className="text-red-500">{errors.nama}</span>}
        </div>
        <div>
          <Label htmlFor="direktur">Direktur</Label>
          <Input
            id="direktur"
            value={data.direktur}
            onChange={(e) => setData("direktur", e.target.value)}
            required
          />
          {errors.direktur && <span className="text-red-500">{errors.direktur}</span>}
        </div>
        <div>
          <Label htmlFor="no_akta">No Akta</Label>
          <Input
            id="no_akta"
            value={data.no_akta}
            onChange={(e) => setData("no_akta", e.target.value)}
            required
          />
          {errors.no_akta && <span className="text-red-500">{errors.no_akta}</span>}
        </div>
        <div>
          <Label htmlFor="notaris">Notaris</Label>
          <Input
            id="notaris"
            value={data.notaris}
            onChange={(e) => setData("notaris", e.target.value)}
            required
          />
          {errors.notaris && <span className="text-red-500">{errors.notaris}</span>}
        </div>
        <div>
          <Label htmlFor="tanggal_akta">Tanggal Akta</Label>
          <Input
            id="tanggal_akta"
            type="date"
            value={data.tanggal_akta}
            onChange={(e) => setData("tanggal_akta", e.target.value)}
          />
          {errors.tanggal_akta && <span className="text-red-500">{errors.tanggal_akta}</span>}
        </div>
        <div>
          <Label htmlFor="alamat">Alamat</Label>
          <Input
            id="alamat"
            value={data.alamat}
            onChange={(e) => setData("alamat", e.target.value)}
            required
          />
          {errors.alamat && <span className="text-red-500">{errors.alamat}</span>}
        </div>
        <div>
          <Label htmlFor="bank">Bank</Label>
          <Input
            id="bank"
            value={data.bank}
            onChange={(e) => setData("bank", e.target.value)}
          />
          {errors.bank && <span className="text-red-500">{errors.bank}</span>}
        </div>
        <div>
          <Label htmlFor="norek">No Rekening</Label>
          <Input
            id="norek"
            value={data.norek}
            onChange={(e) => setData("norek", e.target.value)}
          />
          {errors.norek && <span className="text-red-500">{errors.norek}</span>}
        </div>
        <Button type="submit" disabled={processing}>Simpan</Button>
      </form>
    </div>
  );
};

export default PenyediaCreate;
