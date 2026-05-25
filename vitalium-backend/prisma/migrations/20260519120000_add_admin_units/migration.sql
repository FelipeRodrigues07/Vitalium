-- CreateTable
CREATE TABLE "admin_units" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_units_adminId_unitId_key" ON "admin_units"("adminId", "unitId");

-- CreateIndex
CREATE INDEX "admin_units_adminId_idx" ON "admin_units"("adminId");

-- CreateIndex
CREATE INDEX "admin_units_unitId_idx" ON "admin_units"("unitId");

-- AddForeignKey
ALTER TABLE "admin_units" ADD CONSTRAINT "admin_units_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_units" ADD CONSTRAINT "admin_units_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
