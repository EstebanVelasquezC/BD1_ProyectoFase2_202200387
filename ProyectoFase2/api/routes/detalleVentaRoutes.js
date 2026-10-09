const express = require('express');
const ctrl = require('../controllers/detalleVentaController');

const router = express.Router();
router.get('/', ctrl.getAll);
router.get('/venta/:ventaId', ctrl.getByVenta);
// POST dispara el Trigger de Proteccion de Inventario (ver controller).
router.post('/', ctrl.create);
router.get('/:ventaId/:productoId', ctrl.getById);
router.put('/:ventaId/:productoId', ctrl.update);
router.delete('/:ventaId/:productoId', ctrl.remove);

module.exports = router;
