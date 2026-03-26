import { useState, useEffect } from 'react';
import './App.css';

const API = '/api/notes';

function getUserId() {
  let id = localStorage.getItem('user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('user_id', id);
  }
  return id;
}

const USER_ID = getUserId();
const HEADERS = {
  'Content-Type': 'application/json',
  'x-user-id': USER_ID
};

function App() {
  const [notes, setNotes]     = useState([]);
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => { fetchNotes(); }, []);

  async function fetchNotes() {
    const res = await fetch(API, { headers: HEADERS });
    setNotes(await res.json());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !body.trim()) return setError('Both fields are required.');
    if (editing) {
      await fetch(`${API}/${editing}`, {
        method: 'PUT', headers: HEADERS,
        body: JSON.stringify({ title, body }),
      });
      setEditing(null);
    } else {
      await fetch(API, {
        method: 'POST', headers: HEADERS,
        body: JSON.stringify({ title, body }),
      });
    }
    setTitle(''); setBody('');
    fetchNotes();
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: 'DELETE', headers: HEADERS });
    fetchNotes();
  }

  function handleEdit(note) {
    setEditing(note.id);
    setTitle(note.title);
    setBody(note.body);
  }

  return (
    <div className="app">
      <header><h1>📝 NoteFlow</h1><p>Your simple personal notes</p></header>

      <form onSubmit={handleSubmit} className="form">
        <h2>{editing ? 'Edit Note' : 'New Note'}</h2>
        {error && <p className="error">{error}</p>}
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your note..." rows={4} />
        <div className="form-buttons">
          <button type="submit">{editing ? 'Update Note' : 'Add Note'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setTitle(''); setBody(''); }}>Cancel</button>}
        </div>
      </form>

      <section className="notes">
        {notes.length === 0 && <p className="empty">No notes yet. Create your first one above!</p>}
        {notes.map(note => (
          <div className="card" key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
            <small>{new Date(note.created_at).toLocaleString()}</small>
            <div className="card-buttons">
              <button onClick={() => handleEdit(note)}>Edit</button>
              <button className="del" onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
