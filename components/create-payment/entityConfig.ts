import { Building2, Briefcase, User, Warehouse } from 'lucide-react';

export type EntityType = 'VENDOR' | 'PARTNER' | 'AGENCY' | 'CONTRACTOR';

export const ENTITY_OPTIONS = [
    {
        id: 'VENDOR',
        label: 'Vendor',
        description: 'Procurement and invoice-based suppliers.',
        icon: Warehouse,
    },
    {
        id: 'PARTNER',
        label: 'Partner',
        description: 'Revenue share and program settlements.',
        icon: User,
    },
    {
        id: 'AGENCY',
        label: 'Agency',
        description: 'Teams with split payouts and milestones.',
        icon: Building2,
    },
    {
        id: 'CONTRACTOR',
        label: 'Contractor',
        description: 'Individual contributors and freelancers.',
        icon: Briefcase,
    },
] as const;

export const ENTITY_DEFAULTS = {
    VENDOR: {
        releaseCondition: 'ON_APPROVAL',
        requiresEscrowDefault: false,
        requiresMilestonesDefault: false,
    },
    PARTNER: {
        releaseCondition: 'ON_APPROVAL',
        requiresEscrowDefault: false,
        requiresMilestonesDefault: false,
    },
    AGENCY: {
        releaseCondition: 'ON_MILESTONE',
        requiresEscrowDefault: true,
        requiresMilestonesDefault: true,
    },
    CONTRACTOR: {
        releaseCondition: 'ON_APPROVAL',
        requiresEscrowDefault: true,
        requiresMilestonesDefault: false,
    },
} as const;
