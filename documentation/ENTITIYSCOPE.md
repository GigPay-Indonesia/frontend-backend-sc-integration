Perfect. Here is the **English, product-grade documentation** you can directly use in:

* Product spec
* README
* Docs site
* Investor / judge material
* Backend & frontend implementation reference

This explains **why** these entity types exist and **what each one needs from escrow and payments**.

---

# 📘 GigPay Recipient & Business Model Specification

> In GigPay, a **recipient is a business entity**, not just a wallet address.
> Payments are **business operations**, not transfers.

GigPay is designed for **B2B, B2B2C, and platform economies** where every counterparty has different legal, operational, and financial requirements.

---

# 1. Core Principle

Every recipient in GigPay is modeled as:

> **A business entity with identity, policy, and payment behavior.**

This allows:

* Policy enforcement
* Risk management
* Approval workflows
* Escrow rules
* Compliance and audit trails

---

# 2. Universal Fields (All Entity Types)

Every recipient has:

## Identity

* Legal / Display Name
* Entity Type (Vendor, Partner, Agency, Contractor)
* Email (finance/billing)
* Country / Jurisdiction
* Internal reference ID (optional)

## Payment Preferences

* Preferred payout asset (IDRX, USDC, etc.)
* Payout address (onchain)
* Settlement preference:

  * Instant
  * Scheduled (weekly/monthly)
* Escrow required? (yes/no)

## Accounting & Ops

* Vendor / Partner code
* Cost center / Project code
* Default split rules (if applicable)

## Risk & Policy

* Risk level (Low / Medium / High)
* Approval requirements
* Max payment per transaction
* Requires multi-signature approval?

---

# 3. Entity Types & Their Business Meaning

---

# 🏭 3.1 Vendor

> A **Vendor** is a company that sells goods or services to you.

Examples:

* SaaS providers
* Hardware suppliers
* Cloud providers
* Marketing vendors

## What Vendors Need from Escrow

* Purchase-order-like payment flows
* Invoice reference support
* Optional delivery-based release
* Refund path if SLA is not met

## Vendor-Specific Fields

### Legal & Compliance

* Legal company name
* Tax ID / registration number
* Contract reference ID

### Procurement & Finance

* Category: Software / Hardware / Services / Ops
* Payment terms:

  * Net 7 / Net 14 / Net 30
  * Milestone-based
* Invoice required? (yes/no)
* Auto-release or manual approval?

## Escrow Behavior

* Usually **escrow is optional**
* Often **release after approval or delivery confirmation**
* Refund path is important

---

# 🤝 3.2 Partner

> A **Partner** is a business entity you cooperate with under a **revenue share, profit share, or strategic agreement**.

Examples:

* Distribution partners
* Channel partners
* Affiliate networks
* Joint ventures

## What Partners Need from Escrow

* Recurring or scheduled settlements
* Split payout logic
* Transparent accounting
* Campaign or program-based payouts

## Partner-Specific Fields

### Commercial

* Partnership type:

  * Revenue share
  * Cost share
  * Profit share
* Default split ratio
* Settlement cycle:

  * Weekly / Monthly / Per campaign

### Performance

* Program ID / Campaign ID
* KPI tags

## Escrow Behavior

* Often **escrow is not strictly required**
* Escrow is useful for:

  * Campaign-based funds
  * Dispute windows
  * Performance-based release

---

# 🏢 3.3 Agency

> An **Agency** is an organization that manages **multiple contractors or teams**.

Examples:

* Creative agencies
* Development houses
* Marketing agencies
* Consulting firms

## What Agencies Need from Escrow

* Milestone-based escrow
* Split payouts to team members
* Partial releases
* Dispute handling

## Agency-Specific Fields

### Structure

* Is this a master payee? (yes/no)
* Has sub-recipients? (yes/no)
* Supports split payouts? (yes/no)

### Payment Flow

* Payout mode:

  * Pay agency only
  * Split to team
  * Hybrid
* Default split templates

### Risk

* Escrow is usually **mandatory**
* Often higher dispute surface

## Escrow Behavior

* Escrow is **default ON**
* Supports:

  * Milestones
  * Partial releases
  * Split distribution

---

# 👨‍💻 3.4 Contractor / Freelancer

> A **Contractor** is an individual contributor.

Examples:

* Developer
* Designer
* Consultant
* Writer

## What Contractors Need from Escrow

* Guaranteed payment
* Clear delivery → release flow
* Simple dispute mechanism
* Optional milestone payments

## Contractor-Specific Fields

### Identity

* Full legal name
* Nationality
* Individual / Sole proprietor

### Engagement Model

* Contract type:

  * Fixed
  * Hourly
  * Retainer
* Billing model:

  * Per task
  * Per milestone
  * Monthly

### Tax (Future-ready)

* Tax classification
* Withholding required? (yes/no)

## Escrow Behavior

* Escrow is **strongly recommended**
* Simple:

  * Fund → Deliver → Release

---

# 4. Why This Matters for Product & Architecture

Because:

> **Payments are workflows. Not transfers.**

Different entities require:

* Different approval logic
* Different escrow rules
* Different release conditions
* Different risk policies

GigPay encodes this **into the payment intent itself**.

---

# 5. UX & Product Flow

When user selects:

> Entity Type = Vendor / Partner / Agency / Contractor

The system:

* Shows different fields
* Applies different default policies
* Sets different escrow behavior

---

# 6. Technical Model (Simplified)

```ts
Recipient {
  id
  name
  type: Vendor | Partner | Agency | Contractor

  // Common
  email
  country
  payoutAddress
  preferredAsset

  // Accounting
  tags[]
  costCenter

  // Policy
  riskLevel
  approvalPolicy

  // Type-specific profiles
  vendorProfile?
  partnerProfile?
  agencyProfile?
  contractorProfile?
}
```

---

# 7. Strategic Positioning

This model makes GigPay:

* Not a wallet
* Not a payment app
* Not just an escrow

But:

> **A programmable business payment infrastructure.**

---

# 8. Taglines You Can Use

* “Payments are workflows, not transfers.”
* “Run your treasury like software.”
* “Business-grade finance, onchain.”
* “Programmable payouts for modern companies.”

---

If you want, next I can generate:

* UI form schema per entity
* Backend DB schema
* Smart contract minimal mapping
* Approval workflow matrix
* Risk policy templates

Below is a **deep, implementation-ready spec** for what the Recipient app must collect **before** creating an escrow intent — per category (Vendor / Partner / Agency / Contractor). It includes:

* **Why the data is needed (real-world business)**
* **Frontend field requirements (step-by-step wizard)**
* **Backend schema + validation rules**
* **How this maps into escrow creation (what becomes onchain vs offchain)**

Use this as your `documentation/RECIPIENTS.md` and as the source for frontend forms + backend API.

---

# Recipient App Specification (Pre-Escrow)

**Version:** v1 (Hackathon + production-ready direction)
**Goal:** Build a recipient onboarding layer that makes GigPay feel like “business payments”, not a wallet transfer.

## Core Rule

Before escrow exists, the system must know:

1. **Who** is being paid (business identity)
2. **Why** they’re being paid (business context)
3. **How** funds should settle (asset + rails)
4. **What constraints** apply (risk/compliance + approvals)
5. **What payout structure** applies (single payee vs split vs milestones)

Escrow should be created only after Recipient Profile passes validation.

---

# 1) Universal Recipient Data (All Types)

These are required for every recipient type.

## 1.1 Identity Block (Business-grade)

**Required**

* `displayName` (string) — shown in UI
* `entityType` (enum: Vendor | Partner | Agency | Contractor)
* `billingEmail` (string)
* `country` (ISO-2)
* `timezone` (IANA string) — scheduling settlement windows + invoice cycle

**Recommended**

* `legalName` (string)
* `website` (url)
* `address` (structured)
* `taxId` (string) *(optional in hackathon; critical in prod)*

**Why this matters**

* Audit trails, invoice mapping, accounting exports, dispute resolution.

## 1.2 Payment Destination Block (Where funds go)

Recipient must choose a settlement method.

**Required**

* `preferredAsset` (enum: IDRX | USDC | USDT | DAI | …)
* `payoutMethod` (enum: OnchainWallet | BankTransfer | Hybrid)
* If `OnchainWallet`:

  * `payoutAddress` (0x…)
* If `BankTransfer` (future):

  * `bankAccountRef` (tokenized reference ID, not raw bank details)
* If `Hybrid`:

  * `payoutAddress` + `bankAccountRef`

**Why this matters**

* Your product is “B2B-grade payout rails”: wallet or bank, recipient chooses.

## 1.3 Operational + Accounting Tags

**Required**

* `defaultCurrency` (IDR/USD/etc) — for invoice display
* `paymentReferenceLabel` (string) — shown on receipts/invoices

**Optional but recommended**

* `tags[]` (project / department / campaign)
* `costCenter` (string)
* `vendorCode` (string)

**Why**

* Enterprises care more about “what payment was for” than transaction hash.

## 1.4 Risk & Approval Defaults

**Required**

* `riskTier` (Low/Med/High)
* `approvalPolicy` (enum):

  * `auto` (no approval)
  * `single_approver`
  * `multi_approver`
  * `threshold_based`

**Optional**

* `maxSinglePayment`
* `maxMonthlyLimit`
* `requiresMilestones` boolean
* `requiresEscrow` boolean *(default differs per type)*

---

# 2) Entity-Type Requirements (Deep Analysis)

## A) Vendor (Procurement / Invoice-based supplier)

### Business Reality

Vendors usually operate via:

* PO → Delivery → Invoice → Payment
  They want predictable settlement and invoice reconciliation.

### Vendor Required Fields (Pre-Escrow)

**A.1 Procurement Profile**

* `vendorCategory` (enum: Software | Hardware | Services | Logistics | Marketing | Other)
* `paymentTerms` (enum: Net0 | Net7 | Net14 | Net30 | MilestoneBased)
* `invoiceRequired` (boolean)
* `supportedDocuments` (list): Invoice, PO, DeliveryProof

**A.2 Billing Controls**

* `billToEntityName`
* `invoiceEmail` *(can differ from billingEmail)*
* `taxTreatment` (optional)

### Vendor Escrow Defaults

* `requiresEscrow`: Optional (false by default)
* Escrow used when:

  * delivery risk
  * milestone work
  * large payments

### UI Behavior

* Show **Invoice/PO** inputs in the escrow creation flow
* Add “Attach invoice later” option

### Backend Validation

* If `invoiceRequired == true` → enforce `invoiceEmail`
* If `paymentTerms == MilestoneBased` → enforce milestones template

---

## B) Partner (Revenue share / program settlement)

### Business Reality

Partners are paid based on:

* revenue share
* profit share
* affiliate conversions
* channel performance
  They need settlement schedules + split accounting.

### Partner Required Fields

**B.1 Partnership Model**

* `partnerModel` (enum: RevenueShare | ProfitShare | CostShare | Affiliate | Referral)
* `settlementCycle` (Weekly | Biweekly | Monthly | PerCampaign)
* `defaultSplitBps` *(if multi-side settlement exists)*

**B.2 Program Context**

* `programId` (string)
* `trackingMethod` (enum: OffchainReport | OnchainMetrics | ManualApproval)

### Partner Escrow Defaults

* `requiresEscrow`: usually false
* escrow useful for:

  * campaign budget escrow
  * delayed verification / disputes

### UI Behavior

* Offer “Recurring settlement” setup
* Offer “Escrow only for campaign budgets”

### Backend Validation

* If `partnerModel == RevenueShare` → require `settlementCycle`
* If `trackingMethod == OffchainReport` → require report attachment fields

---

## C) Agency (Manages sub-contractors / team payouts)

### Business Reality

Agencies:

* receive a master payment
* distribute internally
* may require split payout to team
  They also tend to have milestones, delays, dispute risk.

### Agency Required Fields

**C.1 Agency Structure**

* `payoutMode` (enum: MasterPayee | SplitToTeam | Hybrid)
* `hasSubRecipients` (boolean)
* If `SplitToTeam` or `Hybrid`:

  * `teamMembers[]` (recipientRef or wallet addresses)
  * `defaultSplitTemplate[]`

**C.2 Delivery & Milestones**

* `requiresMilestones` (true by default)
* `milestoneTemplate[]` (optional, but strongly recommended)
* `acceptanceWindowDefault` (e.g. 7 days)

### Agency Escrow Defaults

* `requiresEscrow`: true
* `escrowYieldEnabled`: true when acceptance windows are long

### UI Behavior

* Wizard must support “Add team splits”
* Support partial releases (milestones)

### Backend Validation

* If `payoutMode != MasterPayee` → require split template sum = 10000 bps
* If `requiresMilestones` → require at least 1 milestone definition

---

## D) Contractor (Individual / freelancer)

### Business Reality

Contractors need:

* payment certainty
* simple terms
* milestone or task-based payout
* fast withdrawal preferences
  They also may want to be paid in USDC instead of IDRX.

### Contractor Required Fields

**D.1 Work Contract Info**

* `engagementType` (enum: Fixed | Hourly | Retainer)
* `scopeSummary` (short string)
* `preferredPayoutAsset` (IDRX/USDC/etc)

**D.2 Verification & Risk**

* `kycLevel` (None | Basic | Verified) *(mock for hackathon)*
* `disputePreference` (AutoArbitration | ManualReview)

### Contractor Escrow Defaults

* `requiresEscrow`: true
* `acceptanceWindow`: short by default (24–72h)
* escrow yield: only if window is long

### UI Behavior

* Keep fields minimal
* Focus on payout preference + wallet

### Backend Validation

* If `engagementType == Hourly` → require timesheet/report attachment capability
* If payout asset differs from treasury → require swap route availability

---

# 3) Frontend Integration Spec

## 3.1 Recipient Wizard (Recommended)

**Step 1: Identity**

* Name, email, type, country, timezone

**Step 2: Payout**

* preferred asset, payout method, wallet/bank

**Step 3: Business Profile (dynamic by type)**

* Vendor/Partner/Agency/Contractor fields shown conditionally

**Step 4: Policy**

* approval policy, risk tier, thresholds, escrow defaults

**Step 5: Review**

* summary + create recipient

## 3.2 Field Schema (Frontend JSON-ish example)

You can implement as `recipientFormConfig.ts`.

```ts
type EntityType = "VENDOR" | "PARTNER" | "AGENCY" | "CONTRACTOR";

type RecipientCreatePayload = {
  displayName: string;
  legalName?: string;
  entityType: EntityType;
  billingEmail: string;
  country: string;
  timezone: string;

  payout: {
    preferredAsset: "IDRX" | "USDC" | "USDT" | "DAI";
    payoutMethod: "ONCHAIN" | "BANK" | "HYBRID";
    payoutAddress?: string;
    bankAccountRef?: string;
  };

  accounting: {
    defaultCurrency: string;
    paymentReferenceLabel: string;
    tags?: string[];
    costCenter?: string;
    externalRef?: string;
  };

  policy: {
    riskTier: "LOW" | "MED" | "HIGH";
    approvalPolicy: "AUTO" | "SINGLE" | "MULTI" | "THRESHOLD";
    maxSinglePayment?: string;
    maxMonthlyLimit?: string;
    requiresEscrowDefault?: boolean;
    requiresMilestonesDefault?: boolean;
  };

  profile:
    | { kind: "VENDOR"; vendorCategory: string; paymentTerms: string; invoiceRequired: boolean; invoiceEmail?: string; }
    | { kind: "PARTNER"; partnerModel: string; settlementCycle: string; trackingMethod: string; programId?: string; }
    | { kind: "AGENCY"; payoutMode: string; hasSubRecipients: boolean; defaultSplitTemplate?: { recipient: string; bps: number }[]; acceptanceWindowDefault?: number; }
    | { kind: "CONTRACTOR"; engagementType: string; scopeSummary: string; disputePreference?: string; };
};
```

---

# 4) Backend Model (Database)

Recommended tables:

## 4.1 `recipients`

* id (uuid)
* org_id (uuid)
* display_name
* legal_name
* entity_type
* billing_email
* country
* timezone
* status (active/inactive)

## 4.2 `recipient_payouts`

* recipient_id
* preferred_asset
* payout_method
* payout_address
* bank_account_ref

## 4.3 `recipient_profiles_vendor`

* recipient_id
* vendor_category
* payment_terms
* invoice_required
* invoice_email

## 4.4 `recipient_profiles_partner`

* recipient_id
* partner_model
* settlement_cycle
* tracking_method
* program_id

## 4.5 `recipient_profiles_agency`

* recipient_id
* payout_mode
* has_sub_recipients
* acceptance_window_default

## 4.6 `recipient_profiles_contractor`

* recipient_id
* engagement_type
* scope_summary
* dispute_preference
* kyc_level

## 4.7 `recipient_policies`

* recipient_id
* risk_tier
* approval_policy
* max_single_payment
* max_monthly_limit
* requires_escrow_default
* requires_milestones_default

## 4.8 `recipient_split_templates`

* recipient_id
* template_name
* recipient_wallet_or_ref
* bps

---

# 5) Mapping Recipient → Escrow Intent

Recipient profile influences escrow defaults:

### Example mapping rules

* Vendor with invoiceRequired → escrow intent requires invoice reference
* Agency payoutMode split → escrow uses SplitRouter template by default
* Contractor payout asset differs from treasury → escrow flow requires RFQ swap route
* High risk tier → approvals required before fund/release

### What goes onchain vs offchain

**Onchain (minimal + verifiable)**

* treasury
* recipient payout address (or final payout wallet)
* asset
* amount
* splits (if needed)
* acceptanceWindow
* protection flags (optional)

**Offchain**

* legal name, tax ID, invoice attachments
* partner performance calculation
* approval workflow records
* bank payout routing

---

# 6) API Endpoints

## Recipient

* `POST /recipients`
* `GET /recipients`
* `GET /recipients/:id`
* `PATCH /recipients/:id`
* `POST /recipients/:id/split-templates`

## Escrow creation (uses recipient defaults)

* `POST /escrows/prepare-intent`

  * returns recommended params + computed splits + swap route readiness
* `POST /escrows/create-intent`

  * triggers onchain create intent

---

# 7) Implementation Notes (Hackathon-Friendly)

For hackathon:

* Keep bank payout as `bankAccountRef` placeholder
* Use MockIDRX + MockOptionBook
* Keep compliance fields optional but in UI as “optional”

For judging:

* Show you are “enterprise-ready” by having:

  * recipient profiles
  * policies
  * audit fields
  * approval logic stubs

---

If you want, next I can generate:

1. **Frontend field config file** (ready to copy-paste)
2. **Backend Prisma schema** for these tables
3. **UI copy** per field (helper text / tooltips)
4. **Validation functions** (zod or manual) for payload enforcement

