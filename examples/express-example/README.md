# Citizen iD Passport Example - Express.js

This is a complete example application demonstrating how to use `passport-citizenid` with Express.js.

For general documentation about `passport-citizenid`, including installation, configuration options, and API reference, see the [main README](../README.md).

## Features Demonstrated

- Express.js integration with passport-citizenid
- Session management with express-session
- User profile display with EJS templates
- Access and refresh token handling
- Protected routes
- Error handling

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and add your Citizen iD credentials:

```env
CITIZENID_CLIENT_ID=your-client-id-here
CITIZENID_CLIENT_SECRET=your-client-secret-here
CITIZENID_CALLBACK_URL=http://localhost:3000/auth/citizenid/callback
SESSION_SECRET=change-this-to-a-random-secret
```

### 3. Get Citizen iD Credentials

To get your Citizen iD OAuth2 credentials, see the [Getting Client Credentials](../README.md#getting-client-credentials) section in the main README.

You'll need to:

1. Create or log into your Citizen iD account
2. Register a new application
3. Set the callback URL to: `http://localhost:3000/auth/citizenid/callback`
4. Note your Client ID and Client Secret

### 4. Run the Application

**Production:**

```bash
npm start
```

**Development (with TypeScript compilation and auto-reload):**

```bash
npm run dev
```

**Development (direct TypeScript execution, faster):**

```bash
npm run dev:ts
```

The application will be available at: <http://localhost:3000>

## Project Structure

```
express-example/
├── src/
│   └── server.ts       # Main application file (TypeScript source)
├── dist/               # Compiled JavaScript (generated)
├── views/              # EJS templates
│   ├── home.ejs        # Home page
│   ├── login.ejs       # Login page
│   ├── profile.ejs     # User profile page
│   └── error.ejs       # Error page
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
├── .env.example        # Environment variables template
├── .env                # Your local environment (git-ignored)
└── README.md           # This file
```

## Routes

- `GET /` - Home page (shows login button or user info)
- `GET /login` - Login page
- `GET /auth/citizenid` - Initiates OAuth flow with Citizen iD
- `GET /auth/citizenid/callback` - OAuth callback endpoint
- `GET /profile` - User profile page (requires authentication)
- `GET /logout` - Logout and clear session

## How This Example Works

This example demonstrates a typical Express.js application using `passport-citizenid`:

1. **Session Management**: Uses `express-session` to store user data in the session
2. **Protected Routes**: The `/profile` route is protected by the `ensureAuthenticated` middleware
3. **Templates**: Uses EJS templates for rendering views

For details on the OAuth 2.0 authentication flow, see the [Authenticate Requests](../README.md#authenticate-requests) section in the main README.

## Customization

### Changing Scopes and Using Constants

For detailed information about available scopes, endpoint constants, and role constants, see the [Using Constants](../README.md#using-constants) section in the main README.

The example demonstrates using scope constants in `src/server.ts`. You can modify the scope array to request different permissions.

### Custom Authorization Parameters

For information on custom authorization parameters, see the [Custom Authorization Parameters](../README.md#custom-authorization-parameters) section in the main README.

## Security Considerations

For general security best practices, see the [Security Considerations](../README.md#security-considerations) section in the main README.

## Troubleshooting

### "Missing credentials" error

Make sure your `.env` file is properly configured with valid `CITIZENID_CLIENT_ID` and `CITIZENID_CLIENT_SECRET`.

### "Callback URL mismatch" error

Ensure the callback URL in your `.env` file matches the one registered in your Citizen iD application settings.

### Session not persisting

Check that:

1. `express-session` is properly configured
2. Cookie settings are appropriate for your environment
3. Session secret is set

## Learn More

For more information, see the [README](../README.md) and its [Related Resources](../README.md#related-resources) section.
