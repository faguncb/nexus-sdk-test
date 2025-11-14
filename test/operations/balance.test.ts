import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { getSDK } from '../fixtures/sdk';

describe('Balance Operations', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
    });

    it('should get unified balances (CA tokens only)', async () => {
        const balances = await sdk.getUnifiedBalances(false);
        expect(balances).to.be.an('array');
        expect(balances.some((b: any) => b.symbol === 'USDC')).to.be.true;
    });

    it('should get all balances including swappable tokens', async () => {
        const balances = await sdk.getUnifiedBalances(true);
        expect(balances.length).to.be.gte(1);
    });

    it('should get specific token balance', async () => {
        const usdc = await sdk.getUnifiedBalance('USDC', false);
        expect(usdc).to.have.property('symbol', 'USDC');
        expect(usdc!.balance).to.be.a('string');
    });
});