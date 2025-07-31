"use client"

import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { router } from "@inertiajs/react"

interface BreadcrumbItem {
  title: string
  href?: string
  isActive?: boolean
}

interface ModernBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function ModernBreadcrumb({ items, className }: ModernBreadcrumbProps) {
  const handleNavigation = (href: string) => {
    router.visit(href)
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            onClick={() => handleNavigation('/dashboard')}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isActive ? (
                <BreadcrumbPage className="font-medium">
                  {item.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink 
                  onClick={() => item.href && handleNavigation(item.href)}
                  className="hover:text-primary transition-colors"
                >
                  {item.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
} 