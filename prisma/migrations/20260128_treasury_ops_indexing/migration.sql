-- Treasury Ops indexing tables (hybrid analytics)

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ChainEventSource" AS ENUM ('TREASURY', 'ESCROW', 'YIELD_MANAGER', 'REGISTRY', 'SWAP', 'TOKEN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChainEvent" (
  "id" TEXT NOT NULL,
  "chainId" INTEGER NOT NULL,
  "source" "ChainEventSource" NOT NULL,
  "contractAddress" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "txHash" TEXT NOT NULL,
  "blockNumber" BIGINT NOT NULL,
  "logIndex" INTEGER NOT NULL,
  "onchainIntentId" BIGINT,
  "asset" TEXT,
  "amount" DECIMAL(38,18),
  "data" JSONB,
  "timestamp" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TreasurySnapshot" (
  "id" TEXT NOT NULL,
  "chainId" INTEGER NOT NULL,
  "treasury" TEXT NOT NULL,
  "assetSymbol" TEXT,
  "idle" DECIMAL(38,18) NOT NULL,
  "escrowLocked" DECIMAL(38,18) NOT NULL,
  "yieldDeployed" DECIMAL(38,18) NOT NULL,
  "total" DECIMAL(38,18) NOT NULL,
  "blockNumber" BIGINT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TreasurySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EscrowIntentState" (
  "id" TEXT NOT NULL,
  "chainId" INTEGER NOT NULL,
  "onchainIntentId" BIGINT NOT NULL,
  "status" "EscrowIntentStatus" NOT NULL,
  "treasury" TEXT,
  "asset" TEXT,
  "payoutAsset" TEXT,
  "amount" DECIMAL(38,18),
  "escrowYieldEnabled" BOOLEAN,
  "escrowShares" DECIMAL(38,18),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EscrowIntentState_pkey" PRIMARY KEY ("id")
);

-- Indexes / constraints
CREATE UNIQUE INDEX IF NOT EXISTS "ChainEvent_chainId_txHash_logIndex_key" ON "ChainEvent"("chainId", "txHash", "logIndex");
CREATE INDEX IF NOT EXISTS "ChainEvent_chainId_source_blockNumber_idx" ON "ChainEvent"("chainId", "source", "blockNumber");
CREATE INDEX IF NOT EXISTS "ChainEvent_onchainIntentId_idx" ON "ChainEvent"("onchainIntentId");

CREATE INDEX IF NOT EXISTS "TreasurySnapshot_chainId_treasury_timestamp_idx" ON "TreasurySnapshot"("chainId", "treasury", "timestamp");

CREATE UNIQUE INDEX IF NOT EXISTS "EscrowIntentState_onchainIntentId_key" ON "EscrowIntentState"("onchainIntentId");
CREATE INDEX IF NOT EXISTS "EscrowIntentState_chainId_status_idx" ON "EscrowIntentState"("chainId", "status");