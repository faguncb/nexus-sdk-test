import { describe, it, before } from 'mocha';
import sinon from 'sinon';
import { getSDK } from './fixtures/sdk';

describe('Intent & Allowance Hooks', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
    });

    it('should trigger intent hook on simulate', async () => {
        const spy = sinon.spy(({ allow }) => allow());
        sdk.setOnIntentHook(spy);

        await sdk.simulateBridge({ token: 'USDC', amount: '0.01', chainId: 11155420 });
        expect(spy).to.have.been.calledOnce;
    });

    it('should trigger allowance hook on execute simulation', async () => {
        const spy = sinon.spy(({ allow }) => allow(['min']));
        sdk.setOnAllowanceHook(spy);

        await sdk.simulateExecute({
            toChainId: 1,
            contractAddress: '0x1111...',
            contractAbi: [],
            functionName: 'test',
            buildFunctionParams: () => ({ functionParams: [] }),
            tokenApproval: { token: 'USDC', amount: '100000' },
        });

        expect(spy).to.have.been.called;
    });
});