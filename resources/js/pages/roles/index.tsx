// resources/js/Pages/roles/Index.tsx
import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { User } from "@/types";

interface Permission {
    id: number;
    name: string;
}

interface Kegiatan {
    id: number;
    nama: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    kegiatan: Kegiatan[];
}

interface RolesPageProps {
    auth: {
        user: User;
    };
    roles: Role[];
    permissions: Permission[];
    kegiatanList: Kegiatan[];
    flash: {
        success?: string;
    };
    [key: string]: any;
}

export default function RolesIndex({ auth, roles, permissions, kegiatanList, flash }: RolesPageProps) {
    const { props } = usePage<RolesPageProps>();
    const userPermissions = props.auth?.user?.permissions || [];

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const createForm = useForm({
        name: '',
        permissions: [] as number[],
        kegiatan: [] as number[],
    });

    const editForm = useForm({
        name: '',
        permissions: [] as number[],
        kegiatan: [] as number[],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (createForm.data.permissions.length === 0) {
            toast.error('Please select at least one permission');
            return;
        }
        createForm.post(route('roles.store'), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createForm.reset();
                toast.success(flash.success || 'Role created successfully');
            },
            onError: (errors) => toast.error(errors.name || 'Failed to create role'),
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editForm.data.permissions.length === 0) {
            toast.error('Please select at least one permission');
            return;
        }
        if (!editingRole) return;
        editForm.put(route('roles.update', editingRole.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingRole(null);
                editForm.reset();
                toast.success(flash.success || 'Role updated successfully');
            },
            onError: (errors) => toast.error(errors.name || 'Failed to update role'),
        });
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        editForm.setData({
            name: role.name,
            permissions: role.permissions.map((p) => p.id),
            kegiatan: role.kegiatan.map((k) => k.id),
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (roleId: number) => {
        setDeletingRoleId(roleId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deletingRoleId) {
            router.delete(route('roles.destroy', deletingRoleId), {
                onSuccess: () => {
                    toast.success('Role deleted successfully');
                    setIsDeleteDialogOpen(false);
                    setDeletingRoleId(null);
                },
                onError: () => {
                    toast.error('Failed to delete role');
                    setIsDeleteDialogOpen(false);
                },
            });
        }
    };

    // Map permissions and kegiatan to the format expected by MultiSelect
    const permissionOptions = permissions.map((permission) => ({
        label: permission.name,
        value: permission.id.toString(),
    }));

    const kegiatanOptions = kegiatanList.map((kegiatan) => ({
        label: kegiatan.nama,
        value: kegiatan.id.toString(),
    }));

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-foreground leading-tight">Role Management</h2>}
        >
            <Head title="Role Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-background overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between mb-6">
                                <h3 className="text-lg font-medium text-foreground">Roles & Permissions</h3>
                                {userPermissions.includes('create roles') && (
                                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    setEditingRole(null);
                                                    createForm.reset();
                                                }}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                Add New Role
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-background">
                                            <DialogHeader>
                                                <DialogTitle className="text-foreground">Create New Role</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleCreate} className="space-y-4">
                                                <div>
                                                    <Label htmlFor="name" className="text-foreground">Role Name</Label>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Enter role name"
                                                        value={createForm.data.name}
                                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                                        className="bg-background text-foreground border-border"
                                                    />
                                                    {createForm.errors.name && (
                                                        <p className="text-destructive text-sm mt-1">{createForm.errors.name}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-foreground">Permissions</h4>
                                                    <MultiSelect
                                                        options={permissionOptions}
                                                        selectedValues={createForm.data.permissions.map(String)}
                                                        onChange={(values) =>
                                                            createForm.setData('permissions', values.map(Number))
                                                        }
                                                        placeholder="Select permissions"
                                                    />
                                                    {createForm.data.permissions.length === 0 && (
                                                        <p className="text-destructive text-sm mt-1">
                                                            At least one permission is required
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-foreground">Kegiatan</h4>
                                                    <MultiSelect
                                                        options={kegiatanOptions}
                                                        selectedValues={createForm.data.kegiatan.map(String)}
                                                        onChange={(values) =>
                                                            createForm.setData('kegiatan', values.map(Number))
                                                        }
                                                        placeholder="Select kegiatan"
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setIsCreateDialogOpen(false)}
                                                        className="bg-background text-foreground border-border hover:bg-muted/50"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={createForm.processing}
                                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                    >
                                                        Create
                                                    </Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            <div className="rounded-md border border-border bg-background">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted">
                                            <TableHead className="text-foreground font-semibold">Role Name</TableHead>
                                            <TableHead className="text-foreground font-semibold">Permissions</TableHead>
                                            <TableHead className="text-foreground font-semibold">Kegiatan</TableHead>
                                            <TableHead className="text-foreground font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {roles.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    No roles found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            roles.map((role) => (
                                                <TableRow key={role.id} className="hover:bg-muted/50">
                                                    <TableCell className="text-foreground">{role.name}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {role.permissions.map((permission) => (
                                                                <span
                                                                    key={permission.id}
                                                                    className="px-2 py-1 text-xs bg-muted/50 rounded-full text-foreground"
                                                                >
                                                                    {permission.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {role.kegiatan.map((kegiatan) => (
                                                                <span
                                                                    key={kegiatan.id}
                                                                    className="px-2 py-1 text-xs bg-muted/50 rounded-full text-foreground"
                                                                >
                                                                    {kegiatan.nama}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {userPermissions.length > 0 ? (
                                                            <>
                                                                {userPermissions.includes('edit roles') && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleEdit(role)}
                                                                        className="mr-2 bg-background text-foreground border-border hover:bg-muted/50"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                )}
                                                                {userPermissions.includes('delete roles') && (
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(role.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">
                                                                No permissions to perform actions
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>

                {userPermissions.includes('edit roles') && (
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="bg-background">
                            <DialogHeader>
                                <DialogTitle className="text-foreground">Edit Role</DialogTitle>
                            </DialogHeader>
                            {editingRole && (
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="edit-name" className="text-foreground">Role Name</Label>
                                        <Input
                                            id="edit-name"
                                            type="text"
                                            placeholder="Enter role name"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            className="bg-background text-foreground border-border"
                                        />
                                        {editForm.errors.name && (
                                            <p className="text-destructive text-sm mt-1">{editForm.errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Permissions</h4>
                                        <MultiSelect
                                            options={permissionOptions}
                                            selectedValues={editForm.data.permissions.map(String)}
                                            onChange={(values) =>
                                                editForm.setData('permissions', values.map(Number))
                                            }
                                            placeholder="Select permissions"
                                        />
                                        {editForm.data.permissions.length === 0 && (
                                            <p className="text-destructive text-sm mt-1">
                                                At least one permission is required
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Kegiatan</h4>
                                        <MultiSelect
                                            options={kegiatanOptions}
                                            selectedValues={editForm.data.kegiatan.map(String)}
                                            onChange={(values) =>
                                                editForm.setData('kegiatan', values.map(Number))
                                            }
                                            placeholder="Select kegiatan"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditDialogOpen(false)}
                                            className="bg-background text-foreground border-border hover:bg-muted/50"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={editForm.processing}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                            Update
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>
                )}

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="bg-background">
                        <DialogHeader>
                            <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <p className="text-foreground">Are you sure you want to delete this role? This action cannot be undone.</p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="bg-background text-foreground border-border hover:bg-muted/50"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
