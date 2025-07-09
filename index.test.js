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

  it('create and list service resources', async () => {
    const user = { username: 'svc', password: 'pass' };
    let res = await request(app).post('/register').send(user);
    expect(res.statusCode).toBe(201);
    res = await request(app).post('/login').send(user);
    const token = res.body.token;

    const headers = { Authorization: `Bearer ${token}` };

    res = await request(app).post('/apps').set(headers).send({ name: 'myapp' });
    expect(res.statusCode).toBe(201);

    res = await request(app).get('/apps').set(headers);
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('name', 'myapp');

    res = await request(app).post('/storage').set(headers).send({ name: 'bucket' });
    expect(res.statusCode).toBe(201);
    res = await request(app).get('/storage').set(headers);
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('name', 'bucket');

    res = await request(app).post('/databases').set(headers).send({ name: 'db' });
    expect(res.statusCode).toBe(201);
    res = await request(app).get('/databases').set(headers);
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('name', 'db');

    res = await request(app).post('/static-sites').set(headers).send({ name: 'site' });
    expect(res.statusCode).toBe(201);
    res = await request(app).get('/static-sites').set(headers);
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('name', 'site');
  });
});
