import { prisma } from "@/lib/prisma";
import { computeStatLine, type StatLine } from "@/lib/statLine";

export type TournamentPlayerLeader = StatLine & {
  playerId: string;
  gamertag: string;
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
};

// Líderes estadísticos de un torneo: agrega el box score de todos los
// partidos FINALIZADOS de ese torneo, agrupado por jugador. No usa ninguna
// tabla de "temporada" — un torneo es un evento aparte, con sus propios
// números, calculados al momento.
export async function getTournamentPlayerLeaders(tournamentId: string): Promise<TournamentPlayerLeader[]> {
  const gameStats = await prisma.playerGameStats.findMany({
    where: { game: { tournamentId, status: "FINISHED" } },
    include: {
      player: true,
      team: true,
      game: { select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true } },
    },
  });

  const byPlayer = new Map<string, { gamertag: string; teamId: string; teamName: string; rows: typeof gameStats; wins: number; losses: number }>();

  for (const s of gameStats) {
    const entry = byPlayer.get(s.playerId) ?? {
      gamertag: s.player.gamertag,
      teamId: s.teamId,
      teamName: s.team.name,
      rows: [],
      wins: 0,
      losses: 0,
    };
    entry.rows.push(s);
    const isHome = s.game.homeTeamId === s.teamId;
    const own = (isHome ? s.game.homeScore : s.game.awayScore) ?? 0;
    const opp = (isHome ? s.game.awayScore : s.game.homeScore) ?? 0;
    if (own > opp) entry.wins++;
    else if (own < opp) entry.losses++;
    byPlayer.set(s.playerId, entry);
  }

  return [...byPlayer.entries()].map(([playerId, entry]) => ({
    playerId,
    gamertag: entry.gamertag,
    teamId: entry.teamId,
    teamName: entry.teamName,
    wins: entry.wins,
    losses: entry.losses,
    ...computeStatLine(entry.rows),
  }));
}

export type TournamentTeamStat = {
  teamId: string;
  teamName: string;
  primaryColor: string | null;
  logoUrl: string | null;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
};

// Récord de cada equipo DENTRO de este torneo (no confundir con su récord
// de liga: un equipo puede ir 3-1 en el torneo y 10-5 en la temporada, son
// cosas totalmente separadas).
export async function getTournamentTeamStats(tournamentId: string): Promise<TournamentTeamStat[]> {
  const games = await prisma.game.findMany({
    where: { tournamentId, status: "FINISHED" },
    include: { homeTeam: true, awayTeam: true },
  });

  const byTeam = new Map<string, TournamentTeamStat>();
  const ensure = (id: string, name: string, color: string | null, logoUrl: string | null) => {
    if (!byTeam.has(id)) byTeam.set(id, { teamId: id, teamName: name, primaryColor: color, logoUrl, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    return byTeam.get(id)!;
  };

  for (const g of games) {
    const home = ensure(g.homeTeamId, g.homeTeam.name, g.homeTeam.primaryColor, g.homeTeam.logoUrl);
    const away = ensure(g.awayTeamId, g.awayTeam.name, g.awayTeam.primaryColor, g.awayTeam.logoUrl);
    const hs = g.homeScore ?? 0;
    const as = g.awayScore ?? 0;
    home.pointsFor += hs; home.pointsAgainst += as;
    away.pointsFor += as; away.pointsAgainst += hs;
    if (hs > as) { home.wins++; away.losses++; }
    else if (as > hs) { away.wins++; home.losses++; }
  }

  return [...byTeam.values()].sort((a, b) => b.wins - a.wins || (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst));
}

// El campeón es el ganador del partido marcado como ronda "Final" que ya
// haya finalizado. Si no hay ninguno todavía, no hay campeón (el torneo
// sigue en curso).
export async function getTournamentChampion(tournamentId: string) {
  const finalGame = await prisma.game.findFirst({
    where: { tournamentId, round: "Final", status: "FINISHED" },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "desc" },
  });
  if (!finalGame || finalGame.homeScore === null || finalGame.awayScore === null) return null;
  return finalGame.homeScore > finalGame.awayScore ? finalGame.homeTeam : finalGame.awayTeam;
}

// MVP del torneo: si ya se otorgó oficialmente (premio cerrado desde el
// admin), se devuelve ese. Si no, se muestra quién va líder en votos por
// ahora (a falta de cerrar la votación).
export async function getTournamentMvp(tournamentId: string) {
  const award = await prisma.award.findFirst({
    where: { tournamentId, type: "MVP" },
    include: { player: true },
  });
  if (award?.player) return { player: award.player, official: true, votes: null as number | null };

  const votes = await prisma.mvpVote.groupBy({
    by: ["votedForId"],
    where: { tournamentId },
    _count: { votedForId: true },
    orderBy: { _count: { votedForId: "desc" } },
    take: 1,
  });
  if (votes.length === 0) return null;

  const player = await prisma.player.findUnique({ where: { id: votes[0].votedForId } });
  if (!player) return null;
  return { player, official: false, votes: votes[0]._count.votedForId };
}
