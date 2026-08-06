// Cálculo de promedios compartido entre la Liga y los Torneos: ambos
// agregan filas de PlayerGameStats de la misma forma, solo cambia qué
// partidos se incluyen (los de una temporada o los de un torneo).

export type GameStatRow = {
  points: number;
  rebounds: number;
  assists: number;
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

export type StatLine = {
  gamesPlayed: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  tpg: number;
  mpg: number;
  fgPct: number | null;
  threePct: number | null;
  ftPct: number | null;
  doubleDoubles: number;
  tripleDoubles: number;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeStatLine(rows: GameStatRow[]): StatLine {
  const gamesPlayed = rows.length;
  const sum = rows.reduce(
    (acc, s) => ({
      points: acc.points + s.points,
      rebounds: acc.rebounds + s.rebounds,
      assists: acc.assists + s.assists,
      steals: acc.steals + s.steals,
      blocks: acc.blocks + s.blocks,
      turnovers: acc.turnovers + s.turnovers,
      minutesPlayed: acc.minutesPlayed + s.minutesPlayed,
      fgMade: acc.fgMade + s.fgMade,
      fgAttempted: acc.fgAttempted + s.fgAttempted,
      threeMade: acc.threeMade + s.threeMade,
      threeAttempted: acc.threeAttempted + s.threeAttempted,
      ftMade: acc.ftMade + s.ftMade,
      ftAttempted: acc.ftAttempted + s.ftAttempted,
    }),
    {
      points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, minutesPlayed: 0,
      fgMade: 0, fgAttempted: 0, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0,
    }
  );

  let doubleDoubles = 0;
  let tripleDoubles = 0;
  for (const s of rows) {
    const doubleDigitCategories = [s.points, s.rebounds, s.assists, s.steals, s.blocks].filter((v) => v >= 10).length;
    if (doubleDigitCategories >= 2) doubleDoubles++;
    if (doubleDigitCategories >= 3) tripleDoubles++;
  }

  return {
    gamesPlayed,
    ppg: gamesPlayed ? round1(sum.points / gamesPlayed) : 0,
    rpg: gamesPlayed ? round1(sum.rebounds / gamesPlayed) : 0,
    apg: gamesPlayed ? round1(sum.assists / gamesPlayed) : 0,
    spg: gamesPlayed ? round1(sum.steals / gamesPlayed) : 0,
    bpg: gamesPlayed ? round1(sum.blocks / gamesPlayed) : 0,
    tpg: gamesPlayed ? round1(sum.turnovers / gamesPlayed) : 0,
    mpg: gamesPlayed ? round1(sum.minutesPlayed / gamesPlayed) : 0,
    fgPct: sum.fgAttempted ? round1((sum.fgMade / sum.fgAttempted) * 100) : null,
    threePct: sum.threeAttempted ? round1((sum.threeMade / sum.threeAttempted) * 100) : null,
    ftPct: sum.ftAttempted ? round1((sum.ftMade / sum.ftAttempted) * 100) : null,
    doubleDoubles,
    tripleDoubles,
  };
}
