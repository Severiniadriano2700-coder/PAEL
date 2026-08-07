import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import TeamsManager from "@/components/admin/TeamsManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/equipos" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 max-w-[1200px] w-full mt-[57px] md:mt-0">
          <h1 className="font-display uppercase text-3xl mb-1">Equipos</h1>
          <p className="text-muted text-sm mb-6">Crea, edita y elimina los equipos de la liga.</p>
          <TeamsManager initialTeams={teams} />
        </main>
      </div>
    </div>
  );
}
