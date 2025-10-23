const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventario.controller');

// Lista
router.get('/', ctrl.index);

// Form de creación (debe ir antes de :id)
router.get('/create', ctrl.createForm);

// Guardar
router.post('/', ctrl.store);

// Detalle (al final para no chocar con /create)
router.get('/:id', ctrl.show);

module.exports = router;
