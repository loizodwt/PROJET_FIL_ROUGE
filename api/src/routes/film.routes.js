const { Router } = require('express');
const filmController = require('../controllers/film.controller');
const authenticate = require('../middlewares/authenticate');
const authenticateOptional = require('../middlewares/authenticateOptional');
const authorize = require('../middlewares/authorize');
const upload = require('../lib/upload');

const router = Router();

router.get('/', filmController.getFilms);
router.get('/:id', authenticateOptional, filmController.getFilm);
router.post('/', authenticate, authorize('ADMIN'), upload.single('photo'), filmController.createFilm);
router.put('/:id', authenticate, authorize('ADMIN'), upload.single('photo'), filmController.updateFilm);
router.delete('/:id', authenticate, authorize('ADMIN'), filmController.deleteFilm);

module.exports = router;
