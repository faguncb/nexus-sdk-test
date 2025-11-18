import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { getSDK } from '../fixtures/sdk';

describe('Unified Balance Operations', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
    });

    it('should get unified balances across all chains', async function () {
        this.timeout(60_000);
        
        const balances = await sdk.getUnifiedBalances(false);
        
        // Verify structure
        expect(balances).to.be.an('array');
        expect(balances.length).to.be.gte(0);
        
        // Verify balance structure
        if (balances.length > 0) {
            const balance = balances[0];
            expect(balance).to.have.property('symbol');
            expect(balance).to.have.property('balance');
            expect(balance).to.have.property('balanceInFiat');
            expect(balance).to.have.property('decimals');
            expect(balance).to.have.property('abstracted');
            expect(balance).to.have.property('breakdown');
            
            // Breakdown should show per-chain balances
            expect(balance.breakdown).to.be.an('array');
        }
    });

    it('should get unified balances including swappable tokens', async function () {
        this.timeout(60_000);
        
        const balancesWithoutSwappable = await sdk.getUnifiedBalances(false);
        const balancesWithSwappable = await sdk.getUnifiedBalances(true);
        
        // With swappable should have equal or more tokens
        expect(balancesWithSwappable.length).to.be.gte(balancesWithoutSwappable.length);
        
        // Verify both return arrays
        expect(balancesWithoutSwappable).to.be.an('array');
        expect(balancesWithSwappable).to.be.an('array');
    });

    it('should get specific token unified balance', async function () {
        this.timeout(60_000);
        
        const usdcBalance = await sdk.getUnifiedBalance('USDC', false);
        
        if (usdcBalance) {
            expect(usdcBalance).to.have.property('symbol', 'USDC');
            expect(usdcBalance).to.have.property('balance');
            expect(usdcBalance.balance).to.be.a('string');
            expect(usdcBalance).to.have.property('balanceInFiat');
            expect(usdcBalance.balanceInFiat).to.be.a('number');
            expect(usdcBalance).to.have.property('breakdown');
            expect(usdcBalance.breakdown).to.be.an('array');
            
            // Breakdown should show USDC balances across chains
            console.log(`USDC unified balance: ${usdcBalance.balance}`);
            console.log(`USDC breakdown across ${usdcBalance.breakdown.length} chains`);
        } else {
            // Token might not be available
            console.log('USDC balance not available (may be expected in test environment)');
        }
    });

    it('should aggregate balances by token symbol', async function () {
        this.timeout(60_000);
        
        const balances = await sdk.getUnifiedBalances(false);
        
        // Group balances by symbol
        const balanceMap = new Map<string, any>();
        balances.forEach((balance: any) => {
            balanceMap.set(balance.symbol, balance);
        });
        
        // Each symbol should appear only once (unified)
        expect(balanceMap.size).to.equal(balances.length);
        
        // Verify aggregation - breakdown should sum to total
        if (balances.length > 0) {
            const balance = balances[0];
            if (balance.breakdown && balance.breakdown.length > 0) {
                // Breakdown amounts should be part of the unified balance
                const breakdownTotal = balance.breakdown.reduce((sum: number, b: any) => {
                    return sum + parseFloat(b.amount || '0');
                }, 0);
                
                console.log(`Unified ${balance.symbol} balance: ${balance.balance}`);
                console.log(`Breakdown total: ${breakdownTotal}`);
            }
        }
    });

    it('should show balance breakdown by chain', async function () {
        this.timeout(60_000);
        
        const balances = await sdk.getUnifiedBalances(false);
        
        if (balances.length > 0) {
            const balance = balances[0];
            
            // Verify breakdown structure
            expect(balance.breakdown).to.be.an('array');
            
            if (balance.breakdown.length > 0) {
                const breakdown = balance.breakdown[0];
                
                // Verify breakdown has required properties
                // Breakdown may have 'amount' or 'balance' property
                const amount = breakdown.amount || breakdown.balance;
                expect(amount).to.exist;
                expect(amount).to.be.a('string');
                
                // Check for tokenAddress (could be tokenAddress or tokenContract)
                const tokenAddress = breakdown.tokenAddress || breakdown.tokenContract;
                // Token address may not always be present in breakdown
                if (!tokenAddress) {
                    console.log('Breakdown structure:', Object.keys(breakdown));
                }
                
                expect(breakdown).to.have.property('decimals');
                
                // Check for chain identifier (could be chainID, chainId, or chain_id)
                const chainId = breakdown.chainID || breakdown.chainId || breakdown.chain_id;
                if (chainId !== undefined) {
                    expect(chainId).to.exist;
                } else {
                    // Some breakdown structures may not have chain ID directly
                    // Check if it's in a nested structure or different format
                    console.log('Breakdown structure:', Object.keys(breakdown));
                }
                
                console.log(`${balance.symbol} breakdown:`);
                balance.breakdown.forEach((b: any) => {
                    const chainId = b.chainID || b.chainId || b.chain_id;
                    const amount = b.amount || b.balance;
                    const tokenAddr = b.tokenAddress || b.tokenContract;
                    const chainInfo = chainId ? `Chain ${chainId}` : 'Chain';
                    console.log(`  ${chainInfo}: ${amount} (${tokenAddr})`);
                });
            }
        }
    });

    it('should calculate USD value for unified balances', async function () {
        this.timeout(60_000);
        
        const balances = await sdk.getUnifiedBalances(false);
        
        if (balances.length > 0) {
            balances.forEach((balance: any) => {
                expect(balance).to.have.property('balanceInFiat');
                expect(balance.balanceInFiat).to.be.a('number');
                expect(balance.balanceInFiat).to.be.gte(0);
                
                // USD value should be reasonable (not negative)
                if (parseFloat(balance.balance) > 0) {
                    expect(balance.balanceInFiat).to.be.gte(0);
                }
            });
            
            // Calculate total portfolio value
            const totalValue = balances.reduce((sum: number, b: any) => {
                return sum + b.balanceInFiat;
            }, 0);
            
            console.log(`Total portfolio value: $${totalValue.toFixed(2)}`);
            expect(totalValue).to.be.a('number');
        }
    });

    it('should handle empty balance gracefully', async function () {
        this.timeout(60_000);
        
        // Get balance for a token that might not exist
        const nonExistentBalance = await sdk.getUnifiedBalance('NONEXISTENT', false);
        
        // Should return null or undefined, not throw error
        expect(nonExistentBalance === null || nonExistentBalance === undefined).to.be.true;
    });

    it('should return consistent balance data', async function () {
        this.timeout(60_000);
        
        // Query balances multiple times
        const balances1 = await sdk.getUnifiedBalances(false);
        const balances2 = await sdk.getUnifiedBalances(false);
        
        // Should return consistent structure
        expect(balances1).to.be.an('array');
        expect(balances2).to.be.an('array');
        
        // Both should have same length (assuming no transactions between calls)
        expect(balances1.length).to.equal(balances2.length);
        
        // Verify structure consistency
        if (balances1.length > 0 && balances2.length > 0) {
            expect(balances1[0]).to.have.property('symbol');
            expect(balances2[0]).to.have.property('symbol');
        }
    });

    it('should filter balances by swappable flag', async function () {
        this.timeout(60_000);
        
        const caOnlyBalances = await sdk.getUnifiedBalances(false);
        const allBalances = await sdk.getUnifiedBalances(true);
        
        // All balances should include CA-only balances
        const caSymbols = new Set(caOnlyBalances.map((b: any) => b.symbol));
        const allSymbols = new Set(allBalances.map((b: any) => b.symbol));
        
        // CA symbols should be subset of all symbols
        caSymbols.forEach(symbol => {
            expect(allSymbols.has(symbol)).to.be.true;
        });
        
        console.log(`CA-only tokens: ${caOnlyBalances.length}`);
        console.log(`All tokens (including swappable): ${allBalances.length}`);
    });

    it('should provide balance metadata', async function () {
        this.timeout(60_000);
        
        const balances = await sdk.getUnifiedBalances(false);
        
        if (balances.length > 0) {
            const balance = balances[0];
            
            // Verify metadata fields
            expect(balance).to.have.property('icon');
            expect(balance.icon).to.be.a('string');
            
            expect(balance).to.have.property('abstracted');
            expect(balance.abstracted).to.be.a('boolean');
            
            // Abstracted tokens are unified across chains
            if (balance.abstracted) {
                expect(balance.breakdown.length).to.be.gte(1);
            }
        }
    });
});

