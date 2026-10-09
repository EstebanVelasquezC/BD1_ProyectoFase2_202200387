const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM VENTA ORDER BY ID_VEN');
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
            .query('SELECT * FROM VENTA WHERE ID_VEN = @id');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Venta no encontrada.' });
        res.json(result.recordset[0]);
    } catch (err) {
        handleDbError(err, res);
    }
}

// Crea el encabezado de la venta. El estado inicial siempre es
// "REGISTRADA" (el cambio a "PAGADA" lo hace exclusivamente el Trigger
// Insert_Pago cuando los abonos cubren el total, nunca el API a mano).
async function create(req, res) {
    const { ID_VEN, FECHA_VEN, TIENDA_ID_TI, EMPLEADO_PERSONA_ID_PER, CLIENTE_PERSONA_ID_PER } = req.body;
    try {
        const pool = await getPool();
        const estado = await pool.request().query(`SELECT ID_ES_VEN FROM ESTADO_VENTA WHERE NOMBRE_ES_VEN = 'REGISTRADA'`);
        const idRegistrada = estado.recordset[0].ID_ES_VEN;

        await pool.request()
            .input('id', sql.Int, ID_VEN)
            .input('fecha', sql.Date, FECHA_VEN)
            .input('tienda', sql.Int, TIENDA_ID_TI)
            .input('estado', sql.Int, idRegistrada)
            .input('empleado', sql.Int, EMPLEADO_PERSONA_ID_PER)
            .input('cliente', sql.Int, CLIENTE_PERSONA_ID_PER)
            .query(`INSERT INTO VENTA (ID_VEN, FECHA_VEN, TIENDA_ID_TI, ESTADO_VENTA_ID_ES_VEN, EMPLEADO_PERSONA_ID_PER, CLIENTE_PERSONA_ID_PER)
                    VALUES (@id, @fecha, @tienda, @estado, @empleado, @cliente)`);
        res.status(201).json({ mensaje: 'Venta creada correctamente con estado REGISTRADA.', ID_VEN });
    } catch (err) {
        handleDbError(err, res);
    }
}

// Solo permite actualizar los datos del encabezado. El estado de la
// venta NO se expone aqui: solo lo cambia el Trigger Insert_Pago o el
// endpoint de anulacion logica (remove).
async function update(req, res) {
    const { FECHA_VEN, TIENDA_ID_TI, EMPLEADO_PERSONA_ID_PER, CLIENTE_PERSONA_ID_PER } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('fecha', sql.Date, FECHA_VEN)
            .input('tienda', sql.Int, TIENDA_ID_TI)
            .input('empleado', sql.Int, EMPLEADO_PERSONA_ID_PER)
            .input('cliente', sql.Int, CLIENTE_PERSONA_ID_PER)
            .query(`UPDATE VENTA SET FECHA_VEN=@fecha, TIENDA_ID_TI=@tienda,
                        EMPLEADO_PERSONA_ID_PER=@empleado, CLIENTE_PERSONA_ID_PER=@cliente
                    WHERE ID_VEN=@id`);
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Venta no encontrada.' });
        res.json({ mensaje: 'Venta actualizada correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

// Eliminacion LOGICA: cambia el estado de la venta a "ANULADA" en vez de
// borrar el registro fisicamente (asi lo permite el enunciado: "o cambiar
// su estado logico, segun lo requiera el modelo"). Esto preserva el
// historial y respeta las vistas analiticas, que excluyen ANULADA.
async function remove(req, res) {
    try {
        const pool = await getPool();
        const estado = await pool.request().query(`SELECT ID_ES_VEN FROM ESTADO_VENTA WHERE NOMBRE_ES_VEN = 'ANULADA'`);
        const idAnulada = estado.recordset[0].ID_ES_VEN;

        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('estado', sql.Int, idAnulada)
            .query('UPDATE VENTA SET ESTADO_VENTA_ID_ES_VEN = @estado WHERE ID_VEN = @id');

        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Venta no encontrada.' });
        res.json({ mensaje: 'Venta anulada correctamente (estado logico = ANULADA).' });
    } catch (err) {
        handleDbError(err, res);
    }
}

module.exports = { getAll, getById, create, update, remove };
