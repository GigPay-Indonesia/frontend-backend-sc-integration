const API_URL = (import.meta.env as ImportMetaEnv & { VITE_API_URL?: string }).VITE_API_URL || 'http://localhost:4000';

const request = async <T>(path: string, options: RequestInit): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Request failed');
    }

    return response.json() as Promise<T>;
};

export const createRecipient = async (payload: Record<string, unknown>): Promise<string> => {
    const data = await request<{ recipient: { id: string } }>('/recipients', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return data.recipient.id;
};

export const createEscrowIntent = async (payload: Record<string, unknown>): Promise<{ id: string }> => {
    return request<{ id: string }>('/escrows/create-intent', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const linkOnchainIntent = async (intentId: string, payload: Record<string, unknown>) => {
    return request<{ intent: { id: string } }>(`/escrows/${intentId}/onchain`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const recordEscrowFunded = async (onchainIntentId: string, payload: Record<string, unknown>) => {
    return request<{ updated: number }>(`/escrows/onchain/${onchainIntentId}/fund`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const recordEscrowSubmitted = async (onchainIntentId: string, payload: Record<string, unknown>) => {
    return request<{ updated: number }>(`/escrows/onchain/${onchainIntentId}/submit-work`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const recordEscrowReleased = async (onchainIntentId: string, payload: Record<string, unknown>) => {
    return request<{ updated: number }>(`/escrows/onchain/${onchainIntentId}/release`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const recordEscrowRefunded = async (onchainIntentId: string, payload: Record<string, unknown>) => {
    return request<{ updated: number }>(`/escrows/onchain/${onchainIntentId}/refund`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const getOnchainIntent = async (onchainIntentId: string) => {
    return request<{ intent: unknown }>(`/escrows/onchain/${onchainIntentId}`, {
        method: 'GET',
    });
};

export const getReleaseData = async (onchainIntentId: string) => {
    return request<{ swapRequired: boolean; swapData?: string }>(`/escrows/onchain/${onchainIntentId}/release-data`, {
        method: 'GET',
    });
};

export const getEscrowIntents = async (filters?: { status?: string; entityType?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    const query = params.toString();
    const path = query ? `/escrows/intents?${query}` : '/escrows/intents';
    return request<{ intents: any[] }>(path, { method: 'GET' });
};
