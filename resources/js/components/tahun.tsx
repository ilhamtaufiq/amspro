"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { router, usePage } from "@inertiajs/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const tahunOptions = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
]

interface PageProps {
  tahun_aktif: number;
  auth: {
    user: {
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
  };
  [key: string]: any;
}

export function PilihTahun() {
  const { tahun_aktif, auth } = usePage<PageProps>().props;
  const userPermissions = auth?.user?.permissions || [];
  const hasViewTahunPermission = userPermissions.includes("view tahun");
  const currentYear = new Date().getFullYear().toString(); // 2025 as of May 10, 2025

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string>(tahun_aktif.toString());

  React.useEffect(() => {
    // For users without view tahun permission, always set the value to the current year
    if (!hasViewTahunPermission) {
      setValue(currentYear);
    } else {
      setValue(tahun_aktif.toString());
    }
  }, [tahun_aktif, hasViewTahunPermission, currentYear]);

  const handleSelect = async (selected: string) => {
  if (selected === value) {
    setOpen(false);
    return;
  }

  setValue(selected);
  setOpen(false);

  try {
    const response = await fetch(route("set-tahun"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
      },
      body: JSON.stringify({ tahun: selected }),
    });

    if (!response.ok) {
      console.error("Failed to set tahun:", await response.json());
      return;
    }

    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);
    searchParams.set("tahun", selected);

    router.visit(
      currentUrl.pathname + "?" + searchParams.toString(),
      {
        method: "get",
        preserveState: true,
        preserveScroll: true,
        only: [
            "pekerjaan",
            "meta",
            "tahun_aktif",
            "kegiatanList",
            "kecamatanList",
            "desaList",
            "statuses",
            "stats",
            "kontrakStats"
        ],
        onSuccess: (page: any) => {
        //   console.log("Year change response:", page); // Debug
        },
      }
    );
  } catch (error) {
    console.error("Error setting tahun:", error);
  }
};
  return (
    <>
      {hasViewTahunPermission ? (
        // Users with view tahun permission can select the year
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {tahunOptions.find((ta) => ta.value === value)?.label ?? currentYear}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {tahunOptions.map((ta) => (
                    <CommandItem
                      key={ta.value}
                      value={ta.value}
                      onSelect={handleSelect}
                    >
                      {ta.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === ta.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        // Users without view tahun permission see the current year as static text
        <Button
          variant="outline"
          className="w-[200px] justify-between cursor-default"
          disabled
        >
          {currentYear}
        </Button>
      )}
    </>
  );
}

export default PilihTahun;
