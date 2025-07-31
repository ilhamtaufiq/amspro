"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'meeting' | 'deadline' | 'milestone' | 'reminder'
  description?: string
}

interface CalendarWidgetProps {
  events?: CalendarEvent[]
  className?: string
}

export function CalendarWidget({ events = [], className }: CalendarWidgetProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'deadline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'milestone':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'Meeting'
      case 'deadline':
        return 'Deadline'
      case 'milestone':
        return 'Milestone'
      case 'reminder':
        return 'Reminder'
      default:
        return 'Event'
    }
  }

  const todayEvents = events.filter(event => 
    format(event.date, 'yyyy-MM-dd') === format(date || new Date(), 'yyyy-MM-dd')
  )

  const upcomingEvents = events
    .filter(event => event.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>
          Schedule and upcoming events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: id }) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {todayEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Today's Events</h4>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                  <Badge className={getEventTypeColor(event.type)}>
                    {getEventTypeLabel(event.type)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Upcoming Events</h4>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(event.date, "MMM dd, yyyy", { locale: id })}
                    </p>
                  </div>
                  <Badge className={getEventTypeColor(event.type)}>
                    {getEventTypeLabel(event.type)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No events scheduled</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 