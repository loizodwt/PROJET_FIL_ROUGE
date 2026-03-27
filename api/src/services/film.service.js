const prisma = require('../lib/prisma');

async function getFilms({ category, minRating, limit = 20, page = 1, search, sort = 'createdAt' }) {
  const where = {};

  if (category) {
    where.category = { slug: category };
  }
  if (minRating) {
    where.avgRating = { gte: parseFloat(minRating) };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { director: { contains: search, mode: 'insensitive' } },
    ];
  }

  const validSorts = ['createdAt', 'title', 'avgRating', 'releaseYear'];
  const orderBy = validSorts.includes(sort)
    ? { [sort]: sort === 'title' ? 'asc' : 'desc' }
    : { createdAt: 'desc' };

  const take = Math.min(parseInt(limit), 100);
  const skip = (parseInt(page) - 1) * take;

  const [films, total] = await Promise.all([
    prisma.film.findMany({
      where,
      orderBy,
      take,
      skip,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.film.count({ where }),
  ]);

  return { films, total, page: parseInt(page), limit: take };
}

async function getFilmById(id) {
  const film = await prisma.film.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: { select: { name: true, slug: true } },
      ratings: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!film) {
    const err = new Error('Film non trouvé');
    err.status = 404;
    throw err;
  }
  return film;
}

async function createFilm(data) {
  const film = await prisma.film.create({
    data,
    include: { category: { select: { name: true, slug: true } } },
  });
  return film;
}

async function updateFilm(id, data) {
  const film = await prisma.film.update({
    where: { id: parseInt(id) },
    data,
    include: { category: { select: { name: true, slug: true } } },
  });
  return film;
}

async function deleteFilm(id) {
  await prisma.film.delete({ where: { id: parseInt(id) } });
}

async function updateAvgRating(filmId) {
  const result = await prisma.rating.aggregate({
    where: { filmId },
    _avg: { score: true },
  });
  await prisma.film.update({
    where: { id: filmId },
    data: { avgRating: result._avg.score || 0 },
  });
}

module.exports = { getFilms, getFilmById, createFilm, updateFilm, deleteFilm, updateAvgRating };
