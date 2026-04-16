const filmService = require('../services/film.service');
const memberService = require('../services/member.service');

async function getFilms(req, res, next) {
  try {
    const result = await filmService.getFilms(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getFilm(req, res, next) {
  try {
    const film = await filmService.getFilmById(req.params.id);
    // Track view history if user is authenticated
    if (req.user) {
      memberService.addToHistory(req.user.id, req.params.id).catch(() => {});
    }
    res.json(film);
  } catch (err) {
    next(err);
  }
}

async function createFilm(req, res, next) {
  try {
    const { title, synopsis, releaseYear, director, categoryId, photoUrl: photoUrlBody } = req.body;
    if (!title) return res.status(400).json({ error: 'title est requis' });

    const data = {
      title,
      synopsis,
      releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      director,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : (photoUrlBody || undefined),
    };

    const film = await filmService.createFilm(data);
    res.status(201).json(film);
  } catch (err) {
    next(err);
  }
}

async function updateFilm(req, res, next) {
  try {
    const { title, synopsis, releaseYear, director, categoryId, photoUrl: photoUrlBody } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (synopsis !== undefined) data.synopsis = synopsis;
    if (releaseYear !== undefined) data.releaseYear = parseInt(releaseYear);
    if (director !== undefined) data.director = director;
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
    if (req.file) data.photoUrl = `/uploads/${req.file.filename}`;
    else if (photoUrlBody !== undefined) data.photoUrl = photoUrlBody || null;

    const film = await filmService.updateFilm(req.params.id, data);
    res.json(film);
  } catch (err) {
    next(err);
  }
}

async function deleteFilm(req, res, next) {
  try {
    await filmService.deleteFilm(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getFilms, getFilm, createFilm, updateFilm, deleteFilm };
