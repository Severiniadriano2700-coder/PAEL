import {
  Home, Calendar, BarChart2, Users, User, Trophy,
  Newspaper, Star, ShoppingBag, Settings, ScrollText, Swords,
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: null,
    items: [{ icon: Home, label: "Inicio", href: "/" }],
  },
  {
    title: "Liga",
    items: [
      { icon: Swords, label: "Liga", href: "/liga" },
      { icon: BarChart2, label: "Clasificación", href: "/clasificacion" },
      { icon: Users, label: "Equipos", href: "/equipos" },
      { icon: User, label: "Jugadores", href: "/jugadores" },
      { icon: BarChart2, label: "Estadísticas", href: "/estadisticas" },
      { icon: Calendar, label: "Partidos", href: "/partidos" },
      { icon: Star, label: "Hall of Fame", href: "/hall-of-fame" },
      { icon: ScrollText, label: "Reglas de la liga", href: "/reglas" },
    ],
  },
  {
    title: "Torneos",
    items: [
      { icon: Trophy, label: "Torneos", href: "/torneos" },
      { icon: ScrollText, label: "Formato del torneo", href: "/torneos/formato" },
    ],
  },
  {
    title: null,
    items: [
      { icon: Newspaper, label: "Noticias", href: "/noticias" },
      { icon: ShoppingBag, label: "Tienda", href: "/tienda" },
      { icon: Settings, label: "Admin Panel", href: "/admin" },
    ],
  },
];

export default function Sidebar({ active = "/" }: { active?: string }) {
  return (
    <aside className="flex flex-col w-56 border-r border-border px-3 py-5 shrink-0">
      <div className="flex items-center gap-2 mb-7 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="ProAm Elite League" className="w-10 h-10 object-contain shrink-0" />
        <span className="font-display uppercase text-xl leading-none">ProAm Elite</span>
      </div>
      <nav className="flex flex-col gap-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <div className="px-3 mb-1 text-[9px] uppercase tracking-widest font-bold text-[#5A5A60]">
                {group.title}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
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
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-border text-[10px] text-[#5A5A60] px-2">
        © 2026 ProAm Elite League
      </div>
    </aside>
  );
}
