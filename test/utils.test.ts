import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { getSDK } from './fixtures/sdk';

describe('Utilities', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
    });

    it('should format and parse units', () => {
        const amount = sdk.utils.parseUnits('1.5', 6);
        expect(amount.toString()).to.equal('1500000');
        expect(sdk.utils.formatUnits(amount, 6)).to.equal('1.5');
        expect(sdk.utils.formatTokenAmount('1500000', 'USDC')).to.equal('1.5 USDC');
    });

    it('should validate address and chain', () => {
        expect(sdk.utils.isValidAddress('0x1234567890123456789012345678901234567890')).to.be.true;
        expect(sdk.utils.isSupportedChain(1)).to.be.true;
        expect(sdk.utils.isSupportedToken('USDT')).to.be.true;
    });
});