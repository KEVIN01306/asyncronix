# Arquitectura del Sistema Backend (SaaS Asyncronix)

Este documento describe de manera exhaustiva y detallada la arquitectura general, estructura de directorios, capas de software, diseño modular, responsabilidades de cada componente y todas las integraciones externas del backend de **Asyncronix**.

---

## 1. Visión General de la Arquitectura

El backend de **Asyncronix** está diseñado bajo los principios de **Clean Architecture (Arquitectura Limpia)**, **Diseño Guiado por el Dominio (DDD táctico)** y una estricta **arquitectura modular multi-inquilino (Multi-Tenant)**.

### Principios Fundamentales

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   (Controllers, Routes, Schemas de Validación Zod, Middlewares HTTP)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Invoca (depende de)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                              │
│       (Casos de Uso / Use Cases, DTOs, Orquestación de Negocio)        │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │ Utiliza                       │ Define interfaces para
                    ▼                               ▼
┌───────────────────────────────────────┐ ┌──────────────────────────────┐
│             DOMAIN LAYER              │ │    INFRASTRUCTURE LAYER      │
│  (Entidades de Negocio, Reglas puras, │ │ (Prisma ORM, PostgreSQL,     │
│   Interfaces de Repositorios y        │ │  SDKs externos: R2, Resend,  │
│   Interfaces de Proveedores/Providers)│ │  Firebase, Digifact, Mappers)│
└───────────────────────────────────────┘ └──────────────────────────────┘
```

1. **Regla de Dependencia Unidireccional**: Las dependencias apuntan hacia el centro (Dominio). La capa de Dominio no conoce la base de datos (Prisma), ni frameworks HTTP (Express), ni servicios externos (Resend, Cloudflare, Digifact).
2. **Aislamiento Multi-Tenant**: Cada petición autenticada viaja con su contexto de seguridad en `res.locals.usuario` (`negocio_id`, `sucursal_id`, roles y permisos). Todas las consultas de persistencia aplican el filtro estricto por `negocio_id` para garantizar la privacidad y el aislamiento entre empresas.
3. **Inversión de Dependencias (IoC) y Composición**: Cada módulo cuenta con un archivo `*.module.ts` que actúa como raíz de composición (Composition Root), instanciando los repositorios concretos, inyectándolos en los casos de uso y proveyendo los controladores listos para las rutas.
4. **Manejo Centralizado de Errores**: Separación clara entre errores de persistencia (`PersistenceError`, `UniqueConstraintError`), errores de validación de entrada (`ZodError`), y errores de negocio/HTTP (`AppError`).

---

## 2. Mapa y Estructura Global del Backend

### Diagrama del Flujo de una Petición (Request Lifecycle)

```
[ Cliente HTTP (Web / Mobile) ]
              │
              ▼ (Headers, JWT Bearer Token, Body JSON / FormData)
┌───────────────────────────────────────────────────────────────────────┐
│ Express Server (src/app.ts & src/server.ts)                           │
│  ├── CORS (app.asyncronix.com, localhost)                             │
│  ├── Body Parser (JSON & URL-Encoded hasta 10MB para Base64)          │
│  ├── Cookie Parser                                                    │
│  └── Router Central (src/routes/index.routes.ts)                      │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│ Middlewares Transversales                                             │
│  ├── AuthMiddleware: Verifica JWT con Jose, extrae usuario/negocio    │
│  ├── Permisos: verificarRol() / verificarPermiso() (RBAC)             │
│  ├── ValidarMiddleware: Valida req.body / req.query / req.params (Zod)│
│  └── FileUploadMiddleware: Multer en memoria (MemoryStorage)          │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│ Presentation: Controller (extiende BaseController)                    │
│  ├── Obtiene entorno seguro: this.obtenerEntorno(res)                 │
│  ├── Extrae DTO y delega al Caso de Uso                               │
│  └── Retorna respuesta estandarizada: Respuesta.exito / paginacion   │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│ Application: Use Case (Lógica de Negocio Pura)                        │
│  ├── Valida invariantes y reglas de negocio                           │
│  ├── Verifica límites de suscripción (NegocioLimite)                  │
│  ├── Orquesta múltiples repositorios y transacciones atómicas         │
│  └── Invoca interfaces de dominio (IStorageProvider, etc.)           │
└─────────────────┬───────────────────────────────────┬─────────────────┘
                  │ Persistencia                      │ Servicios Externos
                  ▼                                   ▼
┌───────────────────────────────────┐ ┌─────────────────────────────────┐
│ Infrastructure: Repositories      │ │ Infrastructure: Providers       │
│  ├── Prisma Client (PostgreSQL)   │ │  ├── Cloudflare R2 (S3 SDK)     │
│  ├── Triggers SQL de stock        │ │  ├── Digifact FEL API           │
│  ├── PrismaErrorMapper            │ │  ├── Resend Email API           │
│  └── Mappers (Prisma <-> Domain)  │ │  ├── Firebase Admin (FCM)       │
│                                   │ │  └── Frankfurter Currency API   │
└───────────────────────────────────┘ └─────────────────────────────────┘
```

### Organización del Código en el Árbol de Carpetas

```
saas-backend/
├── prisma/                          # Definición de base de datos relacional
│   ├── schema.prisma                # Esquema de modelos, tablas y enums
│   ├── seed.ts                      # Carga inicial de módulos, permisos y superadmin
│   └── migrations/                  # Historial de migraciones SQL
├── src/
│   ├── app/                         # Configuración base HTTP y middleware global
│   │   ├── http/
│   │   │   └── respuesta.ts         # Clase utilitaria Respuesta (JSON estándar)
│   │   └── middlewares/
│   │       ├── AuthMiddleware.ts    # Validación de token JWT y permisos RBAC
│   │       ├── ValidarMiddleware.ts # Validación de schemas Zod en peticiones
│   │       └── ErrorMiddleware.ts   # Manejador global de excepciones
│   │
│   ├── infrastructure/              # Configuración compartida de infraestructura
│   │   └── config/
│   │       ├── prisma.ts            # Instancia singleton de PrismaClient
│   │       └── *.json               # Credenciales de servicio (Firebase Admin SDK)
│   │
│   ├── routes/
│   │   └── index.routes.ts          # Enrutador maestro con carga perezosa (dynamic imports)
│   │
│   ├── shared/                      # Bloques de construcción transversales reutilizables
│   │   ├── database/                # Transacciones, triggers y errores de persistencia
│   │   ├── domain/                  # Contratos e interfaces base (Providers, Paginación)
│   │   ├── errors/                  # Clases de error base de la aplicación (AppError)
│   │   ├── infrastructure/          # Adaptadores concretos (R2, Resend, Hash, etc.)
│   │   └── presentation/            # BaseController y middlewares de subida de archivos
│   │
│   ├── modules/                     # Módulos de dominio del sistema (41 módulos)
│   │   ├── auth/                    # Sesión, login, refresh tokens
│   │   ├── usuarios/                # Gestión de usuarios, perfiles y PINs
│   │   ├── ventas/                  # POS, preventas, ventas y facturación
│   │   ├── producto/                # Catálogo, variantes, atributos y códigos QR
│   │   ├── lote/                    # Control de inventario y stock físico
│   │   ├── facturacion/             # Emisión y certificación FEL (Digifact)
│   │   ├── ...                      # (Ver sección detallada de módulos)
│   │
│   ├── app.ts                       # Ensamblaje de Express, CORS, middlewares y rutas
│   └── server.ts                    # Punto de arranque y escucha en el puerto TCP
├── .env                             # Variables de entorno y secretos del servidor
├── package.json                     # Metadatos del proyecto y dependencias
└── tsconfig.json                    # Configuración de TypeScript y alias de rutas
```

---

## 3. Guía de Responsabilidad por Tipo de Archivo y Carpeta

Para garantizar que el código sea predecible y homogéneo entre los más de 40 módulos, cada pieza de código tiene un rol específico y no debe asumir tareas de otras capas:

### 3.1. Archivos `*.module.ts` (Composition Root)
* **¿Para qué sirve?**: Es el punto de ensamblaje e inyección de dependencias del módulo.
* **Qué hace**: Instancia las clases concretas de infraestructura (repositorios de Prisma, proveedores externos de almacenamiento o correo), las inyecta en los constructores de los Casos de Uso correspondientes, y a su vez inyecta los casos de uso en el Controlador.
* **Qué NO debe hacer**: No debe contener lógica de negocio, no debe procesar solicitudes `req`/`res`, ni ejecutar queries directas a la base de datos.

### 3.2. Archivos `*.controller.ts` (Adaptadores de Presentación HTTP)
* **¿Para qué sirve?**: Recibir y responder peticiones HTTP según el estándar RESTful.
* **Qué hace**:
  1. Extiende de `BaseController` para acceder al método `obtenerEntorno(res)`, asegurando el contexto del inquilino autenticado (`negocio_id`, `sucursal_id`, usuario).
  2. Extrae parámetros de URL (`req.params`), datos validados (`req.body`) y filtros (`req.query` o `res.locals.query`).
  3. Ejecuta el Caso de Uso adecuado.
  4. Envía la respuesta utilizando la clase `Respuesta.exito(...)` o `Respuesta.paginacion(...)`.
  5. Captura errores y los delega a `next(error)` para que el middleware global los formatee.
* **Qué NO debe hacer**: No debe consultar Prisma directamente, no debe validar reglas de negocio (ej. "si el stock alcanza" o "si la caja tiene saldo"), ni generar modelos de base de datos.

### 3.3. Archivos `*.routes.ts` (Definición de Endpoints)
* **¿Para qué sirve?**: Mapear rutas URL y verbos HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) hacia métodos del controlador.
* **Qué hace**: Aplica la tubería de middlewares en el orden correcto:
  ```ts
  router.post("/",
      authMiddleware.protegerRuta,
      authMiddleware.verificarPermiso(["CREAR_PRODUCTOS"]),
      validarMiddleware.validarBody(crearProductoSchema),
      productoController.crear
  );
  ```
* **Qué NO debe hacer**: No debe contener funciones anónimas con lógica inline ni interactuar con la base de datos.

### 3.4. Archivos `*.schema.ts` / `*.validator.ts` (Validación de Entrada con Zod)
* **¿Para qué sirve?**: Validar y sanitizar la forma y tipos de datos que ingresan al sistema antes de que alcancen el controlador.
* **Qué hace**: Garantiza tipos primitivos, formatos (UUID, email, números positivos, fechas ISO), valores por defecto y campos requeridos.
* **Diferencia con las reglas de negocio**: El schema valida la *estructura* del dato (ej. "el NIT es un string"), mientras que el Caso de Uso valida el *significado de negocio* (ej. "el cliente no puede comprar si está bloqueado por mora").

### 3.5. Archivos `*.usecase.ts` (Capa de Aplicación / Lógica de Negocio)
* **¿Para qué sirve?**: Contener la lógica central y las decisiones del negocio. Cada acción atómica relevante tiene su propio caso de uso (ej. `RegistrarVentaUseCase`, `CrearTrasladoUseCase`, `FinalizarPreVentaUseCase`).
* **Qué hace**:
  - Valida condiciones previas (existencia de entidades, saldo disponible, permisos especiales por PIN).
  - Consulta límites del plan del inquilino (`NegocioLimite`).
  - Coordina transacciones atómicas cuando se ven afectadas múltiples tablas.
  - Orquesta múltiples repositorios y proveedores externos mediante interfaces.
  - Lanza errores de negocio claros (`AppError`, `StockInsuficienteError`, etc.).
* **Qué NO debe hacer**: No conoce objetos `Request` ni `Response` de Express, no produce códigos HTTP 200/404, ni realiza queries Prisma directamente.

### 3.6. Archivos `*.entity.ts` (Entidades de Dominio)
* **¿Para qué sirve?**: Definir el modelo conceptual y puro del dominio con sus tipos y métodos de validación de invariantes. Es completamente agnóstico de si los datos se guardan en PostgreSQL, MongoDB o memoria.

### 3.7. Archivos `*.repository.ts` (Interfaces de Persistencia en Dominio)
* **¿Para qué sirve?**: Contrato abstracto que especifica qué operaciones de almacenamiento necesita el negocio (ej. `crear()`, `buscarPorId()`, `descontarSaldo()`), desacoplando el dominio del ORM.

### 3.8. Archivos `prisma-*.repository.ts` (Repositorios Concretos en Infrastructure)
* **¿Para qué sirve?**: Implementar la interfaz del repositorio utilizando `PrismaClient`.
* **Qué hace**: Construye las consultas Prisma, aplica filtros por `negocio_id`, maneja paginación (`skip`, `take`), relaciones (`include`) y captura excepciones de base de datos para mapearlas con `PrismaErrorMapper`.
* **Qué NO debe hacer**: No toma decisiones de negocio. Si una clave no existe, retorna `null` o lanza `PersistenceError`, dejando que el caso de uso interprete el significado.

### 3.9. Archivos `*.mapper.ts` (Transformadores de Datos)
* **¿Para qué sirve?**: Aislar los esquemas internos de las tablas de la base de datos de las estructuras que espera el dominio o la respuesta JSON que recibe el cliente frontend.

---

## 4. Inventario Completo de los Módulos del Sistema

El backend cuenta con **41 módulos** organizados en `src/modules/`. A continuación se detalla cada uno de ellos, su ruta montada en la API, su propósito funcional y sus componentes internos:

---

### 1. `auth` (Autenticación y Seguridad)
* **Ruta base**: `/auth`
* **Propósito**: Gestión completa de ciclo de vida de sesiones, autenticación de usuarios mediante credenciales, rotación de Refresh Tokens en cookies `httpOnly`, generación de access tokens JWT y perfil de usuario autenticado.
* **Componentes clave**:
  - **Aplicación**: `login.usecase.ts`, `refresh-token.usecase.ts`, `obtener-perfil.usecase.ts`.
  - **Dominio**: `auth-user.entity.ts`, `auth-session.entity.ts`, `jwt.provider.ts`, `auth.repository.ts`.
  - **Infraestructura**: `prisma-auth.repository.ts`, `jose-jwt.provider.ts`, `auth.mapper.ts`.
  - **Presentación**: `auth.controller.ts`, `auth.routes.ts`, `login.schema.ts`.
  - **Composición**: `auth.module.ts`.

---

### 2. `usuarios` (Gestión de Personal y Autorizaciones)
* **Ruta base**: `/usuarios`
* **Propósito**: Administración de los colaboradores del negocio. Permite altas, bajas lógicas, asignación de roles, cambio de avatar en Cloudflare R2, reseteo de contraseñas y asignación/actualización de **PINs de seguridad** (PIN de caja, PIN de modelo, PIN de sucursal) utilizados para autorizaciones críticas en puntos de venta.
* **Componentes clave**:
  - **Aplicación**: `registrar-usuario.usecase.ts`, `obtener-usuarios.usecase.ts`, `obtener-usuario.usecase.ts`, `actualizar-usuario.usecase.ts`, `eliminar-usuario.usecase.ts`, `actualizar-perfil.usecase.ts`, `actualizar-avatar.usecase.ts`, `cambiar-password.usecase.ts`, `actualizar-pin-caja.usecase.ts`, `actualizar-pin-modelo.usecase.ts`, `actualizar-pin-sucursal.usecase.ts`.
  - **Dominio**: `usuario.entity.ts`, `rol.entity.ts`, `usuario.repository.ts`.
  - **Infraestructura**: `prisma-usuario.repository.ts`, `usuario.mapper.ts`.
  - **Presentación**: `usuario.controller.ts`, `usuario.routes.ts`, `usuario.schema.ts`.
  - **Composición**: `usuario.module.ts`.

---

### 3. `rol` (Roles de Usuario)
* **Ruta base**: `/roles`
* **Propósito**: Mantenimiento de los roles de acceso definidos por el inquilino (ej. Administrador, Cajero, Mecánico, Asesor de Ventas).
* **Componentes clave**:
  - **Aplicación**: `obtener-roles.usecase.ts`, `obtener-rol.usecase.ts`, `crear-rol.usecase.ts`, `actualizar-rol.usecase.ts`, `eliminar-rol.usecase.ts`.
  - **Dominio / Infraestructura / Presentación**: `rol.entity.ts`, `rol.repository.ts`, `prisma-rol.repository.ts`, `rol.controller.ts`, `rol.routes.ts`, `rol.schema.ts`, `rol.module.ts`.

---

### 4. `permisos` (Sistema RBAC Granular)
* **Ruta base**: `/permisos`
* **Propósito**: Catálogo central de módulos y permisos del sistema (más de 90 permisos granulares). Permite consultar los módulos del sistema y asignar dinámicamente permisos específicos a los roles.
* **Componentes clave**:
  - **Aplicación**: `obtener-modulos.usecase.ts`, `obtener-permisos.usecase.ts`, `obtener-permisos-rol.usecase.ts`, `asignar-permisos-rol.usecase.ts`.
  - **Dominio / Infra / Pres**: `permiso.entity.ts`, `permisos.repository.ts`, `prisma-permisos.repository.ts`, `permisos.controller.ts`, `permisos.routes.ts`, `permisos.schema.ts`, `permisos.module.ts`.

---

### 5. `negocio` (Tenancy, Configuración Fiscal y Límites)
* **Ruta base**: `/negocios`
* **Propósito**: Gestión del Inquilino (Tenant raíz). Controla el perfil de la empresa, cambio de moneda base, datos de facturación electrónica (credenciales Digifact de la empresa), y verificación de cuotas y límites máximos según el plan contratado (`NegocioLimite`: usuarios, sucursales, productos, etc.).
* **Componentes clave**:
  - **Aplicación**: `registrar-negocio.usecase.ts`, `obtener-mi-negocio.usecase.ts`, `obtener-negocio.usecase.ts`, `actualizar-negocio.usecase.ts`, `actualizar-mi-negocio.usecase.ts`, `cambiar-moneda-negocio.usecase.ts`, `obtener-limites-negocio.usecase.ts`, `validar-limite-negocio.usecase.ts`, `obtener-facturacion-negocio.usecase.ts`, `actualizar-facturacion-negocio.usecase.ts`.
  - **Dominio**: `negocio.entity.ts`, `negocio-limite.entity.ts`, `negocio-facturacion.entity.ts`, `negocio.repository.ts`.
  - **Infraestructura**: `prisma-negocio.repository.ts`, `negocio.mapper.ts`.
  - **Presentación**: `negocio.controller.ts`, `negocio.routes.ts`, `negocio.validator.ts`, `negocio.module.ts`.

---

### 6. `sucursal` (Sedes y Sucursales)
* **Ruta base**: `/sucursales`
* **Propósito**: Administración de las diferentes tiendas, talleres o sucursales físicas de un negocio, con sus cuentas bancarias asignadas y ubicación geográfica.
* **Componentes clave**:
  - **Aplicación**: `registrar-sucurrsal.usecase.ts`, `obtener-sucurrsales.usecase.ts`, `obtener-sucurrsal.usecase.ts`, `obtener-mi-sucursal.usecase.ts`, `actualizar-sucurrsal.usecase.ts`, `eliminar-sucursal.usecase.ts`, `asignar-cuenta-bancaria-sucursal.usecase.ts`.
  - **Dominio / Infra / Pres**: `sucursal.entity.ts`, `sucursal.repository.ts`, `prisma-sucursal.repository.ts`, `sucursal.controller.ts`, `sucursal.routes.ts`, `sucursal.validator.ts`, `sucursal.module.ts`.

---

### 7. `producto` (Catálogo, Variantes y Códigos QR)
* **Ruta base**: `/productos`
* **Propósito**: Gestión completa de artículos, variantes por talla/color/tipo, códigos de barras, generación de códigos QR automáticos descargables, galería de fotos sincronizada con Cloudflare R2 y asociación con atributos dinámicos.
* **Componentes clave**:
  - **Aplicación**: `registrar-producto.usecase.ts`, `obtener-productos.usecase.ts`, `obtener-producto.usecase.ts`, `actualizar-producto.usecase.ts`, `eliminar-producto.usecase.ts`, `crear-variante.usecase.ts`, `obtener-variante.usecase.ts`, `actualizar-variante.usecase.ts`, `eliminar-variante.usecase.ts`, `listar-variantes-producto.usecase.ts`, `listar-variantes-negocio.usecase.ts`, `buscar-variante-por-codigo.usecase.ts`, `actualizar-codigo-barras-variante.usecase.ts`, `generar-qr-producto.usecase.ts`, `generar-qr-variante.usecase.ts`, `subir-imagen-producto.usecase.ts`, `listar-imagenes-producto.usecase.ts`, `eliminar-imagen-producto.usecase.ts`, `establecer-imagen-principal-producto.usecase.ts`, `actualizar-descripcion-imagen-producto.usecase.ts`, `actualizar-archivo-imagen-producto.usecase.ts`, `actualizar-atributos-producto.usecase.ts`, `listar-atributos-producto.usecase.ts`.
  - **Dominio**: `producto.entity.ts`, `variante.entity.ts`, `producto.repository.ts`, `variante.repository.ts`.
  - **Infraestructura**: `prisma-producto.repository.ts`, `prisma-variante.repository.ts`, `producto.mapper.ts`.
  - **Presentación**: `producto.controller.ts`, `producto.routes.ts`, schemas Zod para producto, variante y scanner.
  - **Composición**: `producto.module.ts`.

---

### 8. `lote` (Control de Inventario y Stock Físico)
* **Ruta base**: `/lotes`
* **Propósito**: Trazabilidad del stock mediante lotes (fecha de adquisición, vencimiento, costo unitario, cantidad inicial y disponible). Incluye lógica especializada para **regularización de inventario negativo** en caso de inconsistencias operativas.
* **Componentes clave**:
  - **Aplicación**: `registrar-lote.usecase.ts`, `obtener-lotes.usecase.ts`, `obtener-lote.usecase.ts`, `listar-lotes.usecase.ts`, `listar-lotes-por-producto.usecase.ts`, `regularizar-stock-negativo.usecase.ts`.
  - **Dominio / Infra / Pres**: `lote.entity.ts`, `lote.repository.ts`, `prisma-lote.repository.ts`, `lote.mapper.ts`, `lote.controller.ts`, `lote.routes.ts`, `lote.schema.ts`, `lote.query.schema.ts`, `lote.module.ts`.

---

### 9. `categoria` (Jerarquía de Categorías de Productos)
* **Ruta base**: `/categorias`
* **Propósito**: Clasificación de productos en árbol jerárquico infinito (categorías padre y subcategorías).
* **Componentes clave**:
  - **Aplicación**: `registrar-categoria.usecase.ts`, `obtener-categorias.usecase.ts`, `obtener-categoria.usecase.ts`, `actualizar-categoria.usecase.ts`, `eliminar-categoria.usecase.ts`, `obtener-categoria-jerarquia.usecase.ts`, `obtener-categorias-disponibles-como-padre.usecase.ts`.
  - **Dominio / Infra / Pres**: `categoria.entity.ts`, `categoria.repository.ts`, `prisma-categoria.repository.ts`, `categoria.controller.ts`, `categoria.routes.ts`, `categoria.schema.ts`, `categoria.module.ts`.

---

### 10. `atributo` (Propiedades Dinámicas de Variantes)
* **Ruta base**: `/atributos`
* **Propósito**: Catálogo de atributos configurables (ej. Color, Talla, Material, Viscosidad) asignables a las variantes de productos.
* **Componentes clave**: `atributo.entity.ts`, `prisma-atributo.repository.ts`, `atributo.controller.ts`, `atributo.routes.ts`.

---

### 11. `cliente` (Cartera de Clientes)
* **Ruta base**: `/clientes`
* **Propósito**: Gestión de clientes individuales y corporativos, búsqueda rápida por NIT o DPI, datos de contacto, dirección y vehículos asociados.
* **Componentes clave**:
  - **Aplicación**: `registrar-cliente.usecase.ts`, `obtener-clientes.ts`, `obtener-cliente.usecase.ts`, `actualizar-cliente.usecase.ts`, `eliminar-cliente.usecase.ts`, `buscar-cliente-por-documento.usecase.ts`.
  - **Dominio / Infra / Pres**: `cliente.entity.ts`, `cliente.repository.ts`, `prisma-cliente.repository.ts`, `cliente.controller.ts`, `cliente.routes.ts`, `cliente.validator.ts`, `cliente.module.ts`.

---

### 12. `proveedor` (Proveedores Comerciales)
* **Ruta base**: `/proveedores`
* **Propósito**: Directorio de proveedores de repuestos, insumos o mercancía con información fiscal y comercial.
* **Componentes clave**:
  - **Aplicación**: `registrar-proveedor.usecase.ts`, `obtener-proveedores.usecase.ts`, `obtener-proveedor.usecase.ts`, `actualizar-proveedor.usecase.ts`, `eliminar-proveedor.usecase.ts`.
  - **Dominio / Infra / Pres**: `proveedor.entity.ts`, `proveedor.repository.ts`, `prisma-proveedor.repository.ts`, `proveedor.controller.ts`, `proveedor.routes.ts`, `proveedor.validator.ts`, `proveedor.module.ts`.

---

### 13. `ventas` (Módulo POS, Preventas y Ventas)
* **Ruta base**: `/ventas`
* **Propósito**: Núcleo de facturación comercial. Soporta flujo de **Preventa rápida (carrito de compra/mostrador)** y **Venta directa**, cálculo de totales, múltiples métodos de pago (Efectivo, Tarjeta, Transferencia), validación de PIN de supervisor/caja para descuentos o contingencias, integración con el descuento atómico de stock mediante triggers y emisión automática de facturas electrónicas FEL.
* **Componentes clave**:
  - **Aplicación**: `crear-preventa.usecase.ts`, `obtener-preventas.usecase.ts`, `obtener-preventa.usecase.ts`, `actualizar-cantidad-preventa.usecase.ts`, `agregar-detalle-preventa.usecase.ts`, `actualizar-cliente-preventa.usecase.ts`, `eliminar-detalle-preventa.usecase.ts`, `finalizar-preventa.usecase.ts`, `registrar-venta.usecase.ts`, `obtener-ventas.usecase.ts`, `obtener-venta.usecase.ts`, `actualizar-venta.usecase.ts`, `anular-venta.usecase.ts`, `finalizar-venta.usecase.ts`, `agregar-producto.usecase.ts`, `buscar-producto-por-sku.usecase.ts`, `crear-detalle-venta.usecase.ts`, `crear-detalle-venta-por-sku.usecase.ts`, `eliminar-detalle-venta.usecase.ts`, `validar-pin.usecase.ts`, `buscar-cliente-por-nit.usecase.ts`, `registrar-cliente-para-venta.usecase.ts`, `venta-detalles.builder.ts`.
  - **Dominio**: `venta.entity.ts`, `venta.repository.ts`.
  - **Infraestructura**: `prisma-venta.repository.ts`, `venta.mapper.ts`.
  - **Presentación**: `venta.controller.ts`, `venta.routes.ts`, schemas Zod de venta, preventa y cliente-venta.
  - **Composición**: `venta.module.ts`.

---

### 14. `facturacion` (Facturación Electrónica en Línea - FEL Digifact)
* **Ruta base**: `/facturacion`
* **Propósito**: Emisión, firma, certificación y anulación de Documentos Tributarios Electrónicos (DTE) ante la SAT a través del certificador autorizado **Digifact**. Además, realiza consultas instantáneas de NIT en el registro fiscal guatemalteco.
* **Componentes clave**:
  - **Aplicación**: `crear-y-certificar-factura.usecase.ts`, `anular-factura.usecase.ts`, `consultar-nit.usecase.ts`, `obtener-token-digifact.usecase.ts`.
  - **Dominio**: `factura.entity.ts`, `factura.repository.ts`.
  - **Infraestructura**: `prisma-factura.repository.ts`, integración con `DigifactProvider` y `CloudflareR2StorageProvider`.
  - **Presentación**: `facturacion.controller.ts`, `facturacion.routes.ts`.
  - **Composición**: `module.ts`.

---

### 15. `cotizacion` (Cotizaciones Comerciales)
* **Ruta base**: `/cotizaciones`
* **Propósito**: Generación de cotizaciones para clientes con control de estado (Pendiente, Aceptada, Rechazada, Vencida) y funcionalidad de **conversión directa a venta**, conservando ítems, cantidades y precios acordados.
* **Componentes clave**:
  - **Aplicación**: `crear-cotizacion.usecase.ts`, `obtener-cotizaciones.usecase.ts`, `obtener-cotizacion.usecase.ts`, `actualizar-estado-cotizacion.usecase.ts`, `convertir-cotizacion.usecase.ts`.
  - **Dominio / Infra / Pres**: `cotizacion.entity.ts`, `cotizacion.repository.ts`, `prisma-cotizacion.repository.ts`, `cotizacion.controller.ts`, `cotizacion.routes.ts`, `cotizacion.validator.ts`, `cotizacion.module.ts`.

---

### 16. `traslado` (Traslado de Inventario entre Sucursales)
* **Ruta base**: `/traslados`
* **Propósito**: Transferencia física de productos y lotes entre diferentes sucursales del negocio. Maneja estados (En tránsito, Recibido, Cancelado) garantizando consistencia de stock en origen y destino.
* **Componentes clave**:
  - **Aplicación**: `crear-traslado.usecase.ts`, `obtener-traslado.usecase.ts`, `listar-traslados-por-origen.usecase.ts`, `listar-traslados-por-destino.usecase.ts`, `recibir-traslado.usecase.ts`, `cancelar-traslado.usecase.ts`.
  - **Dominio / Infra / Pres**: `traslado.entity.ts`, `traslado.repository.ts`, `prisma-traslado.repository.ts`, `traslado.mapper.ts`, `traslado.controller.ts`, `traslado.routes.ts`, `traslado.schema.ts`, `traslado.module.ts`.

---

### 17. `caja` (Cajas Físicas y Terminales de Cobro)
* **Ruta base**: `/cajas`
* **Propósito**: Control de cajas de cobro por sucursal, arqueos, cortes de caja, consulta de historial y vinculación física de computadoras o dispositivos mediante huella/token (`asociar-dispositivo-caja` y `desasociar-dispositivo-caja`).
* **Componentes clave**:
  - **Aplicación**: `registrar-caja.usecase.ts`, `obtener-cajas.usecase.ts`, `obtener-caja.usecase.ts`, `actualizar-caja.usecase.ts`, `eliminar-caja.usecase.ts`, `listar-historial-caja.usecase.ts`, `asociar-dispositivo-caja.usecase.ts`, `desasociar-dispositivo-caja.usecase.ts`.
  - **Dominio / Infra / Pres**: `caja.entity.ts`, `caja.repository.ts`, `prisma-caja.repository.ts`, `caja.mapper.ts`, `caja.controller.ts`, `caja.routes.ts`, `caja.schema.ts`, `caja.module.ts`.

---

### 18. `cuenta-bancaria` (Cuentas Financieras del Negocio)
* **Ruta base**: `/cuentas-bancarias`
* **Propósito**: Gestión de cuentas bancarias monetarias o de ahorro de la empresa, control de saldos y registro de historial de movimientos.
* **Componentes clave**:
  - **Aplicación**: `registrar-cuenta-bancaria.usecase.ts`, `obtener-cuentas-bancarias.usecase.ts`, `obtener-cuenta-bancaria.usecase.ts`, `actualizar-cuenta-bancaria.usecase.ts`, `eliminar-cuenta-bancaria.usecase.ts`, `listar-historial-cuenta-bancaria.usecase.ts`.
  - **Dominio / Infra / Pres**: `cuenta-bancaria.entity.ts`, `cuenta-bancaria.repository.ts`, `prisma-cuenta-bancaria.repository.ts`, `cuenta-bancaria.controller.ts`, `cuenta-bancaria.routes.ts`, `cuenta-bancaria.schema.ts`, `cuenta-bancaria.module.ts`.

---

### 19. `banco` (Catálogo de Bancos)
* **Ruta base**: `/bancos`
* **Propósito**: Catálogo de instituciones bancarias del país.
* **Componentes clave**: `banco.entity.ts`, `banco.repository.ts`, `prisma-banco.repository.ts`, `banco.controller.ts`, `banco.routes.ts`, `banco.schema.ts`, `banco.module.ts`.

---

### 20. `categoria-transaccion` (Categorías Contables)
* **Ruta base**: `/categoria-transaccion`
* **Propósito**: Clasificación de egresos e ingresos operativos (ej. Pago de Servicios, Renta, Nómina, Venta de Activo).
* **Componentes clave**: `categoria-transaccion.entity.ts`, `categoria-transaccion.repository.ts`, `prisma-categoria-transaccion.repository.ts`, `categoria-transaccion.controller.ts`, `categoria-transaccion.routes.ts`, `categoria-transaccion.schema.ts`, `categoria-transaccion.module.ts`.

---

### 21. `transaccion` (Libro Contable, Ingresos, Egresos y Movimientos Internos)
* **Rutas base**: `/ingresos-egresos` y `/movimientos-internos`
* **Propósito**: Núcleo contable y financiero. Registra transacciones monetarias de entrada y salida, así como transferencias internas entre cajas y cuentas bancarias (débitos y créditos atómicos).
* **Componentes clave**:
  - **Aplicación**: `crear-ingreso-egreso.usecase.ts`, `listar-ingresos-egresos.usecase.ts`, `obtener-detalle-ingreso-egreso.usecase.ts`, `crear-movimiento-interno.usecase.ts`, `listar-movimientos-internos.usecase.ts`, `obtener-detalle-movimiento-interno.usecase.ts`, `crear-transaccion.usecase.ts`, `acreditar-caja.usecase.ts`, `debitar-caja.usecase.ts`, `acreditar-cuenta-bancaria.usecase.ts`, `debitar-cuenta-bancaria.usecase.ts`, `listar-historial.usecase.ts`.
  - **Dominio / Infra / Pres**: `transaccion.entity.ts`, `transaccion.repository.ts`, `prisma-transaccion.repository.ts`, `transaccion.controller.ts`, `movimiento-interno.controller.ts`, `transaccion.routes.ts`, `movimiento-interno.routes.ts`, `transaccion.schema.ts`, `transaccion.module.ts`.

---

### 22. `reportes` (Analítica Financiera)
* **Ruta base**: `/reportes`
* **Propósito**: Reportes agregados de ingresos y egresos, balances financieros por sucursal y desglose detallado por origen de fondos en rangos de fechas.
* **Componentes clave**:
  - **Aplicación**: `obtener-reporte-financiero.usecase.ts`, `obtener-detalle-origen.usecase.ts`.
  - **Dominio / Infra / Pres**: `reporte-financiero.model.ts`, `reporte.repository.ts`, `prisma-reporte.repository.ts`, `reporte.controller.ts`, `reportes.routes.ts`, `reportes.module.ts`.

---

### 23. `moneda` (Multimoneda y Divisas)
* **Ruta base**: `/monedas`
* **Propósito**: Catálogo de monedas soportadas (GTQ, USD, EUR, etc.), símbolos y tasas de cambio para transacciones multimoneda.
* **Componentes clave**: `moneda.entity.ts`, `moneda.repository.ts`, `prisma-moneda.repository.ts`, `moneda.controller.ts`, `moneda.routes.ts`, `moneda.schema.ts`, `moneda.module.ts`.

---

### 24. `pais` (Catálogo de Países)
* **Ruta base**: `/paises`
* **Propósito**: Lista de países configurados en el sistema con su código telefónico y moneda principal asociada.
* **Componentes clave**: `pais.entity.ts`, `pais.repository.ts`, `prisma-pais.repository.ts`, `pais.controller.ts`, `pais.routes.ts`, `pais.schema.ts`, `pais.module.ts`.

---

### 25. `geografia` (Divisiones Administrativas)
* **Ruta base**: `/geografia`
* **Propósito**: Consulta de departamentos (Nivel 1) y municipios (Nivel 2) para localización geográfica de sucursales y clientes.
* **Componentes clave**: `geografia.entity.ts`, `geografia.repository.ts`, `prisma-geografia.repository.ts`, `geografia.controller.ts`, `geografia.routes.ts`, `geografia.module.ts`.

---

### 26. `vehiculo` (Vehículos de Clientes)
* **Ruta base**: `/vehiculos`
* **Propósito**: Registro de vehículos atendidos en el taller, placas, VIN/chasis, fotos (avatar) y calcomanía de circulación almacenadas en Cloudflare R2, asociados con sus respectivos clientes.
* **Componentes clave**:
  - **Aplicación**: `registrar-vehiculo.usecase.ts`, `obtener-vehiculos.usecase.ts`, `obtener-vehiculo.usecase.ts`, `obtener-vehiculo-por-placa.usecase.ts`, `actualizar-vehiculo.usecase.ts`, `subir-avatar.usecase.ts`, `subir-calcomania.usecase.ts`, `asociar-cliente.usecase.ts`, `crear-y-asociar-cliente.usecase.ts`.
  - **Dominio / Infra / Pres**: `vehiculo.entity.ts`, `vehiculo.repository.ts`, `prisma-vehiculo.repository.ts`, `vehiculo.controller.ts`, `vehiculo.routes.ts`, `vehiculo.schema.ts`, `vehiculo.module.ts`.

---

### 27. `marca` (Marcas de Vehículos)
* **Ruta base**: `/marcas`
* **Propósito**: Catálogo de fabricantes de vehículos (Toyota, Honda, Yamaha, etc.).
* **Componentes clave**: `marca.entity.ts`, `marca.repository.ts`, `prisma-marca.repository.ts`, `marca.controller.ts`, `marca.routes.ts`, `marca.schema.ts`, `marca.module.ts`.

---

### 28. `linea` (Líneas / Familias Vehiculares)
* **Ruta base**: `/lineas`
* **Propósito**: Catálogo de líneas de vehículos asociadas a cada marca (ej. Corolla, Civic, Hilux).
* **Componentes clave**: `linea.entity.ts`, `linea.repository.ts`, `prisma-linea.repository.ts`, `linea.controller.ts`, `linea.routes.ts`, `linea.schema.ts`, `linea.module.ts`.

---

### 29. `modelo` (Años y Modelos Vehiculares)
* **Ruta base**: `/modelos`
* **Propósito**: Gestión de modelos/años. Incluye el caso de uso protegido por PIN `crear-modelo-por-pin.usecase.ts` para permitir registrar modelos especiales durante la recepción en taller.
* **Componentes clave**: `modelo.entity.ts`, `modelo.repository.ts`, `prisma-modelo.repository.ts`, `modelo.controller.ts`, `modelo.routes.ts`, `modelo.schema.ts`, `modelo.module.ts`.

---

### 30. `cilindrada` (Cilindradas de Motor)
* **Ruta base**: `/cilindradas`
* **Propósito**: Catálogo de capacidad del motor (ej. 150cc, 2.0L, etc.).
* **Componentes clave**: `cilindrada.entity.ts`, `cilindrada.repository.ts`, `prisma-cilindrada.repository.ts`, `cilindrada.controller.ts`, `cilindrada.routes.ts`, `cilindrada.schema.ts`, `cilindrada.module.ts`.

---

### 31. `vehiculotipo` (Tipos de Vehículo)
* **Ruta base**: `/vehiculotipos`
* **Propósito**: Tipología vehicular (Automóvil, Motocicleta, Camioneta, Camión, etc.).
* **Componentes clave**: `vehiculotipo.entity.ts`, `vehiculotipo.repository.ts`, `prisma-vehiculotipo.repository.ts`, `vehiculotipo.controller.ts`, `vehiculotipo.routes.ts`, `vehiculotipo.schema.ts`, `vehiculotipo.module.ts`.

---

### 32. `tipo-servicio` (Tipos de Mantenimiento de Taller)
* **Ruta base**: `/tipos-servicio`
* **Propósito**: Categorías de servicios técnicos ofrecidos (ej. Mantenimiento Preventivo, Correctivo, Enderezado y Pintura).
* **Componentes clave**: `tipo-servicio.entity.ts`, `tipo-servicio.repository.ts`, `prisma-tipo-servicio.repository.ts`, `tipo-servicio.controller.ts`, `tipo-servicio.routes.ts`, `tipo-servicio.schema.ts`, `tipo-servicio.module.ts`.

---

### 33. `opcion-servicio` (Paquetes y Opciones de Servicio)
* **Ruta base**: `/opciones-servicio`
* **Propósito**: Opciones configurables o paquetes dentro de un servicio (ej. Cambio de aceite sintético, alineación láser).
* **Componentes clave**: `opcion-servicio.entity.ts`, `opcion-servicio.repository.ts`, `prisma-opcion-servicio.repository.ts`, `opcion-servicio.controller.ts`, `opcion-servicio.routes.ts`, `opcion-servicio.schema.ts`, `opcion-servicio.module.ts`.

---

### 34. `checklist-item` (Catálogo de Inspección de Entrada)
* **Ruta base**: `/checklist-items`
* **Propósito**: Definición de los puntos a inspeccionar al recibir un vehículo en el taller (ej. Nivel de combustible, rayones, llanta de repuesto, herramientas).
* **Componentes clave**: `checklist-item.entity.ts`, `checklist-item.repository.ts`, `prisma-checklist-item.repository.ts`, `checklist-item.controller.ts`, `checklist-item.routes.ts`, `checklist-item.schema.ts`, `checklist-item.module.ts`.

---

### 35. `servicioVehiculo` (Órdenes de Trabajo y Taller Mecánico)
* **Ruta base**: `/servicio-vehiculos`
* **Propósito**: Módulo operativo de mayor complejidad para talleres mecánicos. Administra órdenes de servicio, registro de inspección inicial (Checklist con fotos y firma digital del cliente), tareas asignadas a mecánicos, repuestos provistos por el cliente o consumidos del inventario del taller, control de custodia y reparaciones externas.
* **Componentes clave (37 casos de uso)**:
  - **Aplicación**: `registrar-servicio.usecase.ts`, `obtener-servicios.usecase.ts`, `obtener-servicio.usecase.ts`, `actualizar-servicio.usecase.ts`, `finalizar-servicio.usecase.ts`, `obtener-estado-servicio.usecase.ts`, `cambiar-estado-servicio.usecase.ts`, `guardar-firma-entrada.usecase.ts`, `subir-imagen-servicio.usecase.ts`, `eliminar-imagen-servicio.usecase.ts`, `subir-imagen-progreso-servicio.usecase.ts`, `registrar-checklist-respuesta.usecase.ts`, `listar-checklist-respuestas.usecase.ts`, `actualizar-checklist-respuesta.usecase.ts`, `eliminar-checklist-respuesta.usecase.ts`, `registrar-servicio-tarea.usecase.ts`, `actualizar-servicio-tarea.usecase.ts`, `eliminar-servicio-tarea.usecase.ts`, `asociar-mecanico-servicio.usecase.ts`, `cambiar-mecanico-servicio.usecase.ts`, `crear-repuesto-servicio.usecase.ts`, `eliminar-repuesto-servicio.usecase.ts`, `administrar-repuesto-solicitado.usecase.ts`, `registrar-repuesto-cliente.usecase.ts`, `eliminar-repuesto-cliente.usecase.ts`, `mandar-reparacion.usecase.ts`, `administrar-reparacion.usecase.ts`, `terminar-reparacion.usecase.ts`, `mandar-custodia.usecase.ts`, `actualizar-custodia.usecase.ts`, `terminar-custodia.usecase.ts`, `crear-cambio-siguiente-servicio.usecase.ts`, `listar-cambios-siguiente-servicio.usecase.ts`, `eliminar-cambio-siguiente-servicio.usecase.ts`, `asociar-cliente-servicio.usecase.ts`, `actualizar-cliente-externo-servicio.usecase.ts`, `actualizar-observaciones-servicio.usecase.ts`.
  - **Dominio**: `servicio.entity.ts`, `servicio.repository.ts`, `servicio.constants.ts`.
  - **Infraestructura**: `prisma-servicio-vehiculo.repository.ts`, mappers de servicio.
  - **Presentación**: `servicio.controller.ts`, `servicio.routes.ts`, schemas Zod de servicio y checklist.
  - **Composición**: `servicio.module.ts`.

---

### 36. `media` (Gestión Centralizada Multimedia)
* **Ruta base**: `/media`
* **Propósito**: Subida, reemplazo, listado y eliminación física de archivos multimedia e imágenes utilizando el proveedor de almacenamiento en la nube Cloudflare R2.
* **Componentes clave**:
  - **Aplicación**: `crear-media.usecase.ts`, `listar-medias.usecase.ts`, `reemplazar-media.usecase.ts`, `eliminar-media.usecase.ts`.
  - **Dominio / Infra / Pres**: `media.entity.ts`, `media.repository.ts`, `prisma-media.repository.ts`, `media.controller.ts`, `media.routes.ts`, `media.module.ts`.

---

### 37. `verificationCode` (Códigos de Verificación OTP)
* **Ruta base**: `/verification-code`
* **Propósito**: Generación, verificación y expiración de códigos OTP numéricos de 6 dígitos enviados por correo electrónico a través de Resend para la verificación de cuentas de usuario y operaciones seguras.
* **Componentes clave**:
  - **Aplicación**: `crear-verification-code.usecase.ts`, `verificar-verification-code.usecase.ts`, `verificar-email-usuario.usecase.ts`, `obtener-estado-codigo.usecase.ts`.
  - **Dominio / Infra / Pres**: `verification-code.entity.ts`, `verification-code.repository.ts`, `prisma-verification-code.repository.ts`, `verification-code.controller.ts`, `verification-code.routes.ts`, `verification-code.schema.ts`, `verificationCode.module.ts`.

---

### 38. `notificacion` (Notificaciones Push Móviles y Web)
* **Ruta base**: `/notifications`
* **Propósito**: Registro de tokens FCM (Firebase Cloud Messaging) de dispositivos de usuarios y envío de notificaciones push en tiempo real.
* **Componentes clave**:
  - **Aplicación**: `guardar-token-notificacion.usecase.ts`, `enviar-notificacion.usecase.ts`.
  - **Dominio**: `notificacion.entity.ts`, `notificacion.repository.ts`.
  - **Infraestructura**: `prisma-notificacion.repository.ts`, `firebase-notificacion.repository.ts`.
  - **Presentación**: `notificacion.controller.ts`, `notificacion.routes.ts`, `notificacion.schema.ts`, `notificacion.module.ts`.

---

### 39. Directorios de Legado / Vacíos
* `batch`: Esqueleto inicial en inglés; reemplazado completamente por el módulo `lote`.
* `client`: Esqueleto inicial en inglés; reemplazado completamente por el módulo `cliente`.
* `vehicle`: Esqueleto inicial en inglés; reemplazado completamente por el módulo `vehiculo`.

---

## 5. Infraestructura Compartida (`src/shared`)

La carpeta `src/shared` provee utilidades de bajo nivel y abstracciones reutilizables:

### 5.1. Base de Datos y Triggers (`shared/database`)
* **`TransactionManager.ts`**: Interfaz para ejecutar bloques transaccionales atómicos en el dominio sin acoplarse a Prisma.
* **`PrismaTransactionManager.ts`**: Implementación concreta que delega en `prisma.$transaction(fn, { maxWait: 10000, timeout: 30000 })`.
* **`PrismaErrorMapper.ts`**: Intercepta errores nativos de Prisma y los convierte en errores tipados (`UniqueConstraintError` para P2002, `NotFoundPersistenceError` para P2025, `DatabaseError` en fallo de conexión).
* **Triggers SQL en PostgreSQL**: Triggers que operan a nivel de motor de base de datos para garantizar la integridad absoluta del stock físico:
  - `descontar_stock_lote`: Descuenta existencias del lote al insertar en `venta_detalles` y desactiva el lote si llega a 0. Lanza excepción SQLSTATE '45000' si no hay stock suficiente.
  - `devolver_stock_lote`: Reintegra stock al lote si un ítem de venta es eliminado.
  - `devolver_stock_venta_anulada`: Devuelve automáticamente el inventario de todos los ítems cuando una venta pasa al estado `ANULADA`.
  - `descontar_stock_lote_repuestos` / `devolver_stock_lote_repuestos`: Idem para repuestos consumidos en órdenes de servicio mecánico.

### 5.2. Manejo de Errores (`shared/errors` y `shared/database/errors`)
* **`AppError`**: Clase base de errores controlados (`message`, `code`, `statusCode`).
* **Errores de Persistencia**: `PersistenceError`, `DatabaseError`, `UniqueConstraintError`, `NotFoundPersistenceError`, `InsufficientStockPersistenceError`, etc.

### 5.3. Presentación y Middlewares Compartidos (`shared/presentation`)
* **`BaseController`**: Clase abstracta de la cual heredan todos los controladores. Implementa `obtenerEntorno(res)`, extrayendo `res.locals.usuario` para inyectar el contexto de inquilino de forma transparente y segura.
* **`FileUploadMiddleware`**: Wrapper de Multer configurado con `memoryStorage()` (almacenamiento en buffer RAM) y límite de 5 MB por archivo. Provee métodos estáticos `single()`, `array()` y `any()`.
* **`paginacion.query.schema.ts`**: Schema Zod estandarizado para query strings de listados (`limit`, `offset`, `q`).

---

## 6. Integraciones Externas

El backend de Asyncronix se conecta con 6 servicios e integraciones clave:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND ASYNCRONIX                              │
└──────┬───────────────┬──────────────┬──────────────┬────────────┬──────┘
       │               │              │              │            │
       ▼               ▼              ▼              ▼            ▼
┌─────────────┐ ┌─────────────┐ ┌───────────┐ ┌────────────┐ ┌───────────┐
│ PostgreSQL  │ │ Cloudflare  │ │ Digifact  │ │   Resend   │ │ Firebase  │
│  + Prisma   │ │     R2      │ │  FEL SAT  │ │   Email    │ │    FCM    │
└─────────────┘ └─────────────┘ └───────────┘ └────────────┘ └───────────┘
```

### 1. PostgreSQL & Prisma ORM
* **Uso**: Base de datos relacional principal del sistema.
* **Configuración**: `prisma/schema.prisma`, `src/infrastructure/config/prisma.ts`.
* **Variables**: `DATABASE_URL`.
* **Características**: Maneja esquemas relacionales completos, llaves foráneas, índices, enums y triggers nativos de stock.

### 2. Cloudflare R2 (S3-Compatible Object Storage)
* **Uso**: Almacenamiento distribuido y de alta disponibilidad para archivos pesados e imágenes: fotos de productos, avatares de usuarios y vehículos, firmas digitales de recepción de taller y PDFs de facturas certificadas.
* **Implementación**: `src/shared/infrastructure/storage/cloudflare-r2.provider.ts` utilizando `@aws-sdk/client-s3`.
* **Variables**: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`, `R2_ENDPOINT`.
* **Interfaz de Dominio**: `IStorageProvider`.

### 3. Digifact FEL (Facturación Electrónica en Línea - SAT Guatemala)
* **Uso**: Certificación oficial de facturas electrónicas (DTE), notas de crédito y anulaciones según las normativas de la SAT en Guatemala. Consulta en tiempo real de NITs para autocompletar nombres de clientes en puntos de venta.
* **Implementación**: `src/shared/infrastructure/providers/digifact/digifact.provider.ts`.
* **Variables**: `DIGIFACT_URL_BASE`, `DIGIFACT_URL_PROD`, `DIGIFACT_URL_TEST`.
* **Interfaz de Dominio**: `IDigifactProvider`.

### 4. Resend (Servicio Transaccional de Correo)
* **Uso**: Envío de correos de bienvenida, verificación de direcciones de correo electrónico y distribución de códigos OTP de 6 dígitos.
* **Implementación**: `src/shared/infrastructure/providers/resend-email.provider.ts` utilizando la librería oficial `resend`.
* **Variables**: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
* **Interfaz de Dominio**: `EmailProvider`.

### 5. Firebase Cloud Messaging (FCM)
* **Uso**: Notificaciones push a aplicaciones web y móviles para alertar sobre cambios de estado en servicios mecánicos, nuevas ventas o avisos del sistema.
* **Implementación**: `src/modules/notificacion/infrastructure/firebase-notificacion.repository.ts` utilizando `firebase-admin`.
* **Variables**: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
* **Interfaz de Dominio**: `INotificacionService`.

### 6. Frankfurter Exchange Rate API
* **Uso**: Obtención de tipos de cambio oficiales actualizados entre monedas (ej. USD a GTQ o EUR) para conversiones automáticas en ventas y cotizaciones multimoneda.
* **Implementación**: `src/shared/infrastructure/frankfurter.provider.ts`.
* **Interfaz de Dominio**: `ExchangeRateProvider`.

### 7. Jose (JWT) y Argon2 (Criptografía)
* **Uso**: Emisión y validación asíncrona de firmas criptográficas para tokens JWT (`jose`), y cálculo de hashes resistentes a ataques por fuerza bruta (`argon2id`) para contraseñas de usuarios y PINs de seguridad.
* **Variables**: `JWT_SECRET`, `JWT_ISS`, `JWT_AUD`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`.

---

## 7. Buenas Prácticas y Reglas de Desarrollo

Para preservar la solidez del sistema al crear o modificar código, se deben cumplir obligatoriamente estas reglas:

1. **Nunca importar Prisma en Controllers, Routes o Use Cases**: El acceso a base de datos ocurre exclusivamente a través de la interfaz del repositorio concreto en Infrastructure.
2. **Nunca manejar objetos `req` o `res` fuera de Controllers o Middlewares**: Los Casos de Uso solo reciben parámetros primitivos o DTOs y devuelven tipos de dominio.
3. **Respetar la Inyección de Dependencias**: Toda nueva clase debe recibir sus colaboradores en el constructor. La instanciación y conexión se realiza en el archivo `module.ts`.
4. **Respuestas homogéneas**: Todos los controladores deben retornar respuestas utilizando la clase `Respuesta`:
   ```ts
   return res.status(200).json(Respuesta.exito("Operación exitosa", data));
   ```
5. **Aislamiento Multi-Tenant**: Cada consulta de lectura, creación, actualización o eliminación en un repositorio debe condicionarse invariablemente al `negocio_id` obtenido del contexto de la petición.
6. **No duplicar lógica de triggers**: El descuento y retorno de stock ante ventas y anulaciones lo realizan los triggers de base de datos; la aplicación no debe descontar stock manualmente por duplicado.
