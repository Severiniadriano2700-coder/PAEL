import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import TournamentsManager from "@/components/admin/TournamentsManager";

export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({ orderBy: { startDate: "desc" } });

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/torneos" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 max-w-[1200px] w-full mt-[57px] md:mt-0">
          <h1 className="font-display uppercase text-3xl mb-1">Torneos</h1>
          <p className="text-muted text-sm mb-6">Crea, edita y elimina los torneos de fin de semana.</p>
          <TournamentsManager initialTournaments={JSON.parse(JSON.stringify(tournaments))} />
        </main>
      </div>
    </div>
  );
}
