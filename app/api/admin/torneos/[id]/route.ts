import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { name, format, prizePool, startDate, endDate, entryFeePerPlayer, bannerUrl, status } = body;

    const tournament = await prisma.tournament.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(format !== undefined ? { format: format.trim() } : {}),
        ...(prizePool !== undefined ? { prizePool: prizePool?.trim() || null } : {}),
        ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(entryFeePerPlayer !== undefined ? { entryFeePerPlayer: entryFeePerPlayer ? parseFloat(entryFeePerPlayer) : null } : {}),
        ...(bannerUrl !== undefined ? { bannerUrl: bannerUrl?.trim() || null } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    return NextResponse.json({ tournament });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Ese torneo ya no existe." }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al actualizar el torneo." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    await prisma.tournament.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Ese torneo ya no existe." }, { status: 404 });
    }
    if (err.code === "P2003" || err.code === "P2014") {
      return NextResponse.json(
        { error: "No se puede eliminar: este torneo tiene partidos o inscripciones asociadas." },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al eliminar el torneo." }, { status: 500 });
  }
}
