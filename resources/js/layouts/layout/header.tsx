import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { GlobalSearch } from '@/components/global-search'
import { NotificationBell } from '@/components/notification-bell'
import { ModeToggle } from '@/components/mode-toggle'
import PilihTahun from '@/components/tahun'
import axios from 'axios'

interface Notification {
  id: string
  title: string
  message: string
  created_at: string
  type: 'info' | 'warning' | 'success' | 'error'
  read_at: string | null
  sender?: {
    name: string
    avatar?: string
    initials: string
  }
}

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await axios.get(route('notifications.index'))
        setNotifications(response.data)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

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
        <NotificationBell notifications={notifications} />
        <PilihTahun />
        <ModeToggle />
      </div>
    </header>
  )
}

Header.displayName = 'Header'