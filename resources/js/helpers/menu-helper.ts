interface MenuItem {
    name: string;
    route: string;
    permission: string;
    icon: string;
}

export class MenuHelper {
    static hasPermission(permission: string): boolean {
        // This will be handled by the backend through the auth props
        return true;
    }

    static getMenuItems(): MenuItem[] {
        return [
            {
                name: 'Dashboard',
                route: 'dashboard',
                permission: 'view_dashboard',
                icon: 'home'
            },
            {
                name: 'Users',
                route: 'users.index',
                permission: 'view_users',
                icon: 'users'
            },
            {
                name: 'Roles & Permissions',
                route: 'roles.index',
                permission: 'view_roles',
                icon: 'shield'
            },
            {
                name: 'Pekerjaan',
                route: 'pekerjaan.index',
                permission: 'view_pekerjaan',
                icon: 'briefcase'
            },
            {
                name: 'Kegiatan',
                route: 'kegiatan.index',
                permission: 'view_kegiatan',
                icon: 'calendar'
            },
        ];
    }
} 