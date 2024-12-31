const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: DiscordStrategy } = require('passport-discord');
const User = require('../models/Schema');
const PassportAuthenticator = require('./passport');

// Create passport authenticator instance
const passportAuth = new PassportAuthenticator(User);

// Configure OAuth strategies
const configureOAuth = () => {
    try {
        // GitHub Strategy
        passportAuth.addStrategy('github', GitHubStrategy, {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
            scope: ['user:email']
        });

        // Google Strategy
        passportAuth.addStrategy('google', GoogleStrategy, {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email', 'openid'],
            accessType: 'offline',
            prompt: 'consent',
            state: true
        });

        // Discord Strategy
        passportAuth.addStrategy('discord', DiscordStrategy, {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            scope: ['identify', 'email']
        });

        console.log('✅ OAuth strategies configured successfully');
    } catch (error) {
        console.error('❌ OAuth configuration error:', error);
        throw error;
    }
};

// Initialize OAuth configuration
configureOAuth();

// Export configured passport authenticator
module.exports = {
    passport: passportAuth.getPassport(),
    initialize: () => {
        return [
            passportAuth.getPassport().initialize(),
            passportAuth.getPassport().session()
        ];
    },
    authenticate: passportAuth.authenticate.bind(passportAuth),
    isAuthenticated: passportAuth.isAuthenticated.bind(passportAuth)
};
