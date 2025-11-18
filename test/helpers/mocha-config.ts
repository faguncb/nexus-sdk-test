/**
 * Mocha configuration and hooks
 * Ensures proper test cleanup and completion
 */

import { clearGlobalTimeout, setupGlobalTimeout } from './test-timeout';

// Setup global timeout at start
setupGlobalTimeout(180000); // 3 minutes

// After all tests, ensure cleanup
export const mochaHooks = {
    afterAll(done: () => void) {
        // Clear global timeout
        clearGlobalTimeout();
        
        // Small delay to ensure all async operations complete
        setTimeout(() => {
            done();
        }, 100);
    }
};

