import * as React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/layouts/layout/app-sidebar'
import { Header } from './header'
import { TopNav } from './top-nav'
import { ModernBreadcrumb } from '@/components/modern-breadcrumb'
import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  user: any
  header?: React.ReactNode
  navigation?: any
}

export function AuthenticatedLayout({ children, user, header, navigation }: Props) {
  const [defaultOpen, setDefaultOpen] = React.useState(() => {
    // Check if sidebar should be open by default (from cookie or localStorage)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-open')
      return saved ? JSON.parse(saved) : true
    }
    return true
  })

  React.useEffect(() => {
    // Save sidebar state to localStorage
    localStorage.setItem('sidebar-open', JSON.stringify(defaultOpen))
  }, [defaultOpen])

  // Get current pathname for active state
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard'

  // Navigation links for top nav with active state
  const navLinks = [
    { title: 'Dashboard', href: '/dashboard', isActive: currentPath === '/dashboard' },
    { title: 'Kegiatan', href: '/kegiatan', isActive: currentPath === '/kegiatan' },
    { title: 'Pekerjaan', href: '/pekerjaan', isActive: currentPath === '/pekerjaan' },
    { title: 'Map', href: '/map', isActive: currentPath === '/map' },
  ]

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} />
      <div id='content' className={cn(
        'flex flex-col',
        'h-screen w-full',
        'bg-background',
        'transition-[margin] ease-linear duration-300',
        // 'lg:ml-[--sidebar-width]',
        // 'peer-data-[collapsible=icon]:md:ml-[calc(var(--sidebar-width-icon))]'
      )}>
        <Header>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* <TopNav links={navLinks} /> */}
            {header && (
              <ModernBreadcrumb items={[{ title: header as string, isActive: true }]} />
            )}
          </div>
        </Header>
        <main className="h-full overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}