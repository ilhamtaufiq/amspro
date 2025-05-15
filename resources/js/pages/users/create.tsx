import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, usePage } from "@inertiajs/react";
import UserForm from "./user-form";

interface CreateUserProps {
  roles: Array<{ id: number; name: string }>;
  auth: {
    user: {
      name: string;
      email: string;
    };
  };
}

export default function CreateUser({ roles, auth }: CreateUserProps) {
  return (
    <AuthenticatedLayout header="Create User">
      <Head title="Create User" />

      <div className="container mx-auto py-10">
        <UserForm roles={roles} />
      </div>
    </AuthenticatedLayout>
  );
} 