import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from './data-table';
import { columns, Todo } from './columns';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface TodoIndexProps extends PageProps {
    todos: Todo[];
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

export default function TodoIndex({ auth, todos, meta, search }: TodoIndexProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Daftar Todo</h2>
                    {auth.user?.permissions?.includes('create todos') && (
                        <Link href={route('todos.create')}>
                            <Button>Tambah Todo</Button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Daftar Todo" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="container mx-auto py-10">
                        <DataTable columns={columns} data={todos} meta={meta} search={search} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
