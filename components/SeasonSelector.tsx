"use client";

import { useRouter } from "next/navigation";

// Permite consultar temporadas anteriores, no solo la activa. Mantiene el
// resto de parámetros de la URL (por ejemplo la categoría en Estadísticas).
export default function SeasonSelector({
  basePath,
  seasons,
  currentId,
  extraParams,
}: {
  basePath: string;
  seasons: { id: string; name: string; isActive: boolean }[];
  currentId?: string;
  extraParams?: Record<string, string | undefined>;
}) {
  const router = useRouter();

  function handleChange(seasonId: string) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      if (value) params.set(key, value);
    }
    params.set("temporada", seasonId);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <select
      value={currentId ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-surface border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-gold text-muted"
      aria-label="Seleccionar temporada"
    >
      {seasons.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}{s.isActive ? " · EN CURSO" : ""}
        </option>
      ))}
    </select>
  );
}
