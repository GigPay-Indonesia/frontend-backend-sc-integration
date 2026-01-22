export enum UserRole {
  FREELANCER = 'FREELANCER',
  COMPANY = 'COMPANY',
}

export enum ContractState {
  CREATED = 'CREATED',        // Intent created, funds in Treasury
  FUNDED = 'FUNDED',          // Funds moved to Escrow (Zone 2 - Liquid)
  SUBMITTED = 'SUBMITTED',    // Work submitted by Freelancer
  DISPUTED = 'DISPUTED',      // In dispute (Zone 3 - Yield Active)
  RELEASED = 'RELEASED',      // Paid to Freelancer (Zone 4)
}

// Based on the "Zones" in the PDF
export enum YieldZone {
  ZONE_1 = 'ZONE_1', // Treasury Yield (Idle)
  ZONE_2 = 'ZONE_2', // Escrow Liquid (Short Wait)
  ZONE_3 = 'ZONE_3', // Escrow Yield (Long Wait/Dispute)
  ZONE_4 = 'ZONE_4', // Released
}

export interface Contract {
  id: string;
  title: string;
  freelancerName: string;
  amount: number; // in IDRX or USDC
  state: ContractState;
  createdAt: string;
  submittedAt?: string;
  isYielding: boolean; // Derived from Zone logic
}

export interface TreasuryStats {
  totalLiquidity: number;
  bufferAmount: number; // Liquid Buffer
  investedAmount: number; // Strategy Yield
  currency: 'IDRX' | 'USDC';
}
