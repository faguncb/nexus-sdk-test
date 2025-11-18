// Import timeout helpers at the very beginning
import './helpers/test-timeout';

// Import all test files
import './operations/balance.test';
import './operations/bridge.test';
import './operations/bridge-execute.test';
import './operations/fast-bridge.test';
import './operations/transfer.test';
import './operations/swap.test';
import './operations/unified-balance.test';
import './operations/wallet-connect.test';
import './utils.test';
import './hooks.test';
import './operations/events.test';

// Ensure process exits after tests complete
process.on('exit', (code) => {
    console.log(`\n✅ Test process exiting with code: ${code}`);
});
