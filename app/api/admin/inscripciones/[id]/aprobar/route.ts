import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const registration = await prisma.teamRegistration.findUnique({ where: { id: params.id } });
    if (!registration) return NextResponse.json({ error: "Esa inscripción ya no existe." }, { status: 404 });
    if (registration.approvedTeamId) {
      return NextResponse.json({ error: "Esta inscripción ya fue aprobada." }, { status: 409 });
    }

    const playerNames = registration.playerNames
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    const team = await prisma.team.create({ data: { name: registration.teamName } });

    // Crea los jugadores reales; si el gamertag ya existe, se omite para no romper la aprobación.
    for (const name of playerNames) {
      const exists = await prisma.player.findUnique({ where: { gamertag: name } });
      if (!exists) {
        await prisma.player.create({ data: { gamertag: name } });
      }
    }

    // Si hay una temporada o torneo activo asociado, asigna a los jugadores a este equipo.
    if (registration.seasonId) {
      for (const name of playerNames) {
        const player = await prisma.player.findUnique({ where: { gamertag: name } });
        if (player) {
          await prisma.playerSeasonStats.upsert({
            where: { playerId_seasonId: { playerId: player.id, seasonId: registration.seasonId } },
            update: { teamId: team.id },
            create: { playerId: player.id, seasonId: registration.seasonId, teamId: team.id },
          });
        }
      }
    }

    const updated = await prisma.teamRegistration.update({
      where: { id: params.id },
      data: { approvedTeamId: team.id },
    });

    return NextResponse.json({ registration: updated, team });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un equipo con ese nombre." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al aprobar la inscripción." }, { status: 500 });
  }
}
