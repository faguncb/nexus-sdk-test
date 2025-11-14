import { describe, it, before } from 'mocha';
import { getSDK } from '../fixtures/sdk';
import { createAutoApproveIntentHook } from '../helpers/hooks';
import { expectSuccess, expectExplorerUrl } from '../helpers/expect';

describe('Bridge Operations', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
        sdk.setOnIntentHook(createAutoApproveIntentHook());
    });

    it('should simulate bridge', async () => {
        const sim = await sdk.simulateBridge({
            token: 'USDC',
            amount: '0.01',
            chainId: 11155420, // Optimism Sepolia
        });
        expect(sim.success).to.be.true;
        expect(sim.intent.fees).to.be.gte(0n);
    });

    it('should bridge USDC to Optimism Sepolia', async function () {
        this.timeout(90_000);
        const result = await sdk.bridge({
            token: 'USDC',
            amount: 0.01,
            chainId: 11155420,
            sourceChains: [84532], // Base Sepolia
        });

        expectSuccess(result);
        expectExplorerUrl(result.explorerUrl);
    });
});