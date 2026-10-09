// Endpoints de reportes. Tal como lo exige el enunciado, el API NO hace
// JOINs en su codigo fuente para estos reportes: simplemente consulta las
// vistas creadas en SQL Server (init.sql). Toda la logica analitica vive
// en el motor de base de datos.

const { getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

async function ventasUbicacion(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM Vista_Ventas_Ubicacion');
        res.json(result.recordset);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function topProductos(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM Vista_Top_Productos ORDER BY MONTO_TOTAL DESC');
        res.json(result.recordset);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function saldosPendientes(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM Vista_Saldos_Pendientes');
        res.json(result.recordset);
    } catch (err) {
        handleDbError(err, res);
    }
}

module.exports = { ventasUbicacion, topProductos, saldosPendientes };
