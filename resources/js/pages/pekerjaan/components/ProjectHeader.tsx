import { Badge } from "@/components/ui/badge";
import type { Pekerjaan, Kontrak } from "./types";

interface ProjectHeaderProps {
  pekerjaan: Pekerjaan;
  kontrak?: Kontrak;
}

export function ProjectHeader({ pekerjaan, kontrak }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{pekerjaan.nama_paket}</h1>
        <p className="text-muted-foreground">ID: {pekerjaan.id}</p>
      </div>
      <Badge
        className={
          kontrak != null
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
      >
        {kontrak != null ? "Aktif" : "Tidak Aktif"}
      </Badge>
    </div>
  );
}