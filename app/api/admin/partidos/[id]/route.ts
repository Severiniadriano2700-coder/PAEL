import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { scheduledAt, phase, status, vodUrl, round, homeTeamId, awayTeamId } = body;

    const game = await prisma.game.update({
      where: { id: params.id },
      data: {
        ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
        ...(phase !== undefined ? { phase } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(vodUrl !== undefined ? { vodUrl: vodUrl?.trim() || null } : {}),
        ...(round !== undefined ? { round: round?.trim() || null } : {}),
        ...(homeTeamId !== undefined ? { homeTeamId } : {}),
        ...(awayTeamId !== undefined ? { awayTeamId } : {}),
      },
      include: { homeTeam: true, awayTeam: true },
    });

    return NextResponse.json({ game });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Ese partido ya no existe." }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al actualizar el partido." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const game = await prisma.game.findUnique({ where: { id: params.id } });
    if (!game) return NextResponse.json({ error: "Ese partido ya no existe." }, { status: 404 });

    if (game.status === "FINISHED") {
      return NextResponse.json(
        { error: "No se puede eliminar un partido ya finalizado (afectaría a las estadísticas). Cámbialo a otro estado si necesitas corregirlo." },
        { status: 409 }
      );
    }

    await prisma.game.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al eliminar el partido." }, { status: 500 });
  }
}
