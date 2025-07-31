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
];

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

  const allTahunOptions = React.useMemo(() => {
    const options = [...tahunOptions];
    const tahunAktifString = tahun_aktif.toString();
    if (!options.some(option => option.value === tahunAktifString)) {
      options.push({ value: tahunAktifString, label: tahunAktifString });
    }
    return options.sort((a, b) => parseInt(a.value) - parseInt(b.value));
  }, [tahun_aktif]);

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string>(tahun_aktif.toString());

  React.useEffect(() => {
    setValue(tahun_aktif.toString());
  }, [tahun_aktif]);

  const handleSelect = (selected: string) => {
    console.log('Tahun dipilih (onSelect):', selected);
    if (selected === value) {
      setOpen(false);
      return;
    }
    setValue(selected);
    setOpen(false);

    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);
    searchParams.set("tahun", selected);

    router.visit(
      currentUrl.pathname + "?" + searchParams.toString(),
      {
        method: "get",
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          // The page will reload, so no need to manually update state here
        },
      }
    );
  };

  return (
    <>
      {hasViewTahunPermission ? (
        // Users with view tahun permission can select the year
        <Popover open={open} onOpenChange={(v) => { console.log('Popover open:', v); setOpen(v); }}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[100px] justify-between"
            >
              {allTahunOptions.find((ta) => ta.value === value)?.label ?? currentYear}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[100px] p-0">
            <Command>
              <CommandList>
                <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {allTahunOptions.map((ta) => (
                    <CommandItem
                      key={ta.value}
                      value={ta.value}
                      onSelect={handleSelect}
                    >
                      {ta.label}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
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
          role="combobox"
          className="w-[100px] justify-between"
          disabled
        >
          {currentYear}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      )}
    </>
  );
}

export default PilihTahun;
