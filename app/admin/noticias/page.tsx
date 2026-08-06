import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import NewsManager from "@/components/admin/NewsManager";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const news = await prisma.news.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/noticias" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-[1200px] w-full">
          <h1 className="font-display uppercase text-3xl mb-1">Noticias</h1>
          <p className="text-muted text-sm mb-6">Crea, edita y elimina las noticias de la liga.</p>
          <NewsManager initialNews={JSON.parse(JSON.stringify(news))} />
        </main>
      </div>
    </div>
  );
}
