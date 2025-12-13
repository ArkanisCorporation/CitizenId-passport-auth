# Examples

This directory contains example applications demonstrating how to use `passport-citizenid`.

For general documentation about `passport-citizenid`, including installation, configuration, and API reference, see the [main README](../README.md).

## Available Examples

### Express.js Example

The `express-example` directory contains a complete Express.js application with Citizen iD authentication.

**Features:**
- Full Express.js integration
- Session management
- User profile display with EJS templates
- Protected routes
- Error handling

See the [express-example README](./express-example/README.md) for setup and usage instructions.

**Files:**
- `src/server.ts` - Main Express application
- `src/standalone-example.ts` - Simpler standalone example
- `views/` - EJS templates for rendering

### Getting Started

1. Navigate to the example directory:
```bash
cd express-example
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (see the example's README for details)

4. Run the example:
```bash
npm start
```

For detailed setup instructions, see the [express-example README](./express-example/README.md).
