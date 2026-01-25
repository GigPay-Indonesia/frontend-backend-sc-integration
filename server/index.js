import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
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

const app = express();
const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
});
const PORT = process.env.PORT || 4000;
const ESCROW_ADDRESS = process.env.GIGPAY_ESCROW_ADDRESS || '0xd09177C97978f5c970ad25294681F5A51685c214';
const RPC_URL = process.env.GIGPAY_RPC_URL;
const EVENT_POLL_INTERVAL_MS = Number(process.env.GIGPAY_EVENT_POLL_MS || 15000);
const SWAP_DATA = process.env.GIGPAY_SWAP_DATA;

app.use(cors());
app.use(express.json());

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

    const events = [
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

        const fallbackStart = latestBlock > 200n ? latestBlock - 200n : 0n;
        const fromBlock = cursor ? cursor.lastProcessedBlock + 1n : fallbackStart;

        if (fromBlock > latestBlock) return;

        const logs = await client.getLogs({
            address: ESCROW_ADDRESS,
            events,
            fromBlock,
            toBlock: latestBlock,
        });

        for (const log of logs) {
            const intentId = log.args?.intentId;
            if (typeof intentId !== 'bigint') continue;

            const updateData = {};
            if (log.eventName === 'IntentCreated') {
                Object.assign(updateData, {
                    status: 'CREATED',
                    createdTxHash: log.transactionHash || null,
                });
            } else if (log.eventName === 'Funded') {
                Object.assign(updateData, {
                    status: 'FUNDED',
                    fundedAt: new Date(),
                    fundedTxHash: log.transactionHash || null,
                });
            } else if (log.eventName === 'Submitted') {
                Object.assign(updateData, {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                    submittedTxHash: log.transactionHash || null,
                    evidenceHash: log.args?.evidenceHash || null,
                });
            } else if (log.eventName === 'Released') {
                Object.assign(updateData, {
                    status: 'RELEASED',
                    releasedAt: new Date(),
                    releasedTxHash: log.transactionHash || null,
                });
            } else if (log.eventName === 'Refunded') {
                Object.assign(updateData, {
                    status: 'REFUNDED',
                    refundedAt: new Date(),
                    refundedTxHash: log.transactionHash || null,
                });
            }

            if (Object.keys(updateData).length) {
                await prisma.escrowIntent.updateMany({
                    where: { onchainIntentId: intentId },
                    data: updateData,
                });
            }
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

app.listen(PORT, () => {
    console.log(`GigPay API listening on ${PORT}`);
});
