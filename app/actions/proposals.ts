import { z } from 'zod';

// Mock Server Action for Client-Side Demo
// In a real Next.js app, this would be 'use server'

const proposalSchema = z.object({
    coverLetter: z.string().min(50, "Cover letter must be at least 50 characters."),
    bidAmount: z.coerce.number().positive("Bid amount must be positive."),
});

export type ProposalState = {
    success?: boolean;
    message?: string;
    errors?: {
        coverLetter?: string[];
        bidAmount?: string[];
        server?: string[];
    };
};

export async function submitProposal(
    gigId: string,
    freelancerAddress: string,
    formData: FormData
): Promise<ProposalState> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log(`[ServerAction] Processing proposal for Gig ${gigId} from ${freelancerAddress}`);

    // 1. Validate Input
    const validatedFields = proposalSchema.safeParse({
        coverLetter: formData.get('coverLetter'),
        bidAmount: formData.get('bidAmount'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validatedFields.error.flatten().fieldErrors
        };
    }

    const { coverLetter, bidAmount } = validatedFields.data;

    // 2. Mock Logic (Prisma Check & Create)
    try {
        // Check for existing proposal (Mock constraint)
        // In real app: const existing = await prisma.proposal.findUnique(...)
        if (coverLetter.includes("DUPLICATE")) {
            return {
                success: false,
                message: "You have already applied to this gig."
            };
        }

        console.log("[ServerAction] Creating Proposal in DB:", {
            gigId,
            freelancerAddress,
            bidAmount,
            coverLetter: coverLetter.substring(0, 20) + "..."
        });

        // Revalidate path (Mock)
        // revalidatePath('/explore');

        return {
            success: true,
            message: "Proposal sent successfully!"
        };

    } catch (error) {
        return {
            success: false,
            message: "Database error. Failed to submit proposal."
        };
    }
}
