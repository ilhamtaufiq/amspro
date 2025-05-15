import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import UserForm from "./user-form";

interface EditUserProps {
  user: {
    id: number;
    name: string;
    email: string;
    roles: Array<{ id: number; name: string }>;
  };
  roles: Array<{ id: number; name: string }>;
  auth: {
    user: {
      name: string;
      email: string;
    };
  };
}

export default function EditUser({ user, roles, auth }: EditUserProps) {
  return (
    <AuthenticatedLayout header="Edit User">
      <Head title="Edit User" />

      <div className="container mx-auto py-10">
        <UserForm user={user} roles={roles} />
      </div>
    </AuthenticatedLayout>
  );
} 