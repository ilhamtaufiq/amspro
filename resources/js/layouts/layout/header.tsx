import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { GlobalSearch } from '@/components/global-search'
import { NotificationBell } from '@/components/notification-bell'
import AppearanceDropdown from '@/components/appearance-dropdown'
import PilihTahun from '@/components/tahun'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
  children?: React.ReactNode
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  // Sample notifications - you can pass this as props or fetch from API
  const sampleNotifications = [
    {
      id: '1',
      title: 'New pekerjaan created',
      description: 'Pembangunan Jalan Desa Sukamaju has been created',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'info' as const,
      read: false,
      user: { name: 'John Doe', initials: 'JD' }
    },
    {
      id: '2',
      title: 'Contract signed',
      description: 'New contract for road construction signed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'success' as const,
      read: false,
      user: { name: 'Jane Smith', initials: 'JS' }
    },
    {
      id: '3',
      title: 'Progress update',
      description: 'Project completion rate updated to 75%',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: 'warning' as const,
      read: true,
      user: { name: 'Mike Johnson', initials: 'MJ' }
    }
  ]

  return (
    <header
      className={cn(
        'bg-background flex h-auto min-h-16 shrink-0 items-center gap-2 justify-between p-4 border-b md:border-none md:rounded-xl flex-col md:flex-row',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 w-full md:w-auto">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {children}
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <GlobalSearch />
        <NotificationBell notifications={sampleNotifications} />
        <PilihTahun />
        <AppearanceDropdown />
      </div>
    </header>
  )
}

Header.displayName = 'Header'