import {
  LayoutDashboard, Inbox, Users, User, Calendar,
  Trophy, Newspaper, Vote, Globe,
} from "lucide-react";
import LogoutButton from "./LogoutButton";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Inbox, label: "Inscripciones", href: "/admin/inscripciones" },
  { icon: Users, label: "Equipos", href: "/admin/equipos" },
  { icon: User, label: "Jugadores", href: "/admin/jugadores" },
  { icon: Calendar, label: "Partidos", href: "/admin/partidos" },
  { icon: Trophy, label: "Torneos", href: "/admin/torneos" },
  { icon: Newspaper, label: "Noticias", href: "/admin/noticias" },
  { icon: Vote, label: "Votación MVP", href: "/admin/mvp" },
];

export default function AdminSidebar({ active = "/admin" }: { active?: string }) {
  return (
    <aside className="flex flex-col w-56 border-r border-border px-3 py-5 shrink-0 min-h-screen">
      <div className="flex items-center gap-2 mb-7 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="ProAm Elite League" className="w-10 h-10 object-contain shrink-0" />
        <div className="leading-tight">
          <div className="font-display uppercase text-lg leading-none">ProAm Elite</div>
          <div className="text-[9px] uppercase tracking-widest text-gold font-bold">Admin</div>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
              active === item.href
                ? "bg-border text-gold"
                : "text-muted hover:text-white hover:bg-surface"
            }`}
          >
            <item.icon size={15} strokeWidth={2} />
            <span className="uppercase text-[11px] tracking-wide font-semibold">
              {item.label}
            </span>
          </a>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-border space-y-0.5">
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted hover:text-white hover:bg-surface transition-colors"
        >
          <Globe size={15} strokeWidth={2} />
          <span className="uppercase text-[11px] tracking-wide font-semibold">Ver web pública</span>
        </a>
        <LogoutButton />
      </div>
    </aside>
  );
}
