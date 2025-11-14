import { NexusSDK } from '@avail-project/nexus-core';
import { getTestProvider } from './provider';

let sdkInstance: NexusSDK;

export const getSDK = async (): Promise<NexusSDK> => {
    if (!sdkInstance) {
        const provider = await getTestProvider();
        sdkInstance = new NexusSDK({ network: 'testnet' });
        await sdkInstance.initialize(provider);
    }
    return sdkInstance;
};

export const resetSDK = async () => {
    if (sdkInstance) {
        await sdkInstance.deinit();
        sdkInstance = undefined as any;
    }
};