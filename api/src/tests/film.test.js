const request = require('supertest');
const app = require('../index');
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

describe('Films', () => {
  let adminToken;
  let userToken;
  let createdFilmId;

  const adminUser = {
    email: `admin_film_test_${Date.now()}@test.com`,
    password: 'adminpass123',
    name: 'Admin Film Test',
  };

  const regularUser = {
    email: `user_film_test_${Date.now()}@test.com`,
    password: 'userpass123',
    name: 'User Film Test',
  };

  beforeAll(async () => {
    // Create admin user directly in DB
    const hashed = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: { email: adminUser.email, password: hashed, name: adminUser.name, role: 'ADMIN' },
    });

    // Get admin token
    const adminLogin = await request(app).post('/auth/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminLogin.body.token;

    // Create regular user
    await request(app).post('/auth/register').send(regularUser);
    const userLogin = await request(app).post('/auth/login').send({
      email: regularUser.email,
      password: regularUser.password,
    });
    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    if (createdFilmId) {
      await prisma.film.deleteMany({ where: { id: createdFilmId } });
    }
    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, regularUser.email] } } });
    await prisma.$disconnect();
  });

  it('GET /films → 200 with films array and total', async () => {
    const res = await request(app).get('/films');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.films)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  it('GET /films?search=... → filters correctly', async () => {
    const res = await request(app).get('/films?search=improbable_title_xyz_12345');
    expect(res.status).toBe(200);
    expect(res.body.films).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('GET /films/:id → 404 for non-existing film', async () => {
    const res = await request(app).get('/films/999999999');
    expect(res.status).toBe(404);
  });

  it('POST /films without auth → 401', async () => {
    const res = await request(app).post('/films').send({ title: 'Test Film' });
    expect(res.status).toBe(401);
  });

  it('POST /films with USER role → 403', async () => {
    const res = await request(app)
      .post('/films')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test Film' });
    expect(res.status).toBe(403);
  });

  it('POST /films with ADMIN → 201', async () => {
    const res = await request(app)
      .post('/films')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Admin Created Film')
      .field('synopsis', 'A test film')
      .field('releaseYear', '2024')
      .field('director', 'Test Director');
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Admin Created Film');
    createdFilmId = res.body.id;
  });

  it('GET /films/:id → 200 for existing film', async () => {
    if (!createdFilmId) return;
    const res = await request(app).get(`/films/${createdFilmId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdFilmId);
  });
});
