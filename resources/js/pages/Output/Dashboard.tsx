import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/pages/Output/data-table';
import { columns } from '@/pages/Output/columns';
import { PageProps } from '@/types';

// Define types for props
interface Summary {
    total_jenis_output: number;
    total_pekerjaan_dengan_output: number;
}

export interface OutputData {
    komponen: string;
    satuan: string;
    total_volume: number;
    jumlah_pekerjaan: number;
}

interface OutputDashboardProps extends PageProps {
    summary: Summary;
    outputs: OutputData[];
    filters: { tahun: number };
}

export default function OutputDashboard({ auth, summary, outputs, filters }: OutputDashboardProps) {

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Output" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Dashboard Rekapitulasi Output</h1>
                    <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                        <span className="font-semibold">Tahun Anggaran: {filters.tahun}</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Jenis Output</CardTitle>
                            <span className="text-muted-foreground">🏗️</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_jenis_output}</div>
                            <p className="text-xs text-muted-foreground">Jenis komponen output yang unik</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pekerjaan dengan Output</CardTitle>
                            <span className="text-muted-foreground">📦</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_pekerjaan_dengan_output}</div>
                            <p className="text-xs text-muted-foreground">Jumlah pekerjaan yang memiliki output</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rekapitulasi Volume Output</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Tabel di bawah ini merangkum total volume untuk setiap jenis komponen output di semua pekerjaan.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={outputs} searchColumn="komponen" />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
