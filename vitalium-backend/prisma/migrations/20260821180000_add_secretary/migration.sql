-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SECRETARY';

-- CreateTable
CREATE TABLE "secretaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secretaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretary_units" (
    "id" TEXT NOT NULL,
    "secretaryId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secretary_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "secretaries_userId_key" ON "secretaries"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "secretary_units_secretaryId_unitId_key" ON "secretary_units"("secretaryId", "unitId");

-- CreateIndex
CREATE INDEX "secretary_units_secretaryId_idx" ON "secretary_units"("secretaryId");

-- CreateIndex
CREATE INDEX "secretary_units_unitId_idx" ON "secretary_units"("unitId");

-- AddForeignKey
ALTER TABLE "secretaries" ADD CONSTRAINT "secretaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretary_units" ADD CONSTRAINT "secretary_units_secretaryId_fkey" FOREIGN KEY ("secretaryId") REFERENCES "secretaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretary_units" ADD CONSTRAINT "secretary_units_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
