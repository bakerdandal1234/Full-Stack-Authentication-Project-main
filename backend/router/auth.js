const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/Schema');
const { verifyToken } = require('../middleware')
// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '15m' }
    );
};



// GitHub OAuth routes
router.get('/github',
    (req, res, next) => {
        console.log('Starting GitHub authentication');
        passport.authenticate('github', { 
            scope: ['user:email']
        })(req, res, next);
    }
);

router.get('/github/callback',
    (req, res, next) => {
        console.log('GitHub callback received');
        passport.authenticate('github', { 
            failureRedirect: 'http://localhost:5173/login',
            failureMessage: true 
        }, async (err, user, info) => {
            if (err) {
                console.error('GitHub authentication error:', err);
                return res.redirect('http://localhost:5173/login');
            }

            if (!user) {
                console.error('No user returned from GitHub:', info);
                return res.redirect('http://localhost:5173/login');
            }

            try {
                // Ensure user is saved
                const existingUser = await User.findById(user._id);
                if (!existingUser) {
                    console.error('User not found in database after GitHub auth');
                    return res.redirect('http://localhost:5173/login');
                }

                req.logIn(user, async (err) => {
                    if (err) {
                        console.error('Error logging in GitHub user:', err);
                        return res.redirect('http://localhost:5173/login');
                    }

                    console.log('GitHub authentication successful for user:', user._id);
                    const token = generateToken(user);
                    

                    
                    // Set cookies
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 15 * 60 * 1000 // 15 minutes
                    });
                   

                    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
                });
            } catch (error) {
                console.error('Error in GitHub callback:', error);
                res.redirect('http://localhost:5173/login');
            }
        })(req, res, next);
    }
);

// Google OAuth routes
router.get('/google',
    (req, res, next) => {
        console.log('Starting Google authentication');
        passport.authenticate('google', { 
            scope: ['profile', 'email'],
            accessType: 'offline',
            prompt: 'consent'
        })(req, res, next);
    }
);

router.get('/google/callback',
    (req, res, next) => {
        console.log('Google callback received');
        passport.authenticate('google', { 
            failureRedirect: 'http://localhost:5173/login',
            failureMessage: true
        }, async (err, user, info) => {
            if (err) {
                console.error('Google authentication error:', err);
                return res.redirect('http://localhost:5173/login');
            }
            
            if (!user) {
                console.error('No user returned from Google:', info);
                return res.redirect('http://localhost:5173/login');
            }

            try {
                console.log('Google user data:', {
                    id: user.googleId,
                    email: user.email,
                    isVerified: user.isVerified
                });

                // Ensure user is saved to database
                const existingUser = await User.findOne({ googleId: user.googleId });
                if (!existingUser) {
                    console.log('Creating new user for Google account');
                    const newUser = new User({
                        email: user.email,
                        googleId: user.googleId,
                        isVerified: true // Google accounts are pre-verified
                    });
                    await newUser.save();
                    user = newUser;
                }

                req.logIn(user, async (err) => {
                    if (err) {
                        console.error('Error logging in user:', err);
                        return res.redirect('http://localhost:5173/login');
                    }

                    console.log('Google authentication successful');
                    const token = generateToken(user);
                    
                    
                    // Set cookies
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 15 * 60 * 1000 // 15 minutes
                    });
                    
                   

                    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
                });
            } catch (error) {
                console.error('Error in Google callback:', error);
                res.redirect('http://localhost:5173/login');
            }
        })(req, res, next);
    }
);

// Add route to get current user info
router.get('/me',verifyToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Find user in database
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user info (excluding sensitive data)
        res.json({
            id: user._id,
            email: user.email,
            username: user.username,
            googleId: user.googleId,
            githubId: user.githubId,
            isVerified: user.isVerified
        });
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
