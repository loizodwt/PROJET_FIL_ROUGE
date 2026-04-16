const memberService = require('../services/member.service');
const filmService = require('../services/film.service');

async function getFavorites(req, res, next) {
  try {
    const favorites = await memberService.getFavorites(req.user.id);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
}

async function toggleFavorite(req, res, next) {
  try {
    const result = await memberService.toggleFavorite(req.user.id, req.params.filmId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getWatchlist(req, res, next) {
  try {
    const list = await memberService.getWatchlist(req.user.id);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function toggleWatchlist(req, res, next) {
  try {
    const result = await memberService.toggleWatchlist(req.user.id, req.params.filmId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function rateFilm(req, res, next) {
  try {
    const { score, comment } = req.body;
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: 'score doit être entre 1 et 5' });
    }
    const rating = await memberService.rateFilm(req.user.id, req.params.filmId, { score: parseInt(score), comment });
    await filmService.updateAvgRating(parseInt(req.params.filmId));
    res.json(rating);
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const history = await memberService.getHistory(req.user.id);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await memberService.getStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const films = await memberService.getRecommendations(req.user.id);
    res.json(films);
  } catch (err) {
    next(err);
  }
}

module.exports = { getFavorites, toggleFavorite, getWatchlist, toggleWatchlist, rateFilm, getHistory, getRecommendations, getStats };
