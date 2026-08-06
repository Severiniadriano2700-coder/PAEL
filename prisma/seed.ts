import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const season = await prisma.season.create({
    data: {
      name: "Temporada 7",
      startDate: new Date("2026-03-01"),
      isActive: true,
    },
  });

  const teamNames = [
    ["Wolves", "WOL", "#3B82F6"],
    ["Dragons", "DRG", "#DC2626"],
    ["Knights", "KNI", "#71717A"],
    ["Titans", "TIT", "#2563EB"],
    ["Rebels", "REB", "#B91C1C"],
    ["Legends", "LEG", "#16A34A"],
    ["Hunters", "HUN", "#78350F"],
    ["Phoenix", "PHX", "#EA580C"],
  ] as const;

  const teams: Record<string, string> = {};
  for (const [name, shortName, color] of teamNames) {
    const team = await prisma.team.create({
      data: { name, shortName, primaryColor: color },
    });
    teams[name] = team.id;
  }

  const standings = [
    { team: "Wolves", w: 18, l: 4, diff: 12, streak: "6W", pos: 1 },
    { team: "Knights", w: 16, l: 6, diff: 8, streak: "3W", pos: 2 },
    { team: "Titans", w: 15, l: 7, diff: 5, streak: "1L", pos: 3 },
    { team: "Dragons", w: 14, l: 8, diff: 3, streak: "2W", pos: 4 },
    { team: "Rebels", w: 12, l: 10, diff: -2, streak: "1L", pos: 5 },
  ];
  for (const s of standings) {
    await prisma.teamSeasonRecord.create({
      data: {
        teamId: teams[s.team],
        seasonId: season.id,
        wins: s.w,
        losses: s.l,
        pointsDiff: s.diff,
        streak: s.streak,
        standing: s.pos,
      },
    });
  }

  const games = [
    { home: "Wolves", away: "Dragons", when: "2026-08-01T20:30:00" },
    { home: "Knights", away: "Titans", when: "2026-08-02T19:00:00" },
    { home: "Rebels", away: "Legends", when: "2026-08-05T18:00:00" },
    { home: "Hunters", away: "Phoenix", when: "2026-08-06T21:00:00" },
  ];
  for (const g of games) {
    await prisma.game.create({
      data: {
        seasonId: season.id,
        homeTeamId: teams[g.home],
        awayTeamId: teams[g.away],
        scheduledAt: new Date(g.when),
        status: "SCHEDULED",
      },
    });
  }

  const players = [
    { gamertag: "A. Severini", position: "SG", team: "Wolves", ppg: 24.8, rpg: 5.7, apg: 6.2, spg: 1.4 },
    { gamertag: "M. Johnson", position: "PG", team: "Knights", ppg: 19.2, rpg: 3.1, apg: 8.7, spg: 1.9 },
    { gamertag: "A. Thompson", position: "PF", team: "Titans", ppg: 17.5, rpg: 9.3, apg: 2.4, spg: 0.8 },
    { gamertag: "J. Williams", position: "SF", team: "Dragons", ppg: 15.9, rpg: 6.1, apg: 3.0, spg: 2.1 },
  ];
  for (const p of players) {
    const player = await prisma.player.create({
      data: { gamertag: p.gamertag, position: p.position },
    });
    await prisma.playerSeasonStats.create({
      data: {
        playerId: player.id,
        seasonId: season.id,
        teamId: teams[p.team],
        ppg: p.ppg,
        rpg: p.rpg,
        apg: p.apg,
        spg: p.spg,
        gamesPlayed: 22,
      },
    });
  }

  await prisma.news.createMany({
    data: [
      {
        title: "Wolves mantienen el liderato tras una victoria épica",
        content: "Wolves aseguró su lugar en la cima de la clasificación tras una intensa victoria en el último partido de la semana.",
        publishedAt: new Date("2026-07-20"),
      },
      {
        title: "Knights fichan a un nuevo jugador estrella",
        content: "Knights anunció el fichaje de un nuevo jugador estrella de cara a la recta final de la temporada.",
        publishedAt: new Date("2026-07-19"),
      },
      {
        title: "Entrevista exclusiva con el MVP de la semana",
        content: "Hablamos con el MVP de la semana sobre su rendimiento y los objetivos de su equipo para lo que resta de temporada.",
        publishedAt: new Date("2026-07-18"),
      },
    ],
  });

  console.log("✅ Base de datos poblada con datos de ejemplo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
