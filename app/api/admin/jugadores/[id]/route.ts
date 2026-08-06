import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { gamertag, fullName, position, bio, avatarUrl, twitter, twitch, youtube, isActive, teamId } = body;

    if (gamertag !== undefined && !gamertag.trim()) {
      return NextResponse.json({ error: "El gamertag es obligatorio." }, { status: 400 });
    }

    const player = await prisma.player.update({
      where: { id: params.id },
      data: {
        ...(gamertag !== undefined ? { gamertag: gamertag.trim() } : {}),
        ...(fullName !== undefined ? { fullName: fullName?.trim() || null } : {}),
        ...(position !== undefined ? { position: position?.trim() || null } : {}),
        ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl?.trim() || null } : {}),
        ...(twitter !== undefined ? { twitter: twitter?.trim() || null } : {}),
        ...(twitch !== undefined ? { twitch: twitch?.trim() || null } : {}),
        ...(youtube !== undefined ? { youtube: youtube?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    // Reasignación de equipo en la temporada activa (si se envió teamId, incluido null para quitarlo).
    if (teamId !== undefined) {
      const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });
      if (activeSeason) {
        await prisma.playerSeasonStats.upsert({
          where: { playerId_seasonId: { playerId: player.id, seasonId: activeSeason.id } },
          update: { teamId: teamId || null },
          create: { playerId: player.id, seasonId: activeSeason.id, teamId: teamId || null },
        });
      }
    }

    return NextResponse.json({ player });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un jugador con ese gamertag." }, { status: 409 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Ese jugador ya no existe." }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al actualizar el jugador." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    await prisma.player.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Ese jugador ya no existe." }, { status: 404 });
    }
    if (err.code === "P2003" || err.code === "P2014") {
      return NextResponse.json(
        { error: "No se puede eliminar: este jugador tiene estadísticas u otros datos asociados. Márcalo como inactivo en su lugar." },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al eliminar el jugador." }, { status: 500 });
  }
}
