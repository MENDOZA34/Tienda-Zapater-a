const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categorias.controller');

router.get('/', ctrl.index);
router.get('/create', ctrl.createForm);
router.post('/', ctrl.store);
router.get('/:id', ctrl.show);

module.exports = router;

