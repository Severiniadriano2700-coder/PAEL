// Tipos y utilidades compartidas entre el perfil de jugador de Liga y el de
// Torneo: ambos muestran "promedios + historial de partidos", solo cambia
// de qué partidos sale esa información.

export type PlayerAverages = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  mpg: number;
  fgPct: number | null;
  threePct: number | null;
  ftPct: number | null;
};

export type MatchLogRow = {
  gameId: string;
  opponent: string;
  opponentColor: string | null;
  date: Date;
  result: "W" | "L" | null;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgMade: number;
  fgAttempted: number;
  threeMade: number;
  threeAttempted: number;
  ftMade: number;
  ftAttempted: number;
  minutesPlayed: number;
};

type GameStatWithGame = {
  id: string;
  teamId: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgMade: number;
  fgAttempted: number;
  threeMade: number;
  threeAttempted: number;
  ftMade: number;
  ftAttempted: number;
  minutesPlayed: number;
  game: {
    id: string;
    scheduledAt: Date;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
    homeTeamId: string;
    awayTeamId: string;
    homeTeam: { name: string; primaryColor: string | null };
    awayTeam: { name: string; primaryColor: string | null };
  };
};

export function buildMatchLog(rows: GameStatWithGame[]): MatchLogRow[] {
  return rows
    .map((s) => {
      const isHome = s.game.homeTeamId === s.teamId;
      const opponentTeam = isHome ? s.game.awayTeam : s.game.homeTeam;
      const own = (isHome ? s.game.homeScore : s.game.awayScore) ?? null;
      const opp = (isHome ? s.game.awayScore : s.game.homeScore) ?? null;
      const result: "W" | "L" | null = own === null || opp === null ? null : own > opp ? "W" : "L";

      return {
        gameId: s.game.id,
        opponent: opponentTeam.name,
        opponentColor: opponentTeam.primaryColor,
        date: s.game.scheduledAt,
        result,
        points: s.points,
        rebounds: s.rebounds,
        assists: s.assists,
        steals: s.steals,
        blocks: s.blocks,
        turnovers: s.turnovers,
        fgMade: s.fgMade,
        fgAttempted: s.fgAttempted,
        threeMade: s.threeMade,
        threeAttempted: s.threeAttempted,
        ftMade: s.ftMade,
        ftAttempted: s.ftAttempted,
        minutesPlayed: s.minutesPlayed,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function computeAveragesFromMatchLog(log: MatchLogRow[]): PlayerAverages {
  const gamesPlayed = log.length;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const sum = log.reduce(
    (acc, m) => ({
      points: acc.points + m.points,
      rebounds: acc.rebounds + m.rebounds,
      assists: acc.assists + m.assists,
      steals: acc.steals + m.steals,
      blocks: acc.blocks + m.blocks,
      minutesPlayed: acc.minutesPlayed + m.minutesPlayed,
      fgMade: acc.fgMade + m.fgMade,
      fgAttempted: acc.fgAttempted + m.fgAttempted,
      threeMade: acc.threeMade + m.threeMade,
      threeAttempted: acc.threeAttempted + m.threeAttempted,
      ftMade: acc.ftMade + m.ftMade,
      ftAttempted: acc.ftAttempted + m.ftAttempted,
    }),
    { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, minutesPlayed: 0, fgMade: 0, fgAttempted: 0, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 }
  );
  const wins = log.filter((m) => m.result === "W").length;
  const losses = log.filter((m) => m.result === "L").length;

  return {
    gamesPlayed,
    wins,
    losses,
    ppg: gamesPlayed ? round1(sum.points / gamesPlayed) : 0,
    rpg: gamesPlayed ? round1(sum.rebounds / gamesPlayed) : 0,
    apg: gamesPlayed ? round1(sum.assists / gamesPlayed) : 0,
    spg: gamesPlayed ? round1(sum.steals / gamesPlayed) : 0,
    bpg: gamesPlayed ? round1(sum.blocks / gamesPlayed) : 0,
    mpg: gamesPlayed ? round1(sum.minutesPlayed / gamesPlayed) : 0,
    fgPct: sum.fgAttempted ? round1((sum.fgMade / sum.fgAttempted) * 100) : null,
    threePct: sum.threeAttempted ? round1((sum.threeMade / sum.threeAttempted) * 100) : null,
    ftPct: sum.ftAttempted ? round1((sum.ftMade / sum.ftAttempted) * 100) : null,
  };
}
