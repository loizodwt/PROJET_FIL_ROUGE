const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const { validate, body } = require('../middlewares/validate');

const router = Router();

router.post(
  '/register',
  validate([
    body('name').notEmpty('Le nom est requis'),
    body('email').isEmail('Email invalide'),
    body('password').minLength(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail('Email invalide'),
    body('password').notEmpty('Le mot de passe est requis'),
  ]),
  authController.login
);

router.get('/me', authenticate, authController.me);
router.put('/me', authenticate, authController.updateMe);

module.exports = router;
