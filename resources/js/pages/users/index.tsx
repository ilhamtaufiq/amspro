import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import { Link, usePage, router } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  roles: { id: number; name: string }[];
}

interface CustomPageProps {
  users: User[];
  auth: {
    user: {
      name: string;
      email: string;
    };
  };
  [key: string]: any;
}

export default function Users() {
  const { users, auth } = usePage<any>().props;
  const user = auth.user;
  const [search, setSearch] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);

  const handleDeleteUser = (id: number) => {
    setUserToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDeleteId !== null) {
      router.delete(route("users.destroy", userToDeleteId), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setUserToDeleteId(null);
        },
        onError: (err: Record<string, string>) => {
          console.error("Error deleting user:", err);
          alert("Gagal menghapus pengguna: " + JSON.stringify(err));
          setIsDeleteDialogOpen(false);
          setUserToDeleteId(null);
        },
      });
    }
  };

  const filteredUsers = users.filter(
    (user: User) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthenticatedLayout user={user} header="Users">
      <Head title="Users" />

      <div className="mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Link href="/users/create">
            <Button>Create User</Button>
          </Link>
        </div>
        <div className="mb-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DataTable columns={columns(handleDeleteUser)} data={filteredUsers} />
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
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
