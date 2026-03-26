const request = require('supertest');
const app = require('../server');

const TEST_USER = { 'x-user-id': 'test-user-123' };

describe('Notes API', () => {
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

  test('POST /api/notes creates a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set(TEST_USER)
      .send({ title: 'Test Note', body: 'This is a test' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Note');
    createdId = res.body.id;
  });

  test('GET /api/notes returns list', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set(TEST_USER);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PUT /api/notes/:id updates a note', async () => {
    const res = await request(app)
      .put(`/api/notes/${createdId}`)
      .set(TEST_USER)
      .send({ title: 'Updated', body: 'Updated body' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/notes/:id deletes a note', async () => {
    const res = await request(app)
      .delete(`/api/notes/${createdId}`)
      .set(TEST_USER);
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/notes returns 400 if fields missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set(TEST_USER)
      .send({ title: '' });
    expect(res.statusCode).toBe(400);
  });
});
