const request = require('supertest');
const app = require('../index');
const prisma = require('../lib/prisma');

describe('Member', () => {
  let token;
  let userId;
  let filmId;

  const testUser = {
    email: `member_test_${Date.now()}@test.com`,
    password: 'password123',
    name: 'Member Test User',
  };

  beforeAll(async () => {
    // Create user and get token
    const reg = await request(app).post('/auth/register').send(testUser);
    userId = reg.body.id;

    const loginRes = await request(app).post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    token = loginRes.body.token;

    // Create a film to use in tests
    const film = await prisma.film.create({
      data: { title: `Test Film Member ${Date.now()}` },
    });
    filmId = film.id;
  });

  afterAll(async () => {
    if (filmId) {
      await prisma.rating.deleteMany({ where: { filmId } });
      await prisma.favorite.deleteMany({ where: { filmId } });
      await prisma.watchlist.deleteMany({ where: { filmId } });
      await prisma.viewHistory.deleteMany({ where: { filmId } });
      await prisma.film.deleteMany({ where: { id: filmId } });
    }
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('POST /me/favorites/:filmId → toggles favorite (added)', async () => {
    const res = await request(app)
      .post(`/me/favorites/${filmId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.action).toBe('added');
  });

  it('GET /me/favorites → returns list', async () => {
    const res = await request(app)
      .get('/me/favorites')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /me/favorites/:filmId → toggles favorite (removed)', async () => {
    const res = await request(app)
      .post(`/me/favorites/${filmId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.action).toBe('removed');
  });

  it('POST /me/ratings/:filmId → creates rating', async () => {
    const res = await request(app)
      .post(`/me/ratings/${filmId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 4, comment: 'Great film!' });
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(4);
  });

  it('GET /me/history → returns history', async () => {
    // Add to history first
    await prisma.viewHistory.create({ data: { userId, filmId } });

    const res = await request(app)
      .get('/me/history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /me/favorites → 401 without auth', async () => {
    const res = await request(app).get('/me/favorites');
    expect(res.status).toBe(401);
  });
});
