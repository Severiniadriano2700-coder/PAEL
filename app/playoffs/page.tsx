import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import SectionIconBadge from "@/components/SectionIconBadge";
import { Flame } from "lucide-react";

export const dynamic = "force-dynamic";

async function getPlayoffs() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) return { season: null, series: [] };

  const series = await prisma.playoffSeries.findMany({
    where: { seasonId: season.id },
    include: { teamA: true, teamB: true },
    orderBy: { createdAt: "asc" },
  });

  return { season, series };
}

export default async function PlayoffsPage() {
  const { season, series } = await getPlayoffs();

  const rounds = Array.from(new Set(series.map((s) => s.round)));

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/clasificacion" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={Flame} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Playoffs</h1>
              <p className="text-muted text-sm mt-1">
                {season ? `Eliminatorias al mejor de 3 — ${season.name}` : "Eliminatorias de playoffs"}
              </p>
            </div>
          </div>

          {!season ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              No hay ninguna temporada activa todavía.
            </div>
          ) : series.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              Los playoffs todavía no han comenzado esta temporada.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rounds.map((round) => (
                <div key={round} className="space-y-3">
                  <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted">{round}</h2>
                  {series
                    .filter((s) => s.round === round)
                    .map((s) => (
                      <div key={s.id} className="bg-surface border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between py-1.5">
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            <TeamBadge logoUrl={s.teamA.logoUrl} letter={s.teamA.name[0]} color={s.teamA.primaryColor ?? "#C9A227"} /> {s.teamA.name}
                          </span>
                          <span className="font-mono font-bold text-gold">{s.teamAWins}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-t border-border">
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            <TeamBadge logoUrl={s.teamB.logoUrl} letter={s.teamB.name[0]} color={s.teamB.primaryColor ?? "#8B8B93"} /> {s.teamB.name}
                          </span>
                          <span className="font-mono font-bold text-gold">{s.teamBWins}</span>
                        </div>
                        <div className="text-[10px] text-muted mt-2 uppercase tracking-wide">
                          {s.status === "FINISHED" ? "Finalizada" : `Al mejor de ${s.gamesToWin * 2 - 1}`}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
