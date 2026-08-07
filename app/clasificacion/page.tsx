import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import SectionIconBadge from "@/components/SectionIconBadge";
import SeasonSelector from "@/components/SeasonSelector";
import { BarChart2 } from "lucide-react";

export const dynamic = "force-dynamic";

// Cuántos equipos entran en playoffs y cuántos se saltan la primera ronda.
const PLAYOFF_SPOTS = 6;
const BYE_SPOTS = 2;

async function getStandings(seasonId?: string) {
  const seasons = await prisma.season.findMany({ orderBy: { startDate: "desc" } });
  const season = seasonId
    ? seasons.find((s) => s.id === seasonId) ?? null
    : seasons.find((s) => s.isActive) ?? seasons[0] ?? null;

  if (!season) return { season: null, seasons, standings: [] };

  const standings = await prisma.teamSeasonRecord.findMany({
    where: { seasonId: season.id },
    include: { team: true },
    orderBy: { standing: "asc" },
  });

  return { season, seasons, standings };
}

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: { temporada?: string };
}) {
  const { season, seasons, standings } = await getStandings(searchParams.temporada);

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/clasificacion" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <SectionIconBadge icon={BarChart2} />
              <div>
                <h1 className="font-display uppercase text-3xl leading-none">Clasificación</h1>
                <p className="text-muted text-sm mt-1">
                  {season ? `Temporada regular — ${season.name}` : "Clasificación de la temporada regular"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {seasons.length > 1 && (
                <SeasonSelector basePath="/clasificacion" seasons={seasons} currentId={season?.id} />
              )}
              <a href="/playoffs" className="text-xs text-gold hover:underline shrink-0">Ver playoffs →</a>
            </div>
          </div>

          {!season ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              No hay ninguna temporada creada todavía.
            </div>
          ) : standings.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              Todavía no hay resultados registrados en esta temporada.
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted text-left text-xs">
                      <th className="font-normal pb-3">Pos</th>
                      <th className="font-normal pb-3">Equipo</th>
                      <th className="font-normal pb-3 text-right">PJ</th>
                      <th className="font-normal pb-3 text-right">V</th>
                      <th className="font-normal pb-3 text-right">D</th>
                      <th className="font-normal pb-3 text-right">%V</th>
                      <th className="font-normal pb-3 text-right">PF</th>
                      <th className="font-normal pb-3 text-right">PC</th>
                      <th className="font-normal pb-3 text-right">PF/P</th>
                      <th className="font-normal pb-3 text-right">PC/P</th>
                      <th className="font-normal pb-3 text-right">Dif</th>
                      <th className="font-normal pb-3 text-right">Racha</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {standings.map((s, i) => {
                      const played = s.wins + s.losses;
                      const pct = played ? Math.round((s.wins / played) * 1000) / 10 : 0;
                      const pfpg = played ? Math.round((s.pointsFor / played) * 10) / 10 : 0;
                      const papg = played ? Math.round((s.pointsAgainst / played) * 10) / 10 : 0;
                      const position = s.standing ?? i + 1;
                      const hasBye = position <= BYE_SPOTS;
                      const inPlayoffs = position <= PLAYOFF_SPOTS;
                      return (
                        <tr
                          key={s.id}
                          className={`border-t border-border ${
                            inPlayoffs ? "border-l-2" : ""
                          }`}
                          style={inPlayoffs ? { borderLeftColor: hasBye ? "#C9A227" : "#3ECF6E" } : undefined}
                        >
                          <td className="py-2.5 text-muted pl-2">{position}</td>
                          <td className="py-2.5 font-sans font-semibold">
                            <a href={`/equipos/${s.team.id}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                              <TeamBadge logoUrl={s.team.logoUrl} letter={s.team.name[0]} color={s.team.primaryColor ?? "#C9A227"} /> {s.team.name}
                            </a>
                          </td>
                          <td className="py-2.5 text-right">{played}</td>
                          <td className="py-2.5 text-right">{s.wins}</td>
                          <td className="py-2.5 text-right">{s.losses}</td>
                          <td className="py-2.5 text-right">{pct}%</td>
                          <td className="py-2.5 text-right text-muted">{s.pointsFor}</td>
                          <td className="py-2.5 text-right text-muted">{s.pointsAgainst}</td>
                          <td className="py-2.5 text-right">{pfpg}</td>
                          <td className="py-2.5 text-right">{papg}</td>
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

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-[10px] uppercase tracking-wide text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: "#C9A227" }} />
                  Top {BYE_SPOTS}: pasan directos a semifinales
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: "#3ECF6E" }} />
                  Top {PLAYOFF_SPOTS}: clasifican a playoffs
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
