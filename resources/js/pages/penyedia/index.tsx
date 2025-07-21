import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from './data-table';
import { columns, Penyedia } from './columns';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

interface PenyediaIndexProps extends PageProps {
    penyedia: Penyedia[];
    meta: {
        current_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    search: string;
}

export default function PenyediaIndex({ auth, penyedia, meta, search }: PenyediaIndexProps) {
    const { auth: pageAuth } = usePage<any>().props;
    const user = pageAuth.user;

    return (
        <AuthenticatedLayout user={user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Daftar Penyedia</h2>
                    {auth.user?.permissions?.includes('create penyedia') && (
                        <Link href={route('penyedia.create')}>
                            <Button>Tambah Penyedia</Button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Daftar Penyedia" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="container mx-auto py-10">
                        <DataTable columns={columns} data={penyedia} meta={meta} search={search} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}