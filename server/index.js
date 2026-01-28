import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';
import {
    escrowActionSchema,
    escrowIntentSchema,
    escrowOnchainLinkSchema,
    prepareIntentSchema,
    recipientSchema,
    recipientUpdateSchema,
    splitTemplateSchema,
} from './validation.js';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { baseSepolia } from 'viem/chains';
import GigPayEscrowCoreV2Abi from '../abis/GigPayEscrowCoreV2.abi.json' assert { type: 'json' };
import GigPayRegistryAbi from '../abis/GigPayRegistry.abi.json' assert { type: 'json' };
import CompanyTreasuryVaultAbi from '../abis/CompanyTreasuryVault.abi.json' assert { type: 'json' };
import ThetanutsVaultStrategyV2Abi from '../abis/ThetanutsVaultStrategyV2.abi.json' assert { type: 'json' };

const app = express();
const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
});
const PORT = process.env.PORT || 4000;
const CHAIN_ID = Number(process.env.GIGPAY_CHAIN_ID || 84532);
const ESCROW_ADDRESS = process.env.GIGPAY_ESCROW_ADDRESS || '0xd09177C97978f5c970ad25294681F5A51685c214';
const TREASURY_ADDRESS = process.env.GIGPAY_TREASURY_ADDRESS || '0xCFB357fae5e5034cCfA0649b711a2897e685D14a';
const RPC_URL = process.env.GIGPAY_RPC_URL;
const EVENT_POLL_INTERVAL_MS = Number(process.env.GIGPAY_EVENT_POLL_MS || 15000);
const SWAP_DATA = process.env.GIGPAY_SWAP_DATA;
const REGISTRY_ADDRESS = process.env.GIGPAY_REGISTRY_ADDRESS || '0x32F8dF36b1e373A9E4C6b733386509D4da535a72';
const TREASURY_YIELD_STRATEGY_ADDRESS =
    process.env.GIGPAY_TREASURY_YIELD_STRATEGY_ADDRESS || '0x5b33727432D8f0F280dd712e78d650411b918353';

const TOKENS = {
    IDRX: process.env.GIGPAY_IDRX_ADDRESS || '0x20Abd5644f1f77155c63A8818C75540F770ae223',
    USDC: process.env.GIGPAY_USDC_ADDRESS || '0x44E7c97Ee6EC2B25145Acf350DBBf636615e198d',
    USDT: process.env.GIGPAY_USDT_ADDRESS || '0xDbb4DEfa899F25Fd1727D55cfb66F6EB0C378893',
    DAI: process.env.GIGPAY_DAI_ADDRESS || '0x029a0241F596B9728c201a58CD9aa9Db5d3ac533',
    EURC: process.env.GIGPAY_EURC_ADDRESS || '0xE9b7236DF6610C1A694955fFe13ca65970183961',
};

app.use(cors());
app.use(express.json());

// --- Registry module cache (hybrid model: resolve modules via registry, cache in memory) ---
const registryCache = {
    updatedAt: null,
    tokenRegistry: null,
    routeRegistry: null,
    swapManager: null,
    yieldManager: null,
};

const ERC20_ABI = [
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
];

const toDecimal18 = (value) => {
    if (typeof value !== 'bigint') return null;
    const s = value.toString();
    if (s.length <= 18) {
        const padded = s.padStart(19, '0');
        return new Prisma.Decimal(`0.${padded}`);
    }
    const whole = s.slice(0, s.length - 18);
    const frac = s.slice(s.length - 18);
    return new Prisma.Decimal(`${whole}.${frac}`);
};

const upsertChainEvent = async (params) => {
    // Params: { source, contractAddress, eventName, txHash, blockNumber, logIndex, onchainIntentId?, asset?, amount?, data?, timestamp? }
    try {
        await prisma.chainEvent.create({
            data: {
                id: crypto.randomUUID(),
                chainId: CHAIN_ID,
                source: params.source,
                contractAddress: params.contractAddress,
                eventName: params.eventName,
                txHash: params.txHash,
                blockNumber: params.blockNumber,
                logIndex: params.logIndex,
                onchainIntentId: params.onchainIntentId ?? null,
                asset: params.asset ?? null,
                amount: params.amount ?? null,
                data: params.data ?? null,
                timestamp: params.timestamp ?? null,
            },
        });
    } catch (e) {
        // ignore duplicates
    }
};

const upsertEscrowIntentState = async (onchainIntentId, data) => {
    await prisma.escrowIntentState.upsert({
        where: { onchainIntentId },
        create: {
            id: crypto.randomUUID(),
            chainId: CHAIN_ID,
            onchainIntentId,
            status: data.status,
            treasury: data.treasury ?? null,
            asset: data.asset ?? null,
            payoutAsset: data.payoutAsset ?? null,
            amount: data.amount ?? null,
            escrowYieldEnabled: data.escrowYieldEnabled ?? null,
            escrowShares: data.escrowShares ?? null,
        },
        update: {
            status: data.status,
            treasury: data.treasury ?? null,
            asset: data.asset ?? null,
            payoutAsset: data.payoutAsset ?? null,
            amount: data.amount ?? null,
            escrowYieldEnabled: data.escrowYieldEnabled ?? null,
            escrowShares: data.escrowShares ?? null,
        },
    });
};

const refreshRegistryModules = async (client) => {
    const [tokenRegistry, routeRegistry, swapManager, yieldManager] = await Promise.all([
        client.readContract({ address: REGISTRY_ADDRESS, abi: GigPayRegistryAbi, functionName: 'tokenRegistry', args: [] }),
        client.readContract({ address: REGISTRY_ADDRESS, abi: GigPayRegistryAbi, functionName: 'routeRegistry', args: [] }),
        client.readContract({ address: REGISTRY_ADDRESS, abi: GigPayRegistryAbi, functionName: 'swapManager', args: [] }),
        client.readContract({ address: REGISTRY_ADDRESS, abi: GigPayRegistryAbi, functionName: 'yieldManager', args: [] }),
    ]);

    registryCache.updatedAt = new Date();
    registryCache.tokenRegistry = tokenRegistry;
    registryCache.routeRegistry = routeRegistry;
    registryCache.swapManager = swapManager;
    registryCache.yieldManager = yieldManager;
};

const getBlockTimestamps = async (client, logs) => {
    const map = new Map();
    const uniq = Array.from(new Set(logs.map((l) => l.blockNumber?.toString()).filter(Boolean)));
    const blocks = await Promise.all(uniq.map((s) => client.getBlock({ blockNumber: BigInt(s) })));
    uniq.forEach((s, i) => map.set(s, blocks[i]?.timestamp));
    return map;
};

const chunkedGetLogs = async ({ client, address, events, fromBlock, toBlock, chunkSize = 50_000n }) => {
    const out = [];
    let start = fromBlock;
    while (start <= toBlock) {
        const end = start + chunkSize - 1n > toBlock ? toBlock : start + chunkSize - 1n;
        // eslint-disable-next-line no-await-in-loop
        const logs = await client.getLogs({ address, events, fromBlock: start, toBlock: end });
        out.push(...logs);
        start = end + 1n;
    }
    return out;
};

const computeTreasuryBreakdown = async (client) => {
    // escrow totals from backend metadata
    const escrowByAsset = await prisma.escrowIntent.groupBy({
        by: ['fundingAsset'],
        where: { status: { in: ['FUNDED', 'SUBMITTED'] } },
        _sum: { amount: true },
    });

    const perAsset = [];

    for (const [symbol, tokenAddress] of Object.entries(TOKENS)) {
        // eslint-disable-next-line no-await-in-loop
        const idleRaw = await client.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [TREASURY_ADDRESS],
        });

        // eslint-disable-next-line no-await-in-loop
        const sharesRaw = await client.readContract({
            address: TREASURY_ADDRESS,
            abi: CompanyTreasuryVaultAbi,
            functionName: 'yieldShares',
            args: [tokenAddress],
        });

        let yieldAssetsRaw = 0n;
        try {
            // eslint-disable-next-line no-await-in-loop
            yieldAssetsRaw = await client.readContract({
                address: TREASURY_YIELD_STRATEGY_ADDRESS,
                abi: ThetanutsVaultStrategyV2Abi,
                functionName: 'convertToAssets',
                args: [sharesRaw],
            });
        } catch {
            // ignore unsupported asset conversions
        }

        const escrowLocked = escrowByAsset.find((x) => x.fundingAsset === symbol)?._sum?.amount || new Prisma.Decimal(0);

        const idle = toDecimal18(idleRaw) || new Prisma.Decimal(0);
        const yieldDeployed = toDecimal18(yieldAssetsRaw) || new Prisma.Decimal(0);
        const total = idle.plus(yieldDeployed).plus(escrowLocked);

        perAsset.push({
            symbol,
            tokenAddress,
            idle,
            yieldDeployed,
            escrowLocked,
            total,
        });
    }

    const totals = perAsset.reduce(
        (acc, r) => {
            acc.idle = acc.idle.plus(r.idle);
            acc.yieldDeployed = acc.yieldDeployed.plus(r.yieldDeployed);
            acc.escrowLocked = acc.escrowLocked.plus(r.escrowLocked);
            acc.total = acc.total.plus(r.total);
            return acc;
        },
        {
            idle: new Prisma.Decimal(0),
            yieldDeployed: new Prisma.Decimal(0),
            escrowLocked: new Prisma.Decimal(0),
            total: new Prisma.Decimal(0),
        }
    );

    return { totals, perAsset };
};

app.get('/registry/modules', async (_req, res) => {
    try {
        if (!RPC_URL) {
            res.status(409).json({ error: 'GIGPAY_RPC_URL not set' });
            return;
        }

        const client = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });
        // refresh on demand if empty/stale (>60s)
        const isStale = !registryCache.updatedAt || (Date.now() - registryCache.updatedAt.getTime()) > 60_000;
        if (isStale) await refreshRegistryModules(client);

        res.json({
            registry: REGISTRY_ADDRESS,
            updatedAt: registryCache.updatedAt,
            modules: {
                tokenRegistry: registryCache.tokenRegistry,
                routeRegistry: registryCache.routeRegistry,
                swapManager: registryCache.swapManager,
                yieldManager: registryCache.yieldManager,
            },
        });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Unable to resolve registry modules.' });
    }
});

// --- Treasury Ops API (hybrid): escrow totals + event feed + snapshots ---
app.get('/treasury/overview', async (_req, res) => {
    try {
        if (!RPC_URL) {
            res.status(409).json({ error: 'GIGPAY_RPC_URL not set' });
            return;
        }

        const client = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });
        const [byStatus, latestSnapshots, recentEvents, breakdown] = await Promise.all([
            prisma.escrowIntent.groupBy({
                by: ['status'],
                _count: { _all: true },
            }),
            prisma.treasurySnapshot.findMany({
                where: { chainId: CHAIN_ID, treasury: TREASURY_ADDRESS },
                orderBy: { timestamp: 'desc' },
                take: 30,
            }),
            prisma.chainEvent.findMany({
                where: { chainId: CHAIN_ID },
                orderBy: [{ blockNumber: 'desc' }, { logIndex: 'desc' }],
                take: 50,
            }),
            computeTreasuryBreakdown(client),
        ]);

        res.json({
            chainId: CHAIN_ID,
            treasury: TREASURY_ADDRESS,
            totals: breakdown.totals,
            perAsset: breakdown.perAsset,
            byStatus,
            snapshots: latestSnapshots,
            recentEvents,
        });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to load treasury overview.' });
    }
});

app.get('/treasury/history', async (req, res) => {
    try {
        const range = typeof req.query.range === 'string' ? req.query.range : '30d';
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const from =
            range === '7d' ? new Date(now - 7 * day) :
                range === '90d' ? new Date(now - 90 * day) :
                    range === '1y' ? new Date(now - 365 * day) :
                        range === 'all' ? new Date(0) : new Date(now - 30 * day);

        const rows = await prisma.treasurySnapshot.findMany({
            where: { chainId: CHAIN_ID, treasury: TREASURY_ADDRESS, timestamp: { gte: from } },
            orderBy: { timestamp: 'asc' },
        });

        res.json({ range, rows });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to load treasury history.' });
    }
});

app.get('/treasury/activity', async (req, res) => {
    try {
        const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 100;
        const source = typeof req.query.source === 'string' ? req.query.source : undefined;
        const rows = await prisma.chainEvent.findMany({
            where: {
                chainId: CHAIN_ID,
                source: source || undefined,
            },
            orderBy: [{ blockNumber: 'desc' }, { logIndex: 'desc' }],
            take: Number.isFinite(limit) ? Math.min(limit, 500) : 100,
        });
        res.json({ rows });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to load treasury activity.' });
    }
});

app.get('/payments/intents', async (req, res) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const intents = await prisma.escrowIntent.findMany({
            where: { status: status || undefined },
            include: {
                recipient: {
                    include: {
                        payout: true,
                        accounting: true,
                        policy: true,
                        vendorProfile: true,
                        partnerProfile: true,
                        agencyProfile: true,
                        contractorProfile: true,
                        splitTemplates: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ intents });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to load payment intents.' });
    }
});

app.get('/payments/intents/:onchainIntentId/history', async (req, res) => {
    try {
        const onchainIntentId = BigInt(req.params.onchainIntentId);
        const rows = await prisma.chainEvent.findMany({
            where: { chainId: CHAIN_ID, onchainIntentId },
            orderBy: [{ blockNumber: 'desc' }, { logIndex: 'desc' }],
        });
        res.json({ rows });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to load payment history.' });
    }
});

const createProfileData = (payload) => {
    const base = {
        payout: {
            create: {
                preferredAsset: payload.payout.preferredAsset,
                payoutMethod: payload.payout.payoutMethod,
                payoutAddress: payload.payout.payoutAddress || null,
                bankAccountRef: payload.payout.bankAccountRef || null,
                settlementPreference: payload.payout.settlementPreference,
            },
        },
        accounting: {
            create: {
                counterpartyCode: payload.accounting.counterpartyCode || null,
                costCenter: payload.accounting.costCenter || null,
                tags: payload.accounting.tags || [],
            },
        },
        policy: {
            create: {
                riskTier: payload.policy.riskTier,
                approvalPolicy: payload.policy.approvalPolicy,
                maxSinglePayment: payload.policy.maxSinglePayment ? payload.policy.maxSinglePayment : null,
                maxMonthlyLimit: payload.policy.maxMonthlyLimit ? payload.policy.maxMonthlyLimit : null,
                requiresEscrowDefault: payload.policy.requiresEscrowDefault ?? null,
                requiresMilestonesDefault: payload.policy.requiresMilestonesDefault ?? null,
            },
        },
    };

    if (payload.profile.type === 'VENDOR') {
        return {
            ...base,
            vendorProfile: {
                create: {
                    vendorCategory: payload.profile.vendorCategory,
                    paymentTerms: payload.profile.paymentTerms,
                    invoiceRequired: payload.profile.invoiceRequired,
                    invoiceEmail: payload.profile.invoiceEmail || null,
                    supportedDocuments: payload.profile.supportedDocuments || [],
                    billToEntityName: payload.profile.billToEntityName || null,
                    taxTreatment: payload.profile.taxTreatment || null,
                },
            },
        };
    }

    if (payload.profile.type === 'PARTNER') {
        return {
            ...base,
            partnerProfile: {
                create: {
                    partnerModel: payload.profile.partnerModel,
                    settlementCycle: payload.profile.settlementCycle,
                    defaultSplitBps: payload.profile.defaultSplitBps || null,
                    programId: payload.profile.programId || null,
                    trackingMethod: payload.profile.trackingMethod,
                    kpiTags: payload.profile.kpiTags || [],
                },
            },
        };
    }

    if (payload.profile.type === 'AGENCY') {
        return {
            ...base,
            agencyProfile: {
                create: {
                    payoutMode: payload.profile.payoutMode,
                    hasSubRecipients: payload.profile.hasSubRecipients,
                    acceptanceWindowDefault: payload.profile.acceptanceWindowDefault || null,
                    requiresMilestones: payload.profile.requiresMilestones,
                    milestoneTemplate: payload.profile.milestoneTemplate || null,
                },
            },
        };
    }

    return {
        ...base,
        contractorProfile: {
            create: {
                engagementType: payload.profile.engagementType,
                scopeSummary: payload.profile.scopeSummary,
                preferredPayoutAsset: payload.profile.preferredPayoutAsset,
                kycLevel: payload.profile.kycLevel,
                disputePreference: payload.profile.disputePreference,
            },
        },
    };
};

app.post('/recipients', async (req, res) => {
    try {
        const payload = recipientSchema.parse(req.body);

        const recipient = await prisma.recipient.create({
            data: {
                orgId: payload.identity.orgId || null,
                displayName: payload.identity.displayName,
                legalName: payload.identity.legalName || null,
                entityType: payload.identity.entityType,
                billingEmail: payload.identity.email,
                country: payload.identity.country,
                timezone: payload.identity.timezone,
                referenceId: payload.identity.referenceId || null,
                ...createProfileData(payload),
                splitTemplates: payload.splitTemplates?.length
                    ? {
                        create: payload.splitTemplates.map((template) => ({
                            templateName: template.templateName,
                            recipientWalletOrRef: template.recipientWalletOrRef,
                            bps: template.bps,
                        })),
                    }
                    : undefined,
            },
            include: {
                payout: true,
                accounting: true,
                policy: true,
                vendorProfile: true,
                partnerProfile: true,
                agencyProfile: true,
                contractorProfile: true,
                splitTemplates: true,
            },
        });

        res.json({ recipient });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.get('/recipients', async (_req, res) => {
    const recipients = await prisma.recipient.findMany({
        include: {
            payout: true,
            accounting: true,
            policy: true,
            vendorProfile: true,
            partnerProfile: true,
            agencyProfile: true,
            contractorProfile: true,
            splitTemplates: true,
        },
    });
    res.json({ recipients });
});

app.get('/recipients/:id', async (req, res) => {
    const recipient = await prisma.recipient.findUnique({
        where: { id: req.params.id },
        include: {
            payout: true,
            accounting: true,
            policy: true,
            vendorProfile: true,
            partnerProfile: true,
            agencyProfile: true,
            contractorProfile: true,
            splitTemplates: true,
        },
    });

    if (!recipient) {
        res.status(404).json({ error: 'Recipient not found' });
        return;
    }

    res.json({ recipient });
});

app.patch('/recipients/:id', async (req, res) => {
    try {
        const payload = recipientUpdateSchema.parse(req.body);
        const recipient = await prisma.recipient.update({
            where: { id: req.params.id },
            data: {
                displayName: payload.identity?.displayName,
                legalName: payload.identity?.legalName,
                entityType: payload.identity?.entityType,
                billingEmail: payload.identity?.email,
                country: payload.identity?.country,
                timezone: payload.identity?.timezone,
                referenceId: payload.identity?.referenceId,
                payout: payload.payout
                    ? {
                        upsert: {
                            create: {
                                preferredAsset: payload.payout.preferredAsset,
                                payoutMethod: payload.payout.payoutMethod,
                                payoutAddress: payload.payout.payoutAddress || null,
                                bankAccountRef: payload.payout.bankAccountRef || null,
                                settlementPreference: payload.payout.settlementPreference,
                            },
                            update: {
                                preferredAsset: payload.payout.preferredAsset,
                                payoutMethod: payload.payout.payoutMethod,
                                payoutAddress: payload.payout.payoutAddress || null,
                                bankAccountRef: payload.payout.bankAccountRef || null,
                                settlementPreference: payload.payout.settlementPreference,
                            },
                        },
                    }
                    : undefined,
                accounting: payload.accounting
                    ? {
                        upsert: {
                            create: {
                                counterpartyCode: payload.accounting.counterpartyCode || null,
                                costCenter: payload.accounting.costCenter || null,
                                tags: payload.accounting.tags || [],
                            },
                            update: {
                                counterpartyCode: payload.accounting.counterpartyCode || null,
                                costCenter: payload.accounting.costCenter || null,
                                tags: payload.accounting.tags || [],
                            },
                        },
                    }
                    : undefined,
                policy: payload.policy
                    ? {
                        upsert: {
                            create: {
                                riskTier: payload.policy.riskTier,
                                approvalPolicy: payload.policy.approvalPolicy,
                                maxSinglePayment: payload.policy.maxSinglePayment || null,
                                maxMonthlyLimit: payload.policy.maxMonthlyLimit || null,
                                requiresEscrowDefault: payload.policy.requiresEscrowDefault ?? null,
                                requiresMilestonesDefault: payload.policy.requiresMilestonesDefault ?? null,
                            },
                            update: {
                                riskTier: payload.policy.riskTier,
                                approvalPolicy: payload.policy.approvalPolicy,
                                maxSinglePayment: payload.policy.maxSinglePayment || null,
                                maxMonthlyLimit: payload.policy.maxMonthlyLimit || null,
                                requiresEscrowDefault: payload.policy.requiresEscrowDefault ?? null,
                                requiresMilestonesDefault: payload.policy.requiresMilestonesDefault ?? null,
                            },
                        },
                    }
                    : undefined,
            },
            include: {
                payout: true,
                accounting: true,
                policy: true,
                vendorProfile: true,
                partnerProfile: true,
                agencyProfile: true,
                contractorProfile: true,
                splitTemplates: true,
            },
        });

        res.json({ recipient });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.post('/recipients/:id/split-templates', async (req, res) => {
    try {
        const payload = splitTemplateSchema.parse(req.body);
        const created = await prisma.recipientSplitTemplate.createMany({
            data: payload.templates.map((template) => ({
                recipientId: req.params.id,
                templateName: template.templateName,
                recipientWalletOrRef: template.recipientWalletOrRef,
                bps: template.bps,
            })),
        });
        res.json({ created });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.post('/escrows/prepare-intent', async (req, res) => {
    try {
        const payload = prepareIntentSchema.parse(req.body);
        const recipient = await prisma.recipient.findUnique({
            where: { id: payload.recipientId },
            include: {
                vendorProfile: true,
                partnerProfile: true,
                agencyProfile: true,
                contractorProfile: true,
                splitTemplates: true,
            },
        });

        if (!recipient) {
            res.status(404).json({ error: 'Recipient not found' });
            return;
        }

        let releaseCondition = 'ON_APPROVAL';
        let requiresEscrow = recipient.entityType === 'AGENCY' || recipient.entityType === 'CONTRACTOR';
        let requiresMilestones = recipient.entityType === 'AGENCY';
        let acceptanceWindowDays = recipient.entityType === 'CONTRACTOR' ? 3 : 7;
        let enableYield = recipient.entityType === 'AGENCY';

        if (recipient.vendorProfile?.paymentTerms === 'MILESTONE_BASED') {
            releaseCondition = 'ON_MILESTONE';
        }

        if (recipient.agencyProfile?.requiresMilestones) {
            releaseCondition = 'ON_MILESTONE';
            requiresMilestones = true;
        }

        const splitTemplate = recipient.splitTemplates.map((template) => ({
            recipient: template.recipientWalletOrRef,
            bps: template.bps,
        }));

        res.json({
            defaults: {
                releaseCondition,
                requiresEscrow,
                requiresMilestones,
                acceptanceWindowDays,
                enableYield,
            },
            splitTemplate,
        });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.post('/escrows/create-intent', async (req, res) => {
    try {
        const payload = escrowIntentSchema.parse(req.body);

        const intent = await prisma.escrowIntent.create({
            data: {
                recipientId: payload.recipientId,
                entityType: payload.entityType,
                amount: payload.amount,
                fundingAsset: payload.fundingAsset,
                payoutAsset: payload.payoutAsset,
                releaseCondition: payload.releaseCondition,
                deadlineDays: payload.deadlineDays,
                acceptanceWindowDays: payload.acceptanceWindowDays,
                enableYield: payload.enableYield,
                enableProtection: payload.enableProtection,
                splitConfig: payload.splitConfig || null,
                milestoneTemplate: payload.milestoneTemplate || null,
                notes: payload.notes || null,
            },
        });

        res.json({
            id: intent.id,
            onchainPayload: {
                fundingAsset: payload.fundingAsset,
                payoutAsset: payload.payoutAsset,
                amount: payload.amount,
                deadlineDays: payload.deadlineDays,
                acceptanceWindowDays: payload.acceptanceWindowDays,
                splitConfig: payload.splitConfig || null,
                enableYield: payload.enableYield,
                enableProtection: payload.enableProtection,
            },
        });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.post('/escrows/:id/onchain', async (req, res) => {
    try {
        const payload = escrowOnchainLinkSchema.parse(req.body);
        const onchainIntentId = BigInt(payload.onchainIntentId);

        const intent = await prisma.escrowIntent.update({
            where: { id: req.params.id },
            data: {
                onchainIntentId,
                createdTxHash: payload.createTxHash || null,
                status: 'CREATED',
            },
        });

        res.json({ intent });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.post('/escrows/onchain/:intentId/fund', async (req, res) => {
    try {
        const payload = escrowActionSchema.parse(req.body);
        const onchainIntentId = BigInt(req.params.intentId);

        const updated = await prisma.escrowIntent.updateMany({
            where: { onchainIntentId },
            data: {
                status: 'FUNDED',
                fundedAt: new Date(),
                fundedTxHash: payload.txHash || null,
            },
        });

        res.json({ updated: updated.count });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.post('/escrows/onchain/:intentId/submit-work', async (req, res) => {
    try {
        const payload = escrowActionSchema.parse(req.body);
        const onchainIntentId = BigInt(req.params.intentId);

        const updated = await prisma.escrowIntent.updateMany({
            where: { onchainIntentId },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                submittedTxHash: payload.txHash || null,
                evidenceHash: payload.evidenceHash || null,
            },
        });

        res.json({ updated: updated.count });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.post('/escrows/onchain/:intentId/release', async (req, res) => {
    try {
        const payload = escrowActionSchema.parse(req.body);
        const onchainIntentId = BigInt(req.params.intentId);

        const updated = await prisma.escrowIntent.updateMany({
            where: { onchainIntentId },
            data: {
                status: 'RELEASED',
                releasedAt: new Date(),
                releasedTxHash: payload.txHash || null,
            },
        });

        res.json({ updated: updated.count });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.post('/escrows/onchain/:intentId/refund', async (req, res) => {
    try {
        const payload = escrowActionSchema.parse(req.body);
        const onchainIntentId = BigInt(req.params.intentId);

        const updated = await prisma.escrowIntent.updateMany({
            where: { onchainIntentId },
            data: {
                status: 'REFUNDED',
                refundedAt: new Date(),
                refundedTxHash: payload.txHash || null,
            },
        });

        res.json({ updated: updated.count });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Invalid payload' });
    }
});

app.get('/escrows/intents', async (req, res) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const entityType = typeof req.query.entityType === 'string' ? req.query.entityType : undefined;

        const intents = await prisma.escrowIntent.findMany({
            where: {
                status: status || undefined,
                entityType: entityType || undefined,
            },
            include: {
                recipient: {
                    select: {
                        id: true,
                        displayName: true,
                        entityType: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({ intents });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to load escrow intents.' });
    }
});

app.get('/escrows/:id', async (req, res) => {
    try {
        const intent = await prisma.escrowIntent.findUnique({
            where: { id: req.params.id },
            include: {
                recipient: {
                    select: {
                        id: true,
                        displayName: true,
                        entityType: true,
                    },
                },
            },
        });

        if (!intent) {
            res.status(404).json({ error: 'Escrow intent not found.' });
            return;
        }

        res.json({ intent });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to load escrow intent.' });
    }
});

app.get('/escrows/onchain/:intentId', async (req, res) => {
    try {
        if (!RPC_URL) {
            res.status(500).json({ error: 'GIGPAY_RPC_URL not configured.' });
            return;
        }

        const intentId = BigInt(req.params.intentId);
        const client = createPublicClient({
            chain: baseSepolia,
            transport: http(RPC_URL),
        });

        const intent = await client.readContract({
            address: ESCROW_ADDRESS,
            abi: GigPayEscrowCoreV2Abi,
            functionName: 'intents',
            args: [intentId],
        });

        res.json({ intent });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Unable to read intent.' });
    }
});

app.get('/escrows/onchain/:intentId/release-data', async (req, res) => {
    try {
        if (!RPC_URL) {
            res.status(500).json({ error: 'GIGPAY_RPC_URL not configured.' });
            return;
        }

        const intentId = BigInt(req.params.intentId);
        const client = createPublicClient({
            chain: baseSepolia,
            transport: http(RPC_URL),
        });

        const intent = await client.readContract({
            address: ESCROW_ADDRESS,
            abi: GigPayEscrowCoreV2Abi,
            functionName: 'intents',
            args: [intentId],
        });

        const swapRequired = Boolean(intent?.swapRequired);
        if (!swapRequired) {
            res.json({ swapRequired: false });
            return;
        }

        if (!SWAP_DATA) {
            res.status(409).json({ error: 'Swap required but GIGPAY_SWAP_DATA not configured.' });
            return;
        }

        res.json({ swapRequired: true, swapData: SWAP_DATA });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Unable to prepare release data.' });
    }
});

const startEscrowEventSync = () => {
    if (!RPC_URL) {
        console.warn('GIGPAY_RPC_URL not set; escrow event sync disabled.');
        return;
    }

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http(RPC_URL),
    });

    // warm registry cache and keep it fresh
    refreshRegistryModules(client).catch((e) => console.warn('Registry module refresh failed:', e?.message || e));
    setInterval(() => {
        refreshRegistryModules(client).catch((e) => console.warn('Registry module refresh failed:', e?.message || e));
    }, 60_000);

    const escrowEvents = [
        parseAbiItem('event IntentCreated(uint256 indexed intentId, address indexed treasury, address indexed asset, uint256 amount)'),
        parseAbiItem('event Funded(uint256 indexed intentId, address indexed treasury, uint256 amount)'),
        parseAbiItem('event Submitted(uint256 indexed intentId, bytes32 evidenceHash)'),
        parseAbiItem('event Released(uint256 indexed intentId, uint256 principalPaid, uint256 yieldPaid, uint256 protectionExtra)'),
        parseAbiItem('event Refunded(uint256 indexed intentId, uint256 principalReturned, uint256 yieldReturned, uint256 protectionExtraReturned)'),
    ];

    const syncOnce = async () => {
        const latestBlock = await client.getBlockNumber();
        const cursor = await prisma.escrowEventCursor.findUnique({
            where: { id: 'GigPayEscrowCoreV2' },
        });

        const fallbackStart = latestBlock > 50_000n ? latestBlock - 50_000n : 0n;
        const fromBlock = cursor ? cursor.lastProcessedBlock + 1n : fallbackStart;

        if (fromBlock > latestBlock) return;

        const logs = await chunkedGetLogs({
            client,
            address: ESCROW_ADDRESS,
            events: escrowEvents,
            fromBlock,
            toBlock: latestBlock,
        });
        const tsMap = await getBlockTimestamps(client, logs);

        for (const log of logs) {
            const intentId = log.args?.intentId;
            if (typeof intentId !== 'bigint') continue;

            const updateData = {};
            if (log.eventName === 'IntentCreated') {
                Object.assign(updateData, {
                    status: 'CREATED',
                    createdTxHash: log.transactionHash || null,
                });
                await upsertEscrowIntentState(intentId, {
                    status: 'CREATED',
                    treasury: log.args?.treasury?.toString?.(),
                    asset: log.args?.asset?.toString?.(),
                    amount: toDecimal18(log.args?.amount) || null,
                });
            } else if (log.eventName === 'Funded') {
                Object.assign(updateData, {
                    status: 'FUNDED',
                    fundedAt: new Date(),
                    fundedTxHash: log.transactionHash || null,
                });
                await upsertEscrowIntentState(intentId, {
                    status: 'FUNDED',
                });
            } else if (log.eventName === 'Submitted') {
                Object.assign(updateData, {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                    submittedTxHash: log.transactionHash || null,
                    evidenceHash: log.args?.evidenceHash || null,
                });
                await upsertEscrowIntentState(intentId, { status: 'SUBMITTED' });
            } else if (log.eventName === 'Released') {
                Object.assign(updateData, {
                    status: 'RELEASED',
                    releasedAt: new Date(),
                    releasedTxHash: log.transactionHash || null,
                });
                await upsertEscrowIntentState(intentId, { status: 'RELEASED' });
            } else if (log.eventName === 'Refunded') {
                Object.assign(updateData, {
                    status: 'REFUNDED',
                    refundedAt: new Date(),
                    refundedTxHash: log.transactionHash || null,
                });
                await upsertEscrowIntentState(intentId, { status: 'REFUNDED' });
            }

            if (Object.keys(updateData).length) {
                await prisma.escrowIntent.updateMany({
                    where: { onchainIntentId: intentId },
                    data: updateData,
                });
            }

            const ts = tsMap.get(log.blockNumber.toString());
            await upsertChainEvent({
                source: 'ESCROW',
                contractAddress: ESCROW_ADDRESS,
                eventName: log.eventName,
                txHash: log.transactionHash,
                blockNumber: log.blockNumber,
                logIndex: log.logIndex,
                onchainIntentId: intentId,
                asset: log.args?.asset?.toString?.(),
                amount: toDecimal18(log.args?.amount) || null,
                data: log.args || null,
                timestamp: ts ? new Date(Number(ts) * 1000) : null,
            });
        }

        await prisma.escrowEventCursor.upsert({
            where: { id: 'GigPayEscrowCoreV2' },
            create: { id: 'GigPayEscrowCoreV2', lastProcessedBlock: latestBlock },
            update: { lastProcessedBlock: latestBlock },
        });
    };

    syncOnce().catch((error) => {
        console.error('Failed to sync escrow events:', error);
    });

    setInterval(() => {
        syncOnce().catch((error) => {
            console.error('Failed to sync escrow events:', error);
        });
    }, EVENT_POLL_INTERVAL_MS);
};

startEscrowEventSync();

// Snapshot writer (hybrid): persists totals for charts (idle/escrow/yield/total).
const startTreasurySnapshotLoop = () => {
    if (!RPC_URL) return;
    const client = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });
    const intervalMs = Number(process.env.GIGPAY_SNAPSHOT_MS || 300000); // default 5 minutes

    const tick = async () => {
        try {
            const blockNumber = await client.getBlockNumber();
            const block = await client.getBlock({ blockNumber });
            const { totals, perAsset } = await computeTreasuryBreakdown(client);

            // per-asset snapshots
            for (const row of perAsset) {
                // eslint-disable-next-line no-await-in-loop
                await prisma.treasurySnapshot.create({
                    data: {
                        id: crypto.randomUUID(),
                        chainId: CHAIN_ID,
                        treasury: TREASURY_ADDRESS,
                        assetSymbol: row.symbol,
                        idle: row.idle,
                        escrowLocked: row.escrowLocked,
                        yieldDeployed: row.yieldDeployed,
                        total: row.total,
                        blockNumber,
                        timestamp: new Date(Number(block.timestamp) * 1000),
                    },
                });
            }

            // combined snapshot (assetSymbol null)
            await prisma.treasurySnapshot.create({
                data: {
                    id: crypto.randomUUID(),
                    chainId: CHAIN_ID,
                    treasury: TREASURY_ADDRESS,
                    assetSymbol: null,
                    idle: totals.idle,
                    escrowLocked: totals.escrowLocked,
                    yieldDeployed: totals.yieldDeployed,
                    total: totals.total,
                    blockNumber,
                    timestamp: new Date(Number(block.timestamp) * 1000),
                },
            });
        } catch (e) {
            console.warn('Treasury snapshot failed:', e?.message || e);
        }
    };

    tick();
    setInterval(tick, intervalMs);
};

startTreasurySnapshotLoop();

app.listen(PORT, () => {
    console.log(`GigPay API listening on ${PORT}`);
});
