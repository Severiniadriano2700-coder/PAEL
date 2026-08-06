import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculatePlayerSeasonStats, recalculateTeamSeasonRecord } from "@/lib/recalculate";

type BoxScoreRow = {
  playerId: string;
  teamId: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutesPlayed: number;
  fgMade: number;
  fgAttempted: number;
  threeMade: number;
  threeAttempted: number;
  ftMade: number;
  ftAttempted: number;
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { homeScore, awayScore, boxScore } = body as { homeScore: number; awayScore: number; boxScore: BoxScoreRow[] };

    if (homeScore === undefined || awayScore === undefined || homeScore < 0 || awayScore < 0) {
      return NextResponse.json({ error: "Introduce un marcador válido para ambos equipos." }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id: params.id } });
    if (!game) return NextResponse.json({ error: "Ese partido ya no existe." }, { status: 404 });
    if (!game.seasonId && !game.tournamentId) {
      return NextResponse.json({ error: "Este partido no pertenece a ninguna temporada ni torneo, no se pueden calcular estadísticas." }, { status: 400 });
    }

    for (const row of boxScore) {
      if (row.fgMade > row.fgAttempted) {
        return NextResponse.json({ error: "Tiros de campo anotados no puede ser mayor que intentados." }, { status: 400 });
      }
      if (row.threeMade > row.threeAttempted) {
        return NextResponse.json({ error: "Triples anotados no puede ser mayor que intentados." }, { status: 400 });
      }
      if (row.ftMade > row.ftAttempted) {
        return NextResponse.json({ error: "Tiros libres anotados no puede ser mayor que intentados." }, { status: 400 });
      }
    }

    await prisma.$transaction([
      prisma.game.update({
        where: { id: params.id },
        data: { homeScore, awayScore, status: "FINISHED" },
      }),
      ...boxScore.map((row) =>
        prisma.playerGameStats.upsert({
          where: { gameId_playerId: { gameId: params.id, playerId: row.playerId } },
          update: {
            teamId: row.teamId,
            points: row.points,
            assists: row.assists,
            rebounds: row.rebounds,
            steals: row.steals,
            blocks: row.blocks,
            turnovers: row.turnovers,
            minutesPlayed: row.minutesPlayed,
            fgMade: row.fgMade,
            fgAttempted: row.fgAttempted,
            threeMade: row.threeMade,
            threeAttempted: row.threeAttempted,
            ftMade: row.ftMade,
            ftAttempted: row.ftAttempted,
          },
          create: {
            gameId: params.id,
            playerId: row.playerId,
            teamId: row.teamId,
            points: row.points,
            assists: row.assists,
            rebounds: row.rebounds,
            steals: row.steals,
            blocks: row.blocks,
            turnovers: row.turnovers,
            minutesPlayed: row.minutesPlayed,
            fgMade: row.fgMade,
            fgAttempted: row.fgAttempted,
            threeMade: row.threeMade,
            threeAttempted: row.threeAttempted,
            ftMade: row.ftMade,
            ftAttempted: row.ftAttempted,
          },
        })
      ),
    ]);

    // La liga recalcula y persiste sus promedios de temporada; los torneos
    // se calculan al vuelo (ver lib/tournamentStats.ts) así que no hace
    // falta persistir nada extra para ellos.
    if (game.seasonId) {
      const seasonId = game.seasonId;
      for (const row of boxScore) {
        await recalculatePlayerSeasonStats(row.playerId, seasonId);
      }
      await recalculateTeamSeasonRecord(game.homeTeamId, seasonId);
      await recalculateTeamSeasonRecord(game.awayTeamId, seasonId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al guardar el resultado." }, { status: 500 });
  }
}
