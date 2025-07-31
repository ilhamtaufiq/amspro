import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconFileText,
  IconBuilding,
  IconMapPin,
  IconClipboardList,
  IconFileInvoice,
  IconTruck,
  IconChartBar,
  IconCalendar,
  IconFlag,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin AMSPRO',
    email: 'admin@amspro.com',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'AMSPRO System',
      logo: Command,
      plan: 'Laravel + Inertia.js',
    },
    {
      name: 'Cianjur Kabupaten',
      logo: GalleryVerticalEnd,
      plan: 'Government',
    },
    {
      name: 'Development Team',
      logo: AudioWaveform,
      plan: 'Development',
    },
  ],
  navGroups: [
    {
      title: 'Dashboard',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Peta Interaktif',
          url: '/map',
          icon: IconMapPin,
        },
      ],
    },
    {
      title: 'Master Data',
      items: [
        {
          title: 'Kegiatan',
          url: '/kegiatan',
          icon: IconBuilding,
        },
        {
          title: 'Pekerjaan',
          url: '/pekerjaan',
          icon: IconClipboardList,
        },
        {
          title: 'Kontrak',
          url: '/kontrak',
          icon: IconFileInvoice,
        },
        {
          title: 'Penyedia',
          url: '/penyedia',
          icon: IconTruck,
        },
        {
          title: 'Status',
          url: '/status',
          icon: IconFlag,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          title: 'Progress',
          url: '/progress',
          icon: IconChartBar,
        },
        {
          title: 'Keuangan',
          url: '/keuangan',
          icon: IconFileText,
        },
        {
          title: 'Output',
          url: '/output',
          icon: IconPackages,
        },
        {
          title: 'Todos',
          url: '/todos',
          icon: IconChecklist,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
        {
          title: 'Roles',
          url: '/roles',
          icon: IconLockAccess,
        },
        {
          title: 'Permissions',
          url: '/permissions',
          icon: IconLock,
        },
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/profile',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
          ],
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: IconLockAccess,
          items: [
            {
              title: 'Login',
              url: '/login',
            },
            {
              title: 'Register',
              url: '/register',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'Reset Password',
              url: '/reset-password',
            },
          ],
        },
        {
          title: 'Errors',
          icon: IconBug,
          items: [
            {
              title: 'Unauthorized',
              url: '/401',
              icon: IconLock,
            },
            {
              title: 'Forbidden',
              url: '/403',
              icon: IconUserOff,
            },
            {
              title: 'Not Found',
              url: '/404',
              icon: IconError404,
            },
            {
              title: 'Internal Server Error',
              url: '/500',
              icon: IconServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/503',
              icon: IconBarrierBlock,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelp,
        },
        {
          title: 'Documentation',
          url: '/docs',
          icon: IconFileText,
        },
      ],
    },
  ],
}