#!/usr/bin/env node

/**
 * Test report generation script
 * Generates various test reports and ensures proper cleanup
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    console.log('✅ Created reports directory');
}

// Generate report summary
const generateSummary = () => {
    const summaryPath = path.join(REPORTS_DIR, 'test-summary.txt');
    const timestamp = new Date().toISOString();
    
    const summary = `
Test Report Summary
===================
Generated: ${timestamp}

Report Files:
- HTML Report: reports/nexus-core-full-report.html
- JSON Report: reports/test-results.json
- Simple Output: reports/test-output.txt

To view HTML report, open: reports/nexus-core-full-report.html
`;
    
    fs.writeFileSync(summaryPath, summary);
    console.log('✅ Generated test summary');
};

// Run if called directly
if (require.main === module) {
    generateSummary();
}

module.exports = { generateSummary };

