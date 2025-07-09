const request = require('supertest');
const app = require('./index');

describe('Sevalla clone API', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Welcome to Sevalla clone');
  });

  it('register, login and access protected route', async () => {
    const user = { username: 'test', password: 'pass' };
    let res = await request(app).post('/register').send(user);
    expect(res.statusCode).toBe(201);
    res = await request(app).post('/login').send(user);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    const token = res.body.token;
    res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('username', 'test');
  });
});
