const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all notes for this user
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'default';
  const notes = db.prepare(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId);
  res.json(notes);
});

// GET single note
router.get('/:id', (req, res) => {
  const userId = req.headers['x-user-id'] || 'default';
  const note = db.prepare(
    'SELECT * FROM notes WHERE id = ? AND user_id = ?'
  ).get(req.params.id, userId);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// POST create note
router.post('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'default';
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  const result = db.prepare(
    'INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)'
  ).run(userId, title, body);
  res.status(201).json({ id: result.lastInsertRowid, user_id: userId, title, body });
});

// PUT update note
router.put('/:id', (req, res) => {
  const userId = req.headers['x-user-id'] || 'default';
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  db.prepare(
    'UPDATE notes SET title = ?, body = ? WHERE id = ? AND user_id = ?'
  ).run(title, body, req.params.id, userId);
  res.json({ success: true });
});

// DELETE note
router.delete('/:id', (req, res) => {
  const userId = req.headers['x-user-id'] || 'default';
  db.prepare(
    'DELETE FROM notes WHERE id = ? AND user_id = ?'
  ).run(req.params.id, userId);
  res.json({ success: true });
});

module.exports = router;
