import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, usePage } from "@inertiajs/react";
import { ProjectHeader } from "./components/ProjectHeader";
import { TabsWrapper } from "./components/TabsWrapper";
import type { PageProps } from "./components/types";

export default function PekerjaanDetail() {
  const { pekerjaan, auth, penyediaList, kontrak, keuangan, fotos, progresses, outputs, penerimas, berkasList, flash, errors } = usePage<PageProps>().props;

  return (
    <AuthenticatedLayout header="Detail Pekerjaan">
      <Head title="Detail Pekerjaan" />
      <div className="flex flex-1 flex-col gap-4 h-full">
        <div className="flex justify-between items-center">
          <div className="container mx-auto py-6 space-y-6">
            <ProjectHeader pekerjaan={pekerjaan} kontrak={kontrak} />
            <TabsWrapper
              pekerjaan={pekerjaan}
              auth={auth}
              penyediaList={penyediaList}
              kontrak={kontrak}
              keuangan={keuangan}
              fotos={fotos}
              progresses={progresses}
              outputs={outputs}
              penerimas={penerimas}
              berkasList={berkasList}
              flash={flash}
              errors={errors}
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}