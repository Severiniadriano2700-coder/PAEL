import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Inbox, Users, User, Calendar, Newspaper, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

async function getCounts() {
  const [pendingRegistrations, teams, players, scheduledGames, news, tournaments] =
    await Promise.all([
      prisma.teamRegistration.count({ where: { approvedTeamId: null } }),
      prisma.team.count({ where: { isActive: true } }),
      prisma.player.count({ where: { isActive: true } }),
      prisma.game.count({ where: { status: "SCHEDULED" } }),
      prisma.news.count(),
      prisma.tournament.count(),
    ]);
  return { pendingRegistrations, teams, players, scheduledGames, news, tournaments };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const counts = await getCounts();

  const cards = [
    { icon: Inbox, label: "Inscripciones pendientes", value: counts.pendingRegistrations, href: "/admin/inscripciones", highlight: counts.pendingRegistrations > 0 },
    { icon: Users, label: "Equipos activos", value: counts.teams, href: "/admin/equipos" },
    { icon: User, label: "Jugadores activos", value: counts.players, href: "/admin/jugadores" },
    { icon: Calendar, label: "Partidos programados", value: counts.scheduledGames, href: "/admin/partidos" },
    { icon: Trophy, label: "Torneos", value: counts.tournaments, href: "/admin/torneos" },
    { icon: Newspaper, label: "Noticias publicadas", value: counts.news, href: "/admin/noticias" },
  ];

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-[1200px] w-full">
          <h1 className="font-display uppercase text-3xl mb-1">Dashboard</h1>
          <p className="text-muted text-sm mb-6">
            Bienvenido, {session?.user?.name ?? "Admin"}. Desde aquí gestionas toda la liga.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => (
              <a
                key={c.href + c.label}
                href={c.href}
                className={`bg-surface border rounded-xl p-5 flex items-center gap-4 transition-colors hover:border-gold ${
                  c.highlight ? "border-gold" : "border-border"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#0D0D0F] border border-border flex items-center justify-center text-gold">
                  <c.icon size={18} />
                </div>
                <div>
                  <div className="font-mono font-bold text-2xl leading-none">{c.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted mt-1">{c.label}</div>
                </div>
              </a>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
