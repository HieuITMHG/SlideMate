const jwt = require('jsonwebtoken');

const softAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // Check for token in Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // Fallback to accessToken cookie
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token, proceed without setting req.user
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set req.user if token is valid
    req.user = { id: decoded.user.id };
    next();
  } catch (err) {
    // Log invalid token but proceed without error
    console.warn('Soft auth middleware: Invalid token:', err.message);
    next();
  }
};

module.exports = softAuth;