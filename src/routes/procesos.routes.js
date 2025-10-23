const router = require('express').Router();
const requireLogin = require('../middlewares/requireLogin');
const ctrl = require('../controllers/procesos.controller');

router.get('/', requireLogin, ctrl.index);
router.post('/checkout', requireLogin, ctrl.checkout);
router.get('/reporte', requireLogin, ctrl.reporte);

module.exports = router;
