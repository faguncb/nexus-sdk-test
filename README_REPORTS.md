# Test Report Generation

## Quick Start

Generate HTML report:
```bash
npm run test:report
```

Generate JSON report:
```bash
npm run test:report:json
```

Generate all reports:
```bash
npm run test:report:all
```

## Available Commands

- `npm test` - Run tests with auto-exit (prevents hanging)
- `npm run test:report` - Generate HTML report (Mochawesome)
- `npm run test:report:json` - Generate JSON report
- `npm run test:report:simple` - Generate simple text report
- `npm run test:report:all` - Generate all report types

## Report Locations

All reports are generated in the `reports/` directory:
- `reports/nexus-core-full-report.html` - HTML report
- `reports/test-results.json` - JSON report
- `reports/test-output.txt` - Text report
- `reports/test-summary.txt` - Summary file

## Preventing Test Hangs

All test commands include:
- `--exit` flag - Ensures Mocha exits after tests complete
- Global timeout (180 seconds) - Prevents infinite hangs
- Process handlers - Clean shutdown on SIGINT/SIGTERM
- SDK cleanup - Proper resource cleanup

## Viewing Reports

### HTML Report
Open in your browser:
```bash
open reports/nexus-core-full-report.html
```

### JSON Report
Parse programmatically or view as text:
```bash
cat reports/test-results.json | jq .
```

## Troubleshooting

**Tests hang?**
- Check for async operations without proper cleanup
- Verify all tests have appropriate timeouts
- Use `--exit` flag (already included in npm scripts)

**Report generation fails?**
- Ensure `reports/` directory exists (created automatically)
- Install mochawesome: `npm install --save-dev mochawesome`
- Check file permissions

For more details, see [docs/TEST_REPORTS.md](./docs/TEST_REPORTS.md)

