-- AlterTable
ALTER TABLE "TeamSeasonRecord" ADD COLUMN     "pointsAgainst" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsFor" INTEGER NOT NULL DEFAULT 0;
