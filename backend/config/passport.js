/**
 * @fileoverview Passport authentication manager that provides a flexible and reusable
 * implementation for handling multiple authentication strategies.
 */

const passport = require('passport');

/**
 * @typedef {Object} StrategyConfig
 * @property {string} clientID - OAuth client ID
 * @property {string} clientSecret - OAuth client secret
 * @property {string} callbackURL - OAuth callback URL
 * @property {Object} [additionalOptions] - Additional strategy-specific options
 */

/**
 * @typedef {Object} AuthOptions
 * @property {string[]} [scope] - OAuth scopes to request
 * @property {Object} [additionalOptions] - Additional authentication options
 */

/**
 * @typedef {Object} CallbackOptions
 * @property {string} [successRedirect] - URL to redirect on success
 * @property {string} [failureRedirect] - URL to redirect on failure
 * @property {boolean} [failureFlash] - Whether to flash error messages
 */

class PassportAuthenticator {
    /**
     * Creates an instance of PassportAuthenticator.
     * @param {Object} userModel - Mongoose model for user data
     * @throws {Error} If userModel is not provided
     */
    constructor(userModel) {
        if (!userModel) {
            throw new Error('User model is required for PassportAuthenticator');
        }
        this.User = userModel;
        this.strategies = new Map();
        this._initializePassport();
    }

    /**
     * Initializes passport serialization/deserialization.
     * @private
     */
    _initializePassport() {
        passport.serializeUser(this._serializeUser.bind(this));
        passport.deserializeUser(this._deserializeUser.bind(this));
    }

    /**
     * Serializes user for the session.
     * @private
     * @param {Object} user - User object
     * @param {Function} done - Callback function
     */
    _serializeUser(user, done) {
        try {
            if (!user || !user.id) {
                throw new Error('Invalid user object for serialization');
            }
            console.log('Serializing user:', user.id);
            done(null, user.id);
        } catch (error) {
            console.error('Serialization error:', error);
            done(error, null);
        }
    }

    /**
     * Deserializes user from the session.
     * @private
     * @param {string} id - User ID
     * @param {Function} done - Callback function
     */
    async _deserializeUser(id, done) {
        try {
            if (!id) {
                throw new Error('User ID is required for deserialization');
            }
            console.log('Deserializing user:', id);
            const user = await this.User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            done(null, user);
        } catch (error) {
            console.error('Deserialization error:', error);
            done(error, null);
        }
    }

    /**
     * Creates a new user in the database.
     * @private
     * @param {Object} profile - User profile from OAuth provider
     * @param {string} provider - Name of the OAuth provider
     * @returns {Promise<Object>} Created user object
     * @throws {Error} If user creation fails
     */
    async _createNewUser(profile, provider) {
        try {
            if (!profile || !profile.id) {
                throw new Error('Invalid profile data');
            }

            const email = this._extractEmail(profile, provider);
            const username = this._extractUsername(profile, email);

            const userData = {
                [`${provider}Id`]: profile.id,
                email,
                username,
                isVerified: true,
                provider
            };

            console.log(`Creating new ${provider} user:`, { ...userData, provider });
            const user = new this.User(userData);
            return await user.save();
        } catch (error) {
            console.error(`Error creating ${provider} user:`, error);
            throw error;
        }
    }

    /**
     * Extracts email from profile data.
     * @private
     * @param {Object} profile - User profile
     * @param {string} provider - Provider name
     * @returns {string} Email address
     */
    _extractEmail(profile, provider) {
        return profile.emails?.[0]?.value || 
               `${profile.username || profile.id}@${provider}.com`;
    }

    /**
     * Extracts username from profile data.
     * @private
     * @param {Object} profile - User profile
     * @param {string} email - User email
     * @returns {string} Username
     */
    _extractUsername(profile, email) {
        return profile.username || 
               profile.displayName || 
               email.split('@')[0];
    }

    /**
     * Generic strategy handler for all OAuth providers.
     * @private
     * @param {string} provider - Provider name
     * @param {string} accessToken - OAuth access token
     * @param {string} refreshToken - OAuth refresh token
     * @param {Object} profile - User profile
     * @param {Function} done - Callback function
     */
    async _handleStrategy(provider, accessToken, refreshToken, profile, done) {
        try {
            console.log(`${provider} authentication started for profile:`, profile.id);
            
            let user = await this.User.findOne({ [`${provider}Id`]: profile.id });
            if (!user) {
                user = await this._createNewUser(profile, provider);
                console.log(`New ${provider} user created:`, user.id);
            } else {
                console.log(`Existing ${provider} user found:`, user.id);
            }

            return done(null, user);
        } catch (error) {
            console.error(`${provider} authentication error:`, error);
            if (error.code === 11000) {
                return done(new Error('User with this email or username already exists'), null);
            }
            return done(error, null);
        }
    }

    /**
     * Adds a new authentication strategy.
     * @param {string} name - Strategy name
     * @param {Function} Strategy - Strategy constructor
     * @param {StrategyConfig} config - Strategy configuration
     * @throws {Error} If strategy configuration is invalid
     */
    addStrategy(name, Strategy, config) {
        try {
            this._validateStrategyConfig(name, config);

            const strategyInstance = new Strategy(
                config,
                (accessToken, refreshToken, profile, done) => 
                    this._handleStrategy(name, accessToken, refreshToken, profile, done)
            );

            passport.use(strategyInstance);
            this.strategies.set(name, strategyInstance);

            console.log(`${name} strategy added successfully`);
        } catch (error) {
            console.error(`Error adding ${name} strategy:`, error);
            throw error;
        }
    }

    /**
     * Validates strategy configuration.
     * @private
     * @param {string} name - Strategy name
     * @param {StrategyConfig} config - Strategy configuration
     * @throws {Error} If configuration is invalid
     */
    _validateStrategyConfig(name, config) {
        if (!name || typeof name !== 'string') {
            throw new Error('Strategy name is required and must be a string');
        }
        if (!config || typeof config !== 'object') {
            throw new Error(`Invalid configuration for ${name} strategy`);
        }
        const requiredFields = ['clientID', 'clientSecret', 'callbackURL'];
        for (const field of requiredFields) {
            if (!config[field]) {
                throw new Error(`Missing required field '${field}' for ${name} strategy`);
            }
        }
    }

    /**
     * Returns the passport instance.
     * @returns {Object} Passport instance
     */
    getPassport() {
        return passport;
    }

    /**
     * Creates authentication middleware for a strategy.
     * @param {string} provider - Provider name
     * @param {AuthOptions} [options={}] - Authentication options
     * @returns {Function} Express middleware
     * @throws {Error} If provider is not configured
     */
    getAuthMiddleware(provider, options = {}) {
        this._validateProvider(provider);
        return passport.authenticate(provider, options);
    }

    /**
     * Creates callback middleware for a strategy.
     * @param {string} provider - Provider name
     * @param {CallbackOptions} [options] - Callback options
     * @returns {Function} Express middleware
     * @throws {Error} If provider is not configured
     */
    getAuthCallbackMiddleware(provider, options = {
        failureRedirect: '/login',
        successRedirect: '/'
    }) {
        this._validateProvider(provider);
        return passport.authenticate(provider, options);
    }

    /**
     * Validates that a provider is configured.
     * @private
     * @param {string} provider - Provider name
     * @throws {Error} If provider is not configured
     */
    _validateProvider(provider) {
        if (!this.strategies.has(provider)) {
            throw new Error(`Strategy '${provider}' is not configured`);
        }
    }

    /**
     * Middleware to check if user is authenticated.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    isAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(401).json({ 
            status: 'error',
            message: 'Authentication required',
            code: 'UNAUTHORIZED'
        });
    }
}

module.exports = PassportAuthenticator;
