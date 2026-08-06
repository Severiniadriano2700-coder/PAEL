import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import GamesFilterForm from "@/components/GamesFilterForm";
import SectionIconBadge from "@/components/SectionIconBadge";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

const PHASE_LABEL: Record<string, string> = { REGULAR: "Temporada regular", PLAYOFFS: "Playoffs", FINAL: "Final" };

async function getGames() {
  const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });
  if (!activeSeason) return { season: null, games: [] };

  const games = await prisma.game.findMany({
    where: { seasonId: activeSeason.id },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "asc" },
  });

  return { season: activeSeason, games };
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: { equipo?: string; fase?: string };
}) {
  const { season, games } = await getGames();

  const filtered = games.filter((g) => {
    if (searchParams.equipo && g.homeTeamId !== searchParams.equipo && g.awayTeamId !== searchParams.equipo) return false;
    if (searchParams.fase && g.phase !== searchParams.fase) return false;
    return true;
  });

  const teams = [...new Map(games.flatMap((g) => [[g.homeTeam.id, g.homeTeam], [g.awayTeam.id, g.awayTeam]])).values()];

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/partidos" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={Calendar} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Partidos</h1>
              <p className="text-muted text-sm mt-1">
                {season ? `Calendario de ${season.name}` : "Calendario de la temporada"}
              </p>
            </div>
          </div>

          {!season ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              No hay ninguna temporada activa todavía.
            </div>
          ) : (
            <>
              <GamesFilterForm teams={teams} equipo={searchParams.equipo} fase={searchParams.fase} />

              <div className="bg-surface border border-border rounded-xl p-4">
                {filtered.length === 0 ? (
                  <p className="text-xs text-muted py-8 text-center">No hay partidos que coincidan con los filtros.</p>
                ) : (
                  <div className="space-y-1">
                    {filtered.map((g) => (
                      <div key={g.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div className="flex items-center gap-2 text-sm font-semibold w-64 shrink-0">
                          <TeamBadge letter={g.homeTeam.name[0]} color={g.homeTeam.primaryColor ?? "#C9A227"} />
                          {g.homeTeam.name}
                          <span className="text-muted font-normal text-xs">vs</span>
                          <TeamBadge letter={g.awayTeam.name[0]} color={g.awayTeam.primaryColor ?? "#8B8B93"} />
                          {g.awayTeam.name}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-muted w-32">
                          {PHASE_LABEL[g.phase] ?? g.phase}
                        </div>
                        <div className="text-right leading-tight w-28">
                          <div className="text-[10px] font-mono text-muted">
                            {new Date(g.scheduledAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                          </div>
                          <div className="text-[10px] font-mono text-muted">
                            {new Date(g.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="w-20 text-right">
                          {g.status === "FINISHED" ? (
                            <span className="font-mono font-bold text-sm">{g.homeScore} - {g.awayScore}</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-muted border border-border rounded px-2 py-1">
                              {g.status === "SCHEDULED" ? "Programado" : g.status === "LIVE" ? "En vivo" : g.status === "POSTPONED" ? "Aplazado" : "Cancelado"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
