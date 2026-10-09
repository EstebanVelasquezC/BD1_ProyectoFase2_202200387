const express = require('express');
const ctrl = require('../controllers/vistasController');

const router = express.Router();
router.get('/ventas-ubicacion', ctrl.ventasUbicacion);
router.get('/top-productos', ctrl.topProductos);
router.get('/saldos-pendientes', ctrl.saldosPendientes);

module.exports = router;
