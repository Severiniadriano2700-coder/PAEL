import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { name, shortName, primaryColor, secondaryColor, logoUrl, isActive } = body;

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: "El nombre del equipo es obligatorio." }, { status: 400 });
    }

    const team = await prisma.team.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(shortName !== undefined ? { shortName: shortName?.trim() || null } : {}),
        ...(primaryColor !== undefined ? { primaryColor: primaryColor?.trim() || null } : {}),
        ...(secondaryColor !== undefined ? { secondaryColor: secondaryColor?.trim() || null } : {}),
        ...(logoUrl !== undefined ? { logoUrl: logoUrl?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return NextResponse.json({ team });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un equipo con ese nombre." }, { status: 409 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Ese equipo ya no existe." }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al actualizar el equipo." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    await prisma.team.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Ese equipo ya no existe." }, { status: 404 });
    }
    if (err.code === "P2003" || err.code === "P2014") {
      return NextResponse.json(
        { error: "No se puede eliminar: este equipo tiene partidos, estadísticas u otros datos asociados. Márcalo como inactivo en su lugar." },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al eliminar el equipo." }, { status: 500 });
  }
}
