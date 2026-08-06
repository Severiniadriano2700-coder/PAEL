import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { title, content, imageUrl, authorName } = body;

    if (title !== undefined && !title.trim()) {
      return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });
    }
    if (content !== undefined && !content.trim()) {
      return NextResponse.json({ error: "El contenido es obligatorio." }, { status: 400 });
    }

    const news = await prisma.news.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(content !== undefined ? { content: content.trim() } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl?.trim() || null } : {}),
        ...(authorName !== undefined ? { authorName: authorName?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ news });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Esa noticia ya no existe." }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al actualizar la noticia." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    await prisma.news.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Esa noticia ya no existe." }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al eliminar la noticia." }, { status: 500 });
  }
}
