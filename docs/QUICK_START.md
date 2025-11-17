# Quick Start Guide

Get up and running with the Nexus SDK test suite in minutes!

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test:watch
```

### Generate Test Report
```bash
npm run test:report
```

## Understanding Test Output

### Successful Test
```
✔ should get unified balances (537ms)
```

### Failed Test
```
✖ should get unified balances
  Error: SDK not initialized
```

### Test Summary
```
13 passing (18s)
```

## Common Commands

```bash
# Run specific test file
npx mocha test/operations/balance.test.ts

# Run with verbose output
npm test -- --reporter spec

# Run single test
npx mocha test/operations/balance.test.ts --grep "should get unified balances"
```

## Test Structure

Each test file follows this pattern:

```typescript
import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { getSDK } from '../fixtures/sdk';

describe('Feature Name', () => {
    let sdk: any;

    before(async () => {
        sdk = await getSDK();
    });

    it('should do something', async () => {
        const result = await sdk.someMethod();
        expect(result).to.have.property('success');
    });
});
```

## Next Steps

1. Read [README.md](../README.md) for detailed explanations
2. Explore [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
3. Check test files for examples
4. Start writing your own tests!

## Troubleshooting

**Problem:** Tests timeout
**Solution:** Increase timeout: `this.timeout(60_000)`

**Problem:** SDK not initialized
**Solution:** Make sure `getSDK()` is called in `before()` hook

**Problem:** Connection errors
**Solution:** Check your internet connection and RPC endpoints

## Getting Help

- Check test files for examples
- Read the main README.md
- Review architecture documentation
- Check SDK source code comments

