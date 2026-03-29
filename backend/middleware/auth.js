const jwt = require('jsonwebtoken');
const db = require('../database');

const COOKIE_NAME = 'auth_token';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function createAuthToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function readTokenFromRequest(req) {
  const cookieToken = req.cookies && req.cookies[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  return null;
}

function requireAuth(req, res, next) {
  const token = readTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(payload.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

module.exports = {
  requireAuth,
  createAuthToken,
  setAuthCookie,
  clearAuthCookie,
};
