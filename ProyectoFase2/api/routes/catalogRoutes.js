// Rutas de los catalogos minimos. Cada catalogo tiene su propio router
// (requisito del entregable: "rutas y controladores por entidad"), todos
// construidos sobre la misma fabrica de controlador generico ya que
// comparten estructura (PK entera + nombre).
//
// Prefijo montado en server.js:
//   /api/paises
//   /api/departamentos
//   /api/municipios
//   /api/tipos-tienda
//   /api/tipos-identificacion
//   /api/cargos
//   /api/categorias
//   /api/marcas
//   /api/estados-venta
//   /api/metodos-pago

const express = require('express');
const { createCatalogController } = require('../controllers/catalogGenericController');

function catalogRouter(cfg) {
    const ctrl = createCatalogController(cfg);
    const router = express.Router();
    router.get('/', ctrl.getAll);
    router.get('/:id', ctrl.getById);
    router.post('/', ctrl.create);
    router.put('/:id', ctrl.update);
    router.delete('/:id', ctrl.remove);
    return router;
}

const paisRouter = catalogRouter({
    table: 'PAIS', idColumn: 'ID_PA', columns: [{ name: 'NOMBRE_PA', type: 'nvarchar' }]
});

const departamentoRouter = catalogRouter({
    table: 'DEPARTAMENTO',
    idColumn: 'ID_DEP',
    columns: [{ name: 'NOMBRE_DEP', type: 'nvarchar' }, { name: 'PAIS_ID_PA', type: 'int' }]
});

const municipioRouter = catalogRouter({
    table: 'MUNICIPIO',
    idColumn: 'ID_MUN',
    columns: [{ name: 'NOMBRE_MUN', type: 'nvarchar' }, { name: 'DEPARTAMENTO_ID_DEP', type: 'int' }]
});

const tipoTiendaRouter = catalogRouter({
    table: 'TIPO_TIENDA', idColumn: 'ID_TIP_TIE', columns: [{ name: 'NOMBRE_TIP_TIE', type: 'nvarchar' }]
});

const tipoIdentificacionRouter = catalogRouter({
    table: 'TIPO_IDENTIFICACION', idColumn: 'ID_TIP_IDE', columns: [{ name: 'NOMBRE_TIP_IDE', type: 'nvarchar' }]
});

const cargoRouter = catalogRouter({
    table: 'CARGO', idColumn: 'ID_CAR', columns: [{ name: 'NOMBRE_CAR', type: 'nvarchar' }]
});

const categoriaRouter = catalogRouter({
    table: 'CATEGORIA', idColumn: 'ID_CAT', columns: [{ name: 'NOMBRE_CAT', type: 'nvarchar' }]
});

const marcaRouter = catalogRouter({
    table: 'MARCA', idColumn: 'ID_MAR', columns: [{ name: 'NOMBRE_MAR', type: 'nvarchar' }]
});

const estadoVentaRouter = catalogRouter({
    table: 'ESTADO_VENTA', idColumn: 'ID_ES_VEN', columns: [{ name: 'NOMBRE_ES_VEN', type: 'nvarchar' }]
});

const metodoPagoRouter = catalogRouter({
    table: 'METODO_PAGO', idColumn: 'ID_MET_PAG', columns: [{ name: 'NOMBRE_MET_PAG', type: 'nvarchar' }]
});

module.exports = {
    paisRouter,
    departamentoRouter,
    municipioRouter,
    tipoTiendaRouter,
    tipoIdentificacionRouter,
    cargoRouter,
    categoriaRouter,
    marcaRouter,
    estadoVentaRouter,
    metodoPagoRouter
};
