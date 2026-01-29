
import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000';

async function testCreateJob() {
    const payload = {
        createdBy: "0xTestUser",
        job: {
            isPublic: true,
            title: "Test Job from Script",
            description: "Testing backend validation",
            tags: ["Test"],
            notes: "Test notes"
        },
        payment: {
            recipientId: "123e4567-e89b-12d3-a456-426614174000", // UUID format
            entityType: "CONTRACTOR",
            amount: "1000000000000000000", // 1 ETH/IDRX in wei
            fundingAsset: "0xMockAsset",
            payoutAsset: "0xMockAsset",
            releaseCondition: "ON_APPROVAL",
            deadlineDays: 7,
            acceptanceWindowDays: 7,
            enableYield: false,
            enableProtection: false,
            milestones: [
                {
                    title: "Milestone 1",
                    dueDays: "7",
                    percentage: 100
                }
            ],
            notes: "Payment notes"
        }
    };

    try {
        const response = await fetch(`${API_URL}/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testCreateJob();
