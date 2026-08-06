import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { gamertag, fullName, position, bio, avatarUrl, twitter, twitch, youtube, teamId } = body;

    if (!gamertag || !gamertag.trim()) {
      return NextResponse.json({ error: "El gamertag es obligatorio." }, { status: 400 });
    }

    const player = await prisma.player.create({
      data: {
        gamertag: gamertag.trim(),
        fullName: fullName?.trim() || null,
        position: position?.trim() || null,
        bio: bio?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        twitter: twitter?.trim() || null,
        twitch: twitch?.trim() || null,
        youtube: youtube?.trim() || null,
      },
    });

    // Si se seleccionó un equipo, se asigna en la temporada activa (si existe).
    if (teamId) {
      const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });
      if (activeSeason) {
        await prisma.playerSeasonStats.create({
          data: { playerId: player.id, seasonId: activeSeason.id, teamId },
        });
      }
    }

    return NextResponse.json({ player });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un jugador con ese gamertag." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al crear el jugador." }, { status: 500 });
  }
}
