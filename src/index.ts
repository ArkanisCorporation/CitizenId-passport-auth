/**
 * Module dependencies.
 */
import { Strategy as OAuth2Strategy, StrategyOptions as OAuth2StrategyOptions, VerifyFunction } from 'passport-oauth2';
import * as jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';

/**
 * User profile information from CitizenID.
 */
export interface CitizenIDProfile {
  provider: 'citizenid';
  id: string;
  username: string;
  displayName: string;
  emails: Array<{
    value: string;
    verified: boolean;
  }>;
  roles: string[];
  photos?: Array<{
    value: string;
  }>;
  authorizationId?: string;
  _customClaims?: Record<string, any>; // Custom claims from scopes like discord.profile, rsi.profile, etc.
  _raw: string;
  _json: CitizenIDUserInfo;
}

/**
 * User info from ID token or userinfo endpoint.
 */
export interface CitizenIDUserInfo {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  role?: string | string[];
  oi_au_id?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  nonce?: string;
  at_hash?: string;
  oi_tkn_id?: string;
  azp?: string;
  // Custom profile claims (available when corresponding scopes are requested)
  [key: `urn:user:${string}`]: any;
}

/**
 * Strategy options for CitizenID authentication.
 */
export interface CitizenIDStrategyOptions {
  /**
   * Your CitizenID application's client ID.
   */
  clientID: string;
  
  /**
   * Your CitizenID application's client secret.
   * Optional for public clients using PKCE.
   */
  clientSecret?: string;
  
  /**
   * URL to which CitizenID will redirect the user after authorization.
   */
  callbackURL: string;
  
  /**
   * Array of permission scopes to request.
   * @default ['openid', 'profile', 'email']
   */
  scope?: string[];
  
  /**
   * Authorization endpoint URL.
   * @default 'https://citizenid.space/connect/authorize'
   */
  authorizationURL?: string;
  
  /**
   * Token endpoint URL.
   * @default 'https://citizenid.space/connect/token'
   */
  tokenURL?: string;
  
  /**
   * UserInfo endpoint URL.
   * @default 'https://citizenid.space/connect/userinfo'
   */
  userInfoURL?: string;
  
  /**
   * Enable PKCE (Proof Key for Code Exchange).
   * @default true
   */
  pkce?: boolean;
  
  /**
   * Enable state parameter for CSRF protection.
   * @default true
   */
  state?: boolean;
  
  /**
   * Store state in session (when state is enabled).
   * @default true
   */
  store?: any;
  
  /**
   * Pass request to verify callback.
   * @default false
   */
  passReqToCallback?: boolean;
  
  // Allow other OAuth2StrategyOptions
  [key: string]: any;
}

/**
 * Authorization parameters for OAuth2 request.
 */
export interface CitizenIDAuthorizationParams {
  /**
   * Nonce value for OIDC security.
   */
  nonce?: string;
  
  /**
   * Response mode (e.g., 'form_post', 'query', 'fragment').
   */
  responseMode?: string;
  
  /**
   * Prompt parameter (e.g., 'login', 'consent', 'none').
   */
  prompt?: string;
  
  /**
   * Maximum authentication age in seconds.
   */
  maxAge?: number;
  
  /**
   * UI locales for the authorization interface.
   */
  uiLocales?: string;
}

/**
 * Verify function type for CitizenID strategy.
 */
export type CitizenIDVerifyFunction = 
  | ((accessToken: string, refreshToken: string, profile: CitizenIDProfile, done: (error: any, user?: any, info?: any) => void) => void)
  | ((accessToken: string, refreshToken: string, params: any, profile: CitizenIDProfile, done: (error: any, user?: any, info?: any) => void) => void);

/**
 * Verify function type with request parameter.
 */
export type CitizenIDVerifyFunctionWithRequest = 
  | ((req: any, accessToken: string, refreshToken: string, profile: CitizenIDProfile, done: (error: any, user?: any, info?: any) => void) => void)
  | ((req: any, accessToken: string, refreshToken: string, params: any, profile: CitizenIDProfile, done: (error: any, user?: any, info?: any) => void) => void);

/**
 * `Strategy` constructor.
 *
 * The CitizenID authentication strategy authenticates requests by delegating to
 * CitizenID using the OAuth 2.0 protocol with OpenID Connect.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid. If an exception occurred, `err` should be set.
 *
 * Options:
 *   - `clientID`          your CitizenID application's client ID
 *   - `clientSecret`      your CitizenID application's client secret (optional for public clients)
 *   - `callbackURL`       URL to which CitizenID will redirect the user after granting authorization
 *   - `scope`             array of permission scopes to request (default: ['openid', 'profile', 'email'])
 *   - `authorizationURL`  URL used to obtain an authorization grant (default: 'https://citizenid.space/connect/authorize')
 *   - `tokenURL`          URL used to obtain an access token (default: 'https://citizenid.space/connect/token')
 *   - `userInfoURL`       URL used to obtain user info (default: 'https://citizenid.space/connect/userinfo')
 *   - `pkce`              enable PKCE (default: true)
 *   - `state`             enable state parameter (default: true)
 *
 * Examples:
 *
 *     passport.use(new CitizenIDStrategy({
 *         clientID: 'a3a5953f-8ab0-4d39-a407-d3f0cc9f94da',
 *         clientSecret: 'your-client-secret',
 *         callbackURL: 'https://www.example.com/auth/citizenid/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate({ citizenId: profile.id }, function (err, user) {
 *           return done(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {CitizenIDStrategyOptions} options
 * @param {CitizenIDVerifyFunction | CitizenIDVerifyFunctionWithRequest} verify
 * @api public
 */
export class Strategy extends OAuth2Strategy {
  name: string;
  private _userInfoURL: string;
  private _idToken?: string;
  private _verify: CitizenIDVerifyFunction | CitizenIDVerifyFunctionWithRequest;

  constructor(
    options: CitizenIDStrategyOptions,
    verify: CitizenIDVerifyFunction | CitizenIDVerifyFunctionWithRequest
  ) {
    // Set default options
    options.authorizationURL = options.authorizationURL || 'https://citizenid.space/connect/authorize';
    options.tokenURL = options.tokenURL || 'https://citizenid.space/connect/token';
    options.userInfoURL = options.userInfoURL || 'https://citizenid.space/connect/userinfo';
    
    // Ensure 'openid' scope is always included (required for OIDC)
    options.scope = options.scope || ['openid', 'profile', 'email'];
    if (!Array.isArray(options.scope)) {
      options.scope = [options.scope];
    }
    if (!options.scope.includes('openid')) {
      options.scope.unshift('openid');
    }
    
    // Enable PKCE by default (recommended for security)
    if (options.pkce === undefined) {
      options.pkce = true;
    }
    
    // Enable state parameter by default
    if (options.state === undefined) {
      options.state = true;
    }

    // Store userInfoURL for later use
    const userInfoURL = options.userInfoURL;
    
    // Call the parent constructor with properly typed options
    super(options as OAuth2StrategyOptions, verify as any);
    
    this.name = 'citizenid';
    this._userInfoURL = userInfoURL;
    this._verify = verify;
    
    // Use authorization header for GET requests
    (this as any)._oauth2.useAuthorizationHeaderforGET(true);
  }

  /**
   * Retrieve user profile from CitizenID.
   *
   * This function constructs a normalized profile, with the following properties:
   *
   *   - `provider`         always set to `citizenid`
   *   - `id`               the user's CitizenID ID (sub claim)
   *   - `username`         the user's CitizenID username (preferred_username)
   *   - `displayName`      the user's full name (name)
   *   - `emails`           the user's email addresses
   *   - `roles`            the user's roles
   *   - `_raw`             the raw user info response
   *   - `_json`            the JSON parsed user info
   *
   * @param {String} accessToken
   * @param {Function} done
   * @api protected
   */
  userProfile(accessToken: string, done: (err?: Error | null, profile?: CitizenIDProfile) => void): void {
    // First, try to decode the ID token if available
    // The ID token is typically returned with the access token
    if (this._idToken) {
      try {
        // Decode without verification (verification should be done server-side if needed)
        const decoded = jwt.decode(this._idToken) as CitizenIDUserInfo | null;
        
        if (decoded) {
          const profile = this._normalizeProfile(decoded, this._idToken);
          return done(null, profile);
        }
      } catch (err) {
        // If decoding fails, fall back to userinfo endpoint
      }
    }
    
    // Fall back to calling the userinfo endpoint
    (this as any)._oauth2.get(this._userInfoURL, accessToken, (err: Error | null, body: string, res: any) => {
      if (err) {
        const error = new Error('Failed to fetch user profile');
        (error as any).cause = err;
        return done(error);
      }
      
      try {
        const json = JSON.parse(body) as CitizenIDUserInfo;
        const profile = this._normalizeProfile(json, body);
        
        done(null, profile);
      } catch (ex) {
        const error = new Error('Failed to parse user profile');
        (error as any).cause = ex;
        done(error);
      }
    });
  }

  /**
   * Normalize user profile data from CitizenID.
   *
   * @param {CitizenIDUserInfo} json - The user data from ID token or userinfo endpoint
   * @param {String} raw - The raw response
   * @return {CitizenIDProfile} Normalized profile
   * @api private
   */
  private _normalizeProfile(json: CitizenIDUserInfo, raw: string): CitizenIDProfile {
    const profile: CitizenIDProfile = {
      provider: 'citizenid',
      id: json.sub,
      username: json.preferred_username || '',
      displayName: json.name || json.preferred_username || '',
      emails: [],
      roles: [],
      _raw: raw,
      _json: json
    };
    
    // Add email if available
    if (json.email) {
      profile.emails.push({
        value: json.email,
        verified: json.email_verified || false
      });
    }
    
    // Add roles if available
    if (json.role) {
      profile.roles = Array.isArray(json.role) ? json.role : [json.role];
    }
    
    // Add additional profile fields
    if (json.picture) {
      profile.photos = [{ value: json.picture }];
    }
    
    if (json.oi_au_id) {
      profile.authorizationId = json.oi_au_id;
    }
    
    // Add custom profile claims (discord, rsi, google, twitch) if available
    // These are prefixed with 'urn:user:' and available when corresponding scopes are requested
    const customClaims: Record<string, any> = {};
    Object.keys(json).forEach(key => {
      if (key.startsWith('urn:user:')) {
        customClaims[key] = (json as any)[key];
      }
    });
    if (Object.keys(customClaims).length > 0) {
      profile._customClaims = customClaims;
    }
    
    return profile;
  }

  /**
   * Override token request to capture ID token.
   *
   * @param {String} code
   * @param {Object} params
   * @param {Function} callback
   * @api protected
   */
  getOAuthAccessToken(code: string, params: any, callback: (err: Error | null, accessToken?: string, refreshToken?: string, params?: any) => void): void {
    const self = this;
    const originalGetOAuthAccessToken = (OAuth2Strategy.prototype as any).getOAuthAccessToken;
    
    originalGetOAuthAccessToken.call(this, code, params, (err: Error | null, accessToken?: string, refreshToken?: string, params?: any) => {
      if (err) {
        return callback(err);
      }
      
      // Store the ID token for profile extraction
      if (params && params.id_token) {
        self._idToken = params.id_token;
      }
      
      callback(null, accessToken, refreshToken, params);
    });
  }

  /**
   * Return extra parameters to be included in the authorization request.
   *
   * @param {CitizenIDAuthorizationParams} options
   * @return {Object}
   * @api protected
   */
  authorizationParams(options: CitizenIDAuthorizationParams): any {
    const params: any = {};
    
    // Add nonce for OIDC (recommended for security)
    if (options.nonce) {
      params.nonce = options.nonce;
    }
    
    // Support for response_mode (e.g., form_post)
    if (options.responseMode) {
      params.response_mode = options.responseMode;
    }
    
    // Support for prompt parameter (e.g., login, consent, none)
    if (options.prompt) {
      params.prompt = options.prompt;
    }
    
    // Support for max_age parameter
    if (options.maxAge) {
      params.max_age = options.maxAge;
    }
    
    // Support for ui_locales parameter
    if (options.uiLocales) {
      params.ui_locales = options.uiLocales;
    }
    
    return params;
  }
}

// Export as default and named export for CommonJS compatibility
export default Strategy;
// Also export as module.exports for backward compatibility
module.exports = Strategy;
(module.exports as any).Strategy = Strategy;
(module.exports as any).default = Strategy;
