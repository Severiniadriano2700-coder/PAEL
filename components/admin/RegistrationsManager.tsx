"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ExternalLink } from "lucide-react";

type Registration = {
  id: string;
  competitionType: string;
  teamName: string;
  captainName: string;
  captainContact: string;
  playerNames: string;
  amountDue: number;
  paymentStatus: string;
  paypalOrderId: string | null;
  createdAt: string;
};

export default function RegistrationsManager({ initialPending }: { initialPending: Registration[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(initialPending);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  async function handleApprove(reg: Registration) {
    setRowError(null);
    if (!confirm(`¿Aprobar la inscripción de "${reg.teamName}"? Se creará el equipo y los jugadores en la liga.`)) return;

    setBusyId(reg.id);
    try {
      const res = await fetch(`/api/admin/inscripciones/${reg.id}/aprobar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al aprobar la inscripción.");
      setPending((prev) => prev.filter((r) => r.id !== reg.id));
      router.refresh();
    } catch (err: any) {
      setRowError({ id: reg.id, message: err.message });
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(reg: Registration) {
    setRowError(null);
    if (!confirm(`¿Rechazar y eliminar la inscripción de "${reg.teamName}"? No se puede deshacer.`)) return;

    setBusyId(reg.id);
    try {
      const res = await fetch(`/api/admin/inscripciones/${reg.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al rechazar la inscripción.");
      setPending((prev) => prev.filter((r) => r.id !== reg.id));
      router.refresh();
    } catch (err: any) {
      setRowError({ id: reg.id, message: err.message });
    } finally {
      setBusyId(null);
    }
  }

  if (pending.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted text-sm">
        No hay inscripciones pendientes de revisión ahora mismo.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pending.map((reg) => (
        <div key={reg.id} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display uppercase text-lg leading-none">{reg.teamName}</h3>
                <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded border border-gold/40 text-gold">
                  {reg.competitionType === "LEAGUE" ? "Liga" : "Torneo"}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded border ${
                    reg.paymentStatus === "PAID" ? "text-win border-win/40" : "text-muted border-border"
                  }`}
                >
                  {reg.paymentStatus}
                </span>
              </div>
              <div className="text-xs text-muted mt-1">
                Capitán: {reg.captainName} · {reg.captainContact}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {new Date(reg.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                {" · "}
                {reg.amountDue.toFixed(2)}€
                {reg.paypalOrderId && (
                  <>
                    {" · "}
                    <span className="font-mono">{reg.paypalOrderId}</span>
                  </>
                )}
              </div>
              <div className="text-xs mt-2">
                <span className="text-muted">Jugadores: </span>
                {reg.playerNames}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleApprove(reg)}
                disabled={busyId === reg.id}
                className="flex items-center gap-1.5 bg-gold text-black font-bold text-xs uppercase tracking-wide px-3 py-2 rounded-md hover:bg-[#dbb432] transition-colors disabled:opacity-60"
              >
                <Check size={14} /> Aprobar
              </button>
              <button
                onClick={() => handleReject(reg)}
                disabled={busyId === reg.id}
                className="flex items-center gap-1.5 border border-loss/40 text-loss font-bold text-xs uppercase tracking-wide px-3 py-2 rounded-md hover:bg-loss/10 transition-colors disabled:opacity-60"
              >
                <X size={14} /> Rechazar
              </button>
            </div>
          </div>
          {rowError?.id === reg.id && (
            <p className="text-loss text-xs mt-3 flex items-center gap-1">
              <ExternalLink size={12} /> {rowError.message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
