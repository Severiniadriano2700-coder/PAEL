import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ShoppingBag } from "lucide-react";
import SectionIconBadge from "@/components/SectionIconBadge";

export default function StorePage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar active="/tienda" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 max-w-[1400px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={ShoppingBag} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Tienda</h1>
              <p className="text-muted text-sm mt-1">Merchandising oficial de ProAm Elite League</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-16 text-center">
            <ShoppingBag size={32} className="mx-auto mb-4 text-[#3A3A40]" />
            <h2 className="font-display uppercase text-2xl text-gold mb-2">Próximamente</h2>
            <p className="text-muted text-sm max-w-md mx-auto">
              Estamos preparando la tienda oficial de la liga. Vuelve pronto para conseguir camisetas, gorras y
              merchandising de tu equipo favorito.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
