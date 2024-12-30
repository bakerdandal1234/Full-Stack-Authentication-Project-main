const jwt = require('jsonwebtoken');
const User = require('./models/Schema');

// Verify Access Token Middleware  router.use only for check access token,use protetct-route
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access token required' });
        }
        console.log("authHeader:",authHeader)

        const accessToken = authHeader.split(' ')[1];
        console.log("accessToken:",accessToken)
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            console.log("decoded :",decoded)
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            next();
        } catch (tokenError) {
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Access token expired',
                    tokenExpired: true 
                });
            }
            return res.status(401).json({ message: 'Invalid access token' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// midddleware to check user use it in logout 
const authenticateUser = (req, res, next) => {
    const token = req.cookies.refreshToken ||req.cookies.token; // احصل على رمز المصادقة من الكوكيز
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); // استخدام JWT_REFRESH_SECRET بدلاً من JWT_SECRET
      console.log('Decoded token:', decoded); // للتحقق من محتوى التوكن
      req.user = { id: decoded.userId }; // تعيين id باستخدام userId من التوكن
      next(); // الانتقال إلى المسار التالي
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
  };

module.exports = { verifyToken,authenticateUser };