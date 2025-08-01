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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { formatDistanceToNow, parseISO } from 'date-fns';

interface Notification {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  user?: {
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
  const unreadCount = notifications.filter(n => !n.read).length

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

  const formatTimestamp = (timestamp: string) => {
    try {
        const date = parseISO(timestamp);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error("Invalid date format:", timestamp, error);
        return "Invalid date";
    }
  }

  return (
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
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex items-start space-x-3 p-3">
              <div className="flex-shrink-0">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.description}
                </p>
                {notification.user && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={notification.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {notification.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {notification.user.name}
                    </span>
                  </div>
                )}
              </div>
              {!notification.read && (
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
        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={route('notifications.all')} className="text-sm text-muted-foreground text-center block w-full">View all notifications</a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 