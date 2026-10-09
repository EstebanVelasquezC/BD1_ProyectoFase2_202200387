// CATALOGO_PRODUCTO (precio y existencia de un producto en una tienda
// especifica) tiene llave primaria compuesta (TIENDA_ID_TI, PRODUCTO_ID_PRO).
// Es la tabla que el Trigger de inventario (Insert_Detalle) consulta y
// actualiza, por lo que necesita su propio CRUD para poder dar de alta
// existencias antes de probar los escenarios de venta.

const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM CATALOGO_PRODUCTO ORDER BY TIENDA_ID_TI, PRODUCTO_ID_PRO');
        res.json(result.recordset);
    } catch (err) {
        handleDbError(err, res);
    }
}

// GET /api/catalogo-producto/:tiendaId/:productoId
async function getById(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('tienda', sql.Int, req.params.tiendaId)
            .input('producto', sql.Int, req.params.productoId)
            .query('SELECT * FROM CATALOGO_PRODUCTO WHERE TIENDA_ID_TI=@tienda AND PRODUCTO_ID_PRO=@producto');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Registro de catalogo no encontrado.' });
        res.json(result.recordset[0]);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function create(req, res) {
    const { TIENDA_ID_TI, PRODUCTO_ID_PRO, PRECIO_VIGENTE, EXISTENCIA_ACTUAL } = req.body;
    try {
        const pool = await getPool();
        await pool.request()
            .input('tienda', sql.Int, TIENDA_ID_TI)
            .input('producto', sql.Int, PRODUCTO_ID_PRO)
            .input('precio', sql.Decimal(10, 2), PRECIO_VIGENTE)
            .input('existencia', sql.Int, EXISTENCIA_ACTUAL)
            .query(`INSERT INTO CATALOGO_PRODUCTO (TIENDA_ID_TI, PRODUCTO_ID_PRO, PRECIO_VIGENTE, EXISTENCIA_ACTUAL)
                    VALUES (@tienda, @producto, @precio, @existencia)`);
        res.status(201).json({ mensaje: 'Catalogo de producto creado correctamente.', TIENDA_ID_TI, PRODUCTO_ID_PRO });
    } catch (err) {
        handleDbError(err, res);
    }
}

async function update(req, res) {
    const { PRECIO_VIGENTE, EXISTENCIA_ACTUAL } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('tienda', sql.Int, req.params.tiendaId)
            .input('producto', sql.Int, req.params.productoId)
            .input('precio', sql.Decimal(10, 2), PRECIO_VIGENTE)
            .input('existencia', sql.Int, EXISTENCIA_ACTUAL)
            .query(`UPDATE CATALOGO_PRODUCTO SET PRECIO_VIGENTE=@precio, EXISTENCIA_ACTUAL=@existencia
                    WHERE TIENDA_ID_TI=@tienda AND PRODUCTO_ID_PRO=@producto`);
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Registro de catalogo no encontrado.' });
        res.json({ mensaje: 'Catalogo de producto actualizado correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

async function remove(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('tienda', sql.Int, req.params.tiendaId)
            .input('producto', sql.Int, req.params.productoId)
            .query('DELETE FROM CATALOGO_PRODUCTO WHERE TIENDA_ID_TI=@tienda AND PRODUCTO_ID_PRO=@producto');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Registro de catalogo no encontrado.' });
        res.json({ mensaje: 'Catalogo de producto eliminado correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

module.exports = { getAll, getById, create, update, remove };
