const express = require('express');
const ctrl = require('../controllers/pagoController');

const router = express.Router();
router.get('/', ctrl.getAll);
router.get('/venta/:ventaId', ctrl.getByVenta);
router.get('/:id', ctrl.getById);
// POST dispara el Trigger de Estado Automatico de Venta (ver controller).
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
