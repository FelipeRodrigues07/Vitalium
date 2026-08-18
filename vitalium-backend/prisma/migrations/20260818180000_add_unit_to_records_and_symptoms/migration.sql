-- AlterTable
ALTER TABLE "medical_records" ADD COLUMN "unitId" TEXT;

UPDATE "medical_records" AS mr
SET "unitId" = (
  SELECT pu."unitId"
  FROM "patient_units" pu
  WHERE pu."patientId" = mr."patientId" AND pu."isActive" = true
  ORDER BY pu."isPrimary" DESC, pu."createdAt" ASC
  LIMIT 1
);

UPDATE "medical_records" AS mr
SET "unitId" = (
  SELECT du."unitId"
  FROM "doctor_units" du
  WHERE du."doctorId" = mr."doctorId" AND du."isActive" = true
  ORDER BY du."isPrimary" DESC, du."createdAt" ASC
  LIMIT 1
)
WHERE mr."unitId" IS NULL;

UPDATE "medical_records"
SET "unitId" = (SELECT "id" FROM "units" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "unitId" IS NULL;

ALTER TABLE "medical_records" ALTER COLUMN "unitId" SET NOT NULL;

CREATE INDEX "medical_records_unitId_idx" ON "medical_records"("unitId");

ALTER TABLE "medical_records"
ADD CONSTRAINT "medical_records_unitId_fkey"
FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "symptom_logs" ADD COLUMN "unitId" TEXT;

UPDATE "symptom_logs" AS sl
SET "unitId" = (
  SELECT pu."unitId"
  FROM "patient_units" pu
  WHERE pu."patientId" = sl."patientId" AND pu."isActive" = true
  ORDER BY pu."isPrimary" DESC, pu."createdAt" ASC
  LIMIT 1
);

UPDATE "symptom_logs"
SET "unitId" = (SELECT "id" FROM "units" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "unitId" IS NULL;

ALTER TABLE "symptom_logs" ALTER COLUMN "unitId" SET NOT NULL;

CREATE INDEX "symptom_logs_unitId_idx" ON "symptom_logs"("unitId");

ALTER TABLE "symptom_logs"
ADD CONSTRAINT "symptom_logs_unitId_fkey"
FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
