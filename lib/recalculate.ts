import { prisma } from "@/lib/prisma";
import { computeStatLine } from "@/lib/statLine";

// Recalcula los promedios de un jugador en una temporada de LIGA, agregando
// todos sus PlayerGameStats de partidos ya finalizados de esa temporada.
// (Los torneos usan la misma lógica pero al vuelo, ver lib/tournamentStats.ts,
// porque no existe una tabla de "estadísticas de torneo" persistida.)
export async function recalculatePlayerSeasonStats(playerId: string, seasonId: string) {
  const stats = await prisma.playerGameStats.findMany({
    where: { playerId, game: { seasonId, status: "FINISHED" } },
  });

  const line = computeStatLine(stats);

  await prisma.playerSeasonStats.updateMany({
    where: { playerId, seasonId },
    data: {
      gamesPlayed: line.gamesPlayed,
      ppg: line.ppg,
      rpg: line.rpg,
      apg: line.apg,
      spg: line.spg,
      bpg: line.bpg,
      tpg: line.tpg,
      mpg: line.mpg,
      fgPct: line.fgPct,
      threePct: line.threePct,
      ftPct: line.ftPct,
    },
  });
}

// Recalcula el récord (V-D, diferencial, racha) de un equipo en una temporada,
// agregando todos sus partidos finalizados, y luego recalcula la clasificación
// completa de la temporada (posición de todos los equipos).
export async function recalculateTeamSeasonRecord(teamId: string, seasonId: string) {
  const games = await prisma.game.findMany({
    where: {
      seasonId,
      status: "FINISHED",
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
    orderBy: { scheduledAt: "desc" },
  });

  let wins = 0;
  let losses = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;

  for (const g of games) {
    const isHome = g.homeTeamId === teamId;
    const own = isHome ? g.homeScore ?? 0 : g.awayScore ?? 0;
    const opp = isHome ? g.awayScore ?? 0 : g.homeScore ?? 0;
    pointsFor += own;
    pointsAgainst += opp;
    if (own > opp) wins++;
    else if (own < opp) losses++;
  }
  const pointsDiff = pointsFor - pointsAgainst;

  // Racha: recorre los partidos más recientes primero y cuenta victorias o
  // derrotas consecutivas hasta que se rompe la racha.
  let streakCount = 0;
  let streakType: "W" | "L" | null = null;
  for (const g of games) {
    const isHome = g.homeTeamId === teamId;
    const own = isHome ? g.homeScore ?? 0 : g.awayScore ?? 0;
    const opp = isHome ? g.awayScore ?? 0 : g.homeScore ?? 0;
    const result: "W" | "L" = own > opp ? "W" : "L";
    if (streakType === null) {
      streakType = result;
      streakCount = 1;
    } else if (result === streakType) {
      streakCount++;
    } else {
      break;
    }
  }
  const streak = streakType ? `${streakCount}${streakType}` : null;

  await prisma.teamSeasonRecord.upsert({
    where: { teamId_seasonId: { teamId, seasonId } },
    update: { wins, losses, pointsFor, pointsAgainst, pointsDiff, streak },
    create: { teamId, seasonId, wins, losses, pointsFor, pointsAgainst, pointsDiff, streak },
  });

  await recalculateStandings(seasonId);
}

async function recalculateStandings(seasonId: string) {
  const records = await prisma.teamSeasonRecord.findMany({
    where: { seasonId },
    orderBy: [{ wins: "desc" }, { pointsDiff: "desc" }],
  });

  await Promise.all(
    records.map((r, i) =>
      prisma.teamSeasonRecord.update({ where: { id: r.id }, data: { standing: i + 1 } })
    )
  );
}
