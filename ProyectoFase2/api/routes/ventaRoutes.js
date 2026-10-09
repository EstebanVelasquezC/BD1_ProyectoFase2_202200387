const express = require('express');
const ctrl = require('../controllers/ventaController');

const router = express.Router();
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove); // anulacion logica (estado = ANULADA)

module.exports = router;
