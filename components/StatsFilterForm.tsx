"use client";

import { useRouter } from "next/navigation";

export default function StatsFilterForm({
  teams,
  positions,
  cat,
  temporada,
  equipo,
  posicion,
  modo,
}: {
  teams: { id: string; name: string }[];
  positions: string[];
  cat: string;
  temporada?: string;
  equipo?: string;
  posicion?: string;
  modo?: string;
}) {
  const router = useRouter();

  function navigate(next: Partial<{ equipo: string; posicion: string; modo: string }>) {
    const params = new URLSearchParams();
    params.set("cat", cat);
    if (temporada) params.set("temporada", temporada);

    const finalEquipo = next.equipo !== undefined ? next.equipo : equipo;
    const finalPosicion = next.posicion !== undefined ? next.posicion : posicion;
    const finalModo = next.modo !== undefined ? next.modo : modo;

    if (finalEquipo) params.set("equipo", finalEquipo);
    if (finalPosicion) params.set("posicion", finalPosicion);
    if (finalModo) params.set("modo", finalModo);

    router.push(`/estadisticas?${params.toString()}`);
  }

  const selectClass =
    "bg-surface border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-gold text-muted";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={equipo ?? ""} onChange={(e) => navigate({ equipo: e.target.value })} className={selectClass}>
        <option value="">Todos los equipos</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select value={posicion ?? ""} onChange={(e) => navigate({ posicion: e.target.value })} className={selectClass}>
        <option value="">Todas las posiciones</option>
        {positions.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Promedios vs totales */}
      <div className="flex items-center rounded-md border border-border overflow-hidden">
        <button
          onClick={() => navigate({ modo: "" })}
          className={`text-[10px] uppercase tracking-wide font-bold px-3 py-2 transition-colors ${
            modo !== "totales" ? "bg-gold/10 text-gold" : "text-muted hover:text-white"
          }`}
        >
          Promedio
        </button>
        <button
          onClick={() => navigate({ modo: "totales" })}
          className={`text-[10px] uppercase tracking-wide font-bold px-3 py-2 transition-colors ${
            modo === "totales" ? "bg-gold/10 text-gold" : "text-muted hover:text-white"
          }`}
        >
          Totales
        </button>
      </div>

      {(equipo || posicion || modo) && (
        <a href={`/estadisticas?cat=${cat}${temporada ? `&temporada=${temporada}` : ""}`} className="text-xs text-gold">
          Quitar filtros
        </a>
      )}
    </div>
  );
}
