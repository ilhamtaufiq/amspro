import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Menu, Role } from '@/types/models';

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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Menu Settings</h2>}
        >
            <Head title="Menu Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
                                        {roles.map(role => (
                                            <th key={role.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{role.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {menus.map(menu => (
                                        <tr key={menu.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{menu.label}</td>
                                            {roles.map(role => (
                                                <td key={role.id} className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={menu.roles.some(r => r.id === role.id)}
                                                        onChange={(e) => handleCheckboxChange(menu.id, role.id, e.target.checked)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}