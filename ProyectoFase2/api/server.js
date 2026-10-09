// API REST - Comercial La Estrella (Proyecto 2, Bases de Datos 1, USAC)
// Punto de entrada unico y autorizado hacia la base de datos SQL Server,
// segun la politica del DBA: "ningun usuario ni sistema externo puede
// manipular datos conectandose directamente a la base de datos".

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Catalogos minimos -------------------------------------------------
const {
    paisRouter, departamentoRouter, municipioRouter, tipoTiendaRouter,
    tipoIdentificacionRouter, cargoRouter, categoriaRouter, marcaRouter,
    estadoVentaRouter, metodoPagoRouter
} = require('./routes/catalogRoutes');

app.use('/api/paises', paisRouter);
app.use('/api/departamentos', departamentoRouter);
app.use('/api/municipios', municipioRouter);
app.use('/api/tipos-tienda', tipoTiendaRouter);
app.use('/api/tipos-identificacion', tipoIdentificacionRouter);
app.use('/api/cargos', cargoRouter);
app.use('/api/categorias', categoriaRouter);
app.use('/api/marcas', marcaRouter);
app.use('/api/estados-venta', estadoVentaRouter);
app.use('/api/metodos-pago', metodoPagoRouter);

// --- Entidades principales ----------------------------------------------
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/empleados', require('./routes/empleadoRoutes'));
app.use('/api/tiendas', require('./routes/tiendaRoutes'));
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/ventas', require('./routes/ventaRoutes'));
app.use('/api/detalle-venta', require('./routes/detalleVentaRoutes'));
app.use('/api/pagos', require('./routes/pagoRoutes'));

// --- Reportes analiticos (consumen directamente las Vistas de SQL Server) --
app.use('/api/vistas', require('./routes/vistasRoutes'));

// --- Salud del servicio ---------------------------------------------------
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', servicio: 'La Estrella API', hora: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`La Estrella API escuchando en el puerto ${PORT}`);
});
