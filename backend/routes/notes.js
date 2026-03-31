const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET all notes
router.get('/', (req, res) => {
  const notes = db
    .prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(notes);
});

// GET single note
router.get('/:id', (req, res) => {
  const note = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// POST create note
router.post('/', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  const result = db
    .prepare('INSERT INTO notes (title, body, user_id) VALUES (?, ?, ?)')
    .run(title, body, req.user.id);
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(note);
});

// PUT update note
router.put('/:id', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  const existing = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Note not found' });
  db.prepare('UPDATE notes SET title = ?, body = ? WHERE id = ? AND user_id = ?').run(
    title,
    body,
    req.params.id,
    req.user.id
  );
  const updated = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  res.json(updated);
});

// DELETE note
router.delete('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Note not found' });
  db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Note deleted' });
});

module.exports = router;