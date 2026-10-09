// Configuracion de conexion a SQL Server mediante el paquete "mssql".


const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'LaEstrella#2026',
    database: process.env.DB_DATABASE || 'ComercialLaEstrella',
    options: {
        encrypt: true,
        trustServerCertificate: true, // necesario para el certificado autofirmado del contenedor
        enableArithAbort: true // requerido para DML sobre tablas con indices filtrados
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise;

function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then((pool) => {
                console.log('Conexion a SQL Server establecida correctamente.');
                return pool;
            })
            .catch((err) => {
                poolPromise = null;
                console.error('Error al conectar con SQL Server:', err.message);
                throw err;
            });
    }
    return poolPromise;
}

module.exports = { sql, getPool, config };