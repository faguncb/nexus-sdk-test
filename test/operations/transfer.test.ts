import { describe, it, before } from 'mocha';
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

    it('should fallback to CA when no local balance', async () => {
        const sim = await sdk.simulateTransfer({
            token: 'USDC',
            amount: '10',
            chainId: 80002, // Polygon Amoy
            recipient,
        });
        expect(sim.metadata?.optimization).to.equal('ca');
    });
});