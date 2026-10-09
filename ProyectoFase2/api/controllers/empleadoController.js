// EMPLEADO, igual que CLIENTE, es un subtipo de PERSONA (PERSONA_ID_PER
// es PK y FK a la vez). Mismo patron: crear/actualizar/eliminar en una
// transaccion que cubre PERSONA + EMPLEADO.

const { sql, getPool } = require('../config/db');
const { handleDbError } = require('../utils/errorHandler');

const SELECT_BASE = `
    SELECT
        e.PERSONA_ID_PER,
        p.NOMBRE_PER, p.APELLIDO_PER, p.TELEFONO, p.CORREO_PER,
        p.DIRECCION_PER, p.MUNICIPIO_ID_MUN,
        e.TIENDA_ID_TI, e.CARGO_ID_CAR, e.FECHA_CONTRATACION
    FROM EMPLEADO e
    JOIN PERSONA p ON p.ID_PER = e.PERSONA_ID_PER
`;

async function getAll(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`${SELECT_BASE} ORDER BY e.PERSONA_ID_PER`);
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
            .query(`${SELECT_BASE} WHERE e.PERSONA_ID_PER = @id`);
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        handleDbError(err, res);
    }
}

async function create(req, res) {
    const {
        PERSONA_ID_PER, NOMBRE_PER, APELLIDO_PER, TELEFONO, CORREO_PER,
        DIRECCION_PER, MUNICIPIO_ID_MUN, TIENDA_ID_TI, CARGO_ID_CAR, FECHA_CONTRATACION
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
            .input('tienda', sql.Int, TIENDA_ID_TI)
            .input('cargo', sql.Int, CARGO_ID_CAR)
            .input('fecha', sql.Date, FECHA_CONTRATACION)
            .query(`INSERT INTO EMPLEADO (PERSONA_ID_PER, TIENDA_ID_TI, CARGO_ID_CAR, FECHA_CONTRATACION)
                    VALUES (@id, @tienda, @cargo, @fecha)`);

        await transaction.commit();
        res.status(201).json({ mensaje: 'Empleado creado correctamente.', PERSONA_ID_PER });
    } catch (err) {
        if (transaction) await transaction.rollback().catch(() => {});
        handleDbError(err, res);
    }
}

async function update(req, res) {
    const {
        NOMBRE_PER, APELLIDO_PER, TELEFONO, CORREO_PER,
        DIRECCION_PER, MUNICIPIO_ID_MUN, TIENDA_ID_TI, CARGO_ID_CAR, FECHA_CONTRATACION
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
            return res.status(404).json({ error: 'Empleado no encontrado.' });
        }

        await new sql.Request(transaction)
            .input('id', sql.Int, id)
            .input('tienda', sql.Int, TIENDA_ID_TI)
            .input('cargo', sql.Int, CARGO_ID_CAR)
            .input('fecha', sql.Date, FECHA_CONTRATACION)
            .query(`UPDATE EMPLEADO SET TIENDA_ID_TI=@tienda, CARGO_ID_CAR=@cargo, FECHA_CONTRATACION=@fecha
                    WHERE PERSONA_ID_PER=@id`);

        await transaction.commit();
        res.json({ mensaje: 'Empleado actualizado correctamente.' });
    } catch (err) {
        if (transaction) await transaction.rollback().catch(() => {});
        handleDbError(err, res);
    }
}

async function remove(req, res) {
    let transaction;
    try {
        const pool = await getPool();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const delEmpleado = await new sql.Request(transaction)
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM EMPLEADO WHERE PERSONA_ID_PER = @id');

        if (delEmpleado.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Empleado no encontrado.' });
        }

        await new sql.Request(transaction)
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM PERSONA WHERE ID_PER = @id');

        await transaction.commit();
        res.json({ mensaje: 'Empleado eliminado correctamente.' });
    } catch (err) {
        if (transaction) await transaction.rollback().catch(() => {});
        handleDbError(err, res);
    }
}

module.exports = { getAll, getById, create, update, remove };
