# Test Suite Guide

This guide explains all the test files in the Nexus SDK test suite.

## Test Files Overview

### Core Operation Tests

#### 1. **wallet-connect.test.ts** - Wallet Connection Tests
Tests SDK initialization and wallet connection functionality.

**What it tests:**
- SDK initialization with provider
- Wallet connection and address retrieval
- Provider connection handling
- Wallet disconnection handling
- Multiple wallet connections
- Provider validation
- Connection state maintenance
- Network switching

**Key Test Cases:**
- `should initialize SDK with provider` - Verifies SDK can be initialized
- `should connect wallet and get address` - Tests wallet connection
- `should handle wallet disconnection gracefully` - Tests cleanup
- `should support multiple wallet connections` - Tests multiple providers
- `should handle network switching` - Tests chain switching

---

#### 2. **fast-bridge.test.ts** - Fast Bridge Operations
Tests optimized bridge operations for speed.

**What it tests:**
- Fast bridge simulation
- Fast bridge execution with optimized routes
- Fee comparison between fast and regular bridge
- Multiple source chain optimization
- Route optimization for speed

**Key Test Cases:**
- `should simulate fast bridge` - Tests fast bridge simulation
- `should execute fast bridge with optimized route` - Tests execution
- `should compare fast bridge vs regular bridge fees` - Compares fees
- `should optimize bridge route for speed` - Tests route optimization

**Fast Bridge Features:**
- Uses optimized source chains
- Faster execution times
- Lower fees (in some cases)
- Better route selection

---

#### 3. **bridge-execute.test.ts** - Bridge Simulation and Execution
Tests the complete bridge workflow: simulate then execute.

**What it tests:**
- Bridge simulation before execution
- Intent validation before execution
- Execution with custom source chains
- Error handling during execution
- Execution status tracking

**Key Test Cases:**
- `should simulate bridge then execute` - Complete workflow test
- `should validate intent before execution` - Intent validation
- `should execute bridge with custom source chains` - Custom sources
- `should handle bridge execution errors gracefully` - Error handling
- `should track bridge execution status` - Status tracking

**Workflow:**
1. Simulate bridge to get intent and fees
2. Validate intent structure
3. Execute bridge with simulation data
4. Track execution status

---

#### 4. **swap.test.ts** - Token Swap Operations
Tests token swapping functionality (enhanced with new tests).

**What it tests:**
- Listing supported swap sources
- EXACT_IN swap execution
- Swap simulation before execution
- Different token pair handling
- Parameter validation

**Key Test Cases:**
- `should list supported swap sources` - Lists available DEXes
- `should perform EXACT_IN swap` - Executes swap
- `should simulate swap before execution` - Tests simulation
- `should handle swap with different token pairs` - Token pair tests
- `should validate swap parameters` - Parameter validation

**Swap Features:**
- Multiple DEX aggregator support
- EXACT_IN mode (specify input, get variable output)
- Route optimization
- Fee calculation

---

#### 5. **unified-balance.test.ts** - Unified Balance Operations
Comprehensive tests for unified balance functionality.

**What it tests:**
- Getting unified balances across all chains
- Including/excluding swappable tokens
- Specific token balance retrieval
- Balance aggregation by symbol
- Balance breakdown by chain
- USD value calculation
- Empty balance handling
- Consistent balance data
- Swappable token filtering
- Balance metadata

**Key Test Cases:**
- `should get unified balances across all chains` - Basic balance query
- `should get unified balances including swappable tokens` - Swappable tokens
- `should get specific token unified balance` - Single token query
- `should aggregate balances by token symbol` - Aggregation test
- `should show balance breakdown by chain` - Per-chain breakdown
- `should calculate USD value for unified balances` - USD conversion
- `should filter balances by swappable flag` - Filtering test

**Unified Balance Features:**
- Aggregates balances across all chains
- Shows per-chain breakdown
- Calculates USD values
- Filters by swappable tokens
- Provides metadata (icons, decimals, etc.)

---

#### 6. **events.test.ts** - Event Management
Tests SDK event system and lifecycle tracking.

**What it tests:**
- Event emission during operations
- Intent events through hooks
- Operation lifecycle events
- Multiple event listeners
- Balance update events
- Event cleanup
- Error event tracking

**Key Test Cases:**
- `should emit events during operations` - Event emission
- `should handle intent events through hooks` - Hook-based events
- `should track operation lifecycle events` - Lifecycle tracking
- `should handle multiple event listeners` - Multiple listeners
- `should emit balance update events` - Balance events
- `should handle event cleanup` - Cleanup test
- `should track error events` - Error tracking

**Event System:**
- Uses hooks as event system
- Tracks operation lifecycle
- Handles errors gracefully
- Supports multiple listeners

---

### Existing Test Files

#### 7. **balance.test.ts** - Basic Balance Operations
Basic balance query tests (complemented by unified-balance.test.ts).

#### 8. **bridge.test.ts** - Basic Bridge Operations
Basic bridge tests (complemented by bridge-execute.test.ts and fast-bridge.test.ts).

#### 9. **transfer.test.ts** - Transfer Operations
Tests direct transfers and CA fallback.

#### 10. **hooks.test.ts** - Hook System
Tests intent and allowance hooks.

#### 11. **utils.test.ts** - Utility Functions
Tests utility functions (formatting, validation, etc.).

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx mocha test/operations/wallet-connect.test.ts
```

### Run Tests Matching Pattern
```bash
npx mocha test/operations/ --grep "wallet"
```

### Watch Mode
```bash
npm run test:watch
```

---

## Test Organization

```
test/
├── fixtures/              # Test setup
│   ├── provider.ts       # Mock blockchain provider
│   └── sdk.ts           # SDK initialization
├── helpers/              # Test utilities
│   ├── expect.ts        # Custom assertions
│   └── hooks.ts         # Hook helpers
├── operations/           # Operation tests
│   ├── wallet-connect.test.ts      # NEW: Wallet connection
│   ├── fast-bridge.test.ts          # NEW: Fast bridge
│   ├── bridge-execute.test.ts       # NEW: Bridge workflow
│   ├── unified-balance.test.ts      # NEW: Unified balances
│   ├── events.test.ts               # NEW: Event management
│   ├── balance.test.ts              # Basic balances
│   ├── bridge.test.ts               # Basic bridge
│   ├── transfer.test.ts             # Transfers
│   └── swap.test.ts                 # Swaps (enhanced)
├── hooks.test.ts         # Hook system
├── utils.test.ts         # Utilities
└── index.test.ts         # Test orchestrator
```

---

## Test Patterns

### Pattern 1: Setup and Teardown
```typescript
describe('Feature', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
    });

    after(async () => {
        await resetSDK();
    });
});
```

### Pattern 2: Error Handling
```typescript
try {
    const result = await sdk.someOperation();
    expect(result).to.have.property('success');
} catch (error: any) {
    // Handle expected errors in test environment
    if (error.message?.includes('expected')) {
        expect(error).to.be.an('error');
    } else {
        throw error;
    }
}
```

### Pattern 3: Timeout Management
```typescript
it('should do something', async function () {
    this.timeout(60_000); // 60 seconds
    // ... test code
});
```

---

## Test Coverage

### ✅ Covered Areas

1. **Wallet Connection**
   - Initialization
   - Connection handling
   - Disconnection
   - Multiple providers

2. **Bridge Operations**
   - Regular bridge
   - Fast bridge
   - Bridge simulation
   - Bridge execution
   - Error handling

3. **Swap Operations**
   - Swap sources
   - EXACT_IN swaps
   - Simulation
   - Parameter validation

4. **Balance Operations**
   - Unified balances
   - Per-chain breakdown
   - USD conversion
   - Swappable tokens

5. **Event Management**
   - Event emission
   - Lifecycle tracking
   - Error events
   - Event cleanup

6. **Transfer Operations**
   - Direct transfers
   - CA fallback
   - Optimization

---

## Best Practices

1. **Always simulate before executing** - Get fees and routes first
2. **Handle test environment limitations** - Some operations may fail
3. **Use appropriate timeouts** - Some operations take time
4. **Clean up resources** - Reset SDK after tests
5. **Test error cases** - Verify error handling
6. **Use descriptive test names** - Make tests self-documenting
7. **Log important information** - Help with debugging

---

## Common Issues

### Issue: Tests Timeout
**Solution:** Increase timeout: `this.timeout(120_000)`

### Issue: SDK Not Initialized
**Solution:** Ensure `getSDK()` is called in `before()` hook

### Issue: Connection Errors
**Solution:** Tests handle these gracefully - check error messages

### Issue: Balance Issues
**Solution:** Expected in test environment - tests verify error handling

---

## Adding New Tests

When adding new tests:

1. **Follow existing patterns** - Use similar structure
2. **Add to appropriate file** - Or create new file if needed
3. **Update index.test.ts** - Import new test file
4. **Handle test environment** - Account for limitations
5. **Add documentation** - Update this guide

---

## Test Results

Run tests to see current status:
```bash
npm test
```

Expected output:
- ✅ Passing tests
- ⚠️ Tests that handle expected failures
- ❌ Actual failures (should be investigated)

---

## Next Steps

1. Run all tests: `npm test`
2. Review test output
3. Check specific test files for examples
4. Add more tests as needed
5. Update documentation

Happy testing! 🚀

