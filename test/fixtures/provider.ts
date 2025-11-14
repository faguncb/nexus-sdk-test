import { ethers } from 'ethers';

export const getTestProvider = async (): Promise<ethers.BrowserProvider> => {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No wallet detected. Connect MetaMask or run in browser.');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    return provider;
};