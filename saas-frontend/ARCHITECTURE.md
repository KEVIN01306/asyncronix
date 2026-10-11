# Arquitectura del Sistema Frontend (SaaS Asyncronix)

Este documento describe de manera exhaustiva y detallada la arquitectura general, estructura de directorios, capas de software, diseño modular, responsabilidades de cada componente y todas las integraciones externas del frontend de **Asyncronix**.

---

## 1. Visión General de la Arquitectura

El frontend de **Asyncronix** es una Single Page Application (SPA) moderna desarrollada con **React 19**, **TypeScript** y **Vite**. Está diseñada bajo los principios de **Clean Architecture adaptada a interfaces web**, **Modularidad por Dominio (Feature-Driven Architecture)** y **Multi-Tenancy Dinámico**.

### Principios Fundamentales

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   (Pages / Pantallas, Componentes UI, Formularios con React Hook Form, │
│    Hooks de presentación, Enrutamiento con React Router DOM v7)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Consume
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN LAYER                                 │
│   (Interfaces TypeScript de Modelos y Respuestas, Schemas Zod de       │
│    Validación de Formularios, Constantes de Negocio del Frontend)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Implementado / Suministrado por
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                              │
│   (Repositories API con Axios, Generadores PDF con React-PDF,          │
│    Exportadores ExcelJS, Cliente Firebase FCM, Storage Local)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Se apoya en
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         CORE & SHARED                                  │
│   (Cliente HTTP Axios con Interceptores y Cola de Refresh Token,       │
│    Stores globales con Zustand, Sistema Multitema Dinámico MUI v7,     │
│    Tablas reutilizables ListTable, Notificaciones Sonner, Utils)       │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Separación Estricta de Responsabilidades**: Los componentes visuales (Pages y Componentes) no realizan peticiones HTTP directas ni conocen los endpoints del backend; delegan toda comunicación en la capa de **Repositories** del módulo.
2. **Aislamiento Modular por Funcionalidad**: Cada módulo en `src/modules/` agrupa todo lo necesario para su dominio: tipos (`domain/`), esquemas de validación Zod (`domain/schemas/`), repositorios de comunicación (`infrastructure/`), componentes y páginas (`presentation/`), y su configuración de rutas perezosas (`presentation/*.routes.tsx` y `*-lazy.ts`).
3. **Multi-Tenancy y RBAC Reactivo**: El usuario autenticado, sus roles, permisos granulares, el inquilino activo (`negocio_id`) y su sucursal (`sucursal_id`) residen en `authStore` (Zustand). Toda la interfaz se adapta condicionalmente: el menú lateral, los botones de acción y las rutas protegidas (`RouteProtector`) validan permisos antes de renderizar o permitir navegación.
4. **Formularios Tipados con Zod y React Hook Form**: Validación declarativa sin re-renderizados innecesarios. Los errores de validación se mapean automáticamente a los campos de Material-UI.
5. **División de Código y Rendimiento (Code-Splitting)**: Todas las páginas se cargan bajo demanda mediante `React.lazy()` y `Suspense`, garantizando un bundle inicial ligero y tiempos de carga instantáneos.

---

## 2. Mapa Visual del Frontend y Flujo de Navegación

### Diagrama del Flujo de una Petición y Renderizado

```
[ Navegador Web del Usuario ]
              │
              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ main.tsx (Punto de Entrada)                                            │
│  ├── useUiStore: Recupera modo (Light/Dark/System), variante de tema  │
│  │               (Marton, Corport, LiquidGlass, Neumorphic, etc.)      │
│  ├── ThemeProvider (MUI v7 con paletas dinámicas)                     │
│  ├── CssBaseline                                                       │
│  ├── Toaster (Sonner: Notificaciones flotantes globales)               │
│  ├── activarNotificaciones() (Registro Firebase FCM Service Worker)    │
│  └── RouterProvider (appRouter)                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ appRouter (src/presentation/routers/appRouter.tsx)                    │
│  ├── Ruta /auth/*  ──► BlankLayout (Login y páginas públicas)          │
│  └── Ruta /*       ──► ProtectedRoute (Validador de Sesión)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Si está autenticado
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ FullLayout (Shell Principal)                                           │
│  ├── Navbar (Buscador global con Fuse.js, Selector de Tema, Perfil)    │
│  ├── Sidebar reactivo (menuItems.tsx filtrado por permisos RBAC)       │
│  └── Área Central (<Outlet />)                                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Navegación a módulo
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ RouteProtector (Validador Granular de Permiso)                         │
│  └── Si cumple permiso ──► Carga perezosa (React.lazy / Suspense)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Page Component (Coordinador de Pantalla)                               │
│  ├── Lee URL params / useSearchParams                                 │
│  ├── Hook useAbortableFetch (cancela peticiones anteriores al filtrar) │
│  ├── Invoca ModuleRepository (ej. ProductoRepository.listar)           │
│  └── Renderiza componentes UI (ListTable, Formularios, Modales)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Petición de datos
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Axios Client (src/core/api/api.ts)                                     │
│  ├── Request Interceptor: Inyecta Authorization: Bearer <accessToken> │
│  ├── Response Interceptor: Desenvuelve response.data                   │
│  ├── Manejo 401 TOKEN_EXPIRED: Cola thread-safe con /auth/refresh      │
│  └── Error Handler: Muestra alertas amigables con Sonner               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / CORS / Cookies
                                    ▼
[ Backend REST API - Asyncronix ]
```

### Organización del Código en el Árbol de Carpetas

```
saas-frontend/
├── public/                          # Recursos estáticos servidos en la raíz
│   ├── firebase-messaging-sw.js     # Service Worker para notificaciones push FCM
│   ├── favicon.ico
│   └── icons/                       # Iconos PWA y logos
├── src/
│   ├── core/                        # Núcleo del frontend (agnóstico de módulos)
│   │   ├── api/                     # Cliente HTTP Axios, interceptores y errores
│   │   ├── hooks/                   # Hooks transversales (useDebounce, useScanner)
│   │   ├── notificaciones/          # Inicialización y VAPID de Firebase Messaging
│   │   ├── store/                   # Estados globales con Zustand (auth, ui, device)
│   │   ├── theme/                   # Sistema de diseño multitema MUI y tema PDF
│   │   └── utils/                   # Utilidades (moneda, números a letras, compresión)
│   │
│   ├── presentation/                # Shell visual global y enrutamiento
│   │   ├── layouts/
│   │   │   ├── blankLayout/         # Contenedor limpio (Login)
│   │   │   └── fullLayout/          # Layout con Navbar, Sidebar y SearchBar
│   │   └── routers/
│   │       ├── appRouter.tsx        # Enrutador central con React Router DOM
│   │       └── ProtectedRoute.tsx   # Guardián de sesión y auto-refresh
│   │
│   ├── shared/                      # Componentes UI reutilizables por cualquier módulo
│   │   ├── components/
│   │   │   ├── ui/tables/           # ListTable y ListTableSimple (Tablas estándar)
│   │   │   ├── ui/FacturaTermica/   # Emulador e impresión de ticket térmico 80mm/58mm
│   │   │   ├── firma/               # Lienzo Canvas para firma digital del cliente
│   │   │   ├── download/            # Generadores descargables PDF y Excel
│   │   │   ├── BarcodeRenderer.tsx  # Renderizador de código de barras (JSBarcode)
│   │   │   └── RouteProtector.tsx   # Guardián de ruta por permiso específico
│   │   └── pages/
│   │       └── AccesoDenegadoPage   # Pantalla estándar HTTP 403 Forbidden
│   │
│   ├── modules/                     # Módulos de funcionalidad (37 módulos)
│   │   ├── auth/                    # Autenticación, formulario de login
│   │   ├── ventas/                  # POS, emisión de comprobantes, carrito
│   │   ├── productos/               # Catálogo de productos, escáner, variantes
│   │   ├── serviciosVehiculos/      # Taller mecánico, órdenes, checklists, firmas
│   │   ├── ...                      # (Ver inventario detallado de módulos)
│   │
│   ├── App.tsx                      # Componente contenedor
│   ├── main.tsx                     # Arranque de React en el DOM
│   └── index.css                    # Estilos CSS globales y tipografías
├── .env                             # Variables de entorno (VITE_API_URL, Firebase)
├── package.json                     # Dependencias del proyecto
└── vite.config.ts                   # Configuración del bundler Vite y plugins
```

---

## 3. Guía de Responsabilidad por Tipo de Archivo y Carpeta

Para garantizar que el código sea limpio y predecible entre todos los desarrolladores, cada capa tiene una función clara:

### 3.1. Carpeta `src/core/` (Núcleo del Sistema)
Contiene la infraestructura compartida que soporta a toda la aplicación:

* **`core/api/api.ts`**:
  - Instancia singleton de Axios configurada con `baseURL: import.meta.env.VITE_API_URL` y `withCredentials: true`.
  - **Interceptor de Petición**: Agrega automáticamente el encabezado `Authorization: Bearer <token>` desde `localStorage`.
  - **Interceptor de Respuesta y Cola de Refresco**: Si el backend responde con código HTTP 401 y `code: "TOKEN_EXPIRED"`, pausa las peticiones concurrentes en una cola (`refreshQueue`), solicita un nuevo token a `/auth/refresh` mediante cookies seguras, actualiza `authStore`, reintenta las peticiones encoladas y reanuda el tráfico sin interrumpir al usuario.
* **`core/api/api-error-handler.ts`**:
  - Intercepta errores de red y respuestas del backend. Emite notificaciones flotantes contextuales mediante `sonner` (`toast.error`), discriminando entre sesiones expiradas, credenciales inválidas, límites de plan alcanzados (`LIMIT_EXCEEDED`) y errores de servidor.
* **`core/store/` (Gestores de Estado con Zustand)**:
  - **`authStore.ts`**: Mantiene en memoria el estado de autenticación (`user`, `status`, `isAuthenticated`), tokens de acceso, funciones `login()`, `logout()`, `getMe()` y datos fiscales de la empresa.
  - **`deviceStore.ts`**: Vinculación física de la terminal a una caja de cobro (`cajaId`, `token`, `asociacionId`), persistido en `localStorage` con middleware `persist`. Permite bloquear operaciones POS si la computadora no está asignada formalmente a la caja abierta.
  - **`uiStore.ts`**: Control de preferencias del usuario: modo de color (`system`, `light`, `dark`), variante de diseño (`marton`, `normal`, `corport`, `liquidGlass`, `brutalist`, `neumorphic`), intensidad de bordes y posición/estilo de las alertas flotantes de Sonner.
* **`core/theme/` (Sistema Multitema Dinámico)**:
  - Configura temas visuales basados en Material-UI v7 con personalización de paleta, tipografías, componentes y bordes.
  - **`pdfTheme.ts`**: Colores, fuentes y estilos compartidos para documentos generados con `@react-pdf/renderer` para que coincidan con la identidad corporativa.
* **`core/hooks/`**:
  - **`useAbortableFetch.ts`**: Envuelve peticiones asíncronas con `AbortController`. Si el usuario cambia de página o escribe en un buscador mientras una petición anterior está en vuelo, la cancela automáticamente para evitar condiciones de carrera (*race conditions*).
  - **`useBarcodeScanner.ts`**: Escucha globalmente eventos de teclado a alta velocidad característicos de lectores ópticos de códigos de barras USB/Bluetooth, capturando el código escaneado sin requerir foco en un campo de texto.
  - **`useDebounce.ts`**: Retrasa la emisión de valores de búsqueda (300 ms por defecto) para no saturar al backend con peticiones en cada pulsación de tecla.
* **`core/utils/`**:
  - **`formatMoney.ts`**: Formateo de cantidades monetarias con símbolo de moneda y separadores de miles según la configuración del negocio.
  - **`numeroALetras.ts`**: Algoritmo para convertir cifras numéricas a texto legal guatemalteco (ej. `1250.50` -> *"UN MIL DOSCIENTOS CINCUENTA QUETZALES CON 50/100"*), requerido por la SAT para emisión de facturas y recibos.
  - **`bajarCalidadImagen.ts`**: Compresión y redimensionamiento de fotografías en el cliente mediante Canvas HTML5 antes de transmitirlas a la nube (ahorra ancho de banda y almacenamiento en Cloudflare R2).
  - **`searchIndex.ts`**: Motor de búsqueda difusa (*fuzzy search*) en cliente utilizando **Fuse.js** para filtrado instantáneo en memoria.
* **`core/notificaciones/notificaciones.config.ts`**:
  - Inicializa Firebase Web App, solicita permisos de notificación al navegador y genera el token de dispositivo (FCM Token) usando la llave pública VAPID.

---

### 3.2. Carpeta `src/presentation/` (Shell y Enrutamiento)

* **`presentation/layouts/fullLayout/`**:
  - Layout principal que envuelve a la aplicación una vez autenticada.
  - **`Navbar.tsx`**: Barra superior con buscador global, avatar de usuario, sucursal activa y acceso rápido a ajustes de tema.
  - **`Sidebar.tsx`**: Menú lateral colapsable y responsivo. Lee [`menuItems.tsx`](file:///Applications/asyncronix/saas-frontend/src/presentation/layouts/fullLayout/siderbar/menuItems.tsx) y oculta automáticamente cualquier opción para la cual el usuario no posea el permiso requerido en `authStore.user.permisos`.
* **`presentation/layouts/blankLayout/`**:
  - Contenedor sin barras laterales ni cabeceras complejas, reservado para pantallas de autenticación o páginas independientes.
* **`presentation/routers/`**:
  - **`appRouter.tsx`**: Árbol maestro de rutas construido con `createBrowserRouter`. Agrupa las rutas de los 37 módulos, organizadas bajo `ProtectedRoute` y divididas en trozos (*chunks*) con `React.lazy`.
  - **`ProtectedRoute.tsx`**: Componente de protección de alto nivel. Valida la existencia del token; si la sesión no ha sido verificada en memoria, consulta el endpoint `/auth/refresh` y `/auth/me` para reconstruir el estado. Si la sesión es inválida, redirige al usuario a `/auth/login`.

---

### 3.3. Carpeta `src/shared/` (Componentes y Utilidades Reutilizables)

* **`shared/components/ui/tables/ListTable.tsx` & `ListTableSimple.tsx`**:
  - Componente de tabla de datos universal con cabeceras ordenables, paginación integrada, selector de filas por página, búsqueda local y menú desplegable de acciones por fila (`Ver`, `Editar`, `Eliminar`).
* **`shared/components/RouteProtector.tsx`**:
  - Validador granular de permisos para rutas hijas. Si el usuario intenta forzar la navegación por URL a una pantalla para la cual no tiene autorización, muestra una alerta con Sonner y lo desvía a `/acceso-denegado`.
* **`shared/components/ui/FacturaTermicaPreview/`**:
  - Emulador visual de tirilla de ticket térmico para impresoras POS de 80mm y 58mm. Incluye encabezado con datos del emisor, resolución SAT, detalle de líneas, totales, desglose de impuestos, total en letras y renderizado del código QR fiscal mediante `qrcode.react`. Implementa estilos de impresión CSS `@media print` para disparar `window.print()`.
* **`shared/components/firma/firmaElectronica.tsx`**:
  - Pad de captura de firma digital manuscrita con HTML5 Canvas. Permite limpiar, redibujar y exportar la firma en formato Base64/PNG para ser almacenada en la orden de servicio.
* **`shared/components/BarcodeRenderer.tsx`**:
  - Renderiza códigos de barras vectoriales SVG utilizando la biblioteca **JsBarcode** a partir de cualquier código SKU o identificador.
* **`shared/components/download/ExcelDownloader.tsx` & `PdfDownloader.tsx`**:
  - Generación de hojas de cálculo enriquecidas con **ExcelJS** y documentos PDF vectoriales mediante **@react-pdf/renderer** ejecutados 100% en el cliente.
* **`shared/components/ui/modals/FormaPagoModal.tsx`**:
  - Modal para registro de cobros que permite combinar múltiples medios de pago (Efectivo, Tarjeta, Transferencia, Depósito Bancario) validando montos exactos y cálculo automático de cambio/vuelto.
* **`shared/components/BuscarClientePorNitModal.tsx`**:
  - Diálogo de consulta de clientes que invoca el backend para consultar el NIT en tiempo real ante la SAT (mediante Digifact), autocompletando el nombre fiscal de la persona individual o jurídica.

---

### 3.4. Estructura Interna Estándar de un Módulo (`src/modules/*`)

Cada uno de los módulos de la aplicación sigue una convención estandarizada:

```
modules/nombreModulo/
├── domain/                          # Lógica y definiciones del módulo
│   ├── interfaces/                  # Interfaces TypeScript (Modelos, Requests, DTOs)
│   └── schemas/                     # Schemas de validación Zod para formularios
├── infrastructure/                  # Capa de comunicación
│   └── repositories/                # Objetos con métodos async que llaman a api.get, api.post...
├── presentation/                    # Capa de vistas
│   ├── pages/                       # Pantallas completas (ListPage, FormPage, DetailPage)
│   ├── components/                  # Modales, tarjetas y tablas exclusivas de este módulo
│   ├── hooks/                       # Hooks de estado o filtrado propios del módulo
│   ├── modulo-lazy.ts               # Exportación perezosa con lazy(() => import(...))
│   └── modulo.routes.tsx            # Definición de RouteObject con <RouteProtector>
```

---

## 4. Inventario Exhaustivo de los 37 Módulos del Frontend

A continuación se detalla la totalidad de los módulos implementados en `src/modules/`:

---

### 1. `auth` (Autenticación)
* **Rutas**: `/auth/login`
* **Propósito**: Inicio de sesión de colaboradores con teléfono/usuario y contraseña. Almacena tokens, consulta perfil y setea el estado global.
* **Archivos clave**: `LoginForm.tsx`, `LoginPage.tsx`, `auth.repository.ts`, `login.schema.ts`, `auth.routes.tsx`.

---

### 2. `dashboard` (Panel de Control Principal)
* **Rutas**: `/` (Inicio)
* **Propósito**: Pantalla de bienvenida con métricas clave, resúmenes operativos y accesos directos del negocio.
* **Archivos clave**: `DashboardPage.tsx`, `dashboard.routes.tsx`.

---

### 3. `perfil` (Perfil del Usuario Autenticado)
* **Rutas**: `/perfil`, `/verificar-correo`
* **Propósito**: Consulta del perfil del usuario en sesión, edición de datos personales, carga de avatar a Cloudflare R2, cambio de contraseña y actualización de PINs de autorización (PIN de Caja, PIN de Modelo, PIN de Sucursal).
* **Archivos clave**: `PerfilPage.tsx`, `CorreoVerificadoPage.tsx`, modales `ChangePasswordModal.tsx`, `ChangePinCajaModal.tsx`, `EditAvatarModal.tsx`, `perfil.repository.ts`, `perfil.routes.tsx`.

---

### 4. `usuarios` (Gestión de Personal)
* **Rutas**: `/usuarios`, `/usuarios/nuevo`, `/usuarios/:id`, `/usuarios/:id/editar`
* **Permisos**: `VER_USUARIOS`, `CREAR_USUARIOS`, `VER_USUARIOS_DETALLE`, `EDITAR_USUARIOS`.
* **Propósito**: Administración de colaboradores, asignación de roles, sucursales de trabajo y estados de actividad.
* **Archivos clave**: `UsuariosListPage.tsx`, `UsuarioCreatePage.tsx`, `UsuarioDetailPage.tsx`, `UsuarioEditPage.tsx`, `usuario.repository.ts`, `usuario.schema.ts`, `usuario.routes.tsx`.

---

### 5. `roles` (Roles y Matriz de Permisos)
* **Rutas**: `/roles`, `/roles/nuevo`, `/roles/:id`, `/roles/:id/editar`, `/roles/:id/permisos`
* **Permisos**: `VER_ROLES`, `CREAR_ROLES`, `VER_ROLES_DETALLE`, `EDITAR_ROLES`, `ASIGNAR_PERMISOS_ROL`.
* **Propósito**: Creación de roles de usuario y asignación visual de permisos del sistema organizados por módulos mediante checkboxes jerárquicos.
* **Archivos clave**: `RolesListPage.tsx`, `RolePermissionsPage.tsx`, `RolesCreatePage.tsx`, `RolesDetailPage.tsx`, `rol.repository.ts`, `roles.routes.tsx`.

---

### 6. `negocio` (Ajustes de Tenancy, Facturación y Multimedia)
* **Rutas**: `/negocio`
* **Permisos**: `VER_NEGOCIOS_DETALLE_ME`, `EDITAR_NEGOCIOS`, `NEGOCIOS_CAMBIAR_MONEDA`.
* **Propósito**: Administración central de la empresa: datos comerciales, cambio de moneda base, configuración de facturación electrónica FEL (credenciales Digifact), consulta de límites de suscripción (`NegocioLimitesTab`) y galería de medios centralizada (`MediaGallery`).
* **Archivos clave**: `NegocioPage.tsx`, `NegocioFacturacionTab.tsx`, `NegocioLimitesTab.tsx`, `MediaGallery.tsx`, `CambiarMonedaModal.tsx`, `negocio.repository.ts`, `negocio.routes.tsx`.

---

### 7. `sucursales` (Gestión de Sedes y Cajas)
* **Rutas**: `/sucursales`, `/sucursales/nuevo`, `/sucursales/:id`, `/sucursal/me`
* **Permisos**: `VER_SUCURSALES`, `CREAR_SUCURSALES`, `VER_SUCURSALES_DETALLE`, `EDITAR_SUCURSALES`.
* **Propósito**: Mantenimiento de sedes físicas, consulta de la sucursal asignada al usuario actual (`MiSucursalPage`), asignación de cuentas bancarias y vinculación de terminales/computadoras físicas a cajas de cobro.
* **Archivos clave**: `SucursalesListPage.tsx`, `SucursalDetailPage.tsx`, `MiSucursalPage.tsx`, tabs de cajas y cuentas bancarias, `sucursal.repository.ts`, `sucursal.routes.tsx`.

---

### 8. `productos` (Catálogo, Escáner y Variantes)
* **Rutas**: `/productos`, `/productos/nuevo`, `/productos/:id`, `/productos/:id/editar`, `/productos/scanner`
* **Permisos**: `VER_PRODUCTOS`, `CREAR_PRODUCTOS`, `EDITAR_PRODUCTOS`, `BUSCAR_PRODUCTOS`.
* **Propósito**: Catálogo maestro de productos con imágenes, asignación de categorías jerárquicas, atributos dinámicos, generación y visualización de códigos QR y escáner directo de código de barras para búsqueda rápida.
* **Archivos clave**: `ProductosListPage.tsx`, `ProductoFormPage.tsx`, `ProductoDetailPage.tsx`, `BuscarProductosPage.tsx`, tabs de variantes e imágenes, `producto.repository.ts`, `variante.repository.ts`, `producto.routes.tsx`.

---

### 9. `lotes` (Inventario y Existencias Físicas)
* **Rutas**: `/lotes`, `/lotes/nuevo`, `/lotes/:id`
* **Permisos**: `VER_LOTES`, `CREAR_LOTES`, `VER_LOTES_DETALLE`.
* **Propósito**: Control de existencias por lote, fecha de ingreso, caducidad, costo unitario y regularización de inventario físico.
* **Archivos clave**: `LoteListPage.tsx`, `LoteCreatePage.tsx`, `LoteDetailPage.tsx`, `lote.repository.ts`, `lote.schema.ts`, `lote.routes.tsx`.

---

### 10. `categorias` (Jerarquía de Categorías de Producto)
* **Rutas**: `/categorias`, `/categorias/nuevo`, `/categorias/:id`, `/categorias/:id/editar`
* **Permisos**: `VER_CATEGORIAS_PRODUCTOS`, `CREAR_CATEGORIAS_PRODUCTOS`, `EDITAR_CATEGORIAS_PRODUCTOS`.
* **Propósito**: Clasificación en árbol infinito (categorías padre e hijas) con componente visual `CategoriaJerarquiaDisplay` y autocompletado en cascada.
* **Archivos clave**: `CategoriaListPage.tsx`, `CategoriaFormPage.tsx`, `CategoriaDetailPage.tsx`, `categoria.repository.ts`, `categoria.routes.tsx`.

---

### 11. `atributos` (Atributos de Variantes)
* **Rutas**: Gestionado dentro de la vista de productos y configuración.
* **Propósito**: Catálogo de características de variantes (Talla, Color, Presentación, etc.).
* **Archivos clave**: `atributo.repository.ts`.

---

### 12. `clientes` (Directorio de Clientes)
* **Rutas**: `/clientes`, `/clientes/nuevo`, `/clientes/:id`, `/clientes/:id/editar`
* **Permisos**: `VER_CLIENTES`, `CREAR_CLIENTES`, `VER_CLIENTES_DETALLE`, `EDITAR_CLIENTES`.
* **Propósito**: Cartera de clientes individuales y corporativos, NIT, DPI, teléfonos, direcciones y lista de vehículos asociados.
* **Archivos clave**: `ClientesListPage.tsx`, `ClienteFormPage.tsx`, `ClienteDetallePage.tsx`, `clientes.repository.ts`, `cliente.schema.ts`, `clientes.routes.tsx`.

---

### 13. `proveedores` (Proveedores Comerciales)
* **Rutas**: `/proveedores`, `/proveedores/nuevo`, `/proveedores/:id`, `/proveedores/:id/editar`
* **Permisos**: `VER_PROVEEDORES`, `CREAR_PROVEEDORES`, `VER_PROVEEDORES_DETALLE`, `EDITAR_PROVEEDORES`.
* **Propósito**: Directorio de proveedores de mercancía y repuestos con contactos y datos fiscales.
* **Archivos clave**: `ProveedoresListPage.tsx`, `ProveedorFormPage.tsx`, `ProveedorDetallePage.tsx`, `proveedores.repository.ts`, `proveedores.routes.tsx`.

---

### 14. `ventas` (Punto de Venta POS y Facturación)
* **Rutas**: `/ventas`, `/ventas/nuevo`, `/ventas/:id`
* **Permisos**: `VER_VENTAS`, `CREAR_VENTAS`, `VER_VENTAS_DETALLE`, `ANULAR_VENTAS`.
* **Propósito**: Terminal de punto de venta (POS) y carrito de compras rápido. Admite lectura de códigos de barras con `lectorSkuQr.tsx`, búsqueda de clientes por NIT con consulta SAT en tiempo real, desglose de totales, cobro multimodal (efectivo, tarjeta, transferencia), impresión de ticket térmico e impresión de documento de factura en PDF (`FacturaVentaDocument.tsx`).
* **Archivos clave**: `VentaListPage.tsx`, `VentaFormPage.tsx`, `VentaDetallePage.tsx`, `SaleProductsTable.tsx`, `SaleSummary.tsx`, `FacturaVentaDocument.tsx`, `venta.repository.ts`, `ventas.routes.tsx`.

---

### 15. `cotizaciones` (Cotizaciones Comerciales)
* **Rutas**: `/cotizaciones`, `/cotizaciones/nueva`, `/cotizaciones/:id`, `/cotizaciones/:id/editar`
* **Permisos**: `VER_COTIZACIONES`, `CREAR_COTIZACIONES`, `VER_COTIZACIONES_DETALLE`, `CONVERTIR_COTIZACIONES`.
* **Propósito**: Creación de propuestas comerciales con vigencia, cálculo de precios sugeridos, generación instantánea de documento PDF profesional con membrete (`CotizacionPdf.tsx`) y diálogo de conversión automática directa a venta (`QuotationConvertDialog.tsx`).
* **Archivos clave**: `CotizacionesListPage.tsx`, `CotizacionDetailPage.tsx`, `QuotationForm.tsx`, `CotizacionPdf.tsx`, `QuotationConvertDialog.tsx`, `cotizacion.repository.ts`, `cotizacion.routes.tsx`.

---

### 16. `traslados` (Movimiento de Inventario entre Sedes)
* **Rutas**: `/traslados/salidas`, `/traslados/entradas`, `/traslados/nuevo`, `/traslados/:id`
* **Permisos**: `VER_TRASLADO`, `CREAR_TRASLADO`, `RECIBIR_TRASLADO`, `CANCELAR_TRASLADO`.
* **Propósito**: Solicitud, despacho y confirmación de recepción de productos y lotes entre diferentes sucursales del negocio.
* **Archivos clave**: `TrasladosSalidaPage.tsx`, `TrasladosEntradaPage.tsx`, `TrasladoFormPage.tsx`, `TrasladoDetallePage.tsx`, `LoteSelectionModal.tsx`, `traslado.repository.ts`, `traslado.routes.tsx`.

---

### 17. `caja` (Cajas Registradoras y Arqueos)
* **Rutas**: `/cajas`, `/cajas/nueva`, `/cajas/:id`, `/cajas/:id/historial`
* **Permisos**: `VER_CAJAS`, `CREAR_CAJAS`, `VER_CAJAS_DETALLE`.
* **Propósito**: Control de cajas de cobro, estado actual de apertura/cierre, arqueo de fondos, historial de transacciones y tarjetas de resumen financiero (`CajaCardItem.tsx`).
* **Archivos clave**: `CajaListPage.tsx`, `CajaFormPage.tsx`, `CajaDetailPage.tsx`, `CajaHistorialPage.tsx`, `caja.repository.ts`, `caja.routes.tsx`.

---

### 18. `cuenta-bancaria` (Cuentas Financieras)
* **Rutas**: `/cuentas-bancarias`, `/cuentas-bancarias/nueva`, `/cuentas-bancarias/:id`, `/cuentas-bancarias/:id/historial`
* **Permisos**: `VER_CUENTA_BANCARIA`, `CREAR_CUENTA_BANCARIA`, `VER_CUENTA_BANCARIA_DETALLE`.
* **Propósito**: Administración de cuentas bancarias de la empresa, saldos disponibles en moneda base o extranjera e historial de débitos y créditos.
* **Archivos clave**: `CuentasBancariasListPage.tsx`, `CuentaBancariaFormPage.tsx`, `CuentaBancariaDetailPage.tsx`, `CuentaBancariaHistorialPage.tsx`, `cuenta-bancaria.repository.ts`, `cuenta-bancaria.routes.tsx`.

---

### 19. `bancos` (Catálogo de Bancos)
* **Rutas**: Integrado en formularios de cuentas bancarias y métodos de pago.
* **Propósito**: Listado de instituciones financieras para parametrización bancaria.
* **Archivos clave**: `bancos.repository.ts`, `banco.interface.ts`.

---

### 20. `categorias-transaccion` (Rubros Contables)
* **Rutas**: `/categorias-transaccion`, `/categorias-transaccion/nueva`, `/categorias-transaccion/:id`
* **Permisos**: `VER_CATEGORIAS_TRANSACCION`, `CREAR_CATEGORIAS_TRANSACCION`.
* **Propósito**: Categorización de gastos e ingresos (ej. Servicios, Nómina, Alquileres, Inversiones).
* **Archivos clave**: `CategoriaTransaccionListPage.tsx`, `CategoriaTransaccionFormPage.tsx`, `CategoriaTransaccionDetailPage.tsx`, `categoria-transaccion.repository.ts`, `categorias-transaccion.routes.tsx`.

---

### 21. `ingresos-egresos` (Movimientos de Caja y Bancos)
* **Rutas**: `/ingresos-egresos`, `/ingresos-egresos/nuevo`, `/ingresos-egresos/:id`
* **Permisos**: `VER_INGRESOS_EGRESOS`, `CREAR_INGRESOS_EGRESOS`.
* **Propósito**: Registro de entradas y salidas manuales de dinero en efectivo o bancos con comprobantes y justificación de rubro.
* **Archivos clave**: `IngresoEgresoListPage.tsx`, `IngresoEgresoFormPage.tsx`, `IngresoEgresoDetailPage.tsx`, `ingresoEgreso.repository.ts`, `ingresoEgreso.routes.tsx`.

---

### 22. `movimientos-internos` (Transferencias entre Fondos)
* **Rutas**: `/movimientos-internos`, `/movimientos-internos/nuevo`, `/movimientos-internos/:id`
* **Permisos**: `VER_MOVIMIENTOS`, `CREAR_MOVIMIENTOS`.
* **Propósito**: Traslado de fondos monetarios entre dos entidades internas (ej. de Caja Chica a Cuenta Monetaria o entre sucursales).
* **Archivos clave**: `MovimientosListPage.tsx`, `MovimientoFormPage.tsx`, `MovimientoDetailPage.tsx`, `movimientos.repository.ts`, `movimientos-internos.routes.tsx`.

---

### 23. `reportes` (Analítica Financiera y Exportaciones)
* **Rutas**: `/reportes/financiero`
* **Permisos**: `REPORTES_FINANCIERO`.
* **Propósito**: Centro analítico y contable del negocio. Presenta KPIs generales, paneles de conciliación, gráficos de distribución de ingresos/egresos y herramientas de descarga masiva en **Excel** (`ReporteFinancieroExcel.ts`, `DetalleOrigenExcel.ts`) y **PDF** (`ReporteFinancieroPdf.tsx`).
* **Archivos clave**: `ReporteFinancieroPage.tsx`, `KPIsGenerales.tsx`, `DistribucionCharts.tsx`, `ConciliacionPanel.tsx`, `DetalleOrigenPanel.tsx`, `reportes.service.ts`, `reportes.routes.tsx`.

---

### 24. `monedas` (Monedas y Divisas)
* **Rutas**: `/monedas`, `/monedas/:id`
* **Permisos**: `VER_MONEDAS`.
* **Propósito**: Consulta de divisas activas en el sistema, tasas de cambio y símbolos monetarios.
* **Archivos clave**: `MonedasListPage.tsx`, `MonedaDetailPage.tsx`, `monedas.repository.ts`, `monedas.routes.tsx`.

---

### 25. `paises` (Configuración de Países)
* **Rutas**: `/paises`, `/paises/:id`
* **Permisos**: `VER_PAISES`.
* **Propósito**: Catálogo de países soportados, códigos telefónicos y formatos locales.
* **Archivos clave**: `PaisesListPage.tsx`, `PaisDetailPage.tsx`, `PaisAutocomplete.tsx`, `paises.repository.ts`, `paises.routes.tsx`.

---

### 26. `geografia` (Divisiones Administrativas)
* **Rutas**: Utilizado como autocompletado en sucursales y clientes.
* **Propósito**: Selección en cascada de Departamentos (`DepartamentoAutocomplete.tsx`) y Municipios (`MunicipioAutocomplete.tsx`).
* **Archivos clave**: `geografia.repository.ts`, `geografia.interface.ts`.

---

### 27. `vehiculos` (Vehículos de Clientes)
* **Rutas**: `/vehiculos`, `/vehiculos/nuevo`, `/vehiculos/:id`, `/vehiculos/:id/editar`
* **Permisos**: `VER_VEHICULOS`, `CREAR_VEHICULOS`, `VER_VEHICULOS_DETALLE`, `EDITAR_VEHICULOS`.
* **Propósito**: Ficha técnica de vehículos atendidos: placas, chasis/VIN, año, modelo, carga de foto frontal y carga de calcomanía de circulación en PDF o imagen a Cloudflare R2.
* **Archivos clave**: `VehiculosListPage.tsx`, `VehiculoFormPage.tsx`, `VehiculoDetailPage.tsx`, `VehicleImageUploader.tsx`, `VehiclePdfUploader.tsx`, `CreateModeloModal.tsx`, `vehiculo.repository.ts`, `vehiculos.routes.tsx`.

---

### 28. `marcas` (Marcas de Vehículos)
* **Rutas**: `/marcas`, `/marcas/:id`
* **Permisos**: `VER_MARCAS`.
* **Propósito**: Catálogo de fabricantes automotrices (Toyota, Honda, Nissan, etc.).
* **Archivos clave**: `MarcasListPage.tsx`, `MarcaDetailPage.tsx`, `marcas.repository.ts`, `marcas.routes.tsx`.

---

### 29. `lineas` (Líneas / Familias de Vehículos)
* **Rutas**: `/lineas`, `/lineas/:id`
* **Permisos**: `VER_LINEAS`.
* **Propósito**: Modelos/líneas subordinadas a una marca (Corolla, Civic, Yaris, etc.).
* **Archivos clave**: `LineasListPage.tsx`, `LineaDetailPage.tsx`, `lineas.repository.ts`, `lineas.routes.tsx`.

---

### 30. `modelos` (Años y Modelos Vehiculares)
* **Rutas**: `/modelos`, `/modelos/nuevo`, `/modelos/:id`
* **Permisos**: `VER_MODELOS`, `CREAR_MODELO`.
* **Propósito**: Mantenimiento de años/modelos de vehículos con autorización por PIN de supervisor.
* **Archivos clave**: `ModelosListPage.tsx`, `ModelosCreatePage.tsx`, `ModeloDetailPage.tsx`, `modelos.repository.ts`, `modelos.routes.tsx`.

---

### 31. `cilindradas` (Cilindradas de Motor)
* **Rutas**: `/cilindradas`, `/cilindradas/:id`
* **Permisos**: `VER_CILINDRADAS`.
* **Propósito**: Especificación del cilindraje de los motores vehiculares.
* **Archivos clave**: `CilindradasListPage.tsx`, `CilindradaDetailPage.tsx`, `cilindradas.repository.ts`, `cilindradas.routes.tsx`.

---

### 32. `tipos-servicio` (Tipos de Mantenimiento de Taller)
* **Rutas**: `/tipos-servicio`, `/tipos-servicio/nuevo`, `/tipos-servicio/:id`
* **Permisos**: `VER_TIPO_SERVICIO`, `CREAR_TIPO_SERVICIO`.
* **Propósito**: Configuración de clasificaciones de servicios (Preventivo, Mayor, Afinación, Frenos, etc.).
* **Archivos clave**: `TiposServicioListPage.tsx`, `TipoServicioFormPage.tsx`, `TipoServicioDetailPage.tsx`, `tipo-servicio.repository.ts`, `tipos-servicio.routes.tsx`.

---

### 33. `opciones-servicio` (Paquetes y Tareas de Servicio)
* **Rutas**: `/opciones-servicio`, `/opciones-servicio/nueva`, `/opciones-servicio/:id`
* **Permisos**: `VER_OPCION_SERVICIO`, `CREAR_OPCION_SERVICIO`.
* **Propósito**: Opciones operativas dentro de cada tipo de servicio con precios base.
* **Archivos clave**: `OpcionesServicioListPage.tsx`, `OpcionServicioFormPage.tsx`, `OpcionServicioDetailPage.tsx`, `opcion-servicio.repository.ts`, `opciones-servicio.routes.tsx`.

---

### 34. `checklist-items` (Puntos de Inspección Vehicular)
* **Rutas**: `/checklist`, `/checklist/nuevo`, `/checklist/:id`
* **Permisos**: `VER_CHECKLIST`, `CREAR_CHECKLIST`.
* **Propósito**: Catálogo de ítems de revisión visual y mecánica al recibir un vehículo en el taller.
* **Archivos clave**: `ChecklistItemsListPage.tsx`, `ChecklistItemFormPage.tsx`, `ChecklistItemDetailPage.tsx`, `checklist-item.repository.ts`, `checklist-items.routes.tsx`.

---

### 35. `serviciosVehiculos` (Módulo Integral de Taller Mecánico)
* **Rutas**: `/servicios-vehiculo`, `/servicios-vehiculo/nuevo`, `/servicios-vehiculo/:id`, `/servicios-vehiculo/:id/progreso`, `/servicios-vehiculo/:id/repuestos`, `/servicios-vehiculo/:id/hoja`, `/servicios-vehiculo/:id/salida`
* **Permisos**: `VER_SERVICIOS`, `CREAR_SERVICIOS`, `VER_SERVICIOS_DETALLE`, `FINALIZAR_SERVICIO`.
* **Propósito**: El módulo operativo más amplio del sistema:
  1. **Recepción**: Búsqueda por placa (`Step1BuscarPlaca.tsx`), creación de orden, inspección mediante Checklist con fotos y captura de firma digital del cliente en pantalla táctil (`SignaturePadModal.tsx`).
  2. **Progreso y Tareas**: Asignación de mecánico (`AssignMechanicModal.tsx`), tareas manuales, fotografías de evidencia de avances (`ServiceProgressImages.tsx`) y bitácora de observaciones.
  3. **Repuestos**: Manejo de repuestos traídos por el cliente (`ServiceClientParts.tsx`) o solicitados al inventario interno del taller (`ServicioReparacionRepuestoModal.tsx`).
  4. **Custodia y Reparación Externa**: Control de estadía y envíos a talleres externos de torno o pintura.
  5. **Salida y Hoja de Servicio**: Generación de la Hoja de Servicio en PDF (`HojaServicioPdf.tsx`), recomendaciones para el siguiente servicio y entrega formal con firma de salida.
* **Archivos clave (37 archivos)**: `ServiciosVehiculoListPage.tsx`, `ServicioVehiculoFormPage.tsx`, `ServicioVehiculoDetailPage.tsx`, `ServicioVehiculoProgresoPage.tsx`, `ServicioVehiculoHojaPage.tsx`, `HojaServicioPdf.tsx`, `ServiceChecklist.tsx`, `ServiceSignatures.tsx`, `servicio.repository.ts`, `servicio.routes.tsx`.

---

### 36. `notificaciones` (Notificaciones Push del Sistema)
* **Propósito**: Sincronización del token FCM del dispositivo con el backend para que el usuario reciba alertas en tiempo real sobre órdenes de servicio, ventas o avisos.
* **Archivos clave**: `notificacion.repository.ts`.

---

### 37. `custom` (Páginas Personalizadas)
* **Rutas**: `/custom`
* **Propósito**: Espacio de renderizado de componentes y pruebas de interfaces personalizadas.
* **Archivos clave**: `CustomPage.tsx`, `custom.routes.tsx`.

---

## 5. Integraciones Externas y Bibliotecas del Frontend

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND ASYNCRONIX                             │
└──────┬───────────────┬──────────────┬──────────────┬────────────┬──────┘
       │               │              │              │            │
       ▼               ▼              ▼              ▼            ▼
┌─────────────┐ ┌─────────────┐ ┌───────────┐ ┌────────────┐ ┌───────────┐
│ Backend API │ │  Firebase   │ │ React-PDF │ │  ExcelJS   │ │  Barcode  │
│   (Axios)   │ │  FCM Push   │ │ Document  │ │ Spreadsh. │ │ & QR Scan │
└─────────────┘ └─────────────┘ └───────────┘ └────────────┘ └───────────┘
```

### 1. Axios (Cliente HTTP con Rotación de Tokens)
* **Uso**: Comunicación con todos los endpoints REST del backend.
* **Características**: Manejo automático de cookies `httpOnly`, inyección de encabezado Bearer, cola de reintentos concurrentes ante expiración de token (`TOKEN_EXPIRED`) y cancelación de peticiones con `AbortSignal`.

### 2. Firebase Cloud Messaging (FCM)
* **Uso**: Recepción de notificaciones push en tiempo real incluso con la pestaña en segundo plano o cerrada (a través de `public/firebase-messaging-sw.js`).
* **Variables**: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_VAPID_KEY`.

### 3. Material-UI (MUI v7) + Emotion
* **Uso**: Biblioteca base de componentes visuales (Botones, Cuadros de Diálogo, Tablas, Menús, Tarjetas, Inputs).
* **Características**: Personalización profunda con 6 temas intercambiables en tiempo real (`marton`, `normal`, `corport`, `liquidGlass`, `brutalist`, `neumorphic`).

### 4. Zustand (Gestión de Estado Ligera y Desacoplada)
* **Uso**: Almacén reactivo para datos de sesión (`authStore`), asociación de caja/computadora física (`deviceStore`) y personalización visual de la UI (`uiStore`).

### 5. React Hook Form + Zod
* **Uso**: Construcción de formularios reactivos sin renderizados redundantes con validación tipada en tiempo real.

### 6. @react-pdf/renderer
* **Uso**: Creación y renderizado en cliente de documentos PDF oficiales vectoriales de alta fidelidad: cotizaciones comerciales (`CotizacionPdf.tsx`), hojas de recepción de taller (`HojaServicioPdf.tsx`), reportes financieros (`ReporteFinancieroPdf.tsx`) y facturas de venta (`FacturaVentaDocument.tsx`).

### 7. ExcelJS + File-Saver
* **Uso**: Construcción y descarga de archivos de Excel (.xlsx) con celdas estilizadas, encabezados corporativos, fórmulas y formateo monetario para reportes contables.

### 8. HTML5-QRCode, JsBarcode y QRCode.React
* **Uso**: 
  - `html5-qrcode`: Lectura de códigos QR y de barras utilizando la cámara del dispositivo móvil o laptop.
  - `jsbarcode`: Dibujado vectorial en Canvas/SVG de códigos de barras SKU.
  - `qrcode.react`: Generación instantánea de códigos QR para tickets térmicos y facturas FEL según las especificaciones de la SAT.

### 9. Fuse.js
* **Uso**: Búsqueda difusa (*fuzzy searching*) en el cliente para autocompletar opciones y menús de navegación al instante sin sobrecargar el servidor.

### 10. Sonner
* **Uso**: Sistema de notificaciones tipo Toast con soporte para temas oscuros, colores dinámicos y personalización de posición.

---

## 6. Buenas Prácticas y Reglas de Desarrollo

Para mantener la calidad y consistencia del frontend, todo nuevo desarrollo debe adherirse a estas pautas:

1. **Nunca realizar llamadas `fetch` o `axios` directas dentro de componentes**: Toda interacción de red debe encapsularse en un repositorio dentro de `infrastructure/repositories/`.
2. **Componentes pequeños y modulares**: Mantener los componentes por debajo de 150 líneas siempre que sea posible, abstrayendo modales, tablas y tabs en subcomponentes.
3. **Manejo defensivo de datos**: El frontend nunca debe asumir que el backend devolverá arrays no vacíos o propiedades definidas; siempre utilizar encadenamiento opcional (`row.cliente?.nombre || '-'`) y valores por defecto.
4. **Validar permisos en la vista**: Si un botón o acción requiere un permiso específico (ej. `ANULAR_VENTAS`), verificar `user?.permisos.includes('ANULAR_VENTAS')` para ocultar o deshabilitar el control antes de que el usuario lo accione.
5. **Cancelar peticiones obsoletas en búsquedas**: Utilizar el hook `useAbortableFetch` y `useDebounce` en todos los listados con barra de búsqueda para optimizar el rendimiento y evitar datos desincronizados.
6. **Manejo uniforme de estados**: Cada pantalla de listado o detalle debe contemplar explícitamente tres estados:
   - Estado de Carga (`loading` con Skeleton o `Loading`).
   - Estado Vacío (`empty` con mensaje descriptivo y llamada a la acción).
   - Estado de Error (`error` con notificación contextual y reintento).
