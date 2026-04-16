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

async function getStats(userId) {
  const [ratings, totalFavorites, totalWatchlist, totalHistory] = await Promise.all([
    prisma.rating.findMany({
      where: { userId },
      include: { film: { include: { category: { select: { name: true } } } } },
    }),
    prisma.favorite.count({ where: { userId } }),
    prisma.watchlist.count({ where: { userId } }),
    prisma.viewHistory.count({ where: { userId } }),
  ]);

  // Distribution 1→5
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => { ratingDistribution[r.score]++; });

  // Moyenne des notes données
  const avgRatingGiven = ratings.length > 0
    ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10
    : 0;

  // Catégorie préférée
  const categoryCount = {};
  ratings.forEach(r => {
    const cat = r.film.category?.name;
    if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const topCategoryEntry = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0];
  const topCategory = topCategoryEntry
    ? { name: topCategoryEntry[0], count: topCategoryEntry[1] }
    : null;

  // Film le mieux noté par l'utilisateur
  const topRatedFilm = ratings.length > 0
    ? ratings.sort((a, b) => b.score - a.score)[0]
    : null;

  return {
    totalRatings: ratings.length,
    avgRatingGiven,
    totalFavorites,
    totalWatchlist,
    totalHistory,
    ratingDistribution,
    topCategory,
    topRatedFilm: topRatedFilm
      ? { title: topRatedFilm.film.title, score: topRatedFilm.score }
      : null,
  };
}

async function getRecommendations(userId) {
  const userRatings = await prisma.rating.findMany({
    where: { userId },
    select: { filmId: true, film: { select: { categoryId: true } } },
  });

  const ratedFilmIds = userRatings.map(r => r.filmId);

  // Find most-rated categories
  const categoryCount = {};
  userRatings.forEach(r => {
    const cid = r.film.categoryId;
    if (cid) categoryCount[cid] = (categoryCount[cid] || 0) + 1;
  });

  const topCategoryIds = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => parseInt(id));

  const exclude = ratedFilmIds.length > 0 ? { notIn: ratedFilmIds } : undefined;

  let recommendations = [];

  if (topCategoryIds.length > 0) {
    recommendations = await prisma.film.findMany({
      where: { categoryId: { in: topCategoryIds }, id: exclude },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { avgRating: 'desc' },
      take: 6,
    });
  }

  // Fallback: top rated unrated films
  if (recommendations.length < 3) {
    recommendations = await prisma.film.findMany({
      where: { id: exclude, avgRating: { gt: 0 } },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { avgRating: 'desc' },
      take: 6,
    });
  }

  return recommendations;
}

module.exports = {
  getFavorites, toggleFavorite,
  getWatchlist, toggleWatchlist,
  rateFilm,
  getHistory, addToHistory,
  getRecommendations,
  getStats,
};
