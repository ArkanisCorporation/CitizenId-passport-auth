# Examples

This directory contains example applications demonstrating how to use `passport-citizenid`.

## Express.js Example

The `express-example.js` file demonstrates a complete Express.js application with CitizenID authentication.

### Setup

1. Install dependencies:
```bash
npm install express express-session passport
```

2. Set environment variables:
```bash
export CITIZENID_CLIENT_ID="your-client-id"
export CITIZENID_CLIENT_SECRET="your-client-secret"  # Optional for public clients
export CALLBACK_URL="http://localhost:3000/auth/citizenid/callback"
export SESSION_SECRET="your-session-secret"
```

3. Run the example:
```bash
node examples/express-example.js
```

4. Visit `http://localhost:3000` in your browser and click "Login with CitizenID"

### Features Demonstrated

- Basic authentication flow
- Session management
- User profile display
- Role-based access
- Protected routes
- Logout functionality

### Notes

- The example uses in-memory sessions. In production, use a proper session store (e.g., Redis, MongoDB).
- User data is stored in the session. In production, store user data in a database.
- The example includes basic HTML for demonstration. In production, use a proper templating engine or frontend framework.
