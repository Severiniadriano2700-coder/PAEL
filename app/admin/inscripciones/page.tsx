import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import RegistrationsManager from "@/components/admin/RegistrationsManager";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const pending = await prisma.teamRegistration.findMany({
    where: { approvedTeamId: null },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/inscripciones" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-[1200px] w-full">
          <h1 className="font-display uppercase text-3xl mb-1">Inscripciones pendientes</h1>
          <p className="text-muted text-sm mb-6">
            Al aprobar, se crea automáticamente el equipo y los jugadores dentro de la liga.
          </p>
          <RegistrationsManager initialPending={JSON.parse(JSON.stringify(pending))} />
        </main>
      </div>
    </div>
  );
}
