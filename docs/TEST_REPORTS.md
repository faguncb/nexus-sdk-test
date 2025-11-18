# Test Report Generation Guide

This guide explains how to generate test reports and ensure tests complete properly.

## Report Generation

### HTML Report (Mochawesome)
Generate a beautiful HTML report with charts and detailed test information:

```bash
npm run test:report
```

This generates:
- `reports/nexus-core-full-report.html` - Interactive HTML report
- `reports/test-summary.txt` - Summary file

**Features:**
- Visual charts and graphs
- Test duration tracking
- Pass/fail statistics
- Detailed error messages
- Inline assets (no external dependencies)

### JSON Report
Generate a JSON report for programmatic processing:

```bash
npm run test:report:json
```

Output: `reports/test-results.json`

**Use cases:**
- CI/CD integration
- Automated test analysis
- Test result parsing
- Integration with other tools

### Simple Text Report
Generate a simple text-based report:

```bash
npm run test:report:simple
```

Output: `reports/test-output.txt`

**Use cases:**
- Quick review
- Log files
- Simple text processing

### All Reports
Generate all report types at once:

```bash
npm run test:report:all
```

## Preventing Test Hangs

### Automatic Exit
All test commands include `--exit` flag to ensure Mocha exits after tests complete:

```bash
npm test  # Includes --exit flag
```

### Global Timeout
- Default timeout: 180 seconds (3 minutes)
- Individual test timeouts: 60-120 seconds
- Global timeout handler: Forces exit if tests exceed timeout

### Cleanup Mechanisms

1. **Process Handlers**
   - SIGINT handler (Ctrl+C)
   - SIGTERM handler
   - Unhandled rejection handler
   - Uncaught exception handler

2. **SDK Cleanup**
   - SDK instances are properly cleaned up
   - Provider connections are closed
   - Event listeners are removed

3. **Test Timeouts**
   - Each test has appropriate timeout
   - Long-running operations have extended timeouts
   - Global timeout prevents infinite hangs

## Report Structure

### HTML Report Structure
```
reports/
├── nexus-core-full-report.html  # Main HTML report
├── assets/                        # Report assets (if not inlined)
└── test-summary.txt              # Summary file
```

### JSON Report Structure
```json
{
  "stats": {
    "suites": 10,
    "tests": 50,
    "passes": 48,
    "pending": 0,
    "failures": 2,
    "duration": 120000
  },
  "tests": [...],
  "pending": [...],
  "failures": [...],
  "passes": [...]
}
```

## Troubleshooting

### Tests Hang/Don't Complete

**Solution 1:** Check for hanging async operations
```bash
# Run with verbose output
npm test -- --reporter spec
```

**Solution 2:** Check individual test timeouts
- Ensure all tests have `this.timeout()` set
- Increase timeout for slow operations

**Solution 3:** Force exit
```bash
# Tests will exit after completion
npm test  # Already includes --exit
```

### Report Generation Fails

**Solution 1:** Ensure reports directory exists
```bash
mkdir -p reports
npm run test:report
```

**Solution 2:** Check mochawesome installation
```bash
npm install --save-dev mochawesome
```

**Solution 3:** Generate JSON report instead
```bash
npm run test:report:json
```

### Tests Timeout

**Solution:** Increase timeout for specific test
```typescript
it('should do something', async function () {
    this.timeout(120_000); // 2 minutes
    // ... test code
});
```

## Best Practices

1. **Always use `--exit` flag** - Ensures tests complete
2. **Set appropriate timeouts** - Balance between too short and too long
3. **Generate reports regularly** - Track test health over time
4. **Check reports directory** - Ensure it's in .gitignore
5. **Use JSON reports for CI/CD** - Easier to parse programmatically

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests and generate report
  run: |
    npm test
    npm run test:report:json
    
- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: reports/
```

### GitLab CI Example
```yaml
test:
  script:
    - npm test
    - npm run test:report:json
  artifacts:
    paths:
      - reports/
    expire_in: 1 week
```

## Report Viewing

### HTML Report
Open in browser:
```bash
open reports/nexus-core-full-report.html
# or
xdg-open reports/nexus-core-full-report.html  # Linux
```

### JSON Report
Parse programmatically:
```javascript
const results = require('./reports/test-results.json');
console.log(`Passed: ${results.stats.passes}`);
console.log(`Failed: ${results.stats.failures}`);
```

## Summary

- **HTML Reports**: Best for human review
- **JSON Reports**: Best for automation
- **Text Reports**: Best for logs
- **All reports**: Use `npm run test:report:all`

All test commands ensure proper completion with `--exit` flag and timeout handling.

