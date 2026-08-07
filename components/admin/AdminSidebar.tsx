"use client";

import { useState } from "react";
import {
  LayoutDashboard, Inbox, Users, User, Calendar,
  Trophy, Newspaper, Vote, Globe, Menu, X,
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
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Barra superior solo para móvil: abre el menú */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-4 py-3 bg-black border-b border-border">
        <button
          onClick={() => setOpen(true)}
          className="text-muted hover:text-white p-1 -ml-1"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="ProAm Elite League" className="w-8 h-8 object-contain shrink-0" />
        <span className="font-display uppercase text-lg leading-none">ProAm Elite</span>
        <span className="text-[9px] uppercase tracking-widest text-gold font-bold">Admin</span>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/70 z-40" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`flex flex-col w-56 border-r border-border px-3 py-5 shrink-0 min-h-screen bg-black
          fixed inset-y-0 left-0 z-50 overflow-y-auto transition-transform duration-200
          md:static md:z-auto md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-2 mb-7 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ProAm Elite League" className="w-10 h-10 object-contain shrink-0" />
          <div className="leading-tight">
            <div className="font-display uppercase text-lg leading-none">ProAm Elite</div>
            <div className="text-[9px] uppercase tracking-widest text-gold font-bold">Admin</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden ml-auto text-muted hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
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
    </>
  );
}
