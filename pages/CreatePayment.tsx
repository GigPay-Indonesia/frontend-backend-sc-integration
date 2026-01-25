import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { decodeEventLog, parseUnits } from 'viem';
import type { Abi } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { toast } from 'sonner';
import ReactBitsStepper from '../components/ReactBitsStepper';
import { Step1Recipient } from '../components/create-payment/Step1Recipient';
import { Step2Amount } from '../components/create-payment/Step2Amount';
import { Step3Timing } from '../components/create-payment/Step3Timing';
import { Step4Split } from '../components/create-payment/Step4Split';
import { Step5Review } from '../components/create-payment/Step5Review';
import { SidebarTreasury } from '../components/create-payment/SidebarTreasury';
import { ENTITY_DEFAULTS, EntityType } from '../components/create-payment/entityConfig';
import { getTokenAddress } from '../lib/abis';
import { useGigPayRegistry } from '../lib/hooks/useGigPayRegistry';
import { useEscrowCoreContract, useTreasuryVaultContract, useTokenRegistryContract } from '../lib/hooks/useGigPayContracts';
import { createEscrowIntent, createRecipient, linkOnchainIntent } from '../lib/api';

export type ReleaseCondition = 'ON_APPROVAL' | 'ON_DELIVERY' | 'ON_MILESTONE';
export type PayoutMethod = 'ONCHAIN' | 'BANK' | 'HYBRID';
export type SettlementPreference = 'INSTANT' | 'WEEKLY' | 'MONTHLY';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';
export type ApprovalPolicy = 'AUTO' | 'SINGLE' | 'MULTI' | 'THRESHOLD';

export type VendorProfile = {
    type: 'VENDOR';
    vendorCategory: 'SOFTWARE' | 'HARDWARE' | 'SERVICES' | 'LOGISTICS' | 'MARKETING' | 'OTHER';
    paymentTerms: 'NET0' | 'NET7' | 'NET14' | 'NET30' | 'MILESTONE_BASED';
    invoiceRequired: boolean;
    invoiceEmail: string;
    supportedDocuments: Array<'Invoice' | 'PO' | 'DeliveryProof'>;
    billToEntityName: string;
    taxTreatment: string;
};

export type PartnerProfile = {
    type: 'PARTNER';
    partnerModel: 'REVENUE_SHARE' | 'PROFIT_SHARE' | 'COST_SHARE' | 'AFFILIATE' | 'REFERRAL';
    settlementCycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'PER_CAMPAIGN';
    defaultSplitBps: number;
    programId: string;
    trackingMethod: 'OFFCHAIN_REPORT' | 'ONCHAIN_METRICS' | 'MANUAL_APPROVAL';
    kpiTags: string[];
};

export type AgencyProfile = {
    type: 'AGENCY';
    payoutMode: 'MASTER_PAYEE' | 'SPLIT_TO_TEAM' | 'HYBRID';
    hasSubRecipients: boolean;
    acceptanceWindowDefault: number;
    requiresMilestones: boolean;
};

export type ContractorProfile = {
    type: 'CONTRACTOR';
    engagementType: 'FIXED' | 'HOURLY' | 'RETAINER';
    scopeSummary: string;
    preferredPayoutAsset: string;
    kycLevel: 'NONE' | 'BASIC' | 'VERIFIED';
    disputePreference: 'AUTO_ARBITRATION' | 'MANUAL_REVIEW';
};

export type RecipientProfile = VendorProfile | PartnerProfile | AgencyProfile | ContractorProfile;

export interface PaymentData {
    recipient: {
        identity: {
            displayName: string;
            legalName: string;
            entityType: EntityType;
            email: string;
            country: string;
            timezone: string;
            referenceId: string;
        };
        payout: {
            preferredAsset: string;
            payoutMethod: PayoutMethod;
            payoutAddress: string;
            bankAccountRef: string;
            settlementPreference: SettlementPreference;
        };
        accounting: {
            counterpartyCode: string;
            costCenter: string;
            tags: string[];
        };
        policy: {
            riskTier: RiskTier;
            approvalPolicy: ApprovalPolicy;
            maxSinglePayment: string;
            maxMonthlyLimit: string;
            requiresEscrowDefault: boolean;
            requiresMilestonesDefault: boolean;
        };
        profile: RecipientProfile;
    };
    amount: {
        value: string;
        fundingAsset: string;
        payoutAsset: string;
    };
    timing: {
        releaseCondition: ReleaseCondition;
        deadline: string;
        enableYield: boolean;
        enableProtection: boolean;
    };
    split: {
        enabled: boolean;
        recipients: Array<{ id: number; name: string; address: string; percentage: number }>;
    };
    milestones: {
        items: Array<{ id: number; title: string; dueDays: string; percentage: number }>;
    };
    notes: string;
}

const INITIAL_DATA: PaymentData = {
    recipient: {
        identity: {
            displayName: 'Nusa Creative Studio',
            legalName: '',
            entityType: 'VENDOR',
            email: 'finance@nusa.studio',
            country: 'Indonesia',
            timezone: 'Asia/Jakarta',
            referenceId: '',
        },
        payout: {
            preferredAsset: 'IDRX',
            payoutMethod: 'ONCHAIN',
            payoutAddress: '0x71c7656EC7ab88b098deFB751B7401B5f6d8976F',
            bankAccountRef: '',
            settlementPreference: 'INSTANT',
        },
        accounting: {
            counterpartyCode: '',
            costCenter: '',
            tags: [],
        },
        policy: {
            riskTier: 'MEDIUM',
            approvalPolicy: 'SINGLE',
            maxSinglePayment: '',
            maxMonthlyLimit: '',
            requiresEscrowDefault: ENTITY_DEFAULTS.VENDOR.requiresEscrowDefault,
            requiresMilestonesDefault: ENTITY_DEFAULTS.VENDOR.requiresMilestonesDefault,
        },
        profile: {
            type: 'VENDOR',
            vendorCategory: 'SERVICES',
            paymentTerms: 'NET14',
            invoiceRequired: false,
            invoiceEmail: '',
            supportedDocuments: ['Invoice', 'PO'],
            billToEntityName: '',
            taxTreatment: '',
        },
    },
    amount: {
        value: '45.000.000',
        fundingAsset: 'IDRX',
        payoutAsset: 'IDRX',
    },
    timing: {
        releaseCondition: 'ON_APPROVAL',
        deadline: '7 Days',
        enableYield: true,
        enableProtection: false,
    },
    split: {
        enabled: false,
        recipients: [{ id: 1, name: 'Primary Recipient', address: '0x71c7656EC7ab88b098deFB751B7401B5f6d8976F', percentage: 100 }],
    },
    milestones: {
        items: [],
    },
    notes: '',
};

export const CreatePayment: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { address } = useAccount();
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentData, setPaymentData] = useState<PaymentData>(INITIAL_DATA);
    const [recipientId, setRecipientId] = useState<string | null>(null);
    const [escrowIntentId, setEscrowIntentId] = useState<string | null>(null);
    const { tokenRegistryAddress } = useGigPayRegistry();
    const escrowCore = useEscrowCoreContract();
    const treasuryVault = useTreasuryVaultContract();
    const tokenRegistry = useTokenRegistryContract();
    const { writeContract, data: createTxHash, isPending: isCreating } = useWriteContract();
    const writeContractUnsafe = writeContract as unknown as (args: any) => void;
    const { data: createReceipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: createTxHash,
    });

    const updateData = (field: keyof PaymentData, value: any) => {
        setPaymentData(prev => ({ ...prev, [field]: value }));
    };

    const applyEntityDefaults = (entityType: EntityType) => {
        setPaymentData(prev => {
            const defaults = ENTITY_DEFAULTS[entityType];
            const nextProfile: RecipientProfile = entityType === 'VENDOR'
                ? {
                    type: 'VENDOR',
                    vendorCategory: 'SERVICES',
                    paymentTerms: 'NET14',
                    invoiceRequired: false,
                    invoiceEmail: '',
                    supportedDocuments: ['Invoice', 'PO'],
                    billToEntityName: '',
                    taxTreatment: '',
                }
                : entityType === 'PARTNER'
                    ? {
                        type: 'PARTNER',
                        partnerModel: 'REVENUE_SHARE',
                        settlementCycle: 'MONTHLY',
                        defaultSplitBps: 0,
                        programId: '',
                        trackingMethod: 'MANUAL_APPROVAL',
                        kpiTags: [],
                    }
                    : entityType === 'AGENCY'
                        ? {
                            type: 'AGENCY',
                            payoutMode: 'MASTER_PAYEE',
                            hasSubRecipients: false,
                            acceptanceWindowDefault: 7,
                            requiresMilestones: true,
                        }
                        : {
                            type: 'CONTRACTOR',
                            engagementType: 'FIXED',
                            scopeSummary: '',
                            preferredPayoutAsset: prev.recipient.payout.preferredAsset || 'IDRX',
                            kycLevel: 'BASIC',
                            disputePreference: 'AUTO_ARBITRATION',
                        };

            return {
                ...prev,
                recipient: {
                    ...prev.recipient,
                    identity: {
                        ...prev.recipient.identity,
                        entityType,
                    },
                    policy: {
                        ...prev.recipient.policy,
                        requiresEscrowDefault: defaults.requiresEscrowDefault,
                        requiresMilestonesDefault: defaults.requiresMilestonesDefault,
                    },
                    profile: nextProfile,
                },
                timing: {
                    ...prev.timing,
                    releaseCondition: defaults.releaseCondition,
                },
            };
        });
    };

    useEffect(() => {
        const template = (location.state as { template?: any } | undefined)?.template;
        if (!template) return;

        setPaymentData(prev => ({
            ...prev,
            amount: {
                ...prev.amount,
                value: typeof template.budget === 'string' ? template.budget.replace(/,/g, '.') : prev.amount.value,
            },
            timing: {
                ...prev.timing,
                enableProtection: Array.isArray(template.tags) && template.tags.includes('Protection'),
                enableYield: Array.isArray(template.tags) && template.tags.includes('Yield'),
            },
            notes: template.description || prev.notes,
        }));
    }, [location.state]);

    useEffect(() => {
        setPaymentData((prev) => {
            if (!prev.split.recipients.length) return prev;
            if (prev.split.recipients[0].address) return prev;
            const updated = [...prev.split.recipients];
            updated[0] = { ...updated[0], address: prev.recipient.payout.payoutAddress };
            return { ...prev, split: { recipients: updated } };
        });
    }, [paymentData.recipient.payout.payoutAddress]);

    useEffect(() => {
        if (paymentData.recipient.profile.type !== 'CONTRACTOR') return;
        if (paymentData.recipient.profile.preferredPayoutAsset === paymentData.recipient.payout.preferredAsset) return;
        setPaymentData(prev => {
            if (prev.recipient.profile.type !== 'CONTRACTOR') return prev;
            return {
                ...prev,
                recipient: {
                    ...prev.recipient,
                    profile: {
                        ...prev.recipient.profile,
                        preferredPayoutAsset: prev.recipient.payout.preferredAsset,
                    },
                },
            };
        });
    }, [
        paymentData.recipient.payout.preferredAsset,
        paymentData.recipient.profile.type,
        paymentData.recipient.profile.type === 'CONTRACTOR' ? paymentData.recipient.profile.preferredPayoutAsset : '',
    ]);

    const fundingAssetAddress = useMemo(() => getTokenAddress(paymentData.amount.fundingAsset), [paymentData.amount.fundingAsset]);
    const payoutAssetAddress = useMemo(() => getTokenAddress(paymentData.amount.payoutAsset), [paymentData.amount.payoutAsset]);

    const tokenConfig = useReadContract({
        address: (tokenRegistryAddress || tokenRegistry.address) as `0x${string}` | undefined,
        abi: tokenRegistry.abi as Abi,
        functionName: 'tokenConfig',
        args: fundingAssetAddress ? [fundingAssetAddress] : undefined,
        query: { enabled: Boolean((tokenRegistryAddress || tokenRegistry.address) && tokenRegistry.abi && fundingAssetAddress) },
    });

    const isEscrowEligible = useReadContract({
        address: (tokenRegistryAddress || tokenRegistry.address) as `0x${string}` | undefined,
        abi: tokenRegistry.abi as Abi,
        functionName: 'isEscrowEligible',
        args: fundingAssetAddress ? [fundingAssetAddress] : undefined,
        query: { enabled: Boolean((tokenRegistryAddress || tokenRegistry.address) && tokenRegistry.abi && fundingAssetAddress) },
    });

    const parsedAmount = useMemo(() => {
        const raw = paymentData.amount.value.replace(/\./g, '');
        const decimals = (tokenConfig.data as { decimals?: number } | undefined)?.decimals ?? 18;
        try {
            return parseUnits(raw || '0', Number(decimals));
        } catch {
            return 0n;
        }
    }, [paymentData.amount.value, tokenConfig.data]);

    const splitBps = useMemo(() => {
        return paymentData.split.recipients.map((recipient) => ({
            recipient: recipient.address || paymentData.recipient.payout.payoutAddress,
            bps: Math.round(recipient.percentage * 100),
        }));
    }, [paymentData.split.recipients, paymentData.recipient.payout.payoutAddress]);

    const totalBps = useMemo(() => splitBps.reduce((sum, split) => sum + split.bps, 0), [splitBps]);
    const isSplitValid = totalBps === 10000;
    const isTokenEligible = isEscrowEligible.data !== false;

    const isSplitRequired = useMemo(() => {
        const profile = paymentData.recipient.profile;
        if (profile.type === 'AGENCY') {
            return profile.payoutMode !== 'MASTER_PAYEE';
        }
        if (profile.type === 'PARTNER') {
            return (profile.defaultSplitBps || 0) > 0;
        }
        return paymentData.split.enabled;
    }, [paymentData.recipient.profile, paymentData.split.enabled]);

    const isMilestoneRequired = useMemo(() => {
        const profile = paymentData.recipient.profile;
        if (profile.type === 'AGENCY') return profile.requiresMilestones;
        if (profile.type === 'VENDOR') return profile.paymentTerms === 'MILESTONE_BASED';
        return paymentData.recipient.policy.requiresMilestonesDefault;
    }, [paymentData.recipient.profile, paymentData.recipient.policy.requiresMilestonesDefault]);

    useEffect(() => {
        if (!isMilestoneRequired) return;
        if (paymentData.milestones.items.length > 0) return;
        setPaymentData(prev => ({
            ...prev,
            milestones: {
                items: [{ id: 1, title: '', dueDays: '', percentage: 0 }],
            },
        }));
    }, [isMilestoneRequired, paymentData.milestones.items.length]);

    const isDataValid = useMemo(() => {
        const identity = paymentData.recipient.identity;
        const payout = paymentData.recipient.payout;
        const policy = paymentData.recipient.policy;
        const profile = paymentData.recipient.profile;

        if (!identity.displayName || !identity.email || !identity.country || !identity.timezone) return false;
        if (!payout.preferredAsset || !payout.payoutMethod || !payout.settlementPreference) return false;
        if ((payout.payoutMethod === 'ONCHAIN' || payout.payoutMethod === 'HYBRID') && !payout.payoutAddress) return false;
        if ((payout.payoutMethod === 'BANK' || payout.payoutMethod === 'HYBRID') && !payout.bankAccountRef) return false;
        if (!policy.riskTier || !policy.approvalPolicy) return false;
        if (!paymentData.amount.value || !paymentData.amount.fundingAsset || !paymentData.amount.payoutAsset) return false;
        if (!paymentData.timing.releaseCondition || !paymentData.timing.deadline) return false;

        if (profile.type === 'VENDOR') {
            if (!profile.vendorCategory || !profile.paymentTerms) return false;
            if (profile.invoiceRequired && !profile.invoiceEmail) return false;
        }
        if (profile.type === 'PARTNER') {
            if (!profile.partnerModel || !profile.settlementCycle || !profile.trackingMethod) return false;
        }
        if (profile.type === 'AGENCY') {
            if (!profile.payoutMode) return false;
        }
        if (profile.type === 'CONTRACTOR') {
            if (!profile.engagementType || !profile.scopeSummary || !profile.preferredPayoutAsset) return false;
        }

        if (isSplitRequired && !isSplitValid) return false;

        if (isMilestoneRequired) {
            if (!paymentData.milestones.items.length) return false;
            const milestoneTotal = paymentData.milestones.items.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);
            if (milestoneTotal !== 100) return false;
        }

        return true;
    }, [paymentData, isMilestoneRequired, isSplitRequired, isSplitValid]);

    const parseDays = (value: string) => {
        const numeric = Number(value.replace(/[^0-9]/g, ''));
        return Number.isNaN(numeric) || numeric <= 0 ? 0 : numeric;
    };

    const handleCreateIntent = async () => {
        if (!escrowCore.address || !escrowCore.abi || !treasuryVault.address) return;
        if (!fundingAssetAddress || parsedAmount === 0n) return;
        if ((isSplitRequired && !isSplitValid) || !isTokenEligible || !isDataValid) return;

        const days = parseDays(paymentData.timing.deadline);
        const now = Math.floor(Date.now() / 1000);
        const deadline = BigInt(now + days * 86400);
        const acceptanceWindow = BigInt(days * 86400);
        const escrowYieldEnabled = Boolean(paymentData.timing.enableYield);
        const escrowStrategyId = 0;
        const usePayout = payoutAssetAddress && payoutAssetAddress !== fundingAssetAddress;

        try {
            const createdRecipientId = recipientId || await createRecipient({
                identity: paymentData.recipient.identity,
                payout: paymentData.recipient.payout,
                accounting: paymentData.recipient.accounting,
                policy: paymentData.recipient.policy,
                profile: paymentData.recipient.profile,
                splitTemplates: paymentData.split.recipients.map((recipient) => ({
                    templateName: 'Default',
                    recipientWalletOrRef: recipient.address || paymentData.recipient.payout.payoutAddress,
                    bps: Math.round(recipient.percentage * 100),
                })),
            });
            if (!recipientId) setRecipientId(createdRecipientId);

            const createdIntent = await createEscrowIntent({
                recipientId: createdRecipientId,
                entityType: paymentData.recipient.identity.entityType,
                amount: paymentData.amount.value.replace(/\./g, ''),
                fundingAsset: paymentData.amount.fundingAsset,
                payoutAsset: paymentData.amount.payoutAsset,
                releaseCondition: paymentData.timing.releaseCondition,
                deadlineDays: days,
                acceptanceWindowDays: days,
                enableYield: paymentData.timing.enableYield,
                enableProtection: paymentData.timing.enableProtection,
                splitConfig: splitBps,
                milestoneTemplate: paymentData.milestones.items,
                notes: paymentData.notes,
            });
            setEscrowIntentId(createdIntent.id);
        } catch (error) {
            toast.error('Failed to save recipient or escrow metadata.');
            return;
        }

        if (usePayout) {
            writeContractUnsafe({
                address: escrowCore.address,
                abi: escrowCore.abi as Abi,
                functionName: 'createIntentFromTreasuryWithPayout',
                args: [
                    treasuryVault.address,
                    fundingAssetAddress,
                    payoutAssetAddress,
                    parsedAmount,
                    deadline,
                    acceptanceWindow,
                    splitBps,
                    escrowYieldEnabled,
                    escrowStrategyId,
                    0,
                ],
            });
            return;
        }

        writeContractUnsafe({
            address: escrowCore.address,
            abi: escrowCore.abi as Abi,
            functionName: 'createIntentFromTreasury',
            args: [
                treasuryVault.address,
                fundingAssetAddress,
                parsedAmount,
                deadline,
                acceptanceWindow,
                splitBps,
                escrowYieldEnabled,
                escrowStrategyId,
            ],
        });
    };

    useEffect(() => {
        if (!isConfirmed) return;

        const linkIntent = async () => {
            if (!escrowIntentId || !createReceipt?.logs?.length || !createTxHash) {
                navigate('/payments');
                return;
            }

            let onchainIntentId: bigint | null = null;
            for (const log of createReceipt.logs) {
                try {
                    const decoded = decodeEventLog({
                        abi: escrowCore.abi as Abi,
                        data: log.data,
                        topics: log.topics,
                    });
                    if (decoded.eventName === 'IntentCreated') {
                        onchainIntentId = decoded.args.intentId as bigint;
                        break;
                    }
                } catch {
                    // Ignore logs that do not match the escrow ABI.
                }
            }

            if (onchainIntentId !== null) {
                try {
                    await linkOnchainIntent(escrowIntentId, {
                        onchainIntentId: onchainIntentId.toString(),
                        createTxHash,
                    });
                } catch {
                    // Backend link is best-effort; continue to UI.
                }
            }

            navigate('/payments');
        };

        linkIntent();
    }, [isConfirmed, escrowIntentId, createReceipt, createTxHash, escrowCore.abi, navigate]);

    const handleNext = async () => {
        if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
        } else {
            await handleCreateIntent();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        else navigate('/overview');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {currentStep === 1 ? 'Recipient' :
                                currentStep === 2 ? 'Amount' :
                                    currentStep === 3 ? 'Timing & Conditions' :
                                        currentStep === 4 ? 'Split' : 'Review'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {currentStep === 1 ? 'Who are you paying and where should funds go?' :
                                currentStep === 2 ? 'Define the funding and payout assets.' :
                                    currentStep === 3 ? 'Set release conditions, deadlines, and protections.' :
                                        currentStep === 4 ? 'Distribute payouts across recipients.' :
                                            'Confirm details before creating the payment.'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-xs font-mono text-primary">IDRX Treasury</span>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-slate-900 transition-colors">
                        <Settings size={20} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    {/* Stepper Container */}
                    <div className="bg-[#0a0a0a] border border-slate-800 rounded-2xl min-h-[640px] overflow-hidden mb-6 flex flex-col">
                        <div className="p-6 border-b border-slate-800/50">
                            <ReactBitsStepper
                                steps={[
                                    { id: 1, label: 'Recipient' },
                                    { id: 2, label: 'Amount' },
                                    { id: 3, label: 'Timing' },
                                    { id: 4, label: 'Split' },
                                    { id: 5, label: 'Review' }
                                ]}
                                currentStep={currentStep - 1}
                                onStepClick={(index) => setCurrentStep(index + 1)}
                            />
                        </div>

                        <div className="p-6 flex-1">
                            {currentStep === 1 && <Step1Recipient data={paymentData} updateFields={updateData} onEntityTypeChange={applyEntityDefaults} />}
                            {currentStep === 2 && <Step2Amount data={paymentData} updateFields={updateData} />}
                            {currentStep === 3 && <Step3Timing data={paymentData} updateFields={updateData} />}
                            {currentStep === 4 && <Step4Split data={paymentData} updateFields={updateData} />}
                            {currentStep === 5 && <Step5Review data={paymentData} />}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 gap-4 sm:gap-0">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium w-full sm:w-auto"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={currentStep === 5 && (!address || (isSplitRequired && !isSplitValid) || !isTokenEligible || !isDataValid || isCreating || isConfirming)}
                            className={`px-8 py-3 rounded-xl font-bold transition-all w-full sm:w-auto ${currentStep === 5
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                                : 'bg-primary hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(0,82,255,0.3)] hover:shadow-[0_0_30px_rgba(0,82,255,0.5)]'
                                }`}
                        >
                            {currentStep === 5
                                ? isCreating || isConfirming
                                    ? 'Processing...'
                                    : 'Confirm'
                                : 'Continue'}
                        </button>
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    {[2, 3].includes(currentStep) ? (
                        <SidebarTreasury amount={paymentData.amount.value} />
                    ) : (
                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-slate-300 tracking-wider uppercase mb-4">
                                {currentStep === 1 ? 'Recipient Guidance' :
                                    currentStep === 4 ? 'Split Guidance' :
                                        'Review Tips'}
                            </h4>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {currentStep === 1 ? 'Ensure the recipient entity and payout address match your contract or invoice.' :
                                        currentStep === 4 ? 'Splits should total 100% to avoid allocation errors.' :
                                            'Confirm assets, timing, and protections before creating the payment.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
