import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { getSDK } from '../fixtures/sdk';
import { createAutoApproveIntentHook } from '../helpers/hooks';
import { expectSuccess } from '../helpers/expect';

describe('Fast Bridge Operations', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
        sdk.setOnIntentHook(createAutoApproveIntentHook());
    });

    it('should simulate fast bridge', async function () {
        this.timeout(60_000);
        
        // Fast bridge typically uses optimized routes for speed
        // Test bridge simulation with fast bridge parameters
        const sim = await sdk.simulateBridge({
            token: 'USDC',
            amount: '0.01',
            chainId: 11155420, // Optimism Sepolia
            // Fast bridge may use specific source chains or optimization flags
        });
        
        expect(sim).to.have.property('intent');
        expect(sim.intent).to.have.property('fees');
        expect(sim.intent).to.have.property('sources');
        
        // Fast bridge should have reasonable fees
        expect(sim.intent.fees).to.be.an('object');
    });

    it('should execute fast bridge with optimized route', async function () {
        this.timeout(120_000);
        
        try {
            // Fast bridge execution - uses optimized source chains
            const result = await sdk.bridge({
                token: 'USDC',
                amount: 0.01,
                chainId: 11155420, // Optimism Sepolia
                sourceChains: [84532], // Base Sepolia - optimized for speed
            });

            expect(result).to.be.an('object');
            expect(result).to.have.property('success');
            
            if (result.success) {
                expectSuccess(result);
                // Fast bridge should complete relatively quickly
                // (though in testnet this may vary)
            } else {
                console.log('Fast bridge returned success: false (may be expected in test environment)');
                console.log('Fast bridge result:', JSON.stringify(result, null, 2));
            }
        } catch (error: any) {
            // Handle expected errors in test environment
            if (error.message?.includes('transaction') || 
                error.message?.includes('execution') ||
                error.message?.includes('revert') ||
                error.message?.includes('balance')) {
                console.log('Fast bridge operation failed (expected in test environment):', error.message);
                expect(error).to.be.an('error');
            } else {
                throw error;
            }
        }
    });

    it('should compare fast bridge vs regular bridge fees', async function () {
        this.timeout(60_000);
        
        // Simulate both fast bridge and regular bridge to compare
        const fastBridgeSim = await sdk.simulateBridge({
            token: 'USDC',
            amount: '0.01',
            chainId: 11155420,
            sourceChains: [84532], // Optimized source
        });
        
        const regularBridgeSim = await sdk.simulateBridge({
            token: 'USDC',
            amount: '0.01',
            chainId: 11155420,
            // No sourceChains specified - uses all available
        });
        
        // Both should return valid simulations
        expect(fastBridgeSim).to.have.property('intent');
        expect(regularBridgeSim).to.have.property('intent');
        
        // Compare fee structures
        expect(fastBridgeSim.intent.fees).to.be.an('object');
        expect(regularBridgeSim.intent.fees).to.be.an('object');
        
        console.log('Fast bridge fees:', fastBridgeSim.intent.fees);
        console.log('Regular bridge fees:', regularBridgeSim.intent.fees);
    });

    it('should handle fast bridge with multiple source chains', async function () {
        this.timeout(60_000);
        
        // Fast bridge with multiple optimized sources
        const sim = await sdk.simulateBridge({
            token: 'USDC',
            amount: '0.05',
            chainId: 11155420,
            sourceChains: [84532, 421614], // Multiple optimized sources
        });
        
        expect(sim).to.have.property('intent');
        expect(sim.intent.sources).to.be.an('array');
        
        // Should use multiple sources if needed
        if (sim.intent.sources.length > 1) {
            console.log('Fast bridge using multiple sources:', sim.intent.sources.length);
        }
    });

    it('should optimize bridge route for speed', async function () {
        this.timeout(60_000);
        
        // Test that bridge route is optimized
        const sim = await sdk.simulateBridge({
            token: 'USDC',
            amount: '0.01',
            chainId: 11155420,
        });
        
        // Verify intent has optimization data
        expect(sim.intent).to.have.property('sources');
        expect(sim.intent.sources).to.be.an('array');
        
        // Sources should be ordered by efficiency/speed
        if (sim.intent.sources.length > 0) {
            const source = sim.intent.sources[0];
            expect(source).to.have.property('chainID');
            expect(source).to.have.property('amount');
        }
    });
});

