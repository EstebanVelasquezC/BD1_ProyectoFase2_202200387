// Traduce errores provenientes del motor SQL Server (mssql) a respuestas
// HTTP coherentes, sin que los controladores tengan que repetir esta
// logica en cada endpoint.
//
// Casos cubiertos:
//  - RAISERROR lanzado por el Trigger de inventario (Insert_Detalle)
//    -> HTTP 400 con mensaje "Stock insuficiente"
//  - Violacion de llave unica (UNIQUE / PK duplicada)           -> 409
//  - Violacion de llave foranea (referencia inexistente, o
//    intento de borrar un registro referenciado por otro)       -> 409
//  - Violacion de CHECK constraint                               -> 400
//  - Cualquier otro error no controlado                          -> 500

function handleDbError(err, res) {
    let message = err && err.message ? err.message : 'Error desconocido';

    // Cuando un trigger hace ROLLBACK despues del RAISERROR, SQL Server
    // emite un segundo error (3609: "The transaction ended in the
    // trigger"). El driver mssql deja el RAISERROR original en
    // precedingErrors, asi que se concatenan todos los mensajes.
    if (err && Array.isArray(err.precedingErrors)) {
        message = [...err.precedingErrors.map((e) => e.message), message].join(' | ');
    }

    // Error de negocio lanzado explicitamente por el Trigger de inventario
    if (message.includes('Stock insuficiente')) {
        return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Violacion de CHECK (se evalua ANTES que FOREIGN KEY porque ambas
    // comparten el numero de error 547 en SQL Server)
    if (message.includes('CHECK constraint')) {
        return res.status(400).json({ error: 'Los datos enviados violan una regla de negocio (CHECK constraint).', detalle: message });
    }

    // Violacion de restriccion UNIQUE o PRIMARY KEY duplicada
    if (message.includes('Violation of UNIQUE KEY') ||
        message.includes('Violation of PRIMARY KEY') ||
        (err.number === 2627) || (err.number === 2601)) {
        return res.status(409).json({ error: 'El registro ya existe o viola una restriccion de unicidad.', detalle: message });
    }

    // Violacion de llave foranea (FK inexistente al insertar, o registro
    // referenciado al intentar eliminar)
    if (message.includes('FOREIGN KEY') || err.number === 547) {
        return res.status(409).json({ error: 'Violacion de llave foranea: el registro referenciado no existe o esta en uso por otra tabla.', detalle: message });
    }

    console.error('Error de base de datos no controlado:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', detalle: message });
}

module.exports = { handleDbError };
