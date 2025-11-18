import { NexusSDK } from '@avail-project/nexus-core';
import { getTestProvider } from './provider';

// Polyfill window, localStorage, and self for Node.js environment
if (typeof window === 'undefined') {
    // Simple localStorage polyfill
    const storage: { [key: string]: string } = {};
    (global as any).localStorage = {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value; },
        removeItem: (key: string) => { delete storage[key]; },
        clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
        get length() { return Object.keys(storage).length; },
        key: (index: number) => Object.keys(storage)[index] || null,
    };
    
    // Polyfill self for grpc-web
    (global as any).self = global;
    
    (global as any).window = {
        ethereum: undefined,
        location: {
            href: 'http://localhost:3000',
            origin: 'http://localhost:3000',
            protocol: 'http:',
            host: 'localhost:3000',
            hostname: 'localhost',
            port: '3000',
            pathname: '/',
            search: '',
            hash: '',
        },
        localStorage: (global as any).localStorage,
        addEventListener: () => {},
        removeEventListener: () => {},
        setInterval: (fn: Function, delay: number) => {
            // Return a mock interval ID
            return setInterval(fn, delay) as any;
        },
        clearInterval: (id: any) => {
            clearInterval(id);
        },
    };
}

let sdkInstance: NexusSDK;

export const getSDK = async (): Promise<NexusSDK> => {
    if (!sdkInstance) {
        const provider = await getTestProvider();
        // Enable debug mode to see detailed error messages
        sdkInstance = new NexusSDK({ network: 'testnet', debug: true });
        try {
            await sdkInstance.initialize(provider);
        } catch (error: any) {
            // Log the actual error for debugging
            console.error('SDK initialization error:', error.message || error);
            console.error('Full error:', error);
            if (error.stack) {
                console.error('Stack:', error.stack);
            }
            throw error;
        }
    }
    return sdkInstance;
};

export const resetSDK = async () => {
    if (sdkInstance) {
        try {
            await sdkInstance.deinit();
        } catch (error: any) {
            // Log but don't throw - cleanup errors shouldn't fail tests
            console.log('SDK cleanup warning:', error.message || error);
        } finally {
            sdkInstance = undefined as any;
        }
    }
};

// Ensure cleanup on process exit
if (typeof process !== 'undefined') {
    process.on('exit', async () => {
        await resetSDK();
    });
    
    process.on('SIGINT', async () => {
        await resetSDK();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        await resetSDK();
        process.exit(0);
    });
}
