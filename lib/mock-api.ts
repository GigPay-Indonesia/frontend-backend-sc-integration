import { UserProfileFormValues } from './validators';

const STORAGE_KEY = 'gigpay_user_profile';

const defaultProfile: UserProfileFormValues = {
    displayName: 'Zennz',
    bio: 'Fullstack Developer building on Base. Expert in React, Solidity, and DeFi integrations.',
    skills: 'React, TypeScript, Solidity, Wagmi, TailwindCSS',
    portfolioUrl: 'https://zennz.dev',
    emailNotifications: true,
};

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockUserApi = {
    // Fetch current user profile
    getProfile: async (): Promise<UserProfileFormValues> => {
        await delay(600); // Simulate network latency
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return defaultProfile;

        try {
            return JSON.parse(stored);
        } catch {
            return defaultProfile;
        }
    },

    // Update user profile
    updateProfile: async (data: UserProfileFormValues): Promise<{ success: boolean; data: UserProfileFormValues }> => {
        await delay(1200); // Simulate network latency
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return { success: true, data };
    }
};
