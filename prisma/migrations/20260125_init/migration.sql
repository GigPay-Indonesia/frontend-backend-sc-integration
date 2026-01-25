-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RecipientEntityType" AS ENUM ('VENDOR', 'PARTNER', 'AGENCY', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "RecipientStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('ONCHAIN', 'BANK', 'HYBRID');

-- CreateEnum
CREATE TYPE "SettlementPreference" AS ENUM ('INSTANT', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RiskTier" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ApprovalPolicy" AS ENUM ('AUTO', 'SINGLE', 'MULTI', 'THRESHOLD');

-- CreateEnum
CREATE TYPE "VendorCategory" AS ENUM ('SOFTWARE', 'HARDWARE', 'SERVICES', 'LOGISTICS', 'MARKETING', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('NET0', 'NET7', 'NET14', 'NET30', 'MILESTONE_BASED');

-- CreateEnum
CREATE TYPE "PartnerModel" AS ENUM ('REVENUE_SHARE', 'PROFIT_SHARE', 'COST_SHARE', 'AFFILIATE', 'REFERRAL');

-- CreateEnum
CREATE TYPE "SettlementCycle" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'PER_CAMPAIGN');

-- CreateEnum
CREATE TYPE "TrackingMethod" AS ENUM ('OFFCHAIN_REPORT', 'ONCHAIN_METRICS', 'MANUAL_APPROVAL');

-- CreateEnum
CREATE TYPE "AgencyPayoutMode" AS ENUM ('MASTER_PAYEE', 'SPLIT_TO_TEAM', 'HYBRID');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('FIXED', 'HOURLY', 'RETAINER');

-- CreateEnum
CREATE TYPE "KycLevel" AS ENUM ('NONE', 'BASIC', 'VERIFIED');

-- CreateEnum
CREATE TYPE "DisputePreference" AS ENUM ('AUTO_ARBITRATION', 'MANUAL_REVIEW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gig" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DECIMAL(18,2) NOT NULL,
    "tags" TEXT[],
    "clientId" TEXT NOT NULL,
    "isFunded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "bidAmount" DECIMAL(18,2) NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "gigId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "displayName" TEXT NOT NULL,
    "legalName" TEXT,
    "entityType" "RecipientEntityType" NOT NULL,
    "billingEmail" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "referenceId" TEXT,
    "status" "RecipientStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientPayout" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "preferredAsset" TEXT NOT NULL,
    "payoutMethod" "PayoutMethod" NOT NULL,
    "payoutAddress" TEXT,
    "bankAccountRef" TEXT,
    "settlementPreference" "SettlementPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipientPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientAccounting" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "counterpartyCode" TEXT,
    "costCenter" TEXT,
    "tags" TEXT[],

    CONSTRAINT "RecipientAccounting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientPolicy" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "riskTier" "RiskTier" NOT NULL,
    "approvalPolicy" "ApprovalPolicy" NOT NULL,
    "maxSinglePayment" DECIMAL(18,2),
    "maxMonthlyLimit" DECIMAL(18,2),
    "requiresEscrowDefault" BOOLEAN,
    "requiresMilestonesDefault" BOOLEAN,

    CONSTRAINT "RecipientPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientProfileVendor" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "vendorCategory" "VendorCategory" NOT NULL,
    "paymentTerms" "PaymentTerms" NOT NULL,
    "invoiceRequired" BOOLEAN NOT NULL,
    "invoiceEmail" TEXT,
    "supportedDocuments" TEXT[],
    "billToEntityName" TEXT,
    "taxTreatment" TEXT,

    CONSTRAINT "RecipientProfileVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientProfilePartner" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "partnerModel" "PartnerModel" NOT NULL,
    "settlementCycle" "SettlementCycle" NOT NULL,
    "defaultSplitBps" INTEGER,
    "programId" TEXT,
    "trackingMethod" "TrackingMethod" NOT NULL,
    "kpiTags" TEXT[],

    CONSTRAINT "RecipientProfilePartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientProfileAgency" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "payoutMode" "AgencyPayoutMode" NOT NULL,
    "hasSubRecipients" BOOLEAN NOT NULL,
    "acceptanceWindowDefault" INTEGER,
    "requiresMilestones" BOOLEAN NOT NULL,
    "milestoneTemplate" JSONB,

    CONSTRAINT "RecipientProfileAgency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientProfileContractor" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "engagementType" "EngagementType" NOT NULL,
    "scopeSummary" TEXT NOT NULL,
    "preferredPayoutAsset" TEXT NOT NULL,
    "kycLevel" "KycLevel" NOT NULL,
    "disputePreference" "DisputePreference" NOT NULL,

    CONSTRAINT "RecipientProfileContractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientSplitTemplate" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "recipientWalletOrRef" TEXT NOT NULL,
    "bps" INTEGER NOT NULL,

    CONSTRAINT "RecipientSplitTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowIntent" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "entityType" "RecipientEntityType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "fundingAsset" TEXT NOT NULL,
    "payoutAsset" TEXT NOT NULL,
    "releaseCondition" TEXT NOT NULL,
    "deadlineDays" INTEGER NOT NULL,
    "acceptanceWindowDays" INTEGER NOT NULL,
    "enableYield" BOOLEAN NOT NULL,
    "enableProtection" BOOLEAN NOT NULL,
    "splitConfig" JSONB,
    "milestoneTemplate" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscrowIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_gigId_freelancerId_key" ON "Proposal"("gigId", "freelancerId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientPayout_recipientId_key" ON "RecipientPayout"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientAccounting_recipientId_key" ON "RecipientAccounting"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientPolicy_recipientId_key" ON "RecipientPolicy"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientProfileVendor_recipientId_key" ON "RecipientProfileVendor"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientProfilePartner_recipientId_key" ON "RecipientProfilePartner"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientProfileAgency_recipientId_key" ON "RecipientProfileAgency"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientProfileContractor_recipientId_key" ON "RecipientProfileContractor"("recipientId");

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientPayout" ADD CONSTRAINT "RecipientPayout_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientAccounting" ADD CONSTRAINT "RecipientAccounting_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientPolicy" ADD CONSTRAINT "RecipientPolicy_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientProfileVendor" ADD CONSTRAINT "RecipientProfileVendor_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientProfilePartner" ADD CONSTRAINT "RecipientProfilePartner_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientProfileAgency" ADD CONSTRAINT "RecipientProfileAgency_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientProfileContractor" ADD CONSTRAINT "RecipientProfileContractor_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientSplitTemplate" ADD CONSTRAINT "RecipientSplitTemplate_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowIntent" ADD CONSTRAINT "EscrowIntent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
