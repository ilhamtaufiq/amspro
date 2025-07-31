import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        direktur: '',
        no_akta: '',
        notaris: '',
        tanggal_akta: '',
        alamat: '',
        bank: '',
        norek: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('penyedia.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}
            header="Tambah Penyedia"
        >
            <Head title="Tambah Penyedia" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Penyedia Baru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="nama">Nama Perusahaan</Label>
                                    <Input
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                    />
                                    {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="direktur">Direktur</Label>
                                    <Input
                                        id="direktur"
                                        type="text"
                                        value={data.direktur}
                                        onChange={(e) => setData('direktur', e.target.value)}
                                    />
                                    {errors.direktur && <p className="text-red-500 text-xs mt-1">{errors.direktur}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="no_akta">No. Akta</Label>
                                    <Input
                                        id="no_akta"
                                        type="text"
                                        value={data.no_akta}
                                        onChange={(e) => setData('no_akta', e.target.value)}
                                    />
                                    {errors.no_akta && <p className="text-red-500 text-xs mt-1">{errors.no_akta}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="notaris">Notaris</Label>
                                    <Input
                                        id="notaris"
                                        type="text"
                                        value={data.notaris}
                                        onChange={(e) => setData('notaris', e.target.value)}
                                    />
                                    {errors.notaris && <p className="text-red-500 text-xs mt-1">{errors.notaris}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="tanggal_akta">Tanggal Akta</Label>
                                    <Input
                                        id="tanggal_akta"
                                        type="date"
                                        value={data.tanggal_akta}
                                        onChange={(e) => setData('tanggal_akta', e.target.value)}
                                    />
                                    {errors.tanggal_akta && <p className="text-red-500 text-xs mt-1">{errors.tanggal_akta}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="alamat">Alamat</Label>
                                    <Input
                                        id="alamat"
                                        type="text"
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                    />
                                    {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="bank">Bank</Label>
                                    <Input
                                        id="bank"
                                        type="text"
                                        value={data.bank}
                                        onChange={(e) => setData('bank', e.target.value)}
                                    />
                                    {errors.bank && <p className="text-red-500 text-xs mt-1">{errors.bank}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="norek">No. Rekening</Label>
                                    <Input
                                        id="norek"
                                        type="text"
                                        value={data.norek}
                                        onChange={(e) => setData('norek', e.target.value)}
                                    />
                                    {errors.norek && <p className="text-red-500 text-xs mt-1">{errors.norek}</p>}
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Penyedia'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}