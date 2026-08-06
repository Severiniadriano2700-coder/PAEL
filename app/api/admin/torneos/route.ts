import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { name, format, prizePool, startDate, endDate, entryFeePerPlayer, bannerUrl, seasonId } = body;

    if (!name?.trim() || !format?.trim() || !startDate) {
      return NextResponse.json({ error: "Nombre, formato y fecha de inicio son obligatorios." }, { status: 400 });
    }

    const tournament = await prisma.tournament.create({
      data: {
        name: name.trim(),
        format: format.trim(),
        prizePool: prizePool?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        entryFeePerPlayer: entryFeePerPlayer ? parseFloat(entryFeePerPlayer) : null,
        bannerUrl: bannerUrl?.trim() || null,
        seasonId: seasonId || null,
      },
    });

    return NextResponse.json({ tournament });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al crear el torneo." }, { status: 500 });
  }
}
