import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Trophy, Calendar, Vote, ScrollText } from "lucide-react";
import SectionIconBadge from "@/components/SectionIconBadge";

export default function TournamentFormatPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar active="/torneos/formato" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1000px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={ScrollText} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Formato del torneo</h1>
              <p className="text-muted text-sm mt-1">Cómo funcionan los torneos de fin de semana</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1A1030] to-[#0A0A0B] border border-[#2A1F45] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-gold" />
              <h2 className="font-display uppercase text-lg">Formato</h2>
            </div>
            <ul className="text-sm text-[#D5D4D0] space-y-2 leading-relaxed">
              <li>Eliminación directa a partido único (sin temporada regular)</li>
              <li>Se disputa en un solo fin de semana</li>
              <li>Inscripción: <span className="text-gold font-bold">29,99€ por equipo</span>, precio fijo</li>
              <li>Premios: campeón, subcampeón y MVP (votación)</li>
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-gold" />
              <h2 className="font-display uppercase text-lg">Cómo funciona la inscripción</h2>
            </div>
            <p className="text-sm text-[#D5D4D0] leading-relaxed">
              El capitán del equipo rellena un único formulario con el nombre del equipo y los nombres de los 5-6
              jugadores, y paga el importe total con PayPal. La inscripción queda en estado{" "}
              <span className="text-gold">"pagado, pendiente de revisión"</span> hasta que un administrador la
              aprueba manualmente. En ese momento se crea el equipo dentro del torneo, y el administrador envía el
              acceso a un canal privado de Discord.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Vote size={16} className="text-gold" />
              <h2 className="font-display uppercase text-lg">Votación de MVP</h2>
            </div>
            <p className="text-sm text-[#D5D4D0] leading-relaxed">
              Cada jugador inscrito en el torneo puede votar una vez por el jugador que considera el más valioso
              del torneo. El MVP se calcula contando los votos y se otorga como premio oficial al cerrar la
              votación.
            </p>
          </div>

          <a
            href="/torneos"
            className="inline-block text-xs text-gold hover:underline"
          >
            ← Volver a torneos
          </a>
        </main>
      </div>
    </div>
  );
}
