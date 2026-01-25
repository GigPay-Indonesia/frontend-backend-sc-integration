import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { X, Loader2, Send } from 'lucide-react';
import { submitProposal } from '../../app/actions/proposals';

interface ApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    gigId: string;
    gigTitle: string;
    budget: string; // IDRX formatted string
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
    isOpen,
    onClose,
    gigId,
    gigTitle,
    budget
}) => {
    const { address } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [bidAmount, setBidAmount] = useState(budget.replace(/,/g, ''));

    // Calculate fees (Example logic)
    const bidNum = parseFloat(bidAmount || "0");
    const platformFee = bidNum * 0.05;
    const receiveAmount = bidNum - platformFee;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const result = await submitProposal(gigId, address, formData);

            if (result.success) {
                toast.success(result.message);
                onClose();
            } else {
                toast.error(result.message || "Failed to submit");
                if (result.errors) {
                    // Show validation errors via toast for simplicity in this demo
                    Object.values(result.errors).flat().forEach(err => toast.error(err));
                }
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Dialog (Shadcn-like) */}
            <div className="relative bg-[#09090b] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 p-6">

                {/* Header */}
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-lg font-semibold leading-none tracking-tight text-white">
                        Apply for Gig
                    </h2>
                    <p className="text-sm text-slate-400">
                        Submit your proposal for <span className="text-white font-medium">{gigTitle}</span>
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4 text-slate-400" />
                    <span className="sr-only">Close</span>
                </button>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Bid Amount Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white">
                            Bid Amount <span className="text-xs text-slate-500 font-normal">(IDRX)</span>
                        </label>
                        <input
                            name="bidAmount"
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-slate-800 bg-[#09090b] px-3 py-2 text-sm text-white ring-offset-[#09090b] placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter your bid amount"
                            required
                        />
                        <p className="text-[0.8rem] text-slate-400">
                            You will receive: <span className="text-emerald-400 font-mono font-medium">{receiveAmount.toLocaleString()} IDRX</span> <span className="text-slate-600">(5% fee deducted)</span>
                        </p>
                    </div>

                    {/* Cover Letter Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white">
                            Cover Letter
                        </label>
                        <textarea
                            name="coverLetter"
                            rows={6}
                            className="flex w-full rounded-md border border-slate-800 bg-[#09090b] px-3 py-2 text-sm text-white ring-offset-[#09090b] placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="Why are you the best fit for this gig? Mention your relevant experience..."
                            minLength={50}
                            required
                        />
                        <p className="text-[0.8rem] text-slate-500 text-right">
                            Min. 50 characters
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2 gap-2 sm:gap-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-800 bg-transparent hover:bg-slate-800 hover:text-white h-10 px-4 py-2 text-slate-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Submit Proposal
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
