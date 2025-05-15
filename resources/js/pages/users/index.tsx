import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import { Link, usePage } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
  const { users, auth } = usePage<CustomPageProps>().props;
  const [search, setSearch] = useState("");
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthenticatedLayout header="Users">
      <Head title="Users" />

      <div className="container mx-auto py-10">
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
        <DataTable columns={columns} data={filteredUsers} />
      </div>
    </AuthenticatedLayout>
  );
}
