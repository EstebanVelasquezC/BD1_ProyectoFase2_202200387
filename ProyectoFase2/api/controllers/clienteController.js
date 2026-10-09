// CLIENTE es un subtipo de PERSONA (relacion identificadora 1:1 heredada
// del modelo de la Fase 1: CLIENTE.PERSONA_ID_PER es a la vez PK y FK).
// Por eso cada endpoint de este controlador opera sobre ambas tablas: al
// crear un cliente se crea primero su PERSONA y luego su fila CLIENTE con
// el mismo ID, dentro de una misma transaccion.

const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

const SELECT_BASE = `
    SELECT
        c.PERSONA_ID_PER,
        p.NOMBRE_PER, p.APELLIDO_PER, p.TELEFONO, p.CORREO_PER,
        p.DIRECCION_PER, p.MUNICIPIO_ID_MUN,
        c.TIPO_IDENTIFICACION_ID_TIP_IDE, c.NUMERO_IDENTIFICACION
    FROM CLIENTE c
    JOIN PERSONA p ON p.ID_PER = c.PERSONA_ID_PER
`;

async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`${SELECT_BASE} ORDER BY c.PERSONA_ID_PER`);
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
            .query(`${SELECT_BASE} WHERE c.PERSONA_ID_PER = @id`);
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function create(req, res) {
    const {
        PERSONA_ID_PER, NOMBRE_PER, APELLIDO_PER, TELEFONO, CORREO_PER,
        DIRECCION_PER, MUNICIPIO_ID_MUN, TIPO_IDENTIFICACION_ID_TIP_IDE, NUMERO_IDENTIFICACION
    } = req.body;

    let transaction;
    try {
        const pool = await getPool();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        await new sql.Request(transaction)
            .input('id', sql.Int, PERSONA_ID_PER)
            .input('nombre', sql.NVarChar, NOMBRE_PER)
            .input('apellido', sql.NVarChar, APELLIDO_PER)
            .input('telefono', sql.VarChar, TELEFONO)
            .input('correo', sql.NVarChar, CORREO_PER || null)
            .input('direccion', sql.NVarChar, DIRECCION_PER)
            .input('municipio', sql.Int, MUNICIPIO_ID_MUN)
            .query(`INSERT INTO PERSONA (ID_PER, NOMBRE_PER, APELLIDO_PER, TELEFONO, CORREO_PER, DIRECCION_PER, MUNICIPIO_ID_MUN)
                    VALUES (@id, @nombre, @apellido, @telefono, @correo, @direccion, @municipio)`);

        await new sql.Request(transaction)
            .input('id', sql.Int, PERSONA_ID_PER)
            .input('tipoIdent', sql.Int, TIPO_IDENTIFICACION_ID_TIP_IDE)
            .input('numIdent', sql.VarChar, NUMERO_IDENTIFICACION)
            .query(`INSERT INTO CLIENTE (PERSONA_ID_PER, TIPO_IDENTIFICACION_ID_TIP_IDE, NUMERO_IDENTIFICACION)
                    VALUES (@id, @tipoIdent, @numIdent)`);

        await transaction.commit();
        res.status(201).json({ mensaje: 'Cliente creado correctamente.', PERSONA_ID_PER });
    } catch (err) {
        if (transaction) await transaction.rollback().catch(() => {});
        handleDbError(err, res);
    }
}

async function update(req, res) {
    const {
        NOMBRE_PER, APELLIDO_PER, TELEFONO, CORREO_PER,
        DIRECCION_PER, MUNICIPIO_ID_MUN, TIPO_IDENTIFICACION_ID_TIP_IDE, NUMERO_IDENTIFICACION
    } = req.body;
    const id = req.params.id;

    let transaction;
    try {
        const pool = await getPool();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const upPersona = await new sql.Request(transaction)
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, NOMBRE_PER)
            .input('apellido', sql.NVarChar, APELLIDO_PER)
            .input('telefono', sql.VarChar, TELEFONO)
            .input('correo', sql.NVarChar, CORREO_PER || null)
            .input('direccion', sql.NVarChar, DIRECCION_PER)
            .input('municipio', sql.Int, MUNICIPIO_ID_MUN)
            .query(`UPDATE PERSONA SET NOMBRE_PER=@nombre, APELLIDO_PER=@apellido, TELEFONO=@telefono,
                        CORREO_PER=@correo, DIRECCION_PER=@direccion, MUNICIPIO_ID_MUN=@municipio
                    WHERE ID_PER=@id`);

        if (upPersona.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        await new sql.Request(transaction)
            .input('id', sql.Int, id)
            .input('tipoIdent', sql.Int, TIPO_IDENTIFICACION_ID_TIP_IDE)
            .input('numIdent', sql.VarChar, NUMERO_IDENTIFICACION)
            .query(`UPDATE CLIENTE SET TIPO_IDENTIFICACION_ID_TIP_IDE=@tipoIdent, NUMERO_IDENTIFICACION=@numIdent
                    WHERE PERSONA_ID_PER=@id`);

        await transaction.commit();
        res.json({ mensaje: 'Cliente actualizado correctamente.' });
    } catch (err) {
        if (transaction) await transaction.rollback().catch(() => {});
        handleDbError(err, res);
    }
}

async function remove(req, res) {
    // Eliminacion fisica: primero CLIENTE (hijo) y luego PERSONA (padre).
    // Si el cliente tiene ventas asociadas, la FK VENTA_CLIENTE_FK impide
    // el borrado y el errorHandler responde 409.
    let transaction;
    try {
        const pool = await getPool();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const delCliente = await new sql.Request(transaction)
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM CLIENTE WHERE PERSONA_ID_PER = @id');

        if (delCliente.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        await new sql.Request(transaction)
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM PERSONA WHERE ID_PER = @id');

        await transaction.commit();
        res.json({ mensaje: 'Cliente eliminado correctamente.' });
    } catch (err) {
        if (transaction) await transaction.rollback().catch(() => {});
        handleDbError(err, res);
    }
}

module.exports = { getAll, getById, create, update, remove };
