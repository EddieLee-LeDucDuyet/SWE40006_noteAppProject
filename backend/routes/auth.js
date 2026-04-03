const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const {
  requireAuth,
  createAuthToken,
  setAuthCookie,
  clearAuthCookie,
} = require('../middleware/auth');

const router = express.Router();

function validateCredentials(username, password) {
  if (!username || !password) {
    return 'Username and password are required';
  }

  if (username.trim().length < 3) {
    return 'Username must be at least 3 characters';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existing = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get(normalizedUsername);

  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(normalizedUsername, passwordHash);

  const user = {
    id: Number(result.lastInsertRowid),
    username: normalizedUsername,
  };

  const token = createAuthToken(user);
  setAuthCookie(res, token);

  return res.status(201).json({ user });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existing = db
    .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
    .get(normalizedUsername);

  if (!existing) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isValidPassword = await bcrypt.compare(password, existing.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const user = { id: existing.id, username: existing.username };
  const token = createAuthToken(user);
  setAuthCookie(res, token);

  return res.json({ user });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const {
  requireAuth,
  createAuthToken,
  setAuthCookie,
  clearAuthCookie,
} = require('../middleware/auth');

const router = express.Router();

function validateCredentials(username, password) {
  if (!username || !password) {
    return 'Username and password are required';
  }

  if (username.trim().length < 3) {
    return 'Username must be at least 3 characters';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existing = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get(normalizedUsername);

  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(normalizedUsername, passwordHash);

  const user = {
    id: Number(result.lastInsertRowid),
    username: normalizedUsername,
  };

  const token = createAuthToken(user);
  setAuthCookie(res, token);

  return res.status(201).json({ user });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existing = db
    .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
    .get(normalizedUsername);

  if (!existing) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isValidPassword = await bcrypt.compare(password, existing.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const user = { id: existing.id, username: existing.username };
  const token = createAuthToken(user);
  setAuthCookie(res, token);

  return res.json({ user });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
