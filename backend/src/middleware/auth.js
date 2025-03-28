const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware that allows both authenticated and unauthenticated requests
const auth = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      if (token) {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          // Add user to request object and log
          console.log('Auth middleware - User:', {
            id: user._id,
            email: user.email,
            token: token.substring(0, 10) + '...'
          });
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    // If token verification fails, continue without user
    next();
  }
};

// Strict auth middleware that requires authentication
const requireAuth = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    // Add user to request object and log
    console.log('Auth middleware - User:', {
      id: user._id,
      email: user.email,
      token: token.substring(0, 10) + '...'
    });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({ 
      message: 'Duplicate field value entered'
    });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong on the server'
  });
};

module.exports = {
  auth,
  requireAuth,
  errorHandler
};
