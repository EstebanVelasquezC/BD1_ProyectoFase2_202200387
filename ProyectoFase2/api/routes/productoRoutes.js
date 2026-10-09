const express = require('express');
const ctrl = require('../controllers/productoController');
const catalogoCtrl = require('../controllers/catalogoProductoController');

const router = express.Router();
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

// Sub-recurso: catalogo (precio/existencia) de un producto por tienda.
// GET /api/productos/catalogo                          -> todo el catalogo
// GET /api/productos/catalogo/:tiendaId/:productoId     -> un registro
// POST /api/productos/catalogo                          -> crear
// PUT /api/productos/catalogo/:tiendaId/:productoId     -> actualizar
// DELETE /api/productos/catalogo/:tiendaId/:productoId  -> eliminar
router.get('/catalogo/all', catalogoCtrl.getAll);
router.get('/catalogo/:tiendaId/:productoId', catalogoCtrl.getById);
router.post('/catalogo', catalogoCtrl.create);
router.put('/catalogo/:tiendaId/:productoId', catalogoCtrl.update);
router.delete('/catalogo/:tiendaId/:productoId', catalogoCtrl.remove);

module.exports = router;
