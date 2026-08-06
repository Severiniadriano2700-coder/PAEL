import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ImageIcon, User } from "lucide-react";
import SectionIconBadge from "@/components/SectionIconBadge";

export const dynamic = "force-dynamic";

async function getPlayers() {
  const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });

  const players = await prisma.player.findMany({
    where: { isActive: true },
    orderBy: { gamertag: "asc" },
    include: {
      // Si no hay temporada activa, este seasonId no coincide con nada y
      // seasonStats sale vacío — evita el `include: false` condicional,
      // que confunde el tipado de Prisma en el build de producción.
      seasonStats: { where: { seasonId: activeSeason?.id ?? "__none__" }, include: { team: true } },
    },
  });

  return players.map((p) => ({
    ...p,
    currentStats: p.seasonStats?.[0] ?? null,
  }));
}

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/jugadores" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={User} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Jugadores</h1>
              <p className="text-muted text-sm mt-1">Todos los jugadores activos de la liga</p>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              Todavía no hay jugadores registrados. En cuanto se confirme la primera inscripción, aparecerán aquí.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p) => (
                <a
                  key={p.id}
                  href={`/jugadores/${p.id}`}
                  className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-gold transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0D0D0F] border border-border flex items-center justify-center text-[#3A3A40] shrink-0">
                    <ImageIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{p.gamertag}</div>
                    <div className="text-xs text-muted">
                      {p.position ?? "—"} · {p.currentStats?.team?.name ?? "Sin equipo"}
                    </div>
                    <div className="text-xs font-mono text-gold mt-0.5">
                      {p.currentStats ? `${p.currentStats.ppg} PPG` : "Sin estadísticas"}
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
