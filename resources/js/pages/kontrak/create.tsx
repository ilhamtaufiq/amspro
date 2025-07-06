import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Combobox } from '@/components/ui/combobox';

interface Pekerjaan {
    id: number;
    nama_paket: string;
    pagu: number;
}

interface Penyedia {
    id: number;
    nama: string;
}

interface KontrakCreateProps extends PageProps {
    pekerjaanList: Pekerjaan[];
    penyediaList: Penyedia[];
}

export default function Create({ auth, pekerjaanList, penyediaList }: KontrakCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        id_pekerjaan: '',
        id_penyedia: '',
        kode_rup: '',
        kode_paket: '',
        nomor_penawaran: '',
        tanggal_penawaran: '',
        nilai_kontrak: '',
        tgl_sppbj: '',
        tgl_spk: '',
        tgl_spmk: '',
        tgl_selesai: '',
        sppbj: '',
        spk: '',
        spmk: '',
    });

    const [selectedPekerjaan, setSelectedPekerjaan] = useState<Pekerjaan | null>(null);

    const handlePekerjaanChange = (pekerjaanId: string) => {
        const pekerjaan = pekerjaanList.find(p => p.id.toString() === pekerjaanId) || null;
        setSelectedPekerjaan(pekerjaan);
        setData('id_pekerjaan', pekerjaanId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kontrak.store'));
    };

    const sisaPagu = selectedPekerjaan ? selectedPekerjaan.pagu - parseFloat(data.nilai_kontrak || '0') : null;

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tambah Kontrak</h2>}
        >
            <Head title="Tambah Kontrak" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Kontrak Baru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="id_pekerjaan">Pekerjaan</Label>
                                        <Combobox
                                            items={pekerjaanList.map(p => ({ value: p.id.toString(), label: p.nama_paket }))}
                                            value={data.id_pekerjaan}
                                            onChange={handlePekerjaanChange}
                                            placeholder="Cari Pekerjaan..."
                                        />
                                        {errors.id_pekerjaan && <p className="text-red-500 text-xs mt-1">{errors.id_pekerjaan}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="id_penyedia">Penyedia</Label>
                                        <Combobox
                                            items={penyediaList.map(p => ({ value: p.id.toString(), label: p.nama }))}
                                            value={data.id_penyedia}
                                            onChange={(value) => setData('id_penyedia', value)}
                                            placeholder="Cari Penyedia..."
                                        />
                                        {errors.id_penyedia && <p className="text-red-500 text-xs mt-1">{errors.id_penyedia}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="kode_rup">Kode RUP</Label>
                                        <Input
                                            id="kode_rup"
                                            type="text"
                                            value={data.kode_rup}
                                            onChange={(e) => setData('kode_rup', e.target.value)}
                                        />
                                        {errors.kode_rup && <p className="text-red-500 text-xs mt-1">{errors.kode_rup}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="kode_paket">Kode Paket</Label>
                                        <Input
                                            id="kode_paket"
                                            type="text"
                                            value={data.kode_paket}
                                            onChange={(e) => setData('kode_paket', e.target.value)}
                                        />
                                        {errors.kode_paket && <p className="text-red-500 text-xs mt-1">{errors.kode_paket}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="nomor_penawaran">Nomor Penawaran</Label>
                                        <Input
                                            id="nomor_penawaran"
                                            type="text"
                                            value={data.nomor_penawaran}
                                            onChange={(e) => setData('nomor_penawaran', e.target.value)}
                                        />
                                        {errors.nomor_penawaran && <p className="text-red-500 text-xs mt-1">{errors.nomor_penawaran}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="tanggal_penawaran">Tanggal Penawaran</Label>
                                        <Input
                                            id="tanggal_penawaran"
                                            type="date"
                                            value={data.tanggal_penawaran}
                                            onChange={(e) => setData('tanggal_penawaran', e.target.value)}
                                        />
                                        {errors.tanggal_penawaran && <p className="text-red-500 text-xs mt-1">{errors.tanggal_penawaran}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="nilai_kontrak">Nilai Kontrak</Label>
                                        <Input
                                            id="nilai_kontrak"
                                            type="number"
                                            value={data.nilai_kontrak}
                                            onChange={(e) => setData('nilai_kontrak', e.target.value)}
                                        />
                                        {selectedPekerjaan && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Pagu: {selectedPekerjaan.pagu.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                                {sisaPagu !== null && ` | Sisa: ${sisaPagu.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`}
                                            </p>
                                        )}
                                        {errors.nilai_kontrak && <p className="text-red-500 text-xs mt-1">{errors.nilai_kontrak}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="tgl_sppbj">Tanggal SPPBJ</Label>
                                        <Input
                                            id="tgl_sppbj"
                                            type="date"
                                            value={data.tgl_sppbj}
                                            onChange={(e) => setData('tgl_sppbj', e.target.value)}
                                        />
                                        {errors.tgl_sppbj && <p className="text-red-500 text-xs mt-1">{errors.tgl_sppbj}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="tgl_spk">Tanggal SPK</Label>
                                        <Input
                                            id="tgl_spk"
                                            type="date"
                                            value={data.tgl_spk}
                                            onChange={(e) => setData('tgl_spk', e.target.value)}
                                        />
                                        {errors.tgl_spk && <p className="text-red-500 text-xs mt-1">{errors.tgl_spk}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="tgl_spmk">Tanggal SPMK</Label>
                                        <Input
                                            id="tgl_spmk"
                                            type="date"
                                            value={data.tgl_spmk}
                                            onChange={(e) => setData('tgl_spmk', e.target.value)}
                                        />
                                        {errors.tgl_spmk && <p className="text-red-500 text-xs mt-1">{errors.tgl_spmk}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="tgl_selesai">Tanggal Selesai</Label>
                                        <Input
                                            id="tgl_selesai"
                                            type="date"
                                            value={data.tgl_selesai}
                                            onChange={(e) => setData('tgl_selesai', e.target.value)}
                                        />
                                        {errors.tgl_selesai && <p className="text-red-500 text-xs mt-1">{errors.tgl_selesai}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="sppbj">SPPBJ</Label>
                                        <Input
                                            id="sppbj"
                                            type="text"
                                            value={data.sppbj}
                                            onChange={(e) => setData('sppbj', e.target.value)}
                                        />
                                        {errors.sppbj && <p className="text-red-500 text-xs mt-1">{errors.sppbj}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="spk">SPK</Label>
                                        <Input
                                            id="spk"
                                            type="text"
                                            value={data.spk}
                                            onChange={(e) => setData('spk', e.target.value)}
                                        />
                                        {errors.spk && <p className="text-red-500 text-xs mt-1">{errors.spk}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="spmk">SPMK</Label>
                                        <Input
                                            id="spmk"
                                            type="text"
                                            value={data.spmk}
                                            onChange={(e) => setData('spmk', e.target.value)}
                                        />
                                        {errors.spmk && <p className="text-red-500 text-xs mt-1">{errors.spmk}</p>}
                                    </div>
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Kontrak'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}