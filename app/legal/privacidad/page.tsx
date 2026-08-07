import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import SectionIconBadge from "@/components/SectionIconBadge";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Política de privacidad — ProAm Elite League",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar active="/legal/privacidad" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[900px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={Shield} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Política de privacidad</h1>
              <p className="text-muted text-sm mt-1">Cómo tratamos tus datos personales</p>
            </div>
          </div>

          <div className="bg-surface border border-gold/30 rounded-xl p-4 text-xs text-muted">
            ⚠️ Documento base pendiente de revisión legal. Antes de aceptar inscripciones reales, revísalo
            con un profesional y completa los campos marcados entre corchetes.
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-5 text-sm text-[#D5D4D0] leading-relaxed">
            <section>
              <h2 className="font-display uppercase text-lg mb-2">1. Responsable del tratamiento</h2>
              <p>
                El responsable del tratamiento de los datos recogidos en esta web es
                <strong> [NOMBRE O RAZÓN SOCIAL]</strong>, con domicilio en <strong>[DIRECCIÓN]</strong> y
                correo de contacto <strong>[EMAIL DE CONTACTO]</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">2. Qué datos recogemos</h2>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Nombre del equipo, nombre del capitán y datos de contacto (email o usuario de Discord).</li>
                <li>Gamertags de los jugadores inscritos.</li>
                <li>Estadísticas deportivas asociadas a cada jugador dentro de la competición.</li>
                <li>Identificador de la orden de pago de PayPal (nunca los datos de tu tarjeta).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">3. Para qué los usamos</h2>
              <p>
                Para gestionar tu inscripción, organizar las competiciones, publicar clasificaciones y
                estadísticas deportivas, y comunicarnos contigo sobre la liga. No usamos tus datos para
                publicidad de terceros ni los vendemos.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">4. Pagos</h2>
              <p>
                Los pagos se procesan íntegramente a través de PayPal. Nosotros no almacenamos ni tenemos
                acceso a los datos de tu tarjeta o cuenta bancaria: únicamente guardamos el identificador
                de la orden para poder verificar el pago. Consulta la política de privacidad de PayPal
                para saber cómo tratan tus datos.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">5. Conservación</h2>
              <p>
                Los datos deportivos (equipos, jugadores, estadísticas) se conservan de forma indefinida
                como parte del histórico de la liga. Los datos de contacto se conservan mientras exista
                relación con la competición o hasta que solicites su supresión.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">6. Tus derechos</h2>
              <p>
                Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad de
                tus datos escribiendo a <strong>[EMAIL DE CONTACTO]</strong>. También puedes presentar una
                reclamación ante la autoridad de control competente.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-lg mb-2">7. Menores de edad</h2>
              <p>
                Si eres menor de edad, necesitas el consentimiento de tu padre, madre o tutor legal para
                inscribirte y para que se publiquen tus estadísticas.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
