const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM PRODUCTO ORDER BY ID_PRO');
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
            .query('SELECT * FROM PRODUCTO WHERE ID_PRO = @id');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.json(result.recordset[0]);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function create(req, res) {
    const { ID_PRO, NOMBRE_PRO, CATEGORIA_ID_CAT, MARCA_ID_MAR, DESCRIPCION_PRO } = req.body;
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, ID_PRO)
            .input('nombre', sql.NVarChar, NOMBRE_PRO)
            .input('categoria', sql.Int, CATEGORIA_ID_CAT)
            .input('marca', sql.Int, MARCA_ID_MAR)
            .input('descripcion', sql.NVarChar, DESCRIPCION_PRO || null)
            .query(`INSERT INTO PRODUCTO (ID_PRO, NOMBRE_PRO, CATEGORIA_ID_CAT, MARCA_ID_MAR, DESCRIPCION_PRO)
                    VALUES (@id, @nombre, @categoria, @marca, @descripcion)`);
        res.status(201).json({ mensaje: 'Producto creado correctamente.', ID_PRO });
    } catch (err) {
        handleDbError(err, res);
    }
}

async function update(req, res) {
    const { NOMBRE_PRO, CATEGORIA_ID_CAT, MARCA_ID_MAR, DESCRIPCION_PRO } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('nombre', sql.NVarChar, NOMBRE_PRO)
            .input('categoria', sql.Int, CATEGORIA_ID_CAT)
            .input('marca', sql.Int, MARCA_ID_MAR)
            .input('descripcion', sql.NVarChar, DESCRIPCION_PRO || null)
            .query(`UPDATE PRODUCTO SET NOMBRE_PRO=@nombre, CATEGORIA_ID_CAT=@categoria,
                        MARCA_ID_MAR=@marca, DESCRIPCION_PRO=@descripcion
                    WHERE ID_PRO=@id`);
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.json({ mensaje: 'Producto actualizado correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

async function remove(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM PRODUCTO WHERE ID_PRO = @id');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.json({ mensaje: 'Producto eliminado correctamente.' });
    } catch (err) {
        handleDbError(err, res);
    }
}

module.exports = { getAll, getById, create, update, remove };
