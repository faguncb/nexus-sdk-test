# Nexus SDK Test Suite - Documentation

Welcome! This documentation will help you understand the Nexus SDK and its test suite in a beginner-friendly way.

## 📚 Table of Contents

1. [What is the Nexus SDK?](#what-is-the-nexus-sdk)
2. [Project Structure](#project-structure)
3. [SDK Components Explained](#sdk-components-explained)
4. [Test Suite Overview](#test-suite-overview)
5. [Running Tests](#running-tests)
6. [Understanding Test Files](#understanding-test-files)
7. [Key Concepts](#key-concepts)

---

## What is the Nexus SDK?

The **Nexus SDK** is a powerful toolkit that simplifies blockchain operations across multiple networks. Think of it as a "universal wallet" that lets you:

- **Check balances** across different blockchains
- **Transfer tokens** between chains seamlessly
- **Bridge assets** from one blockchain to another
- **Swap tokens** using various decentralized exchanges
- **Execute smart contract calls** on any supported chain

Instead of writing complex code for each blockchain, the SDK handles all the complexity for you!

---

## Project Structure

```
nexus-sdk-test/
├── test/                          # All test files live here
│   ├── fixtures/                  # Test setup and configuration
│   │   ├── provider.ts           # Mock blockchain provider
│   │   └── sdk.ts                # SDK initialization helper
│   ├── helpers/                   # Reusable test utilities
│   │   ├── expect.ts             # Custom assertion helpers
│   │   └── hooks.ts              # Test hook implementations
│   ├── operations/                # Tests for SDK operations
│   │   ├── balance.test.ts       # Balance checking tests
│   │   ├── bridge.test.ts        # Cross-chain bridge tests
│   │   ├── swap.test.ts          # Token swap tests
│   │   └── transfer.test.ts      # Token transfer tests
│   ├── hooks.test.ts             # Hook system tests
│   ├── utils.test.ts             # Utility function tests
│   └── index.test.ts             # Main test entry point
├── package.json                   # Project dependencies
└── README.md                      # This file!
```

---

## SDK Components Explained

### 1. **NexusSDK** (Main Class)
The core class that provides all SDK functionality. You create an instance of this class to interact with blockchains.

**Key Methods:**
- `initialize()` - Sets up the SDK with a wallet provider
- `getUnifiedBalances()` - Gets your token balances across all chains
- `simulateTransfer()` - Simulates a token transfer (without actually sending)
- `bridge()` - Bridges tokens between blockchains
- `swapWithExactIn()` - Swaps tokens using DEX aggregators

### 2. **Provider** (Blockchain Connection)
A provider is like a "phone line" to the blockchain. It lets the SDK communicate with blockchain networks.

**In Tests:** We use a mock provider (`test/fixtures/provider.ts`) that simulates blockchain interactions without needing real connections.

### 3. **Hooks** (Event Callbacks)
Hooks are functions that get called at specific moments during operations. They let you:
- Approve or reject operations before they execute
- Customize behavior based on operation details
- Add logging or analytics

**Types of Hooks:**
- **Intent Hook** - Called when an operation creates an "intent" (a planned transaction)
- **Allowance Hook** - Called when token approval is needed

---

## Test Suite Overview

Our test suite ensures the SDK works correctly. It's organized into logical groups:

### Test Categories

1. **Balance Operations** - Tests for checking token balances
2. **Bridge Operations** - Tests for cross-chain token bridging
3. **Swap Operations** - Tests for token swapping
4. **Transfer Operations** - Tests for token transfers
5. **Utilities** - Tests for helper functions
6. **Hooks** - Tests for the hook system

### Test Framework

We use:
- **Mocha** - Test runner (organizes and runs tests)
- **Chai** - Assertion library (checks if results are correct)
- **Sinon** - Mocking library (creates fake functions for testing)

---

## Running Tests

### Prerequisites
Make sure you have Node.js installed, then install dependencies:

```bash
npm install
```

### Run All Tests
```bash
npm test
```

This runs all tests in the `test/` folder and shows you which ones pass or fail.

### Run Tests in Watch Mode
```bash
npm run test:watch
```

This automatically re-runs tests when you change files - great for development!

### Generate Test Report
```bash
npm run test:report
```

Creates a detailed HTML report of test results.

---

## Understanding Test Files

### 1. `test/fixtures/sdk.ts` - SDK Setup

**What it does:**
- Creates a reusable SDK instance for all tests
- Sets up the test environment (polyfills for Node.js)
- Initializes the SDK with test configuration

**Key Functions:**
- `getSDK()` - Returns an initialized SDK instance
- `resetSDK()` - Cleans up the SDK after tests

**Why it matters:**
All tests use the same SDK instance, ensuring consistent test conditions.

---

### 2. `test/fixtures/provider.ts` - Mock Blockchain Provider

**What it does:**
- Creates a fake blockchain provider that simulates real blockchain behavior
- Implements the EIP-1193 standard (the standard interface for blockchain providers)
- Handles wallet operations like signing messages and switching chains

**Key Features:**
- Mock wallet address for testing
- Simulated blockchain responses
- Support for multiple RPC endpoints (for reliability)

**Why it matters:**
Tests don't need real blockchain connections, making them fast and free to run.

---

### 3. `test/operations/balance.test.ts` - Balance Tests

**What it tests:**
- Getting unified balances (tokens across all chains)
- Getting balances including swappable tokens
- Getting balance for a specific token (e.g., USDC)

**Example Test:**
```typescript
it('should get unified balances', async () => {
    const balances = await sdk.getUnifiedBalances(false);
    expect(balances).to.be.an('array');
    expect(balances.some(b => b.symbol === 'USDC')).to.be.true;
});
```

**What this means:**
- Calls the SDK to get balances
- Checks that it returns an array
- Verifies USDC is in the results

---

### 4. `test/operations/transfer.test.ts` - Transfer Tests

**What it tests:**
- Direct transfers (when you have balance on the target chain)
- Contract Account (CA) fallback (when you need to bridge first)

**Key Concepts:**
- **Direct Transfer**: Fast and cheap - you already have tokens on the destination chain
- **CA Fallback**: Uses the SDK's smart routing to bridge tokens first, then transfer

**Example Test:**
```typescript
it('should use direct transfer when possible', async () => {
    const sim = await sdk.simulateTransfer({
        token: 'USDC',
        amount: '0.001',
        chainId: 11155420,
        recipient: '0x...',
    });
    // Checks if direct transfer was used
});
```

---

### 5. `test/operations/bridge.test.ts` - Bridge Tests

**What it tests:**
- Simulating bridge operations (checking fees, routes)
- Actually executing bridge operations

**What is Bridging?**
Bridging moves tokens from one blockchain to another. For example:
- You have USDC on Ethereum
- You want USDC on Polygon
- The bridge moves it for you!

**Example Test:**
```typescript
it('should simulate bridge', async () => {
    const sim = await sdk.simulateBridge({
        token: 'USDC',
        amount: '0.01',
        chainId: 11155420, // Optimism Sepolia
    });
    expect(sim).to.have.property('intent');
    expect(sim.intent).to.have.property('fees');
});
```

**What this checks:**
- Bridge simulation returns an "intent" (the planned operation)
- The intent includes fee information

---

### 6. `test/operations/swap.test.ts` - Swap Tests

**What it tests:**
- Listing available swap sources (which DEXes are supported)
- Executing token swaps

**What is Swapping?**
Swapping exchanges one token for another. For example:
- You have USDC
- You want ETH
- A swap exchanges them at the current market rate

**Example Test:**
```typescript
it('should perform EXACT_IN swap', async () => {
    const result = await sdk.swapWithExactIn({
        from: [{ chainId: 84532, amount: '0.01', tokenAddress: '0x...' }],
        toChainId: 11155420,
        toTokenAddress: '0x...',
    });
    expect(result).to.have.property('success');
});
```

**What this checks:**
- Swap operation completes
- Result indicates success or failure

---

### 7. `test/utils.test.ts` - Utility Tests

**What it tests:**
- Unit formatting (converting between human-readable and blockchain formats)
- Address validation
- Chain and token validation

**Key Utilities:**
- `parseUnits()` - Converts "1.5" to "1500000" (for tokens with 6 decimals)
- `formatUnits()` - Converts "1500000" back to "1.5"
- `isValidAddress()` - Checks if an Ethereum address is valid
- `isSupportedChain()` - Checks if a blockchain is supported

**Example:**
```typescript
it('should format and parse units', () => {
    const amount = sdk.utils.parseUnits('1.5', 6);
    expect(amount.toString()).to.equal('1500000');
    expect(sdk.utils.formatUnits(amount, 6)).to.equal('1.5');
});
```

---

### 8. `test/hooks.test.ts` - Hook Tests

**What it tests:**
- Intent hooks are properly set up
- Allowance hooks are properly set up

**What are Hooks?**
Hooks are like "checkpoints" where you can approve or modify operations:

```typescript
// Set a hook that auto-approves all intents
sdk.setOnIntentHook(({ allow }) => allow());
```

**Why use hooks?**
- Add custom logic before operations execute
- Show user confirmation dialogs
- Log operations for analytics

---

### 9. `test/helpers/` - Test Helpers

**`expect.ts`** - Custom assertion helpers:
- `expectSuccess()` - Checks if an operation succeeded
- `expectTxHash()` - Validates transaction hash format
- `expectExplorerUrl()` - Validates blockchain explorer URL

**`hooks.ts`** - Pre-built hook implementations:
- `createAutoApproveIntentHook()` - Auto-approves all intents
- `createAutoApproveAllowanceHook()` - Auto-approves token allowances

---

## Key Concepts

### 1. **Unified Balances**
Instead of checking balances on each chain separately, the SDK aggregates all your balances across chains into a single view.

**Example:**
- You have 10 USDC on Ethereum
- You have 5 USDC on Polygon
- Unified balance shows: 15 USDC total

### 2. **Intent System**
An "intent" is a planned operation that hasn't been executed yet. It includes:
- What you want to do (transfer, bridge, swap)
- Fees involved
- Source and destination chains
- Token amounts

**Why use intents?**
- Preview operations before executing
- Show users what will happen
- Calculate fees upfront

### 3. **Contract Account (CA)**
A Contract Account is a smart contract wallet that can:
- Hold tokens across multiple chains
- Execute operations on your behalf
- Optimize gas costs

**When is CA used?**
- When you don't have tokens on the destination chain
- When bridging is more efficient than direct transfer
- When you need advanced features like gas optimization

### 4. **Simulation vs Execution**
- **Simulation** (`simulate*` methods): Tests an operation without actually doing it
  - Fast and free
  - Shows fees and routes
  - No blockchain transactions
  
- **Execution** (methods without `simulate`): Actually performs the operation
  - Costs gas fees
  - Creates real transactions
  - Permanent on blockchain

### 5. **Chain IDs**
Each blockchain has a unique ID:
- `1` - Ethereum Mainnet
- `11155111` - Ethereum Sepolia (testnet)
- `84532` - Base Sepolia (testnet)
- `11155420` - Optimism Sepolia (testnet)
- `80002` - Polygon Amoy (testnet)

---

## Common Test Patterns

### Pattern 1: Setup and Teardown
```typescript
describe('My Tests', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK(); // Setup before all tests
    });

    it('should do something', async () => {
        // Your test code
    });
});
```

### Pattern 2: Testing with Hooks
```typescript
before(async () => {
    sdk = await getSDK();
    sdk.setOnIntentHook(createAutoApproveIntentHook());
});
```

### Pattern 3: Handling Test Environment Limitations
```typescript
it('should do something', async function () {
    this.timeout(60_000); // Increase timeout for slow operations
    
    try {
        const result = await sdk.someOperation();
        expect(result).to.have.property('success');
    } catch (error) {
        // Handle expected errors in test environment
        if (error.message?.includes('expected error')) {
            this.skip(); // Skip test if error is expected
        } else {
            throw error; // Re-throw unexpected errors
        }
    }
});
```

---

## Troubleshooting

### Tests Fail with "SDK not initialized"
- Make sure `getSDK()` is called in `before()` hook
- Check that provider is properly set up

### Tests Timeout
- Some operations take time (bridging, swapping)
- Increase timeout: `this.timeout(60_000)`

### WebSocket Connection Errors
- Some testnet RPCs have connection issues
- Tests handle these gracefully with try-catch

### "Insufficient balance" Errors
- Expected in test environment
- Tests verify the error handling, not actual execution

---

## Next Steps

1. **Read the test files** - They're great examples of SDK usage
2. **Modify tests** - Try changing parameters to see what happens
3. **Add new tests** - Test new SDK features as they're added
4. **Check SDK documentation** - For detailed API reference

---

## Additional Documentation

For more detailed information, check out:

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started in minutes
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Deep technical dive into SDK architecture
- **[Documentation Index](./docs/README.md)** - Overview of all documentation

## Additional Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/api/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

## Questions?

If you have questions about:
- **Getting Started**: Check the [Quick Start Guide](./docs/QUICK_START.md)
- **SDK Usage**: Check the test files - they're practical examples!
- **Architecture**: Read the [Architecture Guide](./docs/ARCHITECTURE.md)
- **Test Structure**: Read through `test/index.test.ts` to see how tests are organized
- **Specific Operations**: Look at the corresponding test file in `test/operations/`

Happy testing! 🚀

