"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { formatDistanceToNow, parseISO } from 'date-fns';

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

interface NotificationBellProps {
  notifications?: Notification[]
  className?: string
}

export function NotificationBell({ notifications = [], className }: NotificationBellProps) {
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [localNotifications, setLocalNotifications] = React.useState<Notification[]>(notifications)
  
  // Update local notifications when props change
  React.useEffect(() => {
    setLocalNotifications(notifications)
  }, [notifications])
  
  const unreadCount = localNotifications.filter(n => !n.read_at).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) {
      return "No date";
    }
    try {
        const date = parseISO(timestamp);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error("Invalid date format:", timestamp, error);
        return "Invalid date";
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsDialogOpen(true)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      const response = await fetch(route('notifications.read', notificationId), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      if (response.ok) {
        // Update local state
        setLocalNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        )
        
        // Update selected notification if it's the same one
        if (selectedNotification?.id === notificationId) {
          setSelectedNotification(prev => 
            prev ? { ...prev, read_at: new Date().toISOString() } : null
          )
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className={cn("relative", className)}>
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            <span className="sr-only">View notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Notifications</p>
              <p className="text-xs leading-none text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {localNotifications.length > 0 ? (
            localNotifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className="flex items-start space-x-3 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.created_at)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  {notification.sender && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={notification.sender.avatar} />
                        <AvatarFallback className="text-xs">
                          {notification.sender.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {notification.sender.name}
                      </span>
                    </div>
                  )}
                </div>
                {!notification.read_at && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </div>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              <p className="text-sm text-muted-foreground">No notifications</p>
            </DropdownMenuItem>
          )}
          {localNotifications.length > 5 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={route('notifications.all')} className="text-sm text-muted-foreground text-center block w-full">View all notifications</a>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedNotification && getNotificationIcon(selectedNotification.type)}</span>
              {selectedNotification?.title}
            </DialogTitle>
            <DialogDescription className="text-left">
              <div className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedNotification?.message}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Sent {selectedNotification && formatTimestamp(selectedNotification.created_at)}</span>
                  {selectedNotification && !selectedNotification.read_at && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkAsRead(selectedNotification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
} 