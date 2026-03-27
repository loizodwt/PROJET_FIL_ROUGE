const request = require('supertest');
const app = require('../index');
const prisma = require('../lib/prisma');

describe('Auth', () => {
  const testUser = {
    email: `test_${Date.now()}@test.com`,
    password: 'password123',
    name: 'Test User',
  };

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('POST /auth/register — crée un utilisateur', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.password).toBeUndefined();
  });

  it('POST /auth/register — email déjà existant → 409', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('POST /auth/login — retourne un token', async () => {
    const res = await request(app).post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    testUser.token = res.body.token;
  });

  it('POST /auth/login — mauvais mot de passe → 401', async () => {
    const res = await request(app).post('/auth/login').send({
      email: testUser.email,
      password: 'wrong',
    });
    expect(res.status).toBe(401);
  });

  it('GET /auth/me — retourne le profil', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${testUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });
});
