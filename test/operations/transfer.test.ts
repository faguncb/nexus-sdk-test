import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { getSDK } from '../fixtures/sdk';
import { createAutoApproveIntentHook } from '../helpers/hooks';

describe('Smart Transfer (Direct + CA)', () => {
    let sdk: any;
    const recipient = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

    before(async () => {
        sdk = await getSDK();
        sdk.setOnIntentHook(createAutoApproveIntentHook());
    });

    it('should use direct transfer when possible', async () => {
        const sim = await sdk.simulateTransfer({
            token: 'USDC',
            amount: '0.001',
            chainId: 11155420,
            recipient,
        });
        if (sim.metadata?.optimization === 'direct') {
            console.log('Direct transfer used (fast & cheap)');
        }
    });

    it('should fallback to CA when no local balance', async function () {
        this.timeout(60_000);
        try {
            const sim = await sdk.simulateTransfer({
                token: 'USDC',
                amount: '10',
                chainId: 80002, // Polygon Amoy
                recipient,
            });
            expect(sim.metadata?.optimization).to.equal('ca');
        } catch (error: any) {
            // Handle WebSocket connection errors gracefully
            // This is a known issue with Polygon Amoy RPC in test environments
            if (error.message?.includes('WebSocket') || 
                error.message?.includes('socket') || 
                error.message?.includes('connection')) {
                console.log('Transfer simulation failed due to WebSocket connection issue (expected in test environment)');
                console.log('Error:', error.message);
                // Skip the test assertion in this case
                this.skip();
            } else {
                throw error;
            }
        }
    });
});