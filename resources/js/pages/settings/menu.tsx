import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Menu, Role } from '@/types/models';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuSettingsProps extends PageProps {
    menus: (Menu & { roles: Role[] })[];
    roles: Role[];
}

export default function MenuSettings({ auth, menus, roles }: MenuSettingsProps) {

    const handleCheckboxChange = (menuId: number, roleId: number, enabled: boolean) => {
        router.post(route('settings.menu.store'), {
            menu_id: menuId,
            role_id: roleId,
            enabled: enabled,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Menu Settings"
        >
            <Head title="Menu Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Menu Visibility Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</TableHead>
                                            {roles.map(role => (
                                                <TableHead key={role.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{role.name}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {menus.map(menu => (
                                            <TableRow key={menu.id}>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">{menu.label}</TableCell>
                                                {roles.map(role => (
                                                    <TableCell key={role.id} className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={menu.roles.some(r => r.id === role.id)}
                                                            onChange={(e) => handleCheckboxChange(menu.id, role.id, e.target.checked)}
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}