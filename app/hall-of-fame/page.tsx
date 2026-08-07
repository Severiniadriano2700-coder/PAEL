import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeamBadge from "@/components/TeamBadge";
import { Trophy, Crown, Star } from "lucide-react";
import SectionIconBadge from "@/components/SectionIconBadge";

export const dynamic = "force-dynamic";

const TYPE_ICON: Record<string, typeof Trophy> = { Campeón: Crown, Subcampeón: Trophy, MVP: Star };

async function getHallOfFame() {
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
    include: {
      awards: { include: { team: true, player: true } },
    },
  });

  return seasons.filter((s) => s.awards.length > 0);
}

export default async function HallOfFamePage() {
  const seasons = await getHallOfFame();

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/hall-of-fame" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1000px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={Star} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Hall of Fame</h1>
              <p className="text-muted text-sm mt-1">Campeones históricos de la liga, temporada a temporada</p>
            </div>
          </div>

          {seasons.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              Todavía no hay campeones registrados. En cuanto termine una temporada y se otorguen los premios, aparecerán aquí.
            </div>
          ) : (
            <div className="space-y-4">
              {seasons.map((season) => (
                <div key={season.id} className="bg-surface border border-border rounded-xl p-5">
                  <h2 className="font-display uppercase text-xl mb-3">{season.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {season.awards.map((a) => {
                      const Icon = TYPE_ICON[a.type] ?? Trophy;
                      return (
                        <div key={a.id} className="bg-[#0D0D0F] border border-border rounded-lg p-4">
                          <div className="flex items-center gap-1.5 text-gold text-[10px] uppercase font-bold tracking-wide mb-2">
                            <Icon size={12} /> {a.type}
                          </div>
                          {a.team && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <TeamBadge logoUrl={a.team.logoUrl} letter={a.team.name[0]} color={a.team.primaryColor ?? "#C9A227"} /> {a.team.name}
                            </div>
                          )}
                          {a.player && (
                            <div className="text-sm font-semibold">{a.player.gamertag}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
