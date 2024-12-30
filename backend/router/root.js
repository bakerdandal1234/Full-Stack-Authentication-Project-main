const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/Schema');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('../utils/emailService');
const { sendResetPasswordEmail } = require('../utils/emailService');
const { verifyToken } = require('../middleware')
const { authenticateUser } = require('../middleware')
const csrf = require('csurf');

// Middleware for parsing JSON bodies
router.use(express.json());

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

// Validation middleware
const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Signup route
router.post('/signup', signupValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 10 * 1000); // 2 minutes

    // Create new user with all required fields
    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
      verificationTokenExpiry
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15s' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send verification email
    // await sendVerificationEmail(email, verificationToken);

    // Send response
    res.status(201).json({
      message: 'User created successfully. Please check your email for verification.',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Email verification route

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        success: false,
        errorEmail: 'Email not found. Please check your email and try again.'
      });
    }

    // Check if user was created through OAuth
    if (user.googleId || user.githubId) {
      return res.status(401).json({
        success: false,
        errorEmail: 'This email is associated with a Google or GitHub account. Please sign in with the appropriate social login.'
      });
    }

    // Check password using schema method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ 
        success: false,
        errorPassword: 'Password is incorrect. Please try again.'
      });
    }

    // Check if user is verified
    // if (!user.isVerified) {
    //   return res.status(401).json({ 
    //     message: 'Please verify your email before logging in',
    //     needsVerification: true 
    //   });
    // }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // إنشاء توكن CSRF
    const csrfToken = csrf({ cookie: true })
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,  
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // توكن التحديث - يجب أن يكون httpOnly: true
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,  
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response
    res.json({
      success: true,
      accessToken,
      csrfToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken ||req.cookies.token;
    console.log('Refresh token received:', !!refreshToken); // Debug log
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log('Token decoded:', decoded); // Debug log

    // Find user and include refreshToken field
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user) {
      console.log('User not found for token:', decoded.userId); // Debug log
      return res.status(401).json({ message: 'User not found' });
    }


    

    // Generate new tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Send response with new tokens
    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
});

// Logout route
router.post('/logout',authenticateUser, (req, res) => {
  try {
    // مسح جميع الكوكيز
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.clearCookie('XSRF-TOKEN');
    res.clearCookie('_csrf');

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
});

router.get('/', (req, res) => {
  res.send('Hello World!')
});

router.use('/protected-route', verifyToken, (req, res) => {
  res.json({ message: 'تم الوصول إلى المسار المحمي' });
});
// send email verification token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Verifying email token:', token);

    // البحث عن المستخدم بواسطة رمز التحقق
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });

    console.log('User found:', user);
    console.log('Current time:', new Date());
    console.log('Token expiry:', user?.verificationTokenExpiry);

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification link',
        isExpired: true
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        status: 'success',
        message: 'Email already verified',
        isVerified: true
      });
    }

    // Update verification status
    user.isVerified = true;
    await user.save();

    // Clear verification token and expiry after 2 minutes
    setTimeout(async () => {
      try {
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();
        console.log('Verification token and expiry cleared for user:', user.email);
      } catch (error) {
        console.error('Error clearing verification token:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    res.json({
      status: 'success',
      message: 'Email verified successfully',
      isVerified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during email verification'
    });
  }
});
// إعادة إرسال رابط التحقق
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }

    // Create new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    await user.save();

    console.log('Generated new verification token with expiry:', user.verificationTokenExpiry);

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({
      message: 'Verification link has been sent to your email'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      message: 'An error occurred while sending the verification link'
    });
  }
});


// إرسال رابط إعادة تعيين كلمة المرور
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // التحقق من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // إنشاء رمز إعادة تعيين كلمة المرور
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + (60* 60 * 1000); // صالح لمدة ساعة واحدة
    await user.save();

    console.log('Generated new reset token with expiry:', user.resetPasswordExpiry);

    // إرسال رابط إعادة تعيين كلمة المرور عبر البريد الإلكتروني
    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: 'Password reset link has been sent to your email' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'An error occurred while sending the password reset link' });
  }
});

// التحقق من صلاحية رمز إعادة تعيين كلمة المرور
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Verifying token:', token);

    // البحث عن المستخدم بواسطة الرمز
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    console.log('User found:', user);
    console.log('Current time:', Date.now());
    console.log('Token expiry:', user?.resetPasswordExpiry);

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired password reset token'
      });
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      message: 'An error occurred while verifying the token'
    });
  }
});

// إعادة تعيين كلمة المرور باستخدام الرمز
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log('Resetting password for token:', token);
    
    // البحث عن المستخدم بواسطة رمز إعادة تعيين كلمة المرور
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    console.log('User found:', user);
    console.log('Current time:', Date.now());
    console.log('Token expiry:', user?.resetPasswordExpiry);

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired password reset token'
      });
    }

    // التحقق من قوة كلمة المرور الجديدة
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // تحديث كلمة المرور وإزالة رمز إعادة التعيين
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    console.log('Password reset successful');

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'An error occurred while resetting the password'
    });
  }
});

module.exports = router;