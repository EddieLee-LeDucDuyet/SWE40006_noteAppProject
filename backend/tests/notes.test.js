const request = require('supertest');
const app = require('../server');

describe('Notes API', () => {
  const testSuffix = Date.now();
  const primaryUser = {
    username: `testuser_${testSuffix}`,
    password: 'password123',
  };
  const secondaryUser = {
    username: `otheruser_${testSuffix}`,
    password: 'password123',
  };

  const primaryAgent = request.agent(app);
  const secondaryAgent = request.agent(app);

  let createdId;

  test('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('GET /metrics returns server stats', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('server');
    expect(res.body).toHaveProperty('memory');
    expect(res.body).toHaveProperty('performance');
    expect(res.body).toHaveProperty('requests');
  });

  test('GET /api/notes requires authentication', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/register creates account and session cookie', async () => {
    const res = await primaryAgent
      .post('/api/auth/register')
      .send(primaryUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.username).toBe(primaryUser.username);
  });

  test('POST /api/notes creates a note for authenticated user', async () => {
    const res = await primaryAgent
      .post('/api/notes')
      .send({ title: 'Test Note', body: 'This is a test' });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Note');
    createdId = res.body.id;
  });

  test('GET /api/notes returns current user list', async () => {
    const res = await primaryAgent.get('/api/notes');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((note) => note.id === createdId)).toBe(true);
  });

  test('PUT /api/notes/:id updates a note', async () => {
    const res = await primaryAgent
      .put(`/api/notes/${createdId}`)
      .send({ title: 'Updated', body: 'Updated body' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  test('Different user cannot access another user note', async () => {
    const registerRes = await secondaryAgent
      .post('/api/auth/register')
      .send(secondaryUser);

    expect(registerRes.statusCode).toBe(201);

    const noteRes = await secondaryAgent.get(`/api/notes/${createdId}`);
    expect(noteRes.statusCode).toBe(404);
  });

  test('DELETE /api/notes/:id deletes a note', async () => {
    const res = await primaryAgent.delete(`/api/notes/${createdId}`);
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/notes returns 400 if fields missing', async () => {
    const res = await primaryAgent.post('/api/notes').send({ title: '' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/logout clears session', async () => {
    const logoutRes = await primaryAgent.post('/api/auth/logout');
    expect(logoutRes.statusCode).toBe(200);

    const notesRes = await primaryAgent.get('/api/notes');
    expect(notesRes.statusCode).toBe(401);
  });
});