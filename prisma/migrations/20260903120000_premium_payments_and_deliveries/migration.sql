-- LeonardX premium payment proofs, AI credits and job deliveries
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiCreditsTotal" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "apkAccess" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  CREATE TYPE "DeliveryStatus" AS ENUM ('SUBMITTED', 'REVIEWED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "PaymentProof" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "transactionRef" TEXT NOT NULL,
  "receiptUrl" TEXT NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "adminNote" TEXT,
  CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentProof_transactionRef_key" ON "PaymentProof"("transactionRef");
CREATE INDEX IF NOT EXISTS "PaymentProof_userId_createdAt_idx" ON "PaymentProof"("userId","createdAt");
CREATE INDEX IF NOT EXISTS "PaymentProof_status_createdAt_idx" ON "PaymentProof"("status","createdAt");
ALTER TABLE "PaymentProof" DROP CONSTRAINT IF EXISTS "PaymentProof_userId_fkey";
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "JobDelivery" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "freelancerId" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "notes" TEXT,
  "status" "DeliveryStatus" NOT NULL DEFAULT 'SUBMITTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  CONSTRAINT "JobDelivery_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "JobDelivery_jobId_createdAt_idx" ON "JobDelivery"("jobId","createdAt");
CREATE INDEX IF NOT EXISTS "JobDelivery_freelancerId_createdAt_idx" ON "JobDelivery"("freelancerId","createdAt");
ALTER TABLE "JobDelivery" DROP CONSTRAINT IF EXISTS "JobDelivery_jobId_fkey";
ALTER TABLE "JobDelivery" ADD CONSTRAINT "JobDelivery_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobDelivery" DROP CONSTRAINT IF EXISTS "JobDelivery_freelancerId_fkey";
ALTER TABLE "JobDelivery" ADD CONSTRAINT "JobDelivery_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
