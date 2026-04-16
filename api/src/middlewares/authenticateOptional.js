const jwt = require('jsonwebtoken');

function authenticateOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Invalid token — still allow the request, just no user
    }
  }
  next();
}

module.exports = authenticateOptional;
