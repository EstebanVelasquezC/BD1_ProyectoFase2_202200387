// ============================================================
// Bases de Datos 1 - Proyecto 2 (Fase 2) - Script de carga de datos
// Comercial La Estrella
// Orden de carga (respeta dependencias de llaves foraneas):
//   1. Catalogos: PAIS, DEPARTAMENTO, MUNICIPIO, TIPO_TIENDA,
//      TIPO_IDENTIFICACION, CARGO, CATEGORIA, MARCA, ESTADO_VENTA,
//      METODO_PAGO
//   2. TIENDA
//   3. PRODUCTO
//   4. CLIENTE y EMPLEADO (cada uno crea su PERSONA base + el subtipo
//      en una sola llamada al API, ver controllers/clienteController.js
//      y empleadoController.js)
//   5. CATALOGO_PRODUCTO (precio/existencia por tienda), con la
//      existencia "inflada" (ver nota mas abajo)
//   6. VENTA (encabezado, siempre queda en estado REGISTRADA)
//   7. DESGLOSE_VENTA (dispara el Trigger de inventario en cada INSERT)
//   8. PAGO (dispara el Trigger de estado automatico de venta)
//   9. Correccion final de estado: las ventas cuyo estado original en la
//      Fase 1 era ANULADA se anulan explicitamente via DELETE (anulacion
//      logica), ya que ningun trigger puede producir ese estado.


const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api';
const SQL_FILE = path.join(__dirname, 'carga_datos_fase1.sql');

// ------------------------------------------------------------
// 1. Parseo del script SQL de la Fase 1
// ------------------------------------------------------------

function parseValue(raw) {
    raw = raw.trim();
    if (raw.toUpperCase() === 'NULL') return null;
    // TO_DATE('2026-08-23','YYYY-MM-DD') -> '2026-08-23'
    const dateMatch = raw.match(/^TO_DATE\('([\d-]+)'/i);
    if (dateMatch) return dateMatch[1];
    // Cadena entre comillas simples (puede contener comillas escapadas '')
    if (raw.startsWith("'") && raw.endsWith("'")) {
        return raw.slice(1, -1).replace(/''/g, "'");
    }
    // Numero
    if (!isNaN(raw)) return Number(raw);
    return raw;
}

// Separa por comas respetando parentesis y comillas (necesario por
// TO_DATE(...) y por comas dentro de cadenas, que no existen en este
// dataset pero se maneja de forma defensiva).
function splitValues(valuesStr) {
    const parts = [];
    let depth = 0;
    let inQuote = false;
    let current = '';
    for (let i = 0; i < valuesStr.length; i++) {
        const ch = valuesStr[i];
        if (ch === "'" ) inQuote = !inQuote;
        if (!inQuote) {
            if (ch === '(') depth++;
            if (ch === ')') depth--;
        }
        if (ch === ',' && depth === 0 && !inQuote) {
            parts.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim().length > 0) parts.push(current);
    return parts;
}

function parseTable(sqlText, tableName) {
    const regex = new RegExp(`^INSERT INTO ${tableName} \\(([^)]+)\\) VALUES \\((.+)\\);$`, 'gm');
    const rows = [];
    let match;
    while ((match = regex.exec(sqlText)) !== null) {
        const columns = match[1].split(',').map((c) => c.trim());
        const values = splitValues(match[2]).map(parseValue);
        const row = {};
        columns.forEach((col, idx) => { row[col] = values[idx]; });
        rows.push(row);
    }
    return rows;
}

// ------------------------------------------------------------
// 2. Utilidades HTTP
// ------------------------------------------------------------

let okCount = 0;
let failCount = 0;
const failures = [];

async function post(endpoint, body, label) {
    // Reintenta hasta 4 veces si SQL Server elige la peticion como victima de
    // un deadlock (error transitorio, esperable cuando hay triggers y
    // peticiones concurrentes sobre las mismas filas).
    for (let intento = 1; intento <= 8; intento++) {
        try {
            const resp = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (resp.ok) {
                okCount++;
                return await resp.json();
            }
            const errBody = await resp.text();
            if (resp.status === 500 && /deadlock/i.test(errBody) && intento < 8) {
                await new Promise((r) => setTimeout(r, 150 * intento + Math.random() * 100));
                continue;
            }
            failCount++;
            failures.push({ label, status: resp.status, errBody, body });
            return null;
        } catch (err) {
            failCount++;
            failures.push({ label, status: 'EXCEPTION', errBody: err.message, body });
            return null;
        }
    }
    return null;
}

async function del(endpoint, label) {
    try {
        const resp = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
        if (!resp.ok) {
            const errBody = await resp.text();
            failCount++;
            failures.push({ label, status: resp.status, errBody });
            return null;
        }
        okCount++;
        return await resp.json();
    } catch (err) {
        failCount++;
        failures.push({ label, status: 'EXCEPTION', errBody: err.message });
        return null;
    }
}

// Ejecuta una lista de promesas en lotes pequeños, para no saturar el
// pool de conexiones de SQL Server ni perder trazabilidad del progreso.
async function runBatched(items, worker, batchSize = 20, progressLabel = '') {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(worker));
        if (progressLabel) {
            process.stdout.write(`\r${progressLabel}: ${Math.min(i + batchSize, items.length)}/${items.length}`);
        }
    }
    if (progressLabel) process.stdout.write('\n');
}

function groupBy(rows, key) {
    const map = new Map();
    for (const r of rows) {
        if (!map.has(r[key])) map.set(r[key], []);
        map.get(r[key]).push(r);
    }
    return [...map.values()];
}

// ------------------------------------------------------------
// 3. Carga principal
// ------------------------------------------------------------

async function main() {
    console.log(`Leyendo dataset validado de la Fase 1: ${SQL_FILE}`);
    const sqlText = fs.readFileSync(SQL_FILE, 'utf8');

    const pais = parseTable(sqlText, 'PAIS');
    const departamento = parseTable(sqlText, 'DEPARTAMENTO');
    const municipio = parseTable(sqlText, 'MUNICIPIO');
    const tipoTienda = parseTable(sqlText, 'TIPO_TIENDA');
    const tipoIdentificacion = parseTable(sqlText, 'TIPO_IDENTIFICACION');
    const cargo = parseTable(sqlText, 'CARGO');
    const categoria = parseTable(sqlText, 'CATEGORIA');
    const marca = parseTable(sqlText, 'MARCA');
    const estadoVenta = parseTable(sqlText, 'ESTADO_VENTA');
    const metodoPago = parseTable(sqlText, 'METODO_PAGO');
    const persona = parseTable(sqlText, 'PERSONA');
    const tienda = parseTable(sqlText, 'TIENDA');
    const empleado = parseTable(sqlText, 'EMPLEADO');
    const cliente = parseTable(sqlText, 'CLIENTE');
    const producto = parseTable(sqlText, 'PRODUCTO');
    const catalogoProducto = parseTable(sqlText, 'CATALOGO_PRODUCTO');
    const venta = parseTable(sqlText, 'VENTA');
    const desgloseVenta = parseTable(sqlText, 'DESGLOSE_VENTA');
    const pago = parseTable(sqlText, 'PAGO');

    console.log('Filas leidas:', {
        pais: pais.length, departamento: departamento.length, municipio: municipio.length,
        tipoTienda: tipoTienda.length, tipoIdentificacion: tipoIdentificacion.length,
        cargo: cargo.length, categoria: categoria.length, marca: marca.length,
        estadoVenta: estadoVenta.length, metodoPago: metodoPago.length,
        persona: persona.length, tienda: tienda.length, empleado: empleado.length,
        cliente: cliente.length, producto: producto.length, catalogoProducto: catalogoProducto.length,
        venta: venta.length, desgloseVenta: desgloseVenta.length, pago: pago.length
    });

    // --- 1. Catalogos -----------------------------------------------------
    console.log('\n[1/9] Cargando catalogos...');
    await runBatched(pais, (r) => post('/paises', r, 'PAIS'), 10);
    await runBatched(departamento, (r) => post('/departamentos', r, 'DEPARTAMENTO'), 10);
    await runBatched(municipio, (r) => post('/municipios', r, 'MUNICIPIO'), 20);
    await runBatched(tipoTienda, (r) => post('/tipos-tienda', r, 'TIPO_TIENDA'), 10);
    await runBatched(tipoIdentificacion, (r) => post('/tipos-identificacion', r, 'TIPO_IDENTIFICACION'), 10);
    await runBatched(cargo, (r) => post('/cargos', r, 'CARGO'), 10);
    await runBatched(categoria, (r) => post('/categorias', r, 'CATEGORIA'), 10);
    await runBatched(marca, (r) => post('/marcas', r, 'MARCA'), 10);
    await runBatched(estadoVenta, (r) => post('/estados-venta', r, 'ESTADO_VENTA'), 10);
    await runBatched(metodoPago, (r) => post('/metodos-pago', r, 'METODO_PAGO'), 10);

    // --- 2. Tienda ----------------------------------------------------------
    console.log('[2/9] Cargando tiendas...');
    await runBatched(tienda, (r) => post('/tiendas', r, 'TIENDA'), 10);

    // --- 3. Producto ----------------------------------------------------------
    console.log('[3/9] Cargando productos...');
    await runBatched(producto, (r) => post('/productos', r, 'PRODUCTO'), 20);

    // --- 4. Clientes y empleados (PERSONA + subtipo en un solo POST) --------
    console.log('[4/9] Cargando clientes y empleados...');
    const personaById = new Map(persona.map((p) => [p.ID_PER, p]));

    const clientePayloads = cliente.map((c) => {
        const p = personaById.get(c.PERSONA_ID_PER);
        return {
            PERSONA_ID_PER: c.PERSONA_ID_PER,
            NOMBRE_PER: p.NOMBRE_PER, APELLIDO_PER: p.APELLIDO_PER, TELEFONO: p.TELEFONO,
            CORREO_PER: p.CORREO_PER, DIRECCION_PER: p.DIRECCION_PER, MUNICIPIO_ID_MUN: p.MUNICIPIO_ID_MUN,
            TIPO_IDENTIFICACION_ID_TIP_IDE: c.TIPO_IDENTIFICACION_ID_TIP_IDE,
            NUMERO_IDENTIFICACION: String(c.NUMERO_IDENTIFICACION)
        };
    });
    await runBatched(clientePayloads, (r) => post('/clientes', r, 'CLIENTE'), 20, '  Clientes');

    const empleadoPayloads = empleado.map((e) => {
        const p = personaById.get(e.PERSONA_ID_PER);
        return {
            PERSONA_ID_PER: e.PERSONA_ID_PER,
            NOMBRE_PER: p.NOMBRE_PER, APELLIDO_PER: p.APELLIDO_PER, TELEFONO: p.TELEFONO,
            CORREO_PER: p.CORREO_PER, DIRECCION_PER: p.DIRECCION_PER, MUNICIPIO_ID_MUN: p.MUNICIPIO_ID_MUN,
            TIENDA_ID_TI: e.TIENDA_ID_TI, CARGO_ID_CAR: e.CARGO_ID_CAR, FECHA_CONTRATACION: e.FECHA_CONTRATACION
        };
    });
    await runBatched(empleadoPayloads, (r) => post('/empleados', r, 'EMPLEADO'), 20, '  Empleados');

    // --- 5. Catalogo de producto (precio + existencia inflada) --------------
    console.log('[5/9] Calculando existencia inicial (precio/inventario por tienda)...');
    const ventaById = new Map(venta.map((v) => [v.ID_VEN, v]));
    const totalVendidoPorTiendaProducto = new Map(); // "tienda_producto" -> cantidad

    for (const d of desgloseVenta) {
        const v = ventaById.get(d.VENTA_ID_VEN);
        if (!v) continue;
        const key = `${v.TIENDA_ID_TI}_${d.PRODUCTO_ID_PRO}`;
        totalVendidoPorTiendaProducto.set(key, (totalVendidoPorTiendaProducto.get(key) || 0) + d.CANTIDAD);
    }

    const catalogoPayloads = catalogoProducto.map((c) => {
        const key = `${c.TIENDA_ID_TI}_${c.PRODUCTO_ID_PRO}`;
        const totalVendido = totalVendidoPorTiendaProducto.get(key) || 0;
        return {
            TIENDA_ID_TI: c.TIENDA_ID_TI,
            PRODUCTO_ID_PRO: c.PRODUCTO_ID_PRO,
            PRECIO_VIGENTE: c.PRECIO_VIGENTE,
            EXISTENCIA_ACTUAL: c.EXISTENCIA_ACTUAL + totalVendido
        };
    });
    console.log('[5/9] Cargando catalogo de productos (existencia inicial inflada)...');
    await runBatched(catalogoPayloads, (r) => post('/productos/catalogo', r, 'CATALOGO_PRODUCTO'), 20, '  Catalogo');

    // --- 6. Ventas (encabezado) ----------------------------------------------
    console.log('[6/9] Cargando encabezados de venta (quedan en estado REGISTRADA)...');
    const ventaPayloads = venta.map((v) => ({
        ID_VEN: v.ID_VEN,
        FECHA_VEN: v.FECHA_VEN,
        TIENDA_ID_TI: v.TIENDA_ID_TI,
        EMPLEADO_PERSONA_ID_PER: v.EMPLEADO_PERSONA_ID_PER,
        CLIENTE_PERSONA_ID_PER: v.CLIENTE_PERSONA_ID_PER
    }));
    await runBatched(ventaPayloads, (r) => post('/ventas', r, 'VENTA'), 20, '  Ventas');

    // --- 7. Detalle de venta (dispara Trigger de inventario) -----------------
    console.log('[7/9] Cargando detalle de ventas (dispara Trigger de inventario)...');
    // Secuencial por lotes pequenos: cada INSERT hace su propia lectura y
    // escritura de CATALOGO_PRODUCTO dentro del trigger, por lo que un
    // paralelismo muy alto sobre el mismo (tienda, producto) podria generar
    // condiciones de carrera entre peticiones concurrentes.
    const detallePorVenta = groupBy(desgloseVenta, 'VENTA_ID_VEN');
    await runBatched(
        detallePorVenta,
        async (lineas) => {
            // Las lineas de una misma venta van en serie; solo las ventas
            // distintas se procesan en paralelo.
            for (const r of lineas) {
                await post('/detalle-venta', {
                    VENTA_ID_VEN: r.VENTA_ID_VEN,
                    PRODUCTO_ID_PRO: r.PRODUCTO_ID_PRO,
                    CANTIDAD: r.CANTIDAD
                }, 'DESGLOSE_VENTA');
            }
        },
        5,
        '  Ventas con detalle'
    );

    // --- 8. Pagos (dispara Trigger de estado automatico) ---------------------
    console.log('[8/9] Cargando pagos (dispara Trigger de estado de venta)...');
    const pagosPorVenta = groupBy(pago, 'VENTA_ID_VEN');
    await runBatched(
        pagosPorVenta,
        async (pagos) => {
            // Los abonos de una misma venta van en serie (el trigger suma
            // todos los pagos de la venta en cada INSERT).
            for (const r of pagos) {
                await post('/pagos', {
                    ID_PAG: r.ID_PAG,
                    MONTO_PAG: r.MONTO_PAG,
                    VENTA_ID_VEN: r.VENTA_ID_VEN,
                    METODO_PAGO_ID_MET_PAG: r.METODO_PAGO_ID_MET_PAG
                }, 'PAGO');
            }
        },
        4,
        '  Ventas con pagos'
    );

    // --- 9. Correccion final: ventas ANULADA en la Fase 1 ---------------------
    console.log('[9/9] Aplicando anulacion logica a las ventas que en la Fase 1 quedaron ANULADA...');
    const idAnulada = estadoVenta.find((e) => e.NOMBRE_ES_VEN === 'ANULADA').ID_ES_VEN;
    const ventasAnuladas = venta.filter((v) => v.ESTADO_VENTA_ID_ES_VEN === idAnulada);
    await runBatched(
        ventasAnuladas,
        (v) => del(`/ventas/${v.ID_VEN}`, 'VENTA (anulacion logica)'),
        20,
        '  Ventas anuladas'
    );

    // --- Resumen ---------------------------------------------------------
    console.log('\n============================================================');
    console.log(`Carga finalizada. Peticiones exitosas: ${okCount}. Fallidas: ${failCount}.`);
    if (failures.length > 0) {
        console.log('\nPrimeros errores encontrados (maximo 15):');
        failures.slice(0, 15).forEach((f) => {
            console.log(`  [${f.label}] status=${f.status} -> ${f.errBody}`);
        });
        fs.writeFileSync(path.join(__dirname, 'errores_carga.json'), JSON.stringify(failures, null, 2));
        console.log('\nListado completo de errores guardado en seed/errores_carga.json');
    }
    console.log('============================================================');
}

main().catch((err) => {
    console.error('Error fatal durante la carga:', err);
    process.exit(1);
});
