import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import SectionIconBadge from "@/components/SectionIconBadge";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getTeams() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });

  const teams = await prisma.team.findMany({
    where: { isActive: true },
    include: {
      seasonRecords: season ? { where: { seasonId: season.id } } : false,
    },
    orderBy: { name: "asc" },
  });

  return teams.map((t) => ({
    ...t,
    record: t.seasonRecords?.[0] ?? null,
  }));
}

export default async function EquiposPage() {
  const teams = await getTeams();

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <Sidebar active="/equipos" />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar userName="Adriano Severini" />
        <main style={{ padding: 20 }}>
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={Users} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Equipos</h1>
              <p className="text-muted text-sm mt-1">Todos los equipos activos de la liga</p>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              Todavía no hay equipos creados. En cuanto se confirme la primera inscripción, aparecerán aquí.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t) => (
                <a
                  key={t.id}
                  href={`/equipos/${t.id}`}
                  className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-gold transition-colors"
                >
                  <TeamBadge logoUrl={t.logoUrl} letter={t.name[0]} color={t.primaryColor ?? "#C9A227"} />
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted">
                      {t.record ? `${t.record.wins}V - ${t.record.losses}D` : "Sin partidos todavía"}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
