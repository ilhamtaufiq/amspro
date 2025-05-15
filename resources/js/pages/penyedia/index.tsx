import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { PageProps, Penyedia } from "@/types";

interface PenyediaPageProps extends PageProps {
  penyedia: Penyedia[];
}

const PenyediaIndex: React.FC = () => {
  const { penyedia } = usePage<PenyediaPageProps>().props;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Head title="Daftar Penyedia" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Penyedia</CardTitle>
          <Button href={route("penyedia.create")} as="a">
            Tambah Penyedia
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={penyedia} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PenyediaIndex;
