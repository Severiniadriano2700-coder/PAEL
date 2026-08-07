import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import MvpVotingManager from "@/components/admin/MvpVotingManager";

export const dynamic = "force-dynamic";

export default async function AdminMvpPage() {
  const votes = await prisma.mvpVote.findMany({
    include: { votedFor: true, season: true, tournament: true },
  });

  const awards = await prisma.award.findMany({ where: { type: "MVP" } });

  type Group = {
    key: string;
    label: string;
    seasonId: string | null;
    tournamentId: string | null;
    counts: Map<string, { gamertag: string; votes: number }>;
  };
  const groups = new Map<string, Group>();

  for (const vote of votes) {
    const key = vote.seasonId ? `season:${vote.seasonId}` : `tournament:${vote.tournamentId}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: vote.season?.name ?? vote.tournament?.name ?? "Competición",
        seasonId: vote.seasonId,
        tournamentId: vote.tournamentId,
        counts: new Map(),
      });
    }
    const group = groups.get(key)!;
    const entry = group.counts.get(vote.votedForId) ?? { gamertag: vote.votedFor.gamertag, votes: 0 };
    entry.votes += 1;
    group.counts.set(vote.votedForId, entry);
  }

  const competitions = [...groups.values()].map((g) => ({
    key: g.key,
    label: g.label,
    seasonId: g.seasonId,
    tournamentId: g.tournamentId,
    counts: [...g.counts.entries()]
      .map(([playerId, v]) => ({ playerId, gamertag: v.gamertag, votes: v.votes }))
      .sort((a, b) => b.votes - a.votes),
    alreadyAwarded: g.seasonId
      ? awards.some((a) => a.seasonId === g.seasonId)
      : awards.some((a) => a.tournamentId === g.tournamentId),
  }));

  return (
    <div className="min-h-screen flex">
      <AdminSidebar active="/admin/mvp" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 max-w-[1200px] w-full mt-[57px] md:mt-0">
          <h1 className="font-display uppercase text-3xl mb-1">Votación MVP</h1>
          <p className="text-muted text-sm mb-6">
            Recuento de votos por competición. Al cerrar la votación se otorga el premio de MVP.
          </p>
          <MvpVotingManager competitions={competitions} />
        </main>
      </div>
    </div>
  );
}
