const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productos.controller');
const requireLogin = require('../middlewares/requireLogin');

router.get('/', ctrl.index);
router.get('/:id', ctrl.show);
router.post('/:id/favorito', requireLogin, ctrl.toggleFavorito);
router.post('/:id/agregar', requireLogin, ctrl.addToCart);

module.exports = router;
