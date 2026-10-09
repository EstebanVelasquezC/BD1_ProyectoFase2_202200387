// DETALLE DE VENTA (tabla DESGLOSE_VENTA). El POST de este controlador es
// el que dispara el Trigger de Proteccion de Inventario
// (trg_DesgloseVenta_Insert_Detalle): si la cantidad pedida supera la
// existencia_actual del producto en la tienda de la venta, el motor hace
// ROLLBACK + RAISERROR, y este controlador debe traducir ese error a
// HTTP 400 con el mensaje "Stock insuficiente" (ver utils/errorHandler.js).
//
// El precio unitario NO se recibe del cliente: se toma del precio vigente
// en CATALOGO_PRODUCTO para esa tienda/producto en el momento de la venta,
// evitando que el API tenga que "confiar" en un precio enviado desde
// afuera. SUBTOTAL es una columna calculada en la base de datos.

const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM DESGLOSE_VENTA ORDER BY VENTA_ID_VEN, PRODUCTO_ID_PRO');
        res.json(result.recordset);
    } catch (err) {
        handleDbError(err, res);
    }
}

// GET /api/detalle-venta/venta/:ventaId -> todas las lineas de una venta
async function getByVenta(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('venta', sql.Int, req.params.ventaId)
            .query('SELECT * FROM DESGLOSE_VENTA WHERE VENTA_ID_VEN = @venta ORDER BY PRODUCTO_ID_PRO');
        res.json(result.recordset);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function create(req, res) {
    const { VENTA_ID_VEN, PRODUCTO_ID_PRO, CANTIDAD } = req.body;
    try {
        const pool = await getPool();

        // 1) Determinar la tienda de la venta y el precio vigente del
        //    producto en esa tienda (CATALOGO_PRODUCTO).
        const ventaResult = await pool.request()
            .input('venta', sql.Int, VENTA_ID_VEN)
            .query('SELECT TIENDA_ID_TI FROM VENTA WHERE ID_VEN = @venta');

        if (ventaResult.recordset.length === 0) {
            return res.status(404).json({ error: 'La venta indicada no existe.' });
        }
        const tiendaId = ventaResult.recordset[0].TIENDA_ID_TI;

        const catalogoResult = await pool.request()
            .input('tienda', sql.Int, tiendaId)
            .input('producto', sql.Int, PRODUCTO_ID_PRO)
            .query('SELECT PRECIO_VIGENTE FROM CATALOGO_PRODUCTO WHERE TIENDA_ID_TI = @tienda AND PRODUCTO_ID_PRO = @producto');

        if (catalogoResult.recordset.length === 0) {
            return res.status(404).json({ error: 'El producto no esta disponible en el catalogo de esta tienda.' });
        }
        const precioVigente = catalogoResult.recordset[0].PRECIO_VIGENTE;

        // 2) Insertar el detalle. El Trigger de inventario se ejecuta de
        //    forma automatica al hacer este INSERT: valida stock y, si es
        //    suficiente, descuenta la existencia; si no, hace ROLLBACK y
        //    RAISERROR, lo cual mssql reporta como excepcion aqui mismo.
        await pool.request()
            .input('venta', sql.Int, VENTA_ID_VEN)
            .input('producto', sql.Int, PRODUCTO_ID_PRO)
            .input('cantidad', sql.Int, CANTIDAD)
            .input('precio', sql.Decimal(10, 2), precioVigente)
            .query(`INSERT INTO DESGLOSE_VENTA (VENTA_ID_VEN, PRODUCTO_ID_PRO, CANTIDAD, PRECIO_UNITARIO)
                    VALUES (@venta, @producto, @cantidad, @precio)`);

        res.status(201).json({
            mensaje: 'Detalle de venta registrado correctamente. Inventario actualizado por el motor de base de datos.',
            VENTA_ID_VEN, PRODUCTO_ID_PRO, CANTIDAD, PRECIO_UNITARIO: precioVigente
        });
    } catch (err) {
        handleDbError(err, res);
    }
}

// GET /api/detalle-venta/:ventaId/:productoId -> un renglon de detalle
async function getById(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('venta', sql.Int, req.params.ventaId)
            .input('producto', sql.Int, req.params.productoId)
            .query('SELECT * FROM DESGLOSE_VENTA WHERE VENTA_ID_VEN=@venta AND PRODUCTO_ID_PRO=@producto');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Detalle de venta no encontrado.' });
        res.json(result.recordset[0]);
    } catch (err) {
        handleDbError(err, res);
    }
}

// PUT /api/detalle-venta/:ventaId/:productoId -> solo permite corregir el
// PRECIO_UNITARIO. La CANTIDAD no es editable: el Trigger de inventario
// solo actua en el INSERT, asi que cambiarla descuadraria la existencia.
// Para cambiar la cantidad se elimina el renglon y se agrega de nuevo.
async function update(req, res) {
    const { PRECIO_UNITARIO } = req.body;
    if (PRECIO_UNITARIO === undefined) {
        return res.status(400).json({ error: 'Se requiere PRECIO_UNITARIO. La cantidad de un detalle no es editable.' });
    }
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('venta', sql.Int, req.params.ventaId)
            .input('producto', sql.Int, req.params.productoId)
            .input('precio', sql.Decimal(10, 2), PRECIO_UNITARIO)
            .query('UPDATE DESGLOSE_VENTA SET PRECIO_UNITARIO=@precio WHERE VENTA_ID_VEN=@venta AND PRODUCTO_ID_PRO=@producto');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Detalle de venta no encontrado.' });
        res.json({ mensaje: 'Detalle de venta actualizado correctamente (precio unitario).' });
    } catch (err) {
        handleDbError(err, res);
    }
}

async function remove(req, res) {
    // Nota: el borrado de un detalle NO repone automaticamente el
    // inventario (el enunciado solo exige reponerlo via trigger en el
    // INSERT); se deja como eliminacion simple del renglon.
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('venta', sql.Int, req.params.ventaId)
            .input('producto', sql.Int, req.params.productoId)
            .query('DELETE FROM DESGLOSE_VENTA WHERE VENTA_ID_VEN=@venta AND PRODUCTO_ID_PRO=@producto');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Detalle de venta no encontrado.' });
        res.json({ mensaje: 'Detalle de venta eliminado correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

module.exports = { getAll, getByVenta, getById, create, update, remove };
