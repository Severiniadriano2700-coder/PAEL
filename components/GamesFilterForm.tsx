"use client";

const PHASE_LABEL: Record<string, string> = { REGULAR: "Temporada regular", PLAYOFFS: "Playoffs", FINAL: "Final" };

export default function GamesFilterForm({
  teams,
  equipo,
  fase,
}: {
  teams: { id: string; name: string }[];
  equipo?: string;
  fase?: string;
}) {
  return (
    <form className="flex items-center gap-3 flex-wrap" method="get">
      <select
        name="equipo"
        defaultValue={equipo ?? ""}
        className="bg-surface border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-gold"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="">Todos los equipos</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <select
        name="fase"
        defaultValue={fase ?? ""}
        className="bg-surface border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-gold"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="">Todas las fases</option>
        {Object.entries(PHASE_LABEL).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
      {(equipo || fase) && (
        <a href="/partidos" className="text-xs text-gold">Quitar filtros</a>
      )}
    </form>
  );
}
