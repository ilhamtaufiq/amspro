import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, useForm, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useState, FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { InputError } from "@/components/ui/input-error";

interface Permission {
    id: number;
    name: string;
    created_at: string;
}

interface PermissionsPageProps extends PageProps {
    permissions: {
        data: Permission[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

export default function PermissionsIndex({ auth, permissions }: PermissionsPageProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
    });

    const handleCreateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("permissions.store"), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                reset();
            },
        });
    };

    const handleEditClick = (permission: Permission) => {
        setSelectedPermission(permission);
        setData("name", permission.name);
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (selectedPermission) {
            put(route("permissions.update", selectedPermission.id), {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setSelectedPermission(null);
                    reset();
                },
            });
        }
    };

    const handleDeleteClick = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedPermission) {
            router.delete(route("permissions.destroy", selectedPermission.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedPermission(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user ?? { name: '', email: '', roles: [], permissions: [] }}
            header="Manajemen Permissions"
        >
            <Head title="Manajemen Permissions" />

            <div className="py-12">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Daftar Permissions</CardTitle>
                            {(auth.user?.permissions ?? []).includes("create permissions") && (
                                <Button onClick={() => setIsCreateDialogOpen(true)}>Tambah Permission</Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Dibuat Pada</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.data.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell>{permission.id}</TableCell>
                                            <TableCell>{permission.name}</TableCell>
                                            <TableCell>{new Date(permission.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {(auth.user?.permissions ?? []).includes("edit permissions") && (
                                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(permission)}>Edit</Button>
                                                )}
                                                {(auth.user?.permissions ?? []).includes("delete permissions") && (
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(permission)}>Hapus</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {permissions.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">Tidak ada data permissions.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-4">
                                <div>
                                    Menampilkan {permissions.from} sampai {permissions.to} dari {permissions.total} data.
                                </div>
                                <div className="flex space-x-2">
                                    {permissions.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Permission Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Permission</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Permission</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Nama Permission</Label>
                            <Input
                                id="edit-name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Perbarui</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus permission "{selectedPermission?.name}"? Aksi ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
