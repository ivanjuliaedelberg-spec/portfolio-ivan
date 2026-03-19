const jwt    = require('jsonwebtoken');
const cookie = require('cookie');

/**
 * Verify a JWT string. Returns payload or null (if undefined/null).
 * Throws if the token is present but invalid or expired.
 */
function verifyJwt(token) {
  if (!token) return null;
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * Extract and verify the admin_token cookie from an HTTP request.
 * Returns the JWT payload on success, or sends 401 and returns null.
 */
function requireAuth(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  try {
    const payload = verifyJwt(cookies.admin_token);
    if (!payload) {
      res.status(401).json({ error: 'Unauthorized' });
      return null;
    }
    return payload;
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
}

module.exports = { verifyJwt, requireAuth };
