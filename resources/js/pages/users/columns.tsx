import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { User } from "./index";

export const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.roles.map((role: { id: number; name: string }) => (
            <span key={role.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {role.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => (
        <div>{new Date(row.getValue("created_at")).toLocaleDateString()}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <Link href={`/users/${user.id}/edit`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            <Button variant="destructive" size="sm" asChild>
              <Link
                href={`/users/${user.id}`}
                method="delete"
                as="button"
                type="button"
              >
                Delete
              </Link>
            </Button>
          </div>
        );
      },
    },
];
