const { Router } = require('express');
const memberController = require('../controllers/member.controller');
const authenticate = require('../middlewares/authenticate');

const router = Router();

router.use(authenticate);

router.get('/favorites', memberController.getFavorites);
router.post('/favorites/:filmId', memberController.toggleFavorite);

router.get('/watchlist', memberController.getWatchlist);
router.post('/watchlist/:filmId', memberController.toggleWatchlist);

router.post('/ratings/:filmId', memberController.rateFilm);

router.get('/history', memberController.getHistory);

module.exports = router;
