const router = require('express').Router();
const ctrl = require('../controllers/usuarios.controller');
const requireLogin = require('../middlewares/requireLogin');

router.get('/', ctrl.index);
router.get('/login', ctrl.loginForm);
router.post('/login', ctrl.login);
router.get('/register', ctrl.registerForm);
router.post('/register', ctrl.register);
router.post('/logout', ctrl.logout);
router.get('/perfil', requireLogin, ctrl.perfil);

module.exports = router;
