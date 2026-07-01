// ============================================================
//  Authentication & Authorization Middleware
//   - authMiddleware : verifies the JWT token (any logged-in account)
//   - requireAdmin   : allows only accounts with role "Admin"
// ============================================================

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Only allow Admin role (e.g. managing rooms and accounts)
function requireAdmin(req, res, next) {
  if (req.admin && req.admin.role === 'Admin') return next();
  return res.status(403).json({ message: 'Admins only. You do not have permission for this action.' });
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.requireAdmin = requireAdmin;
