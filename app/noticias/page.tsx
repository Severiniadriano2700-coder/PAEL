import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ImageIcon, Newspaper } from "lucide-react";
import SectionIconBadge from "@/components/SectionIconBadge";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await prisma.news.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/noticias" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 space-y-5 max-w-[1400px] w-full">
          <div className="flex items-center gap-3 mb-6">
            <SectionIconBadge icon={Newspaper} />
            <div>
              <h1 className="font-display uppercase text-3xl leading-none">Noticias</h1>
              <p className="text-muted text-sm mt-1">Últimas noticias de la liga</p>
            </div>
          </div>

          {news.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted">
              Todavía no se ha publicado ninguna noticia.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((n) => (
                <a
                  key={n.id}
                  href={`/noticias/${n.id}`}
                  className="bg-surface border border-border rounded-xl overflow-hidden hover:border-gold transition-colors"
                >
                  <div className="aspect-video bg-[#0D0D0F] border-b border-border flex items-center justify-center">
                    {n.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.imageUrl} alt={n.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-[#3A3A40]" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-sm leading-snug">{n.title}</div>
                    <div className="text-xs text-muted mt-1.5 line-clamp-2">{n.content}</div>
                    <div className="text-[10px] text-muted mt-2">
                      {new Date(n.publishedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                      {n.authorName ? ` · ${n.authorName}` : ""}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
