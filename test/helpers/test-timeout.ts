/**
 * Test timeout and cleanup helpers
 * Ensures tests complete and don't hang
 */

// Global timeout handler
let timeoutId: NodeJS.Timeout | null = null;

export const setupGlobalTimeout = (timeoutMs: number = 180000) => {
    // Set a global timeout to force exit if tests hang
    timeoutId = setTimeout(() => {
        console.error('\n⚠️  Tests exceeded global timeout. Forcing exit...');
        process.exit(1);
    }, timeoutMs + 10000); // Add 10s buffer to global timeout
};

export const clearGlobalTimeout = () => {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
};

// Process handlers to ensure cleanup
process.on('exit', () => {
    clearGlobalTimeout();
});

process.on('SIGINT', () => {
    clearGlobalTimeout();
    process.exit(0);
});

process.on('SIGTERM', () => {
    clearGlobalTimeout();
    process.exit(0);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit, but log the error
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    clearGlobalTimeout();
    process.exit(1);
});
