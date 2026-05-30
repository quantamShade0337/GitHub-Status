-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "archetypeKey" TEXT NOT NULL,
    "archetype" TEXT NOT NULL,
    "tagline" TEXT,
    "outputScore" INTEGER NOT NULL,
    "topLanguage" TEXT,
    "totalRepos" INTEGER NOT NULL,
    "estimatedLoc" INTEGER NOT NULL,
    "tokenUsed" BOOLEAN NOT NULL DEFAULT false,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Scan_username_key" ON "Scan"("username");

-- CreateIndex
CREATE INDEX "Scan_archetypeKey_idx" ON "Scan"("archetypeKey");

-- CreateIndex
CREATE INDEX "Scan_outputScore_idx" ON "Scan"("outputScore");

-- CreateIndex
CREATE INDEX "Scan_updatedAt_idx" ON "Scan"("updatedAt");
