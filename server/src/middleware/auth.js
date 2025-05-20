const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = { id: decoded.user.id };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message, err.stack);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;