"use client"

import * as React from "react"
import { router } from "@inertiajs/react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <span className="sr-only">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/dashboard"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/kegiatan"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Kegiatan
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/pekerjaan"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Pekerjaan
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/users"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Users
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/roles"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Roles
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/permissions"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Permissions
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Management">
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/kontrak"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Kontrak
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/penyedia"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Penyedia
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/status"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Status
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.visit("/todos"))
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Todos
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
} 