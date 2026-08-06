import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Trophy } from "lucide-react";
import SectionIconBadge from "@/components/SectionIconBadge";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { UPCOMING: "Próximo", ONGOING: "En curso", FINISHED: "Finalizado" };

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({ orderBy: { startDate: "desc" } });

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/torneos" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={Trophy} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Torneos</h1>
              <p className="text-muted text-sm mt-1">Torneos de fin de semana, próximos y pasados</p>
            </div>
          </div>

          {tournaments.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              Todavía no hay torneos programados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map((t) => (
                <a
                  key={t.id}
                  href={`/torneos/${t.id}`}
                  className="bg-surface border border-border rounded-xl overflow-hidden hover:border-gold transition-colors"
                >
                  <div className="aspect-video bg-gradient-to-br from-[#1A1030] to-[#0A0A0B] border-b border-border flex items-center justify-center">
                    {t.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.bannerUrl} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/trophy-torneo.png" alt={t.name} className="h-full py-2 object-contain" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-display uppercase text-lg leading-none">{t.name}</h2>
                      <span className="text-[9px] uppercase font-bold text-muted border border-border rounded px-1.5 py-0.5">
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted">{t.format}</div>
                    <div className="text-xs text-muted mt-1">
                      {new Date(t.startDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    {t.prizePool && (
                      <div className="flex items-center gap-1 text-xs text-gold mt-2">
                        <Trophy size={12} /> {t.prizePool}
                      </div>
                    )}
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
