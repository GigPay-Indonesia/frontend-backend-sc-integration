-- CreateEnum
CREATE TYPE "EscrowIntentStatus" AS ENUM ('CREATED', 'FUNDED', 'SUBMITTED', 'RELEASED', 'REFUNDED');

-- AlterTable
ALTER TABLE "EscrowIntent"
ADD COLUMN "status" "EscrowIntentStatus" NOT NULL DEFAULT 'CREATED',
ADD COLUMN "onchainIntentId" BIGINT,
ADD COLUMN "evidenceHash" TEXT,
ADD COLUMN "createdTxHash" TEXT,
ADD COLUMN "fundedTxHash" TEXT,
ADD COLUMN "submittedTxHash" TEXT,
ADD COLUMN "releasedTxHash" TEXT,
ADD COLUMN "refundedTxHash" TEXT,
ADD COLUMN "fundedAt" TIMESTAMP(3),
ADD COLUMN "submittedAt" TIMESTAMP(3),
ADD COLUMN "releasedAt" TIMESTAMP(3),
ADD COLUMN "refundedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "EscrowIntent_onchainIntentId_key" ON "EscrowIntent"("onchainIntentId");

-- CreateTable
CREATE TABLE "EscrowEventCursor" (
    "id" TEXT NOT NULL,
    "lastProcessedBlock" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EscrowEventCursor_pkey" PRIMARY KEY ("id")
);
