# passport-citizenid

[Passport](http://passportjs.org/) strategy for authenticating with [CitizenID](https://citizenid.space/) using the OAuth 2.0 API with OpenID Connect.

This module lets you authenticate using CitizenID in your Node.js applications. By plugging into Passport, CitizenID authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/).

## Installation

```bash
npm install passport-citizenid
```

## Usage

### Configure Strategy

The CitizenID authentication strategy authenticates users using a CitizenID account and OAuth 2.0 tokens with OpenID Connect. The strategy requires a `verify` callback, which accepts these credentials and calls `done` providing a user, as well as `options` specifying a client ID, client secret, and callback URL.

```javascript
const CitizenIDStrategy = require('passport-citizenid').Strategy;

passport.use(new CitizenIDStrategy({
    clientID: CITIZENID_CLIENT_ID,
    clientSecret: CITIZENID_CLIENT_SECRET, // Optional for public clients with PKCE
    callbackURL: "http://localhost:3000/auth/citizenid/callback",
    scope: ['openid', 'profile', 'email', 'roles']
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ citizenId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'citizenid'` strategy, to authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/) application:

```javascript
app.get('/auth/citizenid',
  passport.authenticate('citizenid'));

app.get('/auth/citizenid/callback', 
  passport.authenticate('citizenid', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## Configuration Options

### Required Options

- **clientID**: Your CitizenID application's Client ID
- **callbackURL**: URL to which CitizenID will redirect the user after granting authorization

### Optional Options

- **clientSecret**: Your CitizenID application's Client Secret (optional for public clients using PKCE)
- **scope**: Array of permission scopes to request
  - Default: `['openid', 'profile', 'email']`
  - Available scopes: `openid`, `profile`, `email`, `roles`, `offline_access`
- **authorizationURL**: Authorization endpoint URL
  - Default: `'https://citizenid.space/connect/authorize'`
- **tokenURL**: Token endpoint URL
  - Default: `'https://citizenid.space/connect/token'`
- **userInfoURL**: UserInfo endpoint URL
  - Default: `'https://citizenid.space/connect/userinfo'`
- **pkce**: Enable PKCE (Proof Key for Code Exchange)
  - Default: `true` (recommended for security)
- **state**: Enable state parameter for CSRF protection
  - Default: `true`
- **passReqToCallback**: Pass the request to the verify callback
  - Default: `false`

## Examples

### Basic Express.js Application

```javascript
const express = require('express');
const passport = require('passport');
const CitizenIDStrategy = require('passport-citizenid').Strategy;

const app = express();

// Configure Passport
passport.use(new CitizenIDStrategy({
    clientID: process.env.CITIZENID_CLIENT_ID,
    clientSecret: process.env.CITIZENID_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/citizenid/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // In a real application, you would save the user to your database
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello ${req.user.displayName}! <a href="/logout">Logout</a>`);
  } else {
    res.send('<a href="/auth/citizenid">Login with CitizenID</a>');
  }
});

app.get('/auth/citizenid',
  passport.authenticate('citizenid'));

app.get('/auth/citizenid/callback',
  passport.authenticate('citizenid', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
```

### Public Client with PKCE (No Client Secret)

For public clients (like single-page applications or mobile apps), you can omit the client secret and rely on PKCE:

```javascript
passport.use(new CitizenIDStrategy({
    clientID: process.env.CITIZENID_CLIENT_ID,
    callbackURL: "http://localhost:3000/auth/citizenid/callback",
    pkce: true, // Enabled by default
    scope: ['openid', 'profile', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
```

### Request Offline Access (Refresh Token)

To receive a refresh token, include the `offline_access` scope:

```javascript
passport.use(new CitizenIDStrategy({
    clientID: process.env.CITIZENID_CLIENT_ID,
    clientSecret: process.env.CITIZENID_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/citizenid/callback",
    scope: ['openid', 'profile', 'email', 'roles', 'offline_access']
  },
  function(accessToken, refreshToken, profile, done) {
    // refreshToken will be available here
    console.log('Refresh Token:', refreshToken);
    return done(null, profile);
  }
));
```

### Custom Authorization Parameters

You can pass custom parameters to the authorization request:

```javascript
app.get('/auth/citizenid',
  passport.authenticate('citizenid', {
    nonce: 'random-nonce-value',
    responseMode: 'form_post',
    prompt: 'login' // Force user to re-authenticate
  })
);
```

### TypeScript Usage

```typescript
import { Strategy as CitizenIDStrategy, CitizenIDProfile, CitizenIDStrategyOptions } from 'passport-citizenid';
import passport from 'passport';

const options: CitizenIDStrategyOptions = {
  clientID: process.env.CITIZENID_CLIENT_ID!,
  clientSecret: process.env.CITIZENID_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/citizenid/callback",
  scope: ['openid', 'profile', 'email', 'roles']
};

passport.use(new CitizenIDStrategy(options,
  (accessToken: string, refreshToken: string, profile: CitizenIDProfile, done: any) => {
    // Your user logic here
    return done(null, profile);
  }
));
```

### Accessing User Roles

The CitizenID profile includes user roles when the `roles` scope is requested:

```javascript
passport.use(new CitizenIDStrategy({
    clientID: process.env.CITIZENID_CLIENT_ID,
    clientSecret: process.env.CITIZENID_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/citizenid/callback",
    scope: ['openid', 'profile', 'email', 'roles']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('User roles:', profile.roles);
    // Example roles: ['CitizenId.AccountType.Citizen', 'CitizenId.Integrator']
    
    // Check if user has a specific role
    const isIntegrator = profile.roles.includes('CitizenId.Integrator');
    
    return done(null, profile);
  }
));
```

## Profile Structure

The user profile returned by CitizenID contains the following fields:

```javascript
{
  provider: 'citizenid',
  id: '0199a109-3662-7f83-b155-5bc53db7bf26',
  username: 'thekronny',
  displayName: 'thekronny',
  emails: [
    {
      value: 'kronny4@gmail.com',
      verified: false
    }
  ],
  roles: [
    'CitizenId.AccountType.Citizen',
    'CitizenId.Integrator'
  ],
  photos: [
    {
      value: 'https://...'
    }
  ],
  authorizationId: '0199a3df-6c1a-70e8-acf8-db72fd00a0ff',
  _raw: '...',
  _json: {
    sub: '0199a109-3662-7f83-b155-5bc53db7bf26',
    name: 'thekronny',
    preferred_username: 'thekronny',
    email: 'kronny4@gmail.com',
    role: ['CitizenId.AccountType.Citizen', 'CitizenId.Integrator'],
    // ... other OIDC claims
  }
}
```

## OAuth2 Flows Supported

This strategy supports the following OAuth2 flows:

- **Authorization Code Flow** (with PKCE support)
- **Refresh Token Flow** (when `offline_access` scope is requested)

For more information about CitizenID's OAuth2 implementation, see the [CitizenID OAuth2 Documentation](https://docs.citizenid.space/integrator-guide/oauth2/flows-grants.html).

## Security Considerations

1. **PKCE**: This strategy enables PKCE by default for enhanced security. It's especially important for public clients.

2. **State Parameter**: The state parameter is enabled by default to protect against CSRF attacks.

3. **HTTPS**: Always use HTTPS in production for your callback URLs.

4. **Client Secret**: Keep your client secret secure. Never expose it in client-side code.

5. **Token Storage**: Store refresh tokens securely. Consider encrypting them in your database.

## Testing

You can test the authorization flow using the [OAuth 2.0 Debugger](https://oauthdebugger.com/debug):

1. Set Authorize URI to: `https://citizenid.space/connect/authorize`
2. Use your Client ID
3. Set your callback URL
4. Select the scopes you want to test

## License

[MIT](LICENSE)

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/ArkanisCorporation/CitizenId-passport-auth).

## Related Resources

- [CitizenID Documentation](https://docs.citizenid.space/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OpenID Connect Specification](https://openid.net/connect/)
