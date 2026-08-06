import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { title, content, imageUrl, authorName } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "El título y el contenido son obligatorios." }, { status: 400 });
    }

    const news = await prisma.news.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl?.trim() || null,
        authorName: authorName?.trim() || null,
      },
    });

    return NextResponse.json({ news });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al crear la noticia." }, { status: 500 });
  }
}
