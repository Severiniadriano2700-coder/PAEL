import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { homeTeamId, awayTeamId, scheduledAt, phase, seasonId, tournamentId, round } = body;

    if (!homeTeamId || !awayTeamId || !scheduledAt) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }
    if (homeTeamId === awayTeamId) {
      return NextResponse.json({ error: "El equipo local y visitante no pueden ser el mismo." }, { status: 400 });
    }

    const game = await prisma.game.create({
      data: {
        homeTeamId,
        awayTeamId,
        scheduledAt: new Date(scheduledAt),
        phase: phase || "REGULAR",
        seasonId: seasonId || null,
        tournamentId: tournamentId || null,
        round: round || null,
      },
      include: { homeTeam: true, awayTeam: true },
    });

    return NextResponse.json({ game });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al crear el partido." }, { status: 500 });
  }
}
