-- CreateTable
CREATE TABLE "symptom_logs" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "symptom_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "symptom_logs_patientId_idx" ON "symptom_logs"("patientId");

-- CreateIndex
CREATE INDEX "symptom_logs_createdAt_idx" ON "symptom_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "symptom_logs" ADD CONSTRAINT "symptom_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
