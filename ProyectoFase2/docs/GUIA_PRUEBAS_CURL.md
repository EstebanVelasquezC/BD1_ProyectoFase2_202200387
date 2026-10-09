# Guía de pruebas con `curl.exe` (sin Postman)

Proyecto 2 · Bases de Datos 1 · Comercial La Estrella
Esteban Velásquez — Carné 202200387

Esta guía prueba **todos los endpoints del API** desde PowerShell, con los mismos datos de la colección de Postman. Sirve por si en la defensa piden probar "a mano".

## 0. Antes de empezar

1. Docker Desktop abierto (*Engine running*) y el proyecto levantado:
   ```powershell
   docker compose up --build
   ```
   Esperar a ver `Conexion a SQL Server establecida correctamente.` en el log.
2. En **otra** terminal de PowerShell (no hace falta entrar a ninguna carpeta), verificar:
   ```powershell
   curl.exe http://localhost:3000/api/health
   ```
3. Haber corrido el seed una vez (`node cargar_datos.js` dentro de `seed/`), para tener los datos de la Fase 1 cargados.

**Notas importantes**

- Usar siempre `curl.exe` (con `.exe`): en PowerShell `curl` es un alias de otro comando.
- Los cuerpos JSON se envían por *pipe* (`'{...}' | curl.exe ... --data-binary "@-"`), que evita los problemas de comillas de PowerShell.
- Cada comando imprime la respuesta y, en la última línea, el código HTTP (`HTTP 201`, `HTTP 400`...).
- Los listados muestran solo los **3 primeros registros** (para no inundar la pantalla). Quitar `| Select-Object -First 3` para ver todo.
- Los IDs de prueba (9101, 9102, 9700 y 9800+) no chocan con los datos del seed. **Cada sección se puede ejecutar una sola vez**; repetirla da `409` (ya existe). Para empezar de cero: `docker compose down -v`, `docker compose up --build` y volver a correr el seed.
- Orden recomendado: ejecutar las secciones de arriba hacia abajo.

## 1. Health check

```powershell
curl.exe http://localhost:3000/api/health
```

Esperado: `{"status":"ok",...}`

## 2. Catálogos mínimos (CRUD)

Para cada catálogo: listar, crear, obtener, actualizar y eliminar. Esperado: GET `200`, POST `201`, PUT `200`, DELETE `200`.

**1. /paises · GET - Listar Pais**

```powershell
(curl.exe -s http://localhost:3000/api/paises | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**2. /paises · POST - Crear Pais**

```powershell
'{"ID_PA":9101,"NOMBRE_PA":"Pais Postman"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/paises -H "Content-Type: application/json" --data-binary "@-"
```

**3. /paises · GET - Obtener Pais por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/paises/9101
```

**4. /paises · PUT - Actualizar Pais**

```powershell
'{"NOMBRE_PA":"Pais Postman Editado"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/paises/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**5. /paises · DELETE - Eliminar Pais**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/paises/9101
```

**6. /departamentos · GET - Listar Departamento**

```powershell
(curl.exe -s http://localhost:3000/api/departamentos | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**7. /departamentos · POST - Crear Departamento**

```powershell
'{"ID_DEP":9101,"NOMBRE_DEP":"Depto Postman","PAIS_ID_PA":1}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/departamentos -H "Content-Type: application/json" --data-binary "@-"
```

**8. /departamentos · GET - Obtener Departamento por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/departamentos/9101
```

**9. /departamentos · PUT - Actualizar Departamento**

```powershell
'{"NOMBRE_DEP":"Depto Postman Editado","PAIS_ID_PA":1}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/departamentos/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**10. /departamentos · DELETE - Eliminar Departamento**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/departamentos/9101
```

**11. /municipios · GET - Listar Municipio**

```powershell
(curl.exe -s http://localhost:3000/api/municipios | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**12. /municipios · POST - Crear Municipio**

```powershell
'{"ID_MUN":9101,"NOMBRE_MUN":"Municipio Postman","DEPARTAMENTO_ID_DEP":1}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/municipios -H "Content-Type: application/json" --data-binary "@-"
```

**13. /municipios · GET - Obtener Municipio por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/municipios/9101
```

**14. /municipios · PUT - Actualizar Municipio**

```powershell
'{"NOMBRE_MUN":"Municipio Postman Editado","DEPARTAMENTO_ID_DEP":1}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/municipios/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**15. /municipios · DELETE - Eliminar Municipio**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/municipios/9101
```

**16. /tipos-tienda · GET - Listar Tipo de Tienda**

```powershell
(curl.exe -s http://localhost:3000/api/tipos-tienda | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**17. /tipos-tienda · POST - Crear Tipo de Tienda**

```powershell
'{"ID_TIP_TIE":9101,"NOMBRE_TIP_TIE":"Tipo Tienda Postman"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/tipos-tienda -H "Content-Type: application/json" --data-binary "@-"
```

**18. /tipos-tienda · GET - Obtener Tipo de Tienda por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/tipos-tienda/9101
```

**19. /tipos-tienda · PUT - Actualizar Tipo de Tienda**

```powershell
'{"NOMBRE_TIP_TIE":"Tipo Tienda Postman Editado"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/tipos-tienda/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**20. /tipos-tienda · DELETE - Eliminar Tipo de Tienda**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/tipos-tienda/9101
```

**21. /tipos-identificacion · GET - Listar Tipo de Identificacion**

```powershell
(curl.exe -s http://localhost:3000/api/tipos-identificacion | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**22. /tipos-identificacion · POST - Crear Tipo de Identificacion**

```powershell
'{"ID_TIP_IDE":9101,"NOMBRE_TIP_IDE":"Tipo Identificacion Postman"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/tipos-identificacion -H "Content-Type: application/json" --data-binary "@-"
```

**23. /tipos-identificacion · GET - Obtener Tipo de Identificacion por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/tipos-identificacion/9101
```

**24. /tipos-identificacion · PUT - Actualizar Tipo de Identificacion**

```powershell
'{"NOMBRE_TIP_IDE":"Tipo Identificacion Editado"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/tipos-identificacion/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**25. /tipos-identificacion · DELETE - Eliminar Tipo de Identificacion**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/tipos-identificacion/9101
```

**26. /cargos · GET - Listar Cargo**

```powershell
(curl.exe -s http://localhost:3000/api/cargos | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**27. /cargos · POST - Crear Cargo**

```powershell
'{"ID_CAR":9101,"NOMBRE_CAR":"Cargo Postman"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/cargos -H "Content-Type: application/json" --data-binary "@-"
```

**28. /cargos · GET - Obtener Cargo por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/cargos/9101
```

**29. /cargos · PUT - Actualizar Cargo**

```powershell
'{"NOMBRE_CAR":"Cargo Postman Editado"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/cargos/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**30. /cargos · DELETE - Eliminar Cargo**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/cargos/9101
```

**31. /categorias · GET - Listar Categoria**

```powershell
(curl.exe -s http://localhost:3000/api/categorias | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**32. /categorias · POST - Crear Categoria**

```powershell
'{"ID_CAT":9101,"NOMBRE_CAT":"Categoria Postman"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/categorias -H "Content-Type: application/json" --data-binary "@-"
```

**33. /categorias · GET - Obtener Categoria por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/categorias/9101
```

**34. /categorias · PUT - Actualizar Categoria**

```powershell
'{"NOMBRE_CAT":"Categoria Postman Editada"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/categorias/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**35. /categorias · DELETE - Eliminar Categoria**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/categorias/9101
```

**36. /marcas · GET - Listar Marca**

```powershell
(curl.exe -s http://localhost:3000/api/marcas | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**37. /marcas · POST - Crear Marca**

```powershell
'{"ID_MAR":9101,"NOMBRE_MAR":"Marca Postman"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/marcas -H "Content-Type: application/json" --data-binary "@-"
```

**38. /marcas · GET - Obtener Marca por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/marcas/9101
```

**39. /marcas · PUT - Actualizar Marca**

```powershell
'{"NOMBRE_MAR":"Marca Postman Editada"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/marcas/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**40. /marcas · DELETE - Eliminar Marca**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/marcas/9101
```

**41. /estados-venta · GET - Listar Estado de Venta**

```powershell
(curl.exe -s http://localhost:3000/api/estados-venta | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**42. /estados-venta · POST - Crear Estado de Venta**

```powershell
'{"ID_ES_VEN":9101,"NOMBRE_ES_VEN":"EN_PRUEBA"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/estados-venta -H "Content-Type: application/json" --data-binary "@-"
```

**43. /estados-venta · GET - Obtener Estado de Venta por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/estados-venta/9101
```

**44. /estados-venta · PUT - Actualizar Estado de Venta**

```powershell
'{"NOMBRE_ES_VEN":"EN_PRUEBA_EDITADO"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/estados-venta/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**45. /estados-venta · DELETE - Eliminar Estado de Venta**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/estados-venta/9101
```

**46. /metodos-pago · GET - Listar Metodo de Pago**

```powershell
(curl.exe -s http://localhost:3000/api/metodos-pago | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**47. /metodos-pago · POST - Crear Metodo de Pago**

```powershell
'{"ID_MET_PAG":9101,"NOMBRE_MET_PAG":"Metodo Postman"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/metodos-pago -H "Content-Type: application/json" --data-binary "@-"
```

**48. /metodos-pago · GET - Obtener Metodo de Pago por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/metodos-pago/9101
```

**49. /metodos-pago · PUT - Actualizar Metodo de Pago**

```powershell
'{"NOMBRE_MET_PAG":"Metodo Postman Editado"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/metodos-pago/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**50. /metodos-pago · DELETE - Eliminar Metodo de Pago**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/metodos-pago/9101
```

## 3. Clientes (PERSONA + CLIENTE en una transacción)

**1. GET - Listar clientes**

```powershell
(curl.exe -s http://localhost:3000/api/clientes | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**2. GET - Obtener cliente por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/clientes/9101
```

**3. POST - Crear cliente**

```powershell
'{"PERSONA_ID_PER":9101,"NOMBRE_PER":"Juan","APELLIDO_PER":"Postman","TELEFONO":"12345678","CORREO_PER":"juan.postman@correo.com","DIRECCION_PER":"1 Calle 1-11 zona 1","MUNICIPIO_ID_MUN":1,"TIPO_IDENTIFICACION_ID_TIP_IDE":1,"NUMERO_IDENTIFICACION":"1234567890101"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/clientes -H "Content-Type: application/json" --data-binary "@-"
```

**4. PUT - Actualizar cliente**

```powershell
'{"NOMBRE_PER":"Juan","APELLIDO_PER":"Postman Editado","TELEFONO":"12345678","CORREO_PER":"juan.postman@correo.com","DIRECCION_PER":"1 Calle 1-11 zona 1","MUNICIPIO_ID_MUN":1,"TIPO_IDENTIFICACION_ID_TIP_IDE":1,"NUMERO_IDENTIFICACION":"1234567890101"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/clientes/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**5. DELETE - Eliminar cliente**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/clientes/9101
```

## 4. Empleados (PERSONA + EMPLEADO en una transacción)

**1. GET - Listar empleados**

```powershell
(curl.exe -s http://localhost:3000/api/empleados | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**2. GET - Obtener empleado por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/empleados/9102
```

**3. POST - Crear empleado**

```powershell
'{"PERSONA_ID_PER":9102,"NOMBRE_PER":"Maria","APELLIDO_PER":"Postman","TELEFONO":"87654321","CORREO_PER":"maria.postman@correo.com","DIRECCION_PER":"2 Calle 2-22 zona 2","MUNICIPIO_ID_MUN":1,"TIENDA_ID_TI":1,"CARGO_ID_CAR":1,"FECHA_CONTRATACION":"2024-01-15"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/empleados -H "Content-Type: application/json" --data-binary "@-"
```

**4. PUT - Actualizar empleado**

```powershell
'{"NOMBRE_PER":"Maria","APELLIDO_PER":"Postman Editado","TELEFONO":"87654321","CORREO_PER":"maria.postman@correo.com","DIRECCION_PER":"2 Calle 2-22 zona 2","MUNICIPIO_ID_MUN":1,"TIENDA_ID_TI":1,"CARGO_ID_CAR":1,"FECHA_CONTRATACION":"2024-01-15"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/empleados/9102 -H "Content-Type: application/json" --data-binary "@-"
```

**5. DELETE - Eliminar empleado**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/empleados/9102
```

## 5. Tiendas

**1. GET - Listar 04 - Tiendas**

```powershell
(curl.exe -s http://localhost:3000/api/tiendas | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**2. GET - Obtener 04 - Tiendas por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/tiendas/9101
```

**3. POST - Crear 04 - Tiendas**

```powershell
'{"ID_TI":9101,"NOMBRE_TI":"Tienda Postman","DIRECCION_TI":"3 Avenida 3-33 zona 3","MUNICIPIO_ID_MUN":1,"TIPO_TIENDA_ID_TIP_TIE":1,"TELEFONO_TI":"22223333"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/tiendas -H "Content-Type: application/json" --data-binary "@-"
```

**4. PUT - Actualizar 04 - Tiendas**

```powershell
'{"NOMBRE_TI":"Tienda Postman Editada","DIRECCION_TI":"3 Avenida 3-33 zona 3","MUNICIPIO_ID_MUN":1,"TIPO_TIENDA_ID_TIP_TIE":1,"TELEFONO_TI":"22223333"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/tiendas/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**5. DELETE - Eliminar 04 - Tiendas**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/tiendas/9101
```

## 6. Productos y catálogo (precio / existencia por tienda)

El producto 9101 se usa más adelante para la venta de prueba; por eso la eliminación se demuestra con otro producto (9102) que no tiene dependencias.

**1. GET - Listar productos**

```powershell
(curl.exe -s http://localhost:3000/api/productos | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**2. POST - Crear producto**

```powershell
'{"ID_PRO":9101,"NOMBRE_PRO":"Producto Postman","CATEGORIA_ID_CAT":1,"MARCA_ID_MAR":1,"DESCRIPCION_PRO":"Producto de prueba creado desde Postman"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" --data-binary "@-"
```

**3. GET - Obtener producto por ID**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/productos/9101
```

**4. PUT - Actualizar producto**

```powershell
'{"NOMBRE_PRO":"Producto Postman Editado","CATEGORIA_ID_CAT":1,"MARCA_ID_MAR":1,"DESCRIPCION_PRO":"Editado"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/productos/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**5. Listar catálogo completo**

```powershell
(curl.exe -s http://localhost:3000/api/productos/catalogo/all | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**6. Crear registro de catálogo (tienda 1, producto 9101)**

```powershell
'{"TIENDA_ID_TI":1,"PRODUCTO_ID_PRO":9101,"PRECIO_VIGENTE":15.5,"EXISTENCIA_ACTUAL":50}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/productos/catalogo -H "Content-Type: application/json" --data-binary "@-"
```

**7. Obtener registro de catálogo**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/productos/catalogo/1/9101
```

**8. Actualizar registro de catálogo (precio 16, existencia 45)**

```powershell
'{"PRECIO_VIGENTE":16,"EXISTENCIA_ACTUAL":45}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/productos/catalogo/1/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**9. Crear producto desechable 9102**

```powershell
'{"ID_PRO":9102,"NOMBRE_PRO":"Producto Desechable","CATEGORIA_ID_CAT":1,"MARCA_ID_MAR":1,"DESCRIPCION_PRO":"Solo para probar DELETE"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" --data-binary "@-"
```

**10. Eliminar producto desechable 9102**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/productos/9102
```

## 7. Ventas, detalle de venta y pagos

Flujo completo sobre la venta 9101 (tienda 1, empleado 1, cliente 89, producto 9101 con precio 16.00 y existencia 45).

**1. Crear venta (queda en REGISTRADA)**

```powershell
'{"ID_VEN":9101,"FECHA_VEN":"2026-10-01","TIENDA_ID_TI":1,"EMPLEADO_PERSONA_ID_PER":1,"CLIENTE_PERSONA_ID_PER":89}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/ventas -H "Content-Type: application/json" --data-binary "@-"
```

**2. Listar ventas**

```powershell
(curl.exe -s http://localhost:3000/api/ventas | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**3. Obtener venta 9101**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/ventas/9101
```

**4. Actualizar venta (nueva fecha)**

```powershell
'{"FECHA_VEN":"2026-10-02","TIENDA_ID_TI":1,"EMPLEADO_PERSONA_ID_PER":1,"CLIENTE_PERSONA_ID_PER":89}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/ventas/9101 -H "Content-Type: application/json" --data-binary "@-"
```

**5. Agregar 2 unidades del producto 9101 (dispara el Trigger de inventario)** — esperado `201`; el precio sale del catálogo (16.00) y la existencia baja de 45 a 43

```powershell
'{"VENTA_ID_VEN":9101,"PRODUCTO_ID_PRO":9101,"CANTIDAD":2}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/detalle-venta -H "Content-Type: application/json" --data-binary "@-"
```

**6. Verificar el descuento de inventario (debe ser 43)**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/productos/catalogo/1/9101
```

**7. Listar todo el detalle**

```powershell
(curl.exe -s http://localhost:3000/api/detalle-venta | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**8. Detalle de la venta 9101**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/detalle-venta/venta/9101
```

**9. Registrar un abono de 10.00 (dispara el Trigger de pagos)** — la venta vale 32.00, así que sigue en REGISTRADA

```powershell
'{"ID_PAG":9101,"MONTO_PAG":10,"VENTA_ID_VEN":9101,"METODO_PAGO_ID_MET_PAG":1}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pagos -H "Content-Type: application/json" --data-binary "@-"
```

**10. Listar todos los pagos**

```powershell
(curl.exe -s http://localhost:3000/api/pagos | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**11. Pagos de la venta 9101**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/pagos/venta/9101
```

**12. Obtener pago 9101**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/pagos/9101
```

**13. Anular venta 9101 (borrado lógico → ANULADA)**

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/ventas/9101
```

## 8. Vistas analíticas

Los JOINs y agregaciones están dentro de SQL Server; el API solo hace `SELECT * FROM <vista>`. Se muestran los primeros 3 registros.

**1. GET - Vista_Ventas_Ubicacion**

```powershell
(curl.exe -s http://localhost:3000/api/vistas/ventas-ubicacion | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**2. GET - Vista_Top_Productos**

```powershell
(curl.exe -s http://localhost:3000/api/vistas/top-productos | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

**3. GET - Vista_Saldos_Pendientes**

```powershell
(curl.exe -s http://localhost:3000/api/vistas/saldos-pendientes | ConvertFrom-Json) | Select-Object -First 3 | ConvertTo-Json
```

## 9. CRUD complementario (detalle de venta, pagos y catálogo)

Completa el CRUD de las tablas `DESGLOSE_VENTA`, `PAGO` y `CATALOGO_PRODUCTO` sobre datos propios (IDs 9700). Reglas de diseño: en un pago solo se corrige el **método de pago** y en un detalle solo el **precio unitario**, porque los triggers actúan en el `INSERT` y editar monto o cantidad dejaría inconsistentes el estado de la venta o el inventario (para corregirlos se elimina y se vuelve a registrar). El paso 9 comprueba esa regla (debe responder `400`).

**1. 1. Crear producto de prueba** — esperado `HTTP 201`

```powershell
'{"ID_PRO":9700,"NOMBRE_PRO":"Producto CRUD Complementario","CATEGORIA_ID_CAT":1,"MARCA_ID_MAR":1,"DESCRIPCION_PRO":"Para probar detalle, pago y catalogo"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" --data-binary "@-"
```

**2. 2. Crear registro de catalogo (tienda 1, existencia 20)** — esperado `HTTP 201`

```powershell
'{"TIENDA_ID_TI":1,"PRODUCTO_ID_PRO":9700,"PRECIO_VIGENTE":25,"EXISTENCIA_ACTUAL":20}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/productos/catalogo -H "Content-Type: application/json" --data-binary "@-"
```

**3. 3. Crear venta de prueba** — esperado `HTTP 201`

```powershell
'{"ID_VEN":9700,"FECHA_VEN":"2026-10-01","TIENDA_ID_TI":1,"EMPLEADO_PERSONA_ID_PER":1,"CLIENTE_PERSONA_ID_PER":89}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/ventas -H "Content-Type: application/json" --data-binary "@-"
```

**4. 4. POST detalle de venta (2 unidades)** — esperado `HTTP 201`

```powershell
'{"VENTA_ID_VEN":9700,"PRODUCTO_ID_PRO":9700,"CANTIDAD":2}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/detalle-venta -H "Content-Type: application/json" --data-binary "@-"
```

**5. 5. GET detalle por llave (venta/producto)** — esperado `HTTP 200`

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/detalle-venta/9700/9700
```

**6. 6. PUT detalle de venta (corregir precio unitario a 30)** — esperado `HTTP 200`

```powershell
'{"PRECIO_UNITARIO":30}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/detalle-venta/9700/9700 -H "Content-Type: application/json" --data-binary "@-"
```

**7. 7. POST pago (10.00)** — esperado `HTTP 201`

```powershell
'{"ID_PAG":9700,"MONTO_PAG":10,"VENTA_ID_VEN":9700,"METODO_PAGO_ID_MET_PAG":1}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pagos -H "Content-Type: application/json" --data-binary "@-"
```

**8. 8. PUT pago (corregir metodo de pago)** — esperado `HTTP 200`

```powershell
'{"METODO_PAGO_ID_MET_PAG":2}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/pagos/9700 -H "Content-Type: application/json" --data-binary "@-"
```

**9. 9. PUT pago intentando cambiar el monto (rechazado)** — esperado `HTTP 400`

```powershell
'{"MONTO_PAG":999}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X PUT http://localhost:3000/api/pagos/9700 -H "Content-Type: application/json" --data-binary "@-"
```

**10. 10. DELETE pago** — esperado `HTTP 200`

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/pagos/9700
```

**11. 11. DELETE detalle de venta** — esperado `HTTP 200`

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/detalle-venta/9700/9700
```

**12. 12. DELETE registro de catalogo** — esperado `HTTP 200`

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/productos/catalogo/1/9700
```

**13. 13. DELETE producto** — esperado `HTTP 200`

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/productos/9700
```

**14. 14. DELETE venta (anulacion logica)** — esperado `HTTP 200`

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/api/ventas/9700
```

## 10. Pruebas de los Triggers

### 10.1 Preparación (datos propios de la prueba, IDs 9800+)

**1. Crear país**

```powershell
'{"ID_PA":9800,"NOMBRE_PA":"Pais Curl Trigger"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/paises -H "Content-Type: application/json" --data-binary "@-"
```

**2. Crear departamento**

```powershell
'{"ID_DEP":9800,"NOMBRE_DEP":"Depto Curl Trigger","PAIS_ID_PA":9800}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/departamentos -H "Content-Type: application/json" --data-binary "@-"
```

**3. Crear municipio**

```powershell
'{"ID_MUN":9800,"NOMBRE_MUN":"Municipio Curl Trigger","DEPARTAMENTO_ID_DEP":9800}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/municipios -H "Content-Type: application/json" --data-binary "@-"
```

**4. Crear tipo de tienda**

```powershell
'{"ID_TIP_TIE":9800,"NOMBRE_TIP_TIE":"Tipo Curl Trigger"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/tipos-tienda -H "Content-Type: application/json" --data-binary "@-"
```

**5. Crear tienda**

```powershell
'{"ID_TI":9800,"NOMBRE_TI":"Tienda Curl Trigger","DIRECCION_TI":"Direccion de prueba","MUNICIPIO_ID_MUN":9800,"TIPO_TIENDA_ID_TIP_TIE":9800,"TELEFONO_TI":"00000000"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/tiendas -H "Content-Type: application/json" --data-binary "@-"
```

**6. Crear categoría**

```powershell
'{"ID_CAT":9800,"NOMBRE_CAT":"Categoria Curl Trigger"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/categorias -H "Content-Type: application/json" --data-binary "@-"
```

**7. Crear marca**

```powershell
'{"ID_MAR":9800,"NOMBRE_MAR":"Marca Curl Trigger"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/marcas -H "Content-Type: application/json" --data-binary "@-"
```

**8. Crear producto**

```powershell
'{"ID_PRO":9800,"NOMBRE_PRO":"Producto Curl Trigger","CATEGORIA_ID_CAT":9800,"MARCA_ID_MAR":9800,"DESCRIPCION_PRO":"Para validar triggers"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" --data-binary "@-"
```

**9. Crear registro de catálogo (precio 100, existencia 10)**

```powershell
'{"TIENDA_ID_TI":9800,"PRODUCTO_ID_PRO":9800,"PRECIO_VIGENTE":100,"EXISTENCIA_ACTUAL":10}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/productos/catalogo -H "Content-Type: application/json" --data-binary "@-"
```

**10. Crear tipo de identificación**

```powershell
'{"ID_TIP_IDE":9800,"NOMBRE_TIP_IDE":"Tipo Ident Curl Trigger"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/tipos-identificacion -H "Content-Type: application/json" --data-binary "@-"
```

**11. Crear cargo**

```powershell
'{"ID_CAR":9800,"NOMBRE_CAR":"Cargo Curl Trigger"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/cargos -H "Content-Type: application/json" --data-binary "@-"
```

**12. Crear método de pago**

```powershell
'{"ID_MET_PAG":9800,"NOMBRE_MET_PAG":"Metodo Curl Trigger"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/metodos-pago -H "Content-Type: application/json" --data-binary "@-"
```

**13. Crear cliente**

```powershell
'{"PERSONA_ID_PER":9800,"NOMBRE_PER":"Cliente","APELLIDO_PER":"Curl","TELEFONO":"00000001","CORREO_PER":"cliente.curl.trigger@correo.com","DIRECCION_PER":"Direccion de prueba","MUNICIPIO_ID_MUN":9800,"TIPO_IDENTIFICACION_ID_TIP_IDE":9800,"NUMERO_IDENTIFICACION":"CURLTRIGGER01"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/clientes -H "Content-Type: application/json" --data-binary "@-"
```

**14. Crear empleado**

```powershell
'{"PERSONA_ID_PER":9801,"NOMBRE_PER":"Empleado","APELLIDO_PER":"Curl","TELEFONO":"00000002","CORREO_PER":"empleado.curl.trigger@correo.com","DIRECCION_PER":"Direccion de prueba","MUNICIPIO_ID_MUN":9800,"TIENDA_ID_TI":9800,"CARGO_ID_CAR":9800,"FECHA_CONTRATACION":"2024-01-01"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/empleados -H "Content-Type: application/json" --data-binary "@-"
```

**15. Crear venta de prueba (queda REGISTRADA)**

```powershell
'{"ID_VEN":9800,"FECHA_VEN":"2026-10-01","TIENDA_ID_TI":9800,"EMPLEADO_PERSONA_ID_PER":9801,"CLIENTE_PERSONA_ID_PER":9800}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/ventas -H "Content-Type: application/json" --data-binary "@-"
```

### 10.2 Escenarios

**1. Escenario 1 — Inventario, FALLO esperado: vender 999 con existencia 10** — esperado **`HTTP 400`** y `{"error":"Stock insuficiente"}`

```powershell
'{"VENTA_ID_VEN":9800,"PRODUCTO_ID_PRO":9800,"CANTIDAD":999}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/detalle-venta -H "Content-Type: application/json" --data-binary "@-"
```

**2. Escenario 2a — Inventario, ÉXITO esperado: vender 3 de 10** — esperado `HTTP 201`

```powershell
'{"VENTA_ID_VEN":9800,"PRODUCTO_ID_PRO":9800,"CANTIDAD":3}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/detalle-venta -H "Content-Type: application/json" --data-binary "@-"
```

**3. Escenario 2b — Verificar que la existencia bajó de 10 a 7** — esperado `EXISTENCIA_ACTUAL: 7`

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/productos/catalogo/9800/9800
```

**4. Escenario 3a — Abono parcial de 100 (la venta vale 300)** — esperado `HTTP 201`

```powershell
'{"ID_PAG":9800,"MONTO_PAG":100,"VENTA_ID_VEN":9800,"METODO_PAGO_ID_MET_PAG":9800}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pagos -H "Content-Type: application/json" --data-binary "@-"
```

**5. Escenario 3b — La venta SIGUE en REGISTRADA** — esperado `ESTADO_VENTA_ID_ES_VEN` = id de REGISTRADA (1)

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/ventas/9800
```

**6. Escenario 3c — Abono final de 200 (cubre el total de 300)** — esperado `HTTP 201`

```powershell
'{"ID_PAG":9801,"MONTO_PAG":200,"VENTA_ID_VEN":9800,"METODO_PAGO_ID_MET_PAG":9800}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/pagos -H "Content-Type: application/json" --data-binary "@-"
```

**7. Escenario 3d — La venta cambió automáticamente a PAGADA** — esperado `ESTADO_VENTA_ID_ES_VEN` = id de PAGADA (2)

```powershell
curl.exe -s -w "\nHTTP %{http_code}\n" -X GET http://localhost:3000/api/ventas/9800
```

**Qué demuestra:** el API nunca decide el stock ni el estado de la venta; lo hacen los triggers `trg_DesgloseVenta_Insert_Detalle` (rechaza con `RAISERROR` + `ROLLBACK` si la cantidad supera la existencia, o descuenta el inventario) y `trg_Pago_Insert_Pago` (cambia la venta a PAGADA cuando lo pagado alcanza el total).

## 11. Errores esperados (validaciones)

```powershell
# Registro inexistente -> 404
curl.exe -s -w "\nHTTP %{http_code}\n" http://localhost:3000/api/paises/999999

# Crear un país con un ID que ya existe -> 409
'{"ID_PA":1,"NOMBRE_PA":"Repetido"}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/paises -H "Content-Type: application/json" --data-binary "@-"

# Referencia inexistente (llave foránea) -> 409
'{"ID_DEP":9990,"NOMBRE_DEP":"Huerfano","PAIS_ID_PA":999999}' | curl.exe -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/api/departamentos -H "Content-Type: application/json" --data-binary "@-"

# Ruta inexistente -> 404
curl.exe -s -w "\nHTTP %{http_code}\n" http://localhost:3000/api/ruta-que-no-existe
```
