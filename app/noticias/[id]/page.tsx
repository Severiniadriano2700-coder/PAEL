import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const news = await prisma.news.findUnique({ where: { id: params.id } });
  if (!news) notFound();

  return (
    <div className="min-h-screen flex">
      <Sidebar active="/noticias" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Adriano Severini" />
        <main className="p-5 max-w-[900px] w-full">
          <a href="/noticias" className="text-xs text-muted hover:text-gold transition-colors">← Volver a noticias</a>

          <div className="bg-surface border border-border rounded-xl overflow-hidden mt-4">
            <div className="aspect-[21/9] bg-[#0D0D0F] border-b border-border flex items-center justify-center">
              {news.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={28} className="text-[#3A3A40]" />
              )}
            </div>
            <div className="p-6">
              <h1 className="font-display uppercase text-3xl leading-tight mb-2">{news.title}</h1>
              <div className="text-xs text-muted mb-5">
                {new Date(news.publishedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                {news.authorName ? ` · ${news.authorName}` : ""}
              </div>
              <p className="text-sm text-[#D5D4D0] leading-relaxed whitespace-pre-line">{news.content}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
