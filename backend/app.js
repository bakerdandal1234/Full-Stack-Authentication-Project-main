/**
 * Main Application Entry Point
 * 
 * This file sets up the Express application with all necessary middleware,
 * authentication strategies, and route configurations.
 */

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const csrf = require('csurf');
require('dotenv').config();

// Import local modules
const oauth = require('./config/oauth');

// Initialize Express app
const app = express();

// ============================================================================
// Database Configuration
// ============================================================================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

// ============================================================================
// Core Middleware Setup
// ============================================================================

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['set-cookie']
}));

// ============================================================================
// Authentication Setup
// ============================================================================

// Initialize passport middleware
app.use(...oauth.initialize());

// ============================================================================
// Security Middleware (CSRF)
// ============================================================================

// Routes that don't require CSRF protection
const CSRF_EXCLUDED_PATHS = [
    '/login',                    // Initial login
    '/signup',    
    '/logout',                    // Logout
    '/reset-password',           // Password reset request
    '/verify-email',             // Email verification
    '/verify-reset-token',       // Verify reset token
    '/verify-email/:token',      // Email verification with token
    '/verify-reset-token/:token' // Reset token verification
];

// CSRF Protection
const csrfProtection = csrf({
    cookie: {
        key: '_csrf',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// CSRF Middleware with improved path matching
app.use((req, res, next) => {
    // Only exclude specific non-authenticated paths
    if (CSRF_EXCLUDED_PATHS.some(path => req.path.startsWith(path))) {
        return next();
    }

    csrfProtection(req, res, (err) => {
        if (err) {
            console.error('❌ CSRF Error:', err);
            return res.status(403).json({ 
                error: 'Invalid or missing CSRF token',
                code: 'CSRF_ERROR'
            });
        }

        // Set CSRF token cookie with secure settings
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
            httpOnly: false,  
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        next();
    });
});

// ============================================================================
// Routes Configuration
// ============================================================================

// Import route handlers
const mainRouter = require('./router/root');
const authRouter = require('./router/auth');

// Mount routes
app.use('/auth', authRouter);  // Authentication routes
app.use(mainRouter);          // General routes

// Protected route example
app.get('/protected', oauth.isAuthenticated, (req, res) => {
    res.json({
        status: 'success',
        data: { user: req.user }
    });
});

// ============================================================================
// Error Handling
// ============================================================================

// Authentication error handler
app.use((err, req, res, next) => {
    if (err.name === 'AuthenticationError') {
        return res.status(401).json({
            status: 'error',
            message: err.message,
            code: 'AUTHENTICATION_ERROR'
        });
    }
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
    });
});

module.exports = app;
