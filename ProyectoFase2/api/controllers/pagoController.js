// PAGO. El POST de este controlador es el que dispara el Trigger de
// Estado Automatico de Venta (trg_Pago_Insert_Pago): el motor suma todos
// los pagos de la venta y, si el acumulado alcanza o supera el total,
// cambia el estado de la venta a "PAGADA" automaticamente. El API nunca
// actualiza el estado de la venta por su cuenta; solo inserta el pago y
// reporta exito.

const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM PAGO ORDER BY ID_PAG');
        res.json(result.recordset);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function getById(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM PAGO WHERE ID_PAG = @id');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Pago no encontrado.' });
        res.json(result.recordset[0]);
    } catch (err) {
        handleDbError(err, res);
    }
}

// GET /api/pagos/venta/:ventaId -> todos los abonos de una venta
async function getByVenta(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('venta', sql.Int, req.params.ventaId)
            .query('SELECT * FROM PAGO WHERE VENTA_ID_VEN = @venta ORDER BY ID_PAG');
        res.json(result.recordset);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function create(req, res) {
    const { ID_PAG, MONTO_PAG, VENTA_ID_VEN, METODO_PAGO_ID_MET_PAG } = req.body;
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, ID_PAG)
            .input('monto', sql.Decimal(10, 2), MONTO_PAG)
            .input('venta', sql.Int, VENTA_ID_VEN)
            .input('metodo', sql.Int, METODO_PAGO_ID_MET_PAG)
            .query(`INSERT INTO PAGO (ID_PAG, MONTO_PAG, VENTA_ID_VEN, METODO_PAGO_ID_MET_PAG)
                    VALUES (@id, @monto, @venta, @metodo)`);

        res.status(201).json({
            mensaje: 'Pago registrado correctamente. El estado de la venta se actualiza automaticamente si el total queda cubierto.',
            ID_PAG
        });
    } catch (err) {
        handleDbError(err, res);
    }
}

// PUT /api/pagos/:id -> solo permite corregir el METODO DE PAGO.
// El monto y la venta de un pago NO se editan: el Trigger de estado solo
// se evalua en el INSERT, asi que cambiarlos dejaria la venta en un estado
// inconsistente. Para corregir un monto se elimina el pago y se registra uno nuevo.
async function update(req, res) {
    const { METODO_PAGO_ID_MET_PAG } = req.body;
    if (METODO_PAGO_ID_MET_PAG === undefined) {
        return res.status(400).json({ error: 'Se requiere METODO_PAGO_ID_MET_PAG. El monto y la venta de un pago no son editables.' });
    }
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('metodo', sql.Int, METODO_PAGO_ID_MET_PAG)
            .query('UPDATE PAGO SET METODO_PAGO_ID_MET_PAG = @metodo WHERE ID_PAG = @id');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Pago no encontrado.' });
        res.json({ mensaje: 'Pago actualizado correctamente (metodo de pago).' });
    } catch (err) {
        handleDbError(err, res);
    }
}

async function remove(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM PAGO WHERE ID_PAG = @id');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Pago no encontrado.' });
        res.json({ mensaje: 'Pago eliminado correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

module.exports = { getAll, getById, getByVenta, create, update, remove };
