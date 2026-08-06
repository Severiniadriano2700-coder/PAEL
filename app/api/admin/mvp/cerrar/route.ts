import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { seasonId, tournamentId, playerId } = body;

    if (!playerId || (!seasonId && !tournamentId)) {
      return NextResponse.json({ error: "Faltan datos para otorgar el premio." }, { status: 400 });
    }

    const award = await prisma.award.create({
      data: {
        type: "MVP",
        playerId,
        seasonId: seasonId ?? null,
        tournamentId: tournamentId ?? null,
      },
    });

    return NextResponse.json({ award });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al cerrar la votación." }, { status: 500 });
  }
}
