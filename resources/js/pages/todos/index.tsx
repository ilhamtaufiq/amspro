import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from './data-table';
import { columns, Todo } from './columns';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    const user = auth.user;

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [todoToDeleteId, setTodoToDeleteId] = useState<number | null>(null);

    const handleDeleteTodo = (id: number) => {
        setTodoToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (todoToDeleteId !== null) {
            router.delete(route("todos.destroy", todoToDeleteId), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setTodoToDeleteId(null);
                },
                onError: (err) => {
                    console.error("Error deleting todo:", err);
                    alert("Gagal menghapus todo: " + JSON.stringify(err));
                    setIsDeleteDialogOpen(false);
                    setTodoToDeleteId(null);
                },
            });
        }
    };
    return (
        <AuthenticatedLayout user={auth.user}
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
                <div className="mx-auto sm:px-6 lg:px-8">
                    <div className="mx-auto py-10">
                        <DataTable columns={columns(handleDeleteTodo)} data={todos} meta={meta} search={search} />
                    </div>
                </div>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus todo ini? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} variant="destructive">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
