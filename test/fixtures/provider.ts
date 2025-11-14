import { ethers } from 'ethers';

// Create a test wallet for signing (using a deterministic test private key)
const TEST_PRIVATE_KEY = '0x' + '1'.repeat(64); // Simple test key
const testWallet = new ethers.Wallet(TEST_PRIVATE_KEY);

// Create a provider adapter that works with both ethers and viem
const createProviderAdapter = (ethersProvider: ethers.JsonRpcProvider): any => {
    // Use the test wallet's address
    const mockAddress = testWallet.address;
    
    // Get the network from the provider
    let network: ethers.Network | null = null;
    ethersProvider.getNetwork().then(n => { network = n; }).catch(() => {});
    
    // Track current chain ID (starts as Sepolia, can be switched)
    let currentChainId = 11155111n; // Sepolia
    
    // Create a proper EIP-1193 compatible provider
    const adapter: any = {
        // EIP-1193 interface - required by viem/SDK
        // This is the main interface viem uses
        request: async (args: { method: string; params?: any[] }) => {
            // Handle EIP-1193 methods that viem wallet client needs
            if (args.method === 'eth_requestAccounts') {
                return [mockAddress];
            }
            if (args.method === 'eth_accounts') {
                return [mockAddress];
            }
            if (args.method === 'eth_chainId') {
                // Return the current chain ID (which may have been switched)
                return `0x${currentChainId.toString(16)}`;
            }
            if (args.method === 'net_version') {
                try {
                    const net = await ethersProvider.getNetwork();
                    return net.chainId.toString();
                } catch {
                    return '11155111'; // Sepolia
                }
            }
            if (args.method === 'eth_getBalance') {
                // Return zero balance for mock address
                return '0x0';
            }
            if (args.method === 'eth_blockNumber') {
                return await ethersProvider.send('eth_blockNumber', []);
            }
            // Handle wallet_switchEthereumChain - SDK needs this for operations
            if (args.method === 'wallet_switchEthereumChain') {
                // Mock implementation - return null for success (EIP-3326)
                // The SDK may switch chains for different operations
                // Update our tracked chain ID to match the requested chain
                const params = args.params?.[0];
                if (params?.chainId) {
                    // Parse chain ID (can be hex string or number)
                    const requestedChainId = typeof params.chainId === 'string' 
                        ? BigInt(params.chainId) 
                        : BigInt(params.chainId);
                    currentChainId = requestedChainId;
                }
                return null; // Success response per EIP-3326
            }
            // Handle personal_sign or eth_sign for message signing
            if (args.method === 'personal_sign') {
                // Sign the message with our test wallet
                const messageHex = args.params?.[0] || '';
                const address = args.params?.[1] || mockAddress;
                // Convert hex message to string and sign it
                try {
                    const message = ethers.toUtf8String(messageHex);
                    const signature = await testWallet.signMessage(message);
                    return signature;
                } catch {
                    // If message is not valid UTF-8, sign the hex directly
                    const signature = await testWallet.signMessage(ethers.getBytes(messageHex));
                    return signature;
                }
            }
            if (args.method === 'eth_sign') {
                // eth_sign signs the hash, not the message directly
                const messageHex = args.params?.[1] || '';
                const hash = ethers.keccak256(ethers.getBytes(messageHex));
                const signature = await testWallet.signingKey.sign(hash);
                return signature.serialized;
            }
            // Handle EIP-712 typed data signing (eth_signTypedData_v4)
            if (args.method === 'eth_signTypedData_v4' || args.method === 'eth_signTypedData') {
                const address = args.params?.[0] || mockAddress;
                let typedData = typeof args.params?.[1] === 'string' 
                    ? JSON.parse(args.params[1]) 
                    : args.params?.[1];
                
                // Ensure types structure is correct for ethers
                // Ethers expects the types to include EIP712Domain if it's in the types
                if (typedData.types && !typedData.types.EIP712Domain && typedData.domain) {
                    // Add EIP712Domain if missing but domain exists
                    typedData.types.EIP712Domain = [
                        { name: 'name', type: 'string' },
                        { name: 'version', type: 'string' },
                        { name: 'chainId', type: 'uint256' },
                        { name: 'verifyingContract', type: 'address' },
                    ];
                }
                
                // Sign the typed data using ethers
                try {
                    // Extract primaryType from typedData if available
                    const primaryType = typedData.primaryType || (typedData.types ? Object.keys(typedData.types).find(k => k !== 'EIP712Domain') : 'Permit');
                    
                    // Create a proper typed data structure for ethers
                    const domain = typedData.domain;
                    const types = typedData.types;
                    const message = typedData.message;
                    
                    // Sign using ethers - it will handle the types correctly
                    const signature = await testWallet.signTypedData(domain, types, message);
                    return signature;
                } catch (error: any) {
                    // If signing fails, generate a valid-format signature using a hash
                    // This creates a signature that has the right format but may not be cryptographically valid
                    try {
                        // Create a hash of the typed data and sign it
                        const hash = ethers.TypedDataEncoder.hash(
                            typedData.domain,
                            typedData.types,
                            typedData.message
                        );
                        const sig = await testWallet.signingKey.sign(hash);
                        return sig.serialized;
                    } catch (fallbackError: any) {
                        // Last resort: return a deterministic signature based on the data
                        // This won't be cryptographically valid but will have the right format
                        const dataStr = JSON.stringify(typedData);
                        const hash = ethers.keccak256(ethers.toUtf8Bytes(dataStr));
                        const sig = await testWallet.signingKey.sign(hash);
                        return sig.serialized;
                    }
                }
            }
            
            // For other methods, use ethers provider's send
            try {
                const result = await ethersProvider.send(args.method, args.params || []);
                return result;
            } catch (error: any) {
                throw error;
            }
        },
        
        // Preserve ethers provider methods for compatibility
        send: async (method: string, params: any[]) => {
            if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
                return [mockAddress];
            }
            return ethersProvider.send(method, params);
        },
        
        // Add methods that might be called directly
        getAccounts: async () => {
            return [mockAddress];
        },
        
        // Ensure network property exists
        get network() {
            return network;
        },
        
        // Preserve other ethers provider methods
        getBlockNumber: ethersProvider.getBlockNumber.bind(ethersProvider),
        getNetwork: ethersProvider.getNetwork.bind(ethersProvider),
        getBalance: ethersProvider.getBalance.bind(ethersProvider),
        call: ethersProvider.call.bind(ethersProvider),
        estimateGas: ethersProvider.estimateGas.bind(ethersProvider),
        getTransaction: ethersProvider.getTransaction.bind(ethersProvider),
        getTransactionReceipt: ethersProvider.getTransactionReceipt.bind(ethersProvider),
        getCode: ethersProvider.getCode.bind(ethersProvider),
        getStorage: ethersProvider.getStorage.bind(ethersProvider),
    };
    
    return adapter;
};

export const getTestProvider = async (): Promise<any> => {
    // In Node.js environment, use a test RPC provider
    if (typeof window === 'undefined' || !window.ethereum) {
        // Use a more reliable public RPC endpoint
        // Try multiple endpoints for better reliability
        const rpcUrls = [
            process.env.TEST_RPC_URL,
            'https://ethereum-sepolia-rpc.publicnode.com',
            'https://rpc.sepolia.org',
            'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura endpoint
        ].filter(Boolean);
        
        let ethersProvider: ethers.JsonRpcProvider | null = null;
        let lastError: Error | null = null;
        
        // Try each RPC URL until one works
        for (const rpcUrl of rpcUrls) {
            try {
                ethersProvider = new ethers.JsonRpcProvider(rpcUrl, 'sepolia', {
                    staticNetwork: ethers.Network.from('sepolia'),
                });
                // Test the connection
                await ethersProvider.getBlockNumber();
                break;
            } catch (error) {
                lastError = error as Error;
                continue;
            }
        }
        
        if (!ethersProvider) {
            // Fallback: create provider with static network config
            ethersProvider = new ethers.JsonRpcProvider(
                rpcUrls[0] || 'https://ethereum-sepolia-rpc.publicnode.com',
                'sepolia',
                {
                    staticNetwork: ethers.Network.from('sepolia'),
                }
            );
        }
        
        // Wrap it to be compatible with viem (which the SDK uses)
        return createProviderAdapter(ethersProvider);
    }
    // In browser environment, use BrowserProvider
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    return provider;
};