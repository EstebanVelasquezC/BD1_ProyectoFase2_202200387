// Fabrica de controladores para los catalogos minimos (PAIS, DEPARTAMENTO,
// MUNICIPIO, TIPO_TIENDA, TIPO_IDENTIFICACION, CARGO, CATEGORIA, MARCA,
// ESTADO_VENTA, METODO_PAGO). Todos comparten la misma forma: una llave
// primaria entera y uno o dos campos de descripcion, asi que en vez de
// repetir el mismo CRUD diez veces se genera a partir de la configuracion
// de cada tabla. Cada entidad conserva su propio archivo de ruta y
// controlador (ver /routes y /controllers), que simplemente invocan esta
// fabrica con los datos de su tabla.

const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

/**
 * @param {object} cfg
 * @param {string} cfg.table      Nombre de la tabla
 * @param {string} cfg.idColumn   Nombre de la columna PK
 * @param {{name:string,type:'int'|'nvarchar'}[]} cfg.columns
 *        Columnas insertables/actualizables (sin la PK), con su tipo SQL.
 */
function createCatalogController(cfg) {
    const { table, idColumn, columns } = cfg;

    function sqlType(col) {
        return col.type === 'int' ? sql.Int : sql.NVarChar;
    }

    async function getAll(req, res) {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`SELECT * FROM ${table} ORDER BY ${idColumn}`);
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
                .query(`SELECT * FROM ${table} WHERE ${idColumn} = @id`);
            if (result.recordset.length === 0) {
                return res.status(404).json({ error: `${table} no encontrado.` });
            }
            res.json(result.recordset[0]);
        } catch (err) {
            handleDbError(err, res);
        }
    }

    async function create(req, res) {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('id', sql.Int, req.body[idColumn]);
            columns.forEach((col) => request.input(col.name, sqlType(col), req.body[col.name]));

            const colList = [idColumn, ...columns.map((c) => c.name)].join(', ');
            const valList = ['@id', ...columns.map((c) => `@${c.name}`)].join(', ');

            await request.query(`INSERT INTO ${table} (${colList}) VALUES (${valList})`);
            res.status(201).json({ mensaje: `${table} creado correctamente.`, [idColumn]: req.body[idColumn] });
        } catch (err) {
            handleDbError(err, res);
        }
    }

    async function update(req, res) {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('id', sql.Int, req.params.id);
            columns.forEach((col) => request.input(col.name, sqlType(col), req.body[col.name]));

            const setList = columns.map((c) => `${c.name} = @${c.name}`).join(', ');
            const result = await request.query(`UPDATE ${table} SET ${setList} WHERE ${idColumn} = @id`);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: `${table} no encontrado.` });
            }
            res.json({ mensaje: `${table} actualizado correctamente.` });
        } catch (err) {
            handleDbError(err, res);
        }
    }

    async function remove(req, res) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('id', sql.Int, req.params.id)
                .query(`DELETE FROM ${table} WHERE ${idColumn} = @id`);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: `${table} no encontrado.` });
            }
            res.json({ mensaje: `${table} eliminado correctamente.` });
        } catch (err) {
            handleDbError(err, res);
        }
    }

    return { getAll, getById, create, update, remove };
}

module.exports = { createCatalogController };
