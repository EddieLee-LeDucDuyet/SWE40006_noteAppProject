import { useState, useEffect } from 'react';
import './App.css';

const NOTES_API = '/api/notes';
const AUTH_API = 'api/auth';

function App() {
  const [user, setUser]       = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [notes, setNotes]     = useState([]);
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`${AUTH_API}/me`, { credentials: 'include' });
        if (!res.ok) {
          setUser(null);
          setNotes([]);
          return;
        }

        const data = await res.json();
        setUser(data.user);

        const notesRes = await fetch(NOTES_API, { credentials: 'include' });
        if (!notesRes.ok) {
          setNotes([]);
          return;
        }

        setNotes(await notesRes.json());
      } catch (err) {
        setUser(null);
        setNotes([]);
      }
    }

    loadSession();
  }, []);

  async function fetchNotes() {
    const res = await fetch(NOTES_API, { credentials: 'include' });
    if (!res.ok) {
      if (res.status === 401) {
        setUser(null);
        setNotes([]);
      }
      return;
    }
    setNotes(await res.json());
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');

    if (!username.trim() || !password.trim()) {
      setAuthError('Username and password are required.');
      return;
    }

    const endpoint = authMode === 'login' ? 'login' : 'register';
    const res = await fetch(`${AUTH_API}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || 'Authentication failed.');
      return;
    }

    setUser(data.user);
    setPassword('');
    setTitle('');
    setBody('');
    setEditing(null);
    await fetchNotes();
  }

  async function handleLogout() {
    await fetch(`${AUTH_API}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    setNotes([]);
    setTitle('');
    setBody('');
    setEditing(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !body.trim()) return setError('Both fields are required.');
    if (editing) {
      await fetch(`${NOTES_API}/${editing}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, body }),
      });
      setEditing(null);
    } else {
      await fetch(NOTES_API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, body }),
      });
    }
    setTitle(''); setBody('');
    fetchNotes();
  }

  async function handleDelete(id) {
    await fetch(`${NOTES_API}/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchNotes();
  }

  function handleEdit(note) {
    setEditing(note.id);
    setTitle(note.title);
    setBody(note.body);
  }

  return (
    <div className="app">
      <header>
        <h1>📝 NoteFlow</h1>
        <p>Your simple personal notes</p>
      </header>

      {!user && (
        <form onSubmit={handleAuthSubmit} className="form auth-form">
          <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
          {authError && <p className="error">{authError}</p>}
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          <div className="form-buttons">
            <button type="submit">{authMode === 'login' ? 'Login' : 'Create account'}</button>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
            >
              {authMode === 'login' ? 'Need an account?' : 'Have an account?'}
            </button>
          </div>
        </form>
      )}

      {user && (
        <section className="user-bar">
          <p>Signed in as <strong>{user.username}</strong></p>
          <button type="button" onClick={handleLogout}>Logout</button>
        </section>
      )}

      {user && (
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
      )}

      <section className="notes">
        {!user && <p className="empty">Please login or register to manage your notes.</p>}
        {user && notes.length === 0 && <p className="empty">No notes yet. Create your first one above!</p>}
        {user && notes.map(note => (
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
