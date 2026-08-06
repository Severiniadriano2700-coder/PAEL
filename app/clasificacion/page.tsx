import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import SectionIconBadge from "@/components/SectionIconBadge";
import { BarChart2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStandings() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) return { season: null, standings: [] };

  const standings = await prisma.teamSeasonRecord.findMany({
    where: { seasonId: season.id },
    include: { team: true },
    orderBy: { standing: "asc" },
  });

  return { season, standings };
}

export default async function StandingsPage() {
  const { season, standings } = await getStandings();

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/clasificacion" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <SectionIconBadge icon={BarChart2} />
              <div>
                <h1 className="font-display uppercase text-3xl leading-none">Clasificación</h1>
                <p className="text-muted text-sm mt-1">
                  {season ? `Temporada regular — ${season.name}` : "Clasificación de la temporada regular"}
                </p>
              </div>
            </div>
            <a href="/playoffs" className="text-xs text-gold hover:underline shrink-0">Ver playoffs →</a>
          </div>

          {!season ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              No hay ninguna temporada activa todavía.
            </div>
          ) : standings.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              Todavía no hay resultados registrados esta temporada.
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted text-left text-xs">
                    <th className="font-normal pb-3">Pos</th>
                    <th className="font-normal pb-3">Equipo</th>
                    <th className="font-normal pb-3 text-right">PJ</th>
                    <th className="font-normal pb-3 text-right">V</th>
                    <th className="font-normal pb-3 text-right">D</th>
                    <th className="font-normal pb-3 text-right">%V</th>
                    <th className="font-normal pb-3 text-right">Dif</th>
                    <th className="font-normal pb-3 text-right">Racha</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {standings.map((s) => {
                    const played = s.wins + s.losses;
                    const pct = played ? Math.round((s.wins / played) * 1000) / 10 : 0;
                    return (
                      <tr key={s.id} className="border-t border-border">
                        <td className="py-2.5 text-muted">{s.standing}</td>
                        <td className="py-2.5 font-sans font-semibold">
                          <a href={`/equipos/${s.team.id}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                            <TeamBadge letter={s.team.name[0]} color={s.team.primaryColor ?? "#C9A227"} /> {s.team.name}
                          </a>
                        </td>
                        <td className="py-2.5 text-right">{played}</td>
                        <td className="py-2.5 text-right">{s.wins}</td>
                        <td className="py-2.5 text-right">{s.losses}</td>
                        <td className="py-2.5 text-right">{pct}%</td>
                        <td className={`py-2.5 text-right ${s.pointsDiff >= 0 ? "text-win" : "text-loss"}`}>
                          {s.pointsDiff >= 0 ? "+" : ""}{s.pointsDiff}
                        </td>
                        <td className={`py-2.5 text-right ${s.streak?.includes("W") ? "text-win" : "text-loss"}`}>{s.streak ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
