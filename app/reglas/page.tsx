import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Users, Calendar, Vote, ScrollText } from "lucide-react";
import SectionIconBadge from "@/components/SectionIconBadge";

export default function RulesPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar active="/reglas" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1000px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={ScrollText} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Reglas de la Liga</h1>
              <p className="text-muted text-sm mt-1">Cómo funciona la liga regular, de principio a fin</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-gold" />
              <h2 className="font-display uppercase text-lg">Formato</h2>
            </div>
            <ul className="text-sm text-[#D5D4D0] space-y-2 leading-relaxed">
              <li>16 equipos de 5 a 6 jugadores</li>
              <li>Duración: 1,5 meses (temporada regular + playoffs)</li>
              <li>Playoffs: eliminación directa al mejor de 3 partidos por serie</li>
              <li>Inscripción: <span className="text-gold font-bold">70€ por equipo</span>, precio fijo (no varía si son 5 o 6 jugadores)</li>
              <li>Premios: campeón, subcampeón y MVP (elegido por votación entre los jugadores inscritos)</li>
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
              aprueba manualmente. En ese momento se crea el equipo y los jugadores reales dentro de la liga, y el
              administrador envía el acceso a un canal privado de Discord.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Vote size={16} className="text-gold" />
              <h2 className="font-display uppercase text-lg">Votación de MVP</h2>
            </div>
            <p className="text-sm text-[#D5D4D0] leading-relaxed">
              Cada jugador inscrito puede votar una vez por temporada por el jugador que considera el más valioso
              de la liga. El MVP se calcula contando los votos y se otorga como premio oficial al cerrar la
              votación.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
