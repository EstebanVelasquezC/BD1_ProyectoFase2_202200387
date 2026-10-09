-- ============================================================
-- Bases de Datos 1 - Proyecto 2 (Fase 2)
-- Comercial La Estrella - Script de inicializacion
-- Motor: Microsoft SQL Server 2022
--
-- Contenido:
--   1) Creacion de las 19 tablas del modelo relacional de la Fase 1,
--      migradas de Oracle a Transact-SQL.
--   2) Llaves primarias, foraneas, UNIQUE y CHECK.
--   3) 2 Triggers de reglas de negocio (inventario y estado de venta).
--   4) 3 Vistas analiticas (Vista_Ventas_Ubicacion, Vista_Top_Productos,
--      Vista_Saldos_Pendientes).
--
-- Este script NO carga datos. La carga se realiza exclusivamente a
-- traves del API REST (politica del DBA: ningun acceso directo a la
-- base de datos), mediante el script de carga ubicado en /seed.
--
-- Orden de ejecucion: de arriba hacia abajo. Las tablas se crean sin
-- llaves foraneas y estas se agregan al final con ALTER TABLE, por lo
-- que el orden de creacion de tablas no depende de sus dependencias.
--
-- Mapeo de tipos Oracle -> SQL Server:
--   NUMBER(10)       -> INT
--   NUMBER(10,2)     -> DECIMAL(10,2)
--   VARCHAR2(n)      -> NVARCHAR(n)  (se usa NVARCHAR para soportar
--                       tildes y enie en nombres de clientes, tiendas,
--                       marcas, etc. sin problemas de codificacion)
--   DATE             -> DATE
--   GENERATED ALWAYS
--   AS ... VIRTUAL   -> columna calculada AS (...) PERSISTED
--
-- ============================================================

USE master;
GO

IF DB_ID('ComercialLaEstrella') IS NULL
BEGIN
    CREATE DATABASE ComercialLaEstrella;
END
GO

USE ComercialLaEstrella;
GO

-- ============================================================
-- 1. CREACION DE TABLAS (sin llaves foraneas)
-- ============================================================

CREATE TABLE PAIS (
    ID_PA     INT          NOT NULL,
    NOMBRE_PA NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE DEPARTAMENTO (
    ID_DEP     INT           NOT NULL,
    NOMBRE_DEP NVARCHAR(100) NOT NULL,
    PAIS_ID_PA INT           NOT NULL
);
GO

CREATE TABLE MUNICIPIO (
    ID_MUN              INT           NOT NULL,
    NOMBRE_MUN           NVARCHAR(100) NOT NULL,
    DEPARTAMENTO_ID_DEP  INT           NOT NULL
);
GO

CREATE TABLE TIPO_TIENDA (
    ID_TIP_TIE     INT           NOT NULL,
    NOMBRE_TIP_TIE NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE TIPO_IDENTIFICACION (
    ID_TIP_IDE     INT           NOT NULL,
    NOMBRE_TIP_IDE NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE CARGO (
    ID_CAR     INT           NOT NULL,
    NOMBRE_CAR NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE CATEGORIA (
    ID_CAT     INT           NOT NULL,
    NOMBRE_CAT NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE MARCA (
    ID_MAR     INT           NOT NULL,
    NOMBRE_MAR NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE ESTADO_VENTA (
    ID_ES_VEN     INT          NOT NULL,
    NOMBRE_ES_VEN NVARCHAR(50) NOT NULL
);
GO

CREATE TABLE METODO_PAGO (
    ID_MET_PAG     INT          NOT NULL,
    NOMBRE_MET_PAG NVARCHAR(50) NOT NULL
);
GO

CREATE TABLE PERSONA (
    ID_PER           INT            NOT NULL,
    NOMBRE_PER       NVARCHAR(100)  NOT NULL,
    APELLIDO_PER     NVARCHAR(100)  NOT NULL,
    TELEFONO         VARCHAR(10)    NOT NULL,
    CORREO_PER       NVARCHAR(200)  NULL,
    DIRECCION_PER    NVARCHAR(200)  NOT NULL,
    MUNICIPIO_ID_MUN INT            NOT NULL
);
GO

CREATE TABLE TIENDA (
    ID_TI                  INT           NOT NULL,
    NOMBRE_TI              NVARCHAR(100) NOT NULL,
    DIRECCION_TI           NVARCHAR(200) NOT NULL,
    MUNICIPIO_ID_MUN       INT           NOT NULL,
    TIPO_TIENDA_ID_TIP_TIE INT           NOT NULL,
    TELEFONO_TI            VARCHAR(10)   NOT NULL
);
GO

CREATE TABLE EMPLEADO (
    PERSONA_ID_PER     INT  NOT NULL,
    TIENDA_ID_TI       INT  NOT NULL,
    CARGO_ID_CAR       INT  NOT NULL,
    FECHA_CONTRATACION DATE NOT NULL
);
GO

CREATE TABLE CLIENTE (
    PERSONA_ID_PER                 INT          NOT NULL,
    TIPO_IDENTIFICACION_ID_TIP_IDE INT          NOT NULL,
    NUMERO_IDENTIFICACION          VARCHAR(30)  NOT NULL
);
GO

CREATE TABLE PRODUCTO (
    ID_PRO           INT           NOT NULL,
    NOMBRE_PRO       NVARCHAR(150) NOT NULL,
    CATEGORIA_ID_CAT INT           NOT NULL,
    MARCA_ID_MAR     INT           NOT NULL,
    DESCRIPCION_PRO  NVARCHAR(500) NULL
);
GO

CREATE TABLE CATALOGO_PRODUCTO (
    TIENDA_ID_TI      INT           NOT NULL,
    PRODUCTO_ID_PRO   INT           NOT NULL,
    PRECIO_VIGENTE    DECIMAL(10,2) NOT NULL,
    EXISTENCIA_ACTUAL INT           NOT NULL
);
GO

CREATE TABLE VENTA (
    ID_VEN                  INT  NOT NULL,
    FECHA_VEN               DATE NOT NULL,
    TIENDA_ID_TI            INT  NOT NULL,
    ESTADO_VENTA_ID_ES_VEN  INT  NOT NULL,
    EMPLEADO_PERSONA_ID_PER INT  NOT NULL,
    CLIENTE_PERSONA_ID_PER  INT  NOT NULL
);
GO

CREATE TABLE DESGLOSE_VENTA (
    VENTA_ID_VEN    INT           NOT NULL,
    PRODUCTO_ID_PRO INT           NOT NULL,
    CANTIDAD        INT           NOT NULL,
    PRECIO_UNITARIO DECIMAL(10,2) NOT NULL,
    -- AJUSTE: columna calculada, equivalente a la GENERATED ALWAYS ... VIRTUAL
    -- de Oracle. Garantiza SUBTOTAL = CANTIDAD * PRECIO_UNITARIO sin trigger.
    SUBTOTAL AS (CANTIDAD * PRECIO_UNITARIO) PERSISTED
);
GO

CREATE TABLE PAGO (
    ID_PAG                 INT           NOT NULL,
    MONTO_PAG              DECIMAL(10,2) NOT NULL,
    VENTA_ID_VEN           INT           NOT NULL,
    METODO_PAGO_ID_MET_PAG INT           NOT NULL
);
GO

-- ============================================================
-- 2. LLAVES PRIMARIAS
-- ============================================================

ALTER TABLE PAIS                 ADD CONSTRAINT PAIS_PK PRIMARY KEY (ID_PA);
ALTER TABLE DEPARTAMENTO         ADD CONSTRAINT DEPARTAMENTO_PK PRIMARY KEY (ID_DEP);
ALTER TABLE MUNICIPIO            ADD CONSTRAINT MUNICIPIO_PK PRIMARY KEY (ID_MUN);
ALTER TABLE TIPO_TIENDA          ADD CONSTRAINT TIPO_TIENDA_PK PRIMARY KEY (ID_TIP_TIE);
ALTER TABLE TIPO_IDENTIFICACION  ADD CONSTRAINT TIPO_IDENTIFICACION_PK PRIMARY KEY (ID_TIP_IDE);
ALTER TABLE CARGO                ADD CONSTRAINT CARGO_PK PRIMARY KEY (ID_CAR);
ALTER TABLE CATEGORIA            ADD CONSTRAINT CATEGORIA_PK PRIMARY KEY (ID_CAT);
ALTER TABLE MARCA                ADD CONSTRAINT MARCA_PK PRIMARY KEY (ID_MAR);
ALTER TABLE ESTADO_VENTA         ADD CONSTRAINT ESTADO_VENTA_PK PRIMARY KEY (ID_ES_VEN);
ALTER TABLE METODO_PAGO          ADD CONSTRAINT METODO_PAGO_PK PRIMARY KEY (ID_MET_PAG);
ALTER TABLE PERSONA              ADD CONSTRAINT PERSONA_PK PRIMARY KEY (ID_PER);
ALTER TABLE TIENDA               ADD CONSTRAINT TIENDA_PK PRIMARY KEY (ID_TI);
ALTER TABLE EMPLEADO             ADD CONSTRAINT EMPLEADO_PK PRIMARY KEY (PERSONA_ID_PER);
ALTER TABLE CLIENTE              ADD CONSTRAINT CLIENTE_PK PRIMARY KEY (PERSONA_ID_PER);
ALTER TABLE PRODUCTO             ADD CONSTRAINT PRODUCTO_PK PRIMARY KEY (ID_PRO);
ALTER TABLE CATALOGO_PRODUCTO    ADD CONSTRAINT CATALOGO_PRODUCTO_PK PRIMARY KEY (TIENDA_ID_TI, PRODUCTO_ID_PRO);
ALTER TABLE VENTA                ADD CONSTRAINT VENTA_PK PRIMARY KEY (ID_VEN);
ALTER TABLE DESGLOSE_VENTA       ADD CONSTRAINT DESGLOSE_VENTA_PK PRIMARY KEY (VENTA_ID_VEN, PRODUCTO_ID_PRO);
ALTER TABLE PAGO                 ADD CONSTRAINT PAGO_PK PRIMARY KEY (ID_PAG);
GO

-- ============================================================
-- 3. LLAVES FORANEAS
-- ============================================================

ALTER TABLE DEPARTAMENTO ADD CONSTRAINT DEPARTAMENTO_PAIS_FK
    FOREIGN KEY (PAIS_ID_PA) REFERENCES PAIS (ID_PA);

ALTER TABLE MUNICIPIO ADD CONSTRAINT MUNICIPIO_DEPARTAMENTO_FK
    FOREIGN KEY (DEPARTAMENTO_ID_DEP) REFERENCES DEPARTAMENTO (ID_DEP);

ALTER TABLE PERSONA ADD CONSTRAINT PERSONA_MUNICIPIO_FK
    FOREIGN KEY (MUNICIPIO_ID_MUN) REFERENCES MUNICIPIO (ID_MUN);

ALTER TABLE TIENDA ADD CONSTRAINT TIENDA_MUNICIPIO_FK
    FOREIGN KEY (MUNICIPIO_ID_MUN) REFERENCES MUNICIPIO (ID_MUN);

ALTER TABLE TIENDA ADD CONSTRAINT TIENDA_TIPO_TIENDA_FK
    FOREIGN KEY (TIPO_TIENDA_ID_TIP_TIE) REFERENCES TIPO_TIENDA (ID_TIP_TIE);

ALTER TABLE EMPLEADO ADD CONSTRAINT EMPLEADO_PERSONA_FK
    FOREIGN KEY (PERSONA_ID_PER) REFERENCES PERSONA (ID_PER);

ALTER TABLE EMPLEADO ADD CONSTRAINT EMPLEADO_TIENDA_FK
    FOREIGN KEY (TIENDA_ID_TI) REFERENCES TIENDA (ID_TI);

ALTER TABLE EMPLEADO ADD CONSTRAINT EMPLEADO_CARGO_FK
    FOREIGN KEY (CARGO_ID_CAR) REFERENCES CARGO (ID_CAR);

ALTER TABLE CLIENTE ADD CONSTRAINT CLIENTE_PERSONA_FK
    FOREIGN KEY (PERSONA_ID_PER) REFERENCES PERSONA (ID_PER);

ALTER TABLE CLIENTE ADD CONSTRAINT CLIENTE_TIPO_IDENTIFICACION_FK
    FOREIGN KEY (TIPO_IDENTIFICACION_ID_TIP_IDE) REFERENCES TIPO_IDENTIFICACION (ID_TIP_IDE);

ALTER TABLE PRODUCTO ADD CONSTRAINT PRODUCTO_CATEGORIA_FK
    FOREIGN KEY (CATEGORIA_ID_CAT) REFERENCES CATEGORIA (ID_CAT);

ALTER TABLE PRODUCTO ADD CONSTRAINT PRODUCTO_MARCA_FK
    FOREIGN KEY (MARCA_ID_MAR) REFERENCES MARCA (ID_MAR);

ALTER TABLE CATALOGO_PRODUCTO ADD CONSTRAINT CATALOGO_PRODUCTO_TIENDA_FK
    FOREIGN KEY (TIENDA_ID_TI) REFERENCES TIENDA (ID_TI);

ALTER TABLE CATALOGO_PRODUCTO ADD CONSTRAINT CATALOGO_PRODUCTO_PRODUCTO_FK
    FOREIGN KEY (PRODUCTO_ID_PRO) REFERENCES PRODUCTO (ID_PRO);

ALTER TABLE VENTA ADD CONSTRAINT VENTA_TIENDA_FK
    FOREIGN KEY (TIENDA_ID_TI) REFERENCES TIENDA (ID_TI);

ALTER TABLE VENTA ADD CONSTRAINT VENTA_ESTADO_VENTA_FK
    FOREIGN KEY (ESTADO_VENTA_ID_ES_VEN) REFERENCES ESTADO_VENTA (ID_ES_VEN);

ALTER TABLE VENTA ADD CONSTRAINT VENTA_EMPLEADO_FK
    FOREIGN KEY (EMPLEADO_PERSONA_ID_PER) REFERENCES EMPLEADO (PERSONA_ID_PER);

ALTER TABLE VENTA ADD CONSTRAINT VENTA_CLIENTE_FK
    FOREIGN KEY (CLIENTE_PERSONA_ID_PER) REFERENCES CLIENTE (PERSONA_ID_PER);

ALTER TABLE DESGLOSE_VENTA ADD CONSTRAINT DESGLOSE_VENTA_VENTA_FK
    FOREIGN KEY (VENTA_ID_VEN) REFERENCES VENTA (ID_VEN);

ALTER TABLE DESGLOSE_VENTA ADD CONSTRAINT DESGLOSE_VENTA_PRODUCTO_FK
    FOREIGN KEY (PRODUCTO_ID_PRO) REFERENCES PRODUCTO (ID_PRO);

ALTER TABLE PAGO ADD CONSTRAINT PAGO_VENTA_FK
    FOREIGN KEY (VENTA_ID_VEN) REFERENCES VENTA (ID_VEN);

ALTER TABLE PAGO ADD CONSTRAINT PAGO_METODO_PAGO_FK
    FOREIGN KEY (METODO_PAGO_ID_MET_PAG) REFERENCES METODO_PAGO (ID_MET_PAG);
GO

-- ============================================================
-- 4. RESTRICCIONES UNIQUE
-- ============================================================

ALTER TABLE PAIS ADD CONSTRAINT PAIS_NOMBRE_PA_UN UNIQUE (NOMBRE_PA);

-- Nombre de departamento unico DENTRO DEL MISMO pais (no global)
ALTER TABLE DEPARTAMENTO ADD CONSTRAINT DEPARTAMENTO_NOMBRE_DEP_UN UNIQUE (PAIS_ID_PA, NOMBRE_DEP);

-- Nombre de municipio unico DENTRO DEL MISMO departamento (no global)
ALTER TABLE MUNICIPIO ADD CONSTRAINT MUNICIPIO_NOMBRE_MUN_UN UNIQUE (DEPARTAMENTO_ID_DEP, NOMBRE_MUN);

ALTER TABLE TIPO_TIENDA ADD CONSTRAINT TIPO_TIENDA_NOMBRE_UN UNIQUE (NOMBRE_TIP_TIE);
ALTER TABLE TIPO_IDENTIFICACION ADD CONSTRAINT TIPO_IDENTIFICACION_NOMBRE_UN UNIQUE (NOMBRE_TIP_IDE);
ALTER TABLE CARGO ADD CONSTRAINT CARGO_NOMBRE_UN UNIQUE (NOMBRE_CAR);
ALTER TABLE CATEGORIA ADD CONSTRAINT CATEGORIA_NOMBRE_UN UNIQUE (NOMBRE_CAT);
ALTER TABLE MARCA ADD CONSTRAINT MARCA_NOMBRE_UN UNIQUE (NOMBRE_MAR);
ALTER TABLE ESTADO_VENTA ADD CONSTRAINT ESTADO_VENTA_NOMBRE_UN UNIQUE (NOMBRE_ES_VEN);
ALTER TABLE METODO_PAGO ADD CONSTRAINT METODO_PAGO_NOMBRE_UN UNIQUE (NOMBRE_MET_PAG);

-- Correo unico cuando esta registrado. DIFERENCIA CON ORACLE: en SQL Server un
-- UNIQUE normal solo admite UN valor NULL (trata los NULL como iguales), lo que
-- impediria registrar mas de una persona sin correo. Por eso se usa un indice
-- unico FILTRADO que solo aplica la unicidad a los correos que no son NULL.
CREATE UNIQUE INDEX UK_PERSONA_CORREO ON PERSONA (CORREO_PER) WHERE CORREO_PER IS NOT NULL;

ALTER TABLE CLIENTE ADD CONSTRAINT UK_CLIENTE_TIPO_NUMERO
    UNIQUE (TIPO_IDENTIFICACION_ID_TIP_IDE, NUMERO_IDENTIFICACION);
GO

-- ============================================================
-- 4b. INDICES DE APOYO
-- ============================================================
-- SQL Server NO crea indices automaticamente para las llaves foraneas. Sin
-- este indice, el Trigger trg_Pago_Insert_Pago recorre TODA la tabla PAGO
-- para sumar los abonos de una venta; si dos pagos se insertan a la vez,
-- cada transaccion queda esperando la fila nueva de la otra (deadlock).
-- Con el indice, el trigger solo toca las filas de su propia venta.
CREATE INDEX IX_PAGO_VENTA ON PAGO (VENTA_ID_VEN);
GO

-- ============================================================
-- 5. RESTRICCIONES CHECK
-- ============================================================

ALTER TABLE CATALOGO_PRODUCTO ADD CONSTRAINT CK_CATALOGO_PRECIO CHECK (PRECIO_VIGENTE > 0);
ALTER TABLE CATALOGO_PRODUCTO ADD CONSTRAINT CK_CATALOGO_EXISTENCIA CHECK (EXISTENCIA_ACTUAL >= 0);

ALTER TABLE DESGLOSE_VENTA ADD CONSTRAINT CK_DESGLOSE_CANTIDAD CHECK (CANTIDAD > 0);
ALTER TABLE DESGLOSE_VENTA ADD CONSTRAINT CK_DESGLOSE_PRECIO CHECK (PRECIO_UNITARIO > 0);

ALTER TABLE PAGO ADD CONSTRAINT CK_PAGO_MONTO CHECK (MONTO_PAG > 0);

-- A diferencia de Oracle (ORA-02436), SQL Server si permite funciones no
-- deterministicas dentro de un CHECK. Se implementa aqui la regla que en
-- la Fase 1 quedo documentada como limitacion del motor.
ALTER TABLE EMPLEADO ADD CONSTRAINT CK_EMPLEADO_FECHA_CONTRATACION
    CHECK (FECHA_CONTRATACION <= CAST(GETDATE() AS DATE));
GO

-- ============================================================
-- 6. TRIGGERS (reglas de negocio a nivel de motor)
-- ============================================================

-- ------------------------------------------------------------
-- Trigger 1: Proteccion de Inventario
-- Dispara en INSERT sobre DESGLOSE_VENTA (detalle de venta).
-- Verifica que la cantidad solicitada no exceda la existencia_actual
-- del producto en la tienda de la venta. Si no hay stock suficiente,
-- aborta la transaccion completa (ROLLBACK). Si es valida, descuenta
-- automaticamente del inventario (CATALOGO_PRODUCTO).
-- ------------------------------------------------------------
CREATE OR ALTER TRIGGER trg_DesgloseVenta_Insert_Detalle
ON DESGLOSE_VENTA
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificacion de stock: se compara la cantidad insertada contra la
    -- existencia actual de cada producto en la tienda correspondiente a
    -- la venta (la tienda se obtiene de VENTA, no de DESGLOSE_VENTA).
    IF EXISTS (
        SELECT 1
        FROM INSERTED i
        JOIN VENTA v ON v.ID_VEN = i.VENTA_ID_VEN
        JOIN CATALOGO_PRODUCTO cp
             ON cp.TIENDA_ID_TI = v.TIENDA_ID_TI
            AND cp.PRODUCTO_ID_PRO = i.PRODUCTO_ID_PRO
        WHERE i.CANTIDAD > cp.EXISTENCIA_ACTUAL
    )
    BEGIN
        RAISERROR('Stock insuficiente para completar la venta.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Si hay stock suficiente para todas las filas insertadas, se
    -- descuenta la cantidad vendida del inventario de cada producto
    -- en la tienda correspondiente.
    -- Se une por la llave completa (tienda + producto) para que el motor
    -- use la PK de CATALOGO_PRODUCTO (seek) y no bloquee otras filas.
    UPDATE cp
    SET cp.EXISTENCIA_ACTUAL = cp.EXISTENCIA_ACTUAL - i.CANTIDAD
    FROM INSERTED i
    JOIN VENTA v              ON v.ID_VEN = i.VENTA_ID_VEN
    JOIN CATALOGO_PRODUCTO cp ON cp.TIENDA_ID_TI = v.TIENDA_ID_TI
                             AND cp.PRODUCTO_ID_PRO = i.PRODUCTO_ID_PRO;
END
GO

-- ------------------------------------------------------------
-- Trigger 2: Estado Automatico de Venta
-- Dispara en INSERT sobre PAGO. Suma todos los pagos registrados para
-- la venta afectada y los compara contra el total de la venta
-- (suma de SUBTOTAL en DESGLOSE_VENTA). Si el acumulado de pagos
-- alcanza o supera el total, actualiza el estado de la venta a
-- 'PAGADA' automaticamente.
-- ------------------------------------------------------------
CREATE OR ALTER TRIGGER trg_Pago_Insert_Pago
ON PAGO
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @IdPagada INT = (SELECT ID_ES_VEN FROM ESTADO_VENTA WHERE NOMBRE_ES_VEN = 'PAGADA');

    ;WITH VentasAfectadas AS (
        SELECT DISTINCT VENTA_ID_VEN FROM INSERTED
    ),
    TotalesVenta AS (
        SELECT dv.VENTA_ID_VEN, SUM(dv.SUBTOTAL) AS TOTAL_VENTA
        FROM DESGLOSE_VENTA dv
        WHERE dv.VENTA_ID_VEN IN (SELECT VENTA_ID_VEN FROM VentasAfectadas)
        GROUP BY dv.VENTA_ID_VEN
    ),
    PagosVenta AS (
        SELECT p.VENTA_ID_VEN, SUM(p.MONTO_PAG) AS TOTAL_PAGADO
        FROM PAGO p
        WHERE p.VENTA_ID_VEN IN (SELECT VENTA_ID_VEN FROM VentasAfectadas)
        GROUP BY p.VENTA_ID_VEN
    )
    UPDATE v
    SET v.ESTADO_VENTA_ID_ES_VEN = @IdPagada
    FROM VENTA v
    JOIN TotalesVenta tv ON tv.VENTA_ID_VEN = v.ID_VEN
    JOIN PagosVenta pv   ON pv.VENTA_ID_VEN = v.ID_VEN
    WHERE pv.TOTAL_PAGADO >= tv.TOTAL_VENTA;
END
GO

-- ============================================================
-- 7. VISTAS ANALITICAS
-- ============================================================

-- ------------------------------------------------------------
-- Vista_Ventas_Ubicacion
-- Tienda, municipio, departamento, pais, cantidad de ventas y total
-- facturado, excluyendo ventas anuladas.
-- ------------------------------------------------------------
CREATE OR ALTER VIEW Vista_Ventas_Ubicacion AS
SELECT
    t.NOMBRE_TI                      AS TIENDA,
    m.NOMBRE_MUN                     AS MUNICIPIO,
    d.NOMBRE_DEP                     AS DEPARTAMENTO,
    pa.NOMBRE_PA                     AS PAIS,
    COUNT(DISTINCT v.ID_VEN)         AS CANTIDAD_VENTAS,
    SUM(dv.SUBTOTAL)                 AS TOTAL_FACTURADO
FROM TIENDA t
JOIN MUNICIPIO m      ON t.MUNICIPIO_ID_MUN = m.ID_MUN
JOIN DEPARTAMENTO d   ON m.DEPARTAMENTO_ID_DEP = d.ID_DEP
JOIN PAIS pa          ON d.PAIS_ID_PA = pa.ID_PA
JOIN VENTA v          ON v.TIENDA_ID_TI = t.ID_TI
JOIN ESTADO_VENTA ev  ON ev.ID_ES_VEN = v.ESTADO_VENTA_ID_ES_VEN AND ev.NOMBRE_ES_VEN <> 'ANULADA'
JOIN DESGLOSE_VENTA dv ON dv.VENTA_ID_VEN = v.ID_VEN
GROUP BY t.NOMBRE_TI, m.NOMBRE_MUN, d.NOMBRE_DEP, pa.NOMBRE_PA;
GO

-- ------------------------------------------------------------
-- Vista_Top_Productos
-- Codigo del producto, nombre, categoria, marca, unidades totales
-- vendidas y monto total generado, excluyendo ventas anuladas.
-- ------------------------------------------------------------
CREATE OR ALTER VIEW Vista_Top_Productos AS
SELECT
    p.ID_PRO                     AS CODIGO_PRODUCTO,
    p.NOMBRE_PRO                 AS PRODUCTO,
    c.NOMBRE_CAT                 AS CATEGORIA,
    ma.NOMBRE_MAR                AS MARCA,
    SUM(dv.CANTIDAD)             AS UNIDADES_VENDIDAS,
    SUM(dv.SUBTOTAL)             AS MONTO_TOTAL
FROM PRODUCTO p
JOIN CATEGORIA c       ON p.CATEGORIA_ID_CAT = c.ID_CAT
JOIN MARCA ma           ON p.MARCA_ID_MAR = ma.ID_MAR
JOIN DESGLOSE_VENTA dv ON dv.PRODUCTO_ID_PRO = p.ID_PRO
JOIN VENTA v           ON v.ID_VEN = dv.VENTA_ID_VEN
JOIN ESTADO_VENTA ev   ON ev.ID_ES_VEN = v.ESTADO_VENTA_ID_ES_VEN AND ev.NOMBRE_ES_VEN <> 'ANULADA'
GROUP BY p.ID_PRO, p.NOMBRE_PRO, c.NOMBRE_CAT, ma.NOMBRE_MAR;
GO

-- ------------------------------------------------------------
-- Vista_Saldos_Pendientes
-- Unicamente ventas con estado 'REGISTRADA': total de la venta, monto
-- total pagado (si ya existe algun abono) y la diferencia (saldo
-- pendiente).
-- ------------------------------------------------------------
CREATE OR ALTER VIEW Vista_Saldos_Pendientes AS
SELECT
    v.ID_VEN                                    AS ID_VENTA,
    v.FECHA_VEN                                 AS FECHA_VENTA,
    t.NOMBRE_TI                                 AS TIENDA,
    tot.TOTAL_VENTA                             AS TOTAL_VENTA,
    ISNULL(pag.TOTAL_PAGADO, 0)                 AS TOTAL_PAGADO,
    tot.TOTAL_VENTA - ISNULL(pag.TOTAL_PAGADO, 0) AS SALDO_PENDIENTE
FROM VENTA v
JOIN TIENDA t        ON t.ID_TI = v.TIENDA_ID_TI
JOIN ESTADO_VENTA ev ON ev.ID_ES_VEN = v.ESTADO_VENTA_ID_ES_VEN AND ev.NOMBRE_ES_VEN = 'REGISTRADA'
JOIN (
    SELECT VENTA_ID_VEN, SUM(SUBTOTAL) AS TOTAL_VENTA
    FROM DESGLOSE_VENTA
    GROUP BY VENTA_ID_VEN
) tot ON tot.VENTA_ID_VEN = v.ID_VEN
LEFT JOIN (
    SELECT VENTA_ID_VEN, SUM(MONTO_PAG) AS TOTAL_PAGADO
    FROM PAGO
    GROUP BY VENTA_ID_VEN
) pag ON pag.VENTA_ID_VEN = v.ID_VEN;
GO

PRINT 'init.sql ejecutado correctamente: 19 tablas, 2 triggers, 3 vistas creadas.';
GO
