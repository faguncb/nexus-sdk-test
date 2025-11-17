# Documentation Index

Welcome to the Nexus SDK documentation! This directory contains comprehensive guides to help you understand and work with the SDK.

## 📚 Documentation Files

### [Quick Start Guide](./QUICK_START.md)
**Start here if you're new!** Get up and running in minutes with step-by-step instructions.

**Covers:**
- Installation
- Running tests
- Understanding test output
- Common commands
- Troubleshooting

---

### [Main README](../README.md)
**Beginner-friendly comprehensive guide** explaining the SDK and test suite.

**Covers:**
- What is the Nexus SDK?
- Project structure
- SDK components explained
- Test suite overview
- Understanding each test file
- Key concepts (unified balances, intents, CA, etc.)
- Common test patterns

**Best for:**
- Understanding the big picture
- Learning SDK concepts
- Seeing practical examples
- Getting started with testing

---

### [Architecture Guide](./ARCHITECTURE.md)
**Deep technical dive** into SDK architecture and implementation details.

**Covers:**
- SDK architecture overview
- Core components deep dive
- Test architecture
- Data flow diagrams
- Operation types explained
- Hook system details
- Performance considerations
- Security considerations

**Best for:**
- Understanding how things work internally
- Contributing to the SDK
- Debugging complex issues
- Optimizing performance

---

## 🎯 Which Document Should I Read?

### I'm completely new
1. Start with [Quick Start Guide](./QUICK_START.md)
2. Then read [Main README](../README.md)
3. Explore test files to see examples

### I want to understand how it works
1. Read [Main README](../README.md) for concepts
2. Check [Architecture Guide](./ARCHITECTURE.md) for details
3. Read through test files

### I want to contribute
1. Read [Architecture Guide](./ARCHITECTURE.md)
2. Study test files
3. Check SDK source code

### I just want to run tests
1. Read [Quick Start Guide](./QUICK_START.md)
2. Run `npm test`
3. Check test files for examples

---

## 📖 Reading Order Recommendations

### For Beginners
```
1. Quick Start Guide
   ↓
2. Main README (focus on "What is SDK" and "Key Concepts")
   ↓
3. Look at test files
   ↓
4. Try modifying tests
```

### For Developers
```
1. Quick Start Guide
   ↓
2. Main README (all sections)
   ↓
3. Architecture Guide (all sections)
   ↓
4. Test files (study patterns)
   ↓
5. SDK source code
```

### For Contributors
```
1. Architecture Guide (deep read)
   ↓
2. Test files (understand patterns)
   ↓
3. SDK source code
   ↓
4. Write new tests
```

---

## 🔍 Quick Reference

### Common Tasks

**Run tests:**
```bash
npm test
```

**Watch mode:**
```bash
npm run test:watch
```

**Generate report:**
```bash
npm run test:report
```

### Key Concepts

- **Unified Balances**: Aggregated balances across all chains
- **Intent**: Planned operation before execution
- **CA (Contract Account)**: Smart contract wallet system
- **Hooks**: Callbacks for customizing operations
- **Simulation**: Testing operations without execution

### File Locations

- **Main README**: `/README.md`
- **Quick Start**: `/docs/QUICK_START.md`
- **Architecture**: `/docs/ARCHITECTURE.md`
- **Tests**: `/test/` directory
- **Fixtures**: `/test/fixtures/`
- **Helpers**: `/test/helpers/`

---

## 💡 Tips

1. **Start Simple**: Begin with balance tests, they're the easiest
2. **Read Tests**: Test files are great examples of SDK usage
3. **Experiment**: Modify test parameters to see what happens
4. **Check Logs**: Enable debug mode to see detailed logs
5. **Ask Questions**: Test files have comments explaining decisions

---

## 🆘 Need Help?

1. Check the [Quick Start Guide](./QUICK_START.md) troubleshooting section
2. Read relevant sections in [Main README](../README.md)
3. Review [Architecture Guide](./ARCHITECTURE.md) for technical details
4. Look at test files for practical examples
5. Check SDK source code comments

---

## 📝 Documentation Updates

This documentation is maintained alongside the SDK. If you find:
- Errors or outdated information
- Missing explanations
- Unclear sections

Please update the documentation or file an issue!

---

Happy coding! 🚀

