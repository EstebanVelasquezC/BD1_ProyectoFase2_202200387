const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM TIENDA ORDER BY ID_TI');
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
            .query('SELECT * FROM TIENDA WHERE ID_TI = @id');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Tienda no encontrada.' });
        res.json(result.recordset[0]);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function create(req, res) {
    const { ID_TI, NOMBRE_TI, DIRECCION_TI, MUNICIPIO_ID_MUN, TIPO_TIENDA_ID_TIP_TIE, TELEFONO_TI } = req.body;
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, ID_TI)
            .input('nombre', sql.NVarChar, NOMBRE_TI)
            .input('direccion', sql.NVarChar, DIRECCION_TI)
            .input('municipio', sql.Int, MUNICIPIO_ID_MUN)
            .input('tipoTienda', sql.Int, TIPO_TIENDA_ID_TIP_TIE)
            .input('telefono', sql.VarChar, TELEFONO_TI)
            .query(`INSERT INTO TIENDA (ID_TI, NOMBRE_TI, DIRECCION_TI, MUNICIPIO_ID_MUN, TIPO_TIENDA_ID_TIP_TIE, TELEFONO_TI)
                    VALUES (@id, @nombre, @direccion, @municipio, @tipoTienda, @telefono)`);
        res.status(201).json({ mensaje: 'Tienda creada correctamente.', ID_TI });
    } catch (err) {
        handleDbError(err, res);
    }
}

async function update(req, res) {
    const { NOMBRE_TI, DIRECCION_TI, MUNICIPIO_ID_MUN, TIPO_TIENDA_ID_TIP_TIE, TELEFONO_TI } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('nombre', sql.NVarChar, NOMBRE_TI)
            .input('direccion', sql.NVarChar, DIRECCION_TI)
            .input('municipio', sql.Int, MUNICIPIO_ID_MUN)
            .input('tipoTienda', sql.Int, TIPO_TIENDA_ID_TIP_TIE)
            .input('telefono', sql.VarChar, TELEFONO_TI)
            .query(`UPDATE TIENDA SET NOMBRE_TI=@nombre, DIRECCION_TI=@direccion, MUNICIPIO_ID_MUN=@municipio,
                        TIPO_TIENDA_ID_TIP_TIE=@tipoTienda, TELEFONO_TI=@telefono
                    WHERE ID_TI=@id`);
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Tienda no encontrada.' });
        res.json({ mensaje: 'Tienda actualizada correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

async function remove(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM TIENDA WHERE ID_TI = @id');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Tienda no encontrada.' });
        res.json({ mensaje: 'Tienda eliminada correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

module.exports = { getAll, getById, create, update, remove };
