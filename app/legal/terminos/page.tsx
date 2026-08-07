import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import SectionIconBadge from "@/components/SectionIconBadge";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Términos y condiciones — ProAm Elite League",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar active="/legal/terminos" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[900px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={FileText} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Términos y condiciones</h1>
              <p className="text-muted text-sm mt-1">Condiciones de inscripción y participación</p>
            </div>
          </div>

          <div className="bg-surface border border-gold/30 rounded-xl p-4 text-xs text-muted">
            ⚠️ Documento base pendiente de revisión legal. Antes de aceptar inscripciones reales, revísalo
            con un profesional y completa los campos marcados entre corchetes.
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-5 text-sm text-[#D5D4D0] leading-relaxed">
            <section>
              <h2 className="font-display uppercase text-lg mb-2">1. Objeto</h2>
              <p>
                Estos términos regulan la inscripción y participación en las competiciones organizadas por
                ProAm Elite League (en adelante, «la Liga»), organizada por <strong>[NOMBRE O RAZÓN SOCIAL]</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">2. Inscripción y precio</h2>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Liga Regular: <strong>70&nbsp;€ por equipo</strong>, precio fijo (5 o 6 jugadores).</li>
                <li>Torneo de fin de semana: <strong>29,99&nbsp;€ por equipo</strong>, precio fijo.</li>
                <li>
                  El pago se realiza a través de PayPal en el momento de la inscripción. La plaza queda en
                  estado «pagado, pendiente de revisión» hasta que la organización la aprueba manualmente.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">3. Devoluciones</h2>
              <p>
                Si la organización rechaza tu inscripción o cancela la competición antes de su inicio, se
                devolverá el importe íntegro. Una vez comenzada la competición, no se admiten devoluciones
                por abandono voluntario o descalificación del equipo, salvo <strong>[EXCEPCIONES QUE
                DECIDAS APLICAR]</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">4. Obligaciones de los participantes</h2>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Presentarse puntualmente a los partidos programados.</li>
                <li>Mantener un comportamiento respetuoso con rivales, staff y comunidad.</li>
                <li>No usar trampas, cuentas de terceros ni suplantar la identidad de otro jugador.</li>
                <li>Aceptar los resultados publicados oficialmente por la organización.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">5. Sanciones</h2>
              <p>
                El incumplimiento de estas normas puede conllevar advertencia, suspensión de partidos o
                expulsión del equipo sin derecho a devolución, a criterio de la organización.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">6. Premios</h2>
              <p>
                Los premios anunciados para cada competición (campeón, subcampeón y MVP) se entregarán
                según lo publicado en la página de la competición correspondiente. La organización se
                reserva el derecho de modificar los premios comunicándolo con antelación.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">7. Datos y estadísticas</h2>
              <p>
                Al inscribirte aceptas que tu gamertag y tus estadísticas deportivas se publiquen en esta
                web como parte del histórico de la competición. Para el tratamiento de datos personales,
                consulta la <a href="/legal/privacidad" className="text-gold hover:underline">política de privacidad</a>.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">8. Independencia</h2>
              <p>
                ProAm Elite League es una competición organizada de forma independiente por aficionados y
                no está afiliada, patrocinada ni respaldada por ninguna liga deportiva profesional ni por
                los desarrolladores o distribuidores del videojuego utilizado.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
