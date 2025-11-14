import { describe, it, before } from 'mocha';
import { getSDK } from '../fixtures/sdk';
import { ethers } from 'ethers';

describe('Swap Operations', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
    });

    it('should list supported swap sources', () => {
        const sources = sdk.utils.getSwapSupportedChainsAndTokens();
        expect(sources.length).to.be.gte(3);
    });

    it('should perform EXACT_IN swap', async function () {
        this.timeout(120_000);
        const result = await sdk.swapWithExactIn(
            {
                from: [{
                    chainId: 84532,
                    amount: ethers.parseUnits('0.01', 6),
                    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
                }],
                toChainId: 11155420,
                toTokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            },
            { swapIntentHook: async ({ allow }) => allow() }
        );

        expect(result.success).to.be.true;
    });
});