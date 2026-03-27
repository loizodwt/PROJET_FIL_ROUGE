const prisma = require('../lib/prisma');

async function getFavorites(userId) {
  return prisma.favorite.findMany({
    where: { userId },
    include: { film: { include: { category: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function toggleFavorite(userId, filmId) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_filmId: { userId, filmId: parseInt(filmId) } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { action: 'removed' };
  }

  await prisma.favorite.create({ data: { userId, filmId: parseInt(filmId) } });
  return { action: 'added' };
}

async function getWatchlist(userId) {
  return prisma.watchlist.findMany({
    where: { userId },
    include: { film: { include: { category: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function toggleWatchlist(userId, filmId) {
  const existing = await prisma.watchlist.findUnique({
    where: { userId_filmId: { userId, filmId: parseInt(filmId) } },
  });

  if (existing) {
    await prisma.watchlist.delete({ where: { id: existing.id } });
    return { action: 'removed' };
  }

  await prisma.watchlist.create({ data: { userId, filmId: parseInt(filmId) } });
  return { action: 'added' };
}

async function rateFilm(userId, filmId, { score, comment }) {
  const rating = await prisma.rating.upsert({
    where: { userId_filmId: { userId, filmId: parseInt(filmId) } },
    update: { score, comment },
    create: { userId, filmId: parseInt(filmId), score, comment },
  });
  return rating;
}

async function getHistory(userId) {
  return prisma.viewHistory.findMany({
    where: { userId },
    include: { film: { select: { id: true, title: true, photoUrl: true } } },
    orderBy: { viewedAt: 'desc' },
    take: 50,
  });
}

async function addToHistory(userId, filmId) {
  return prisma.viewHistory.create({
    data: { userId, filmId: parseInt(filmId) },
  });
}

module.exports = {
  getFavorites, toggleFavorite,
  getWatchlist, toggleWatchlist,
  rateFilm,
  getHistory, addToHistory,
};
