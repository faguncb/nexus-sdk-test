# Nexus SDK Architecture & Component Guide

This document provides a detailed technical explanation of the Nexus SDK components and test architecture.

## Table of Contents

1. [SDK Architecture Overview](#sdk-architecture-overview)
2. [Core Components](#core-components)
3. [Test Architecture](#test-architecture)
4. [Data Flow](#data-flow)
5. [Operation Types](#operation-types)
6. [Hook System](#hook-system)

---

## SDK Architecture Overview

The Nexus SDK follows a modular architecture designed to abstract blockchain complexity:

```
┌─────────────────────────────────────────┐
│         Application Layer                │
│  (Your Application Code)                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Nexus SDK                        │
│  ┌────────────────────────────────────┐ │
│  │  Operation Layer                   │ │
│  │  - Transfer, Bridge, Swap          │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Intent System                     │ │
│  │  - Intent Creation & Management    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Hook System                       │ │
│  │  - Intent & Allowance Hooks        │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Provider Adapter                  │ │
│  │  - Multi-chain Support             │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Blockchain Networks                 │
│  Ethereum, Polygon, Base, Optimism, etc.  │
└──────────────────────────────────────────┘
```

---

## Core Components

### 1. NexusSDK Class

**Location:** `@avail-project/nexus-core` package

**Purpose:** Main entry point for all SDK operations

**Key Responsibilities:**
- SDK initialization and configuration
- Provider management
- Operation orchestration
- State management

**Initialization Flow:**
```typescript
const sdk = new NexusSDK({ 
    network: 'testnet',  // or 'mainnet'
    debug: true          // Enable debug logging
});

await sdk.initialize(provider);
```

**Key Methods:**

#### Balance Operations
```typescript
// Get all balances across chains
getUnifiedBalances(includeSwappable: boolean): Promise<Asset[]>

// Get balance for specific token
getUnifiedBalance(tokenSymbol: string, includeSwappable: boolean): Promise<Asset | null>
```

**What happens internally:**
1. SDK queries multiple blockchain RPCs
2. Aggregates balances by token symbol
3. Calculates total USD value
4. Returns unified view

#### Transfer Operations
```typescript
// Simulate transfer (no execution)
simulateTransfer(params: TransferParams): Promise<SimulationResult>

// Execute transfer
transfer(params: TransferParams): Promise<OperationResult>
```

**Transfer Optimization:**
- **Direct Transfer**: If balance exists on destination chain
  - Fast execution
  - Low gas fees
  - Single transaction
  
- **CA Fallback**: If balance doesn't exist on destination chain
  - Uses Contract Account system
  - Bridges tokens first, then transfers
  - May involve multiple transactions

#### Bridge Operations
```typescript
// Simulate bridge
simulateBridge(params: BridgeParams): Promise<SimulationResult>

// Execute bridge
bridge(params: BridgeParams): Promise<OperationResult>
```

**Bridge Process:**
1. Check source chain balances
2. Calculate fees (protocol, solver, gas)
3. Create intent with source chains
4. Execute bridge transaction
5. Monitor fulfillment

#### Swap Operations
```typescript
// List supported swap sources
utils.getSwapSupportedChainsAndTokens(): SwapSource[]

// Execute swap
swapWithExactIn(params: SwapParams, options?: SwapOptions): Promise<OperationResult>
```

**Swap Process:**
1. Query DEX aggregators (LiFi, Bebop, etc.)
2. Find best swap route
3. Calculate output amount
4. Execute swap transaction

---

### 2. Provider System

**Purpose:** Abstracts blockchain communication

**Provider Interface (EIP-1193):**
```typescript
interface Provider {
    request(args: { method: string; params?: any[] }): Promise<any>
}
```

**Supported Methods:**
- `eth_requestAccounts` - Get connected wallet addresses
- `eth_accounts` - Get current accounts
- `eth_chainId` - Get current chain ID
- `wallet_switchEthereumChain` - Switch to different chain
- `personal_sign` - Sign messages
- `eth_signTypedData_v4` - Sign typed data (EIP-712)
- `eth_sendTransaction` - Send transactions
- `eth_call` - Read from contracts
- `eth_getBalance` - Get balance

**Test Provider Implementation:**
Our test provider (`test/fixtures/provider.ts`) implements:
- Mock wallet with deterministic key
- Chain switching simulation
- Message signing with test wallet
- RPC method proxying

---

### 3. Intent System

**What is an Intent?**
An intent is a structured representation of a planned operation before execution.

**Intent Structure:**
```typescript
interface Intent {
    sources: Source[];           // Where tokens come from
    destination: Destination;    // Where tokens go
    fees: Fees;                  // All fees involved
    isAvailableBalanceInsufficient: boolean;
}
```

**Source:**
```typescript
interface Source {
    chainID: number;
    tokenContract: string;
    amount: string;
    decimals: number;
    universe: number;
}
```

**Destination:**
```typescript
interface Destination {
    chainID: number;
    tokenContract: string;
    amount: string;
    decimals: number;
    gas: bigint;
    universe: number;
}
```

**Fees:**
```typescript
interface Fees {
    protocol: string;    // Protocol fee (e.g., 0.05%)
    solver: string;      // Solver fee
    collection: string;  // Collection fee
    fulfilment: string;  // Fulfilment fee
    caGas: string;       // Contract Account gas
    gasSupplied: string; // Gas supplied by user
}
```

**Intent Lifecycle:**
1. **Creation**: SDK creates intent based on operation parameters
2. **Simulation**: Intent is simulated to calculate fees and routes
3. **Approval**: Hooks can approve/modify intent
4. **Execution**: Intent is converted to transactions
5. **Fulfilment**: Transactions are executed and monitored

---

### 4. Hook System

**Purpose:** Allow applications to intercept and customize operations

**Hook Types:**

#### Intent Hook
Called when an intent is created, before execution.

```typescript
sdk.setOnIntentHook(({ intent, allow, reject }) => {
    // Show user confirmation dialog
    if (userApproves) {
        allow(); // Proceed with operation
    } else {
        reject(); // Cancel operation
    }
});
```

**Use Cases:**
- User confirmation dialogs
- Fee validation
- Custom routing logic
- Analytics logging

#### Allowance Hook
Called when token approval is needed.

```typescript
sdk.setOnAllowanceHook(({ token, amount, allow }) => {
    // Approve minimum required or maximum
    allow(['min']); // or ['max']
});
```

**Use Cases:**
- Custom approval strategies
- Approval amount optimization
- User approval flows

**Hook Execution Flow:**
```
Operation Request
    ↓
Intent Creation
    ↓
Intent Hook Called ← Application can approve/reject/modify
    ↓
If Approved:
    ↓
Token Approval Needed?
    ↓
Allowance Hook Called ← Application can customize approval
    ↓
Transaction Execution
```

---

## Test Architecture

### Test Structure

```
test/
├── fixtures/          # Test setup and mocks
├── helpers/           # Reusable test utilities
├── operations/        # Operation-specific tests
└── index.test.ts      # Test orchestrator
```

### Test Fixtures

#### `test/fixtures/sdk.ts`
**Purpose:** Centralized SDK instance management

**Key Features:**
- Singleton pattern (one SDK instance per test run)
- Environment polyfills (localStorage, window, etc.)
- Error handling and logging
- Cleanup utilities

**Why Singleton?**
- Faster test execution (no repeated initialization)
- Consistent test state
- Resource efficiency

#### `test/fixtures/provider.ts`
**Purpose:** Mock blockchain provider

**Implementation Details:**
- EIP-1193 compliant interface
- Deterministic test wallet
- Chain switching simulation
- RPC method proxying
- Multiple RPC endpoint fallback

**Mock Wallet:**
```typescript
const TEST_PRIVATE_KEY = '0x' + '1'.repeat(64);
const testWallet = new ethers.Wallet(TEST_PRIVATE_KEY);
```

**Why Mock Provider?**
- No real blockchain needed
- Fast test execution
- Deterministic results
- No gas costs

### Test Helpers

#### `test/helpers/expect.ts`
Custom assertion helpers for common patterns:

```typescript
expectSuccess(result)      // Checks result.success === true
expectTxHash(hash)         // Validates transaction hash format
expectExplorerUrl(url)     // Validates explorer URL
```

#### `test/helpers/hooks.ts`
Pre-built hook implementations for testing:

```typescript
createAutoApproveIntentHook()    // Auto-approves all intents
createAutoApproveAllowanceHook() // Auto-approves allowances
```

---

## Data Flow

### Balance Query Flow

```
Application
    ↓
sdk.getUnifiedBalances()
    ↓
SDK queries multiple RPCs in parallel
    ↓
┌──────────┬──────────┬──────────┐
│ Chain 1  │ Chain 2  │ Chain 3  │
│ RPC      │ RPC      │ RPC      │
└────┬─────┴────┬─────┴────┬─────┘
     │          │          │
     └──────────┼──────────┘
                ↓
     Aggregate by token symbol
                ↓
     Calculate USD values
                ↓
     Return unified balances
```

### Transfer Flow

```
Application
    ↓
sdk.simulateTransfer(params)
    ↓
Check destination chain balance
    ↓
    ├─ Has balance? → Direct Transfer Path
    │                    ↓
    │              Single transaction
    │                    ↓
    │              Return simulation
    │
    └─ No balance? → CA Fallback Path
                         ↓
                    Create Intent
                         ↓
                    Intent Hook
                         ↓
                    Bridge tokens
                         ↓
                    Transfer tokens
                         ↓
                    Return result
```

### Bridge Flow

```
Application
    ↓
sdk.simulateBridge(params)
    ↓
Query fee store (protocol fees)
    ↓
Query oracle prices
    ↓
Calculate required amount (amount + fees)
    ↓
Find source chains with balance
    ↓
Create Intent
    ├─ Sources: Available chains
    ├─ Destination: Target chain
    └─ Fees: All calculated fees
    ↓
Return Simulation Result
    ↓
[If executing]
    ↓
Intent Hook
    ↓
Execute bridge transaction
    ↓
Monitor fulfilment
    ↓
Return result
```

---

## Operation Types

### 1. Balance Operations

**Purpose:** Query token balances across chains

**Methods:**
- `getUnifiedBalances()` - All tokens
- `getUnifiedBalance()` - Specific token

**Returns:**
```typescript
interface Asset {
    symbol: string;
    balance: string;           // Human-readable balance
    balanceInFiat: number;    // USD value
    decimals: number;
    icon: string;
    abstracted: boolean;      // Is it a unified token?
    breakdown: Balance[];      // Per-chain breakdown
}
```

**Example:**
```typescript
const balances = await sdk.getUnifiedBalances(true);
// Returns: [
//   { symbol: 'USDC', balance: '37.52', balanceInFiat: 37.51, ... },
//   { symbol: 'ETH', balance: '0.0001', balanceInFiat: 0.32, ... }
// ]
```

### 2. Transfer Operations

**Purpose:** Send tokens to an address

**Optimization Strategies:**
- **Direct**: If balance exists on destination
- **CA**: If balance needs bridging first

**Parameters:**
```typescript
interface TransferParams {
    token: string;           // Token symbol
    amount: string;          // Amount to transfer
    chainId: number;        // Destination chain
    recipient: string;       // Recipient address
}
```

**Result:**
```typescript
interface SimulationResult {
    intent?: Intent;         // If CA is used
    metadata?: {
        optimization: 'direct' | 'ca';
    };
    fees?: Fees;
}
```

### 3. Bridge Operations

**Purpose:** Move tokens between chains

**Process:**
1. Calculate total needed (amount + fees)
2. Find source chains with sufficient balance
3. Create intent with sources
4. Execute bridge transaction

**Parameters:**
```typescript
interface BridgeParams {
    token: string;
    amount: string | number;
    chainId: number;         // Destination chain
    sourceChains?: number[]; // Optional: specific sources
}
```

**Fees Breakdown:**
- Protocol fee: Fixed percentage (e.g., 0.05%)
- Solver fee: Dynamic based on route
- Gas fees: Estimated gas costs
- Collection fee: If multiple sources needed

### 4. Swap Operations

**Purpose:** Exchange one token for another

**Supported Aggregators:**
- LiFi
- Bebop
- (More can be added)

**Parameters:**
```typescript
interface SwapParams {
    from: Array<{
        chainId: number;
        amount: bigint;
        tokenAddress: string;
    }>;
    toChainId: number;
    toTokenAddress: string;
}
```

**Swap Modes:**
- **EXACT_IN**: Specify input amount, get variable output
- **EXACT_OUT**: Specify output amount, get variable input

---

## Hook System Details

### Intent Hook

**When Called:**
- After intent creation
- Before transaction execution
- During simulation (if enabled)

**Hook Signature:**
```typescript
type IntentHook = (context: {
    intent: Intent;
    allow: () => void;
    reject: () => void;
    modify?: (newIntent: Intent) => void;
}) => void;
```

**Example Usage:**
```typescript
sdk.setOnIntentHook(({ intent, allow, reject }) => {
    // Show user confirmation
    const totalCost = calculateTotalCost(intent);
    
    if (confirm(`Bridge ${totalCost} USDC?`)) {
        allow();
    } else {
        reject();
    }
});
```

### Allowance Hook

**When Called:**
- When token approval is needed
- Before approval transaction

**Hook Signature:**
```typescript
type AllowanceHook = (context: {
    token: string;
    amount: string;
    spender: string;
    allow: (strategy: 'min' | 'max' | string[]) => void;
}) => void;
```

**Example Usage:**
```typescript
sdk.setOnAllowanceHook(({ token, amount, allow }) => {
    // Approve minimum required
    allow(['min']);
    
    // Or approve maximum for future operations
    // allow(['max']);
});
```

---

## Testing Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- One assertion per test concept

### 2. Setup and Teardown
```typescript
describe('My Tests', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
    });

    after(async () => {
        await resetSDK();
    });
});
```

### 3. Error Handling
```typescript
it('should handle errors gracefully', async function () {
    try {
        await sdk.someOperation();
    } catch (error) {
        // Handle expected errors
        if (error.message?.includes('expected')) {
            expect(error).to.be.an('error');
        } else {
            throw error; // Re-throw unexpected
        }
    }
});
```

### 4. Timeout Management
```typescript
it('should complete slow operation', async function () {
    this.timeout(60_000); // 60 seconds
    // ... test code
});
```

### 5. Mocking and Stubbing
```typescript
import sinon from 'sinon';

it('should call hook', async () => {
    const spy = sinon.spy();
    sdk.setOnIntentHook(spy);
    
    await sdk.simulateBridge({ ... });
    
    // Verify hook was called
    expect(spy).to.have.been.called;
});
```

---

## Common Patterns

### Pattern 1: Simulation Before Execution
```typescript
// Always simulate first
const sim = await sdk.simulateBridge({ ... });

// Check fees and routes
console.log('Fees:', sim.intent.fees);
console.log('Sources:', sim.intent.sources);

// Then execute if user approves
if (userApproves) {
    const result = await sdk.bridge({ ... });
}
```

### Pattern 2: Error Recovery
```typescript
try {
    const result = await sdk.bridge({ ... });
    if (result.success) {
        // Handle success
    } else {
        // Handle failure
        console.error('Bridge failed:', result.error);
    }
} catch (error) {
    // Handle unexpected errors
    if (error.message?.includes('network')) {
        // Retry logic
    } else {
        throw error;
    }
}
```

### Pattern 3: Hook Chaining
```typescript
// Set multiple hooks
sdk.setOnIntentHook(({ intent, allow }) => {
    logIntent(intent);
    allow();
});

sdk.setOnAllowanceHook(({ allow }) => {
    allow(['min']);
});
```

---

## Performance Considerations

### 1. Parallel Queries
SDK queries multiple chains in parallel for balance operations.

### 2. Caching
- Balance queries may be cached
- Fee store is cached
- Oracle prices are cached

### 3. Batch Operations
Multiple operations can be batched when possible.

### 4. Connection Pooling
RPC connections are pooled for efficiency.

---

## Security Considerations

### 1. Private Keys
- Never expose private keys
- Use secure key management
- Test provider uses deterministic test key (safe for tests only)

### 2. Transaction Signing
- All transactions require explicit user approval
- Hooks provide approval points
- Never auto-approve in production

### 3. Input Validation
- SDK validates all inputs
- Address format validation
- Amount validation
- Chain ID validation

### 4. Error Handling
- Never expose sensitive error details
- Log errors securely
- Handle network failures gracefully

---

## Conclusion

This architecture provides:
- **Abstraction**: Hide blockchain complexity
- **Flexibility**: Support multiple chains and operations
- **Safety**: Hooks and validation ensure security
- **Performance**: Parallel queries and caching
- **Testability**: Mock providers enable fast tests

For more information, see:
- [README.md](../README.md) - Beginner-friendly guide
- Test files - Practical examples
- SDK source code - Implementation details

