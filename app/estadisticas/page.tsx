import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import SectionIconBadge from "@/components/SectionIconBadge";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORIES: { key: "ppg" | "rpg" | "apg" | "spg" | "bpg"; label: string }[] = [
  { key: "ppg", label: "Puntos" },
  { key: "rpg", label: "Rebotes" },
  { key: "apg", label: "Asistencias" },
  { key: "spg", label: "Robos" },
  { key: "bpg", label: "Tapones" },
];

export default async function StatsPage({ searchParams }: { searchParams: { cat?: string } }) {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  const activeCat = CATEGORIES.find((c) => c.key === searchParams.cat)?.key ?? "ppg";

  const stats = season
    ? await prisma.playerSeasonStats.findMany({
        where: { seasonId: season.id },
        include: { player: true, team: true },
        orderBy: { [activeCat]: "desc" },
        take: 25,
      })
    : [];

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/estadisticas" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={Activity} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Estadísticas</h1>
              <p className="text-muted text-sm mt-1">Líderes estadísticos de la temporada regular</p>
            </div>
          </div>

          {!season ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              No hay ninguna temporada activa todavía.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <a
                    key={c.key}
                    href={`/estadisticas?cat=${c.key}`}
                    className={`text-xs uppercase tracking-wide font-bold px-3 py-2 rounded-md border transition-colors ${
                      activeCat === c.key ? "border-gold text-gold bg-gold/10" : "border-border text-muted hover:text-white"
                    }`}
                  >
                    {c.label}
                  </a>
                ))}
              </div>

              <div className="bg-surface border border-border rounded-xl p-4">
                {stats.length === 0 ? (
                  <p className="text-xs text-muted py-8 text-center">Todavía no hay estadísticas registradas esta temporada.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted text-left text-xs">
                          <th className="font-normal pb-3">#</th>
                          <th className="font-normal pb-3">Jugador</th>
                          <th className="font-normal pb-3">Equipo</th>
                          <th className="font-normal pb-3 text-right">PJ</th>
                          <th className="font-normal pb-3 text-right">{CATEGORIES.find((c) => c.key === activeCat)?.label}</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {stats.map((s, i) => (
                          <tr key={s.id} className="border-t border-border">
                            <td className="py-2.5 text-muted">{i + 1}</td>
                            <td className="py-2.5 font-sans font-semibold">
                              <a href={`/jugadores/${s.player.id}`} className="hover:text-gold transition-colors">
                                {s.player.gamertag}
                              </a>
                            </td>
                            <td className="py-2.5 font-sans text-muted">{s.team?.name ?? "Sin equipo"}</td>
                            <td className="py-2.5 text-right">{s.gamesPlayed}</td>
                            <td className="py-2.5 text-right text-gold font-bold">{s[activeCat]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
