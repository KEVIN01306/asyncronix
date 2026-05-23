# Cambios en el Módulo de Ventas - Búsqueda y Creación de Clientes con NIT

## Resumen Ejecutivo

Se ha modificado el flujo de ventas para permitir búsqueda y creación de clientes **únicamente con NIT**, sin afectar las funcionalidades existentes del módulo de clientes que continúan soportando tanto NIT como DPI.

## Objetivos Alcanzados

✅ La búsqueda de clientes en ventas se realiza únicamente por NIT  
✅ La creación de clientes en ventas solicita solo Nombre y NIT  
✅ El campo DPI se mantiene en la base de datos y otras funcionalidades  
✅ La arquitectura y convenciones del proyecto se respetan  
✅ No hay cambios en el módulo de clientes existente  

## Archivos Creados

### 1. Validadores específicos para ventas
**Archivo:** `src/modules/ventas/presentation/validators/cliente-venta.schema.ts`

Define dos esquemas Zod:
- `buscarClienteNitVentaSchema`: Validación para búsqueda por NIT (obligatorio)
- `crearClienteVentaSchema`: Validación para crear cliente (nombre y NIT obligatorios)

### 2. Casos de uso específicos para ventas

#### Búsqueda de cliente por NIT
**Archivo:** `src/modules/ventas/application/buscar-cliente-por-nit.usecase.ts`

```typescript
export class BuscarClientePorNitVentaUseCase {
  async execute(nit: string, negocio_id: string): Promise<ClienteObtenidoDetalle | null>
}
```

- Acepta solo NIT como parámetro
- Retorna el cliente si existe o null
- Usa el repositorio de clientes para la consulta

#### Creación de cliente para ventas
**Archivo:** `src/modules/ventas/application/registrar-cliente-para-venta.usecase.ts`

```typescript
interface RegistrarClienteVentaData {
  nombre: string;
  nit: string;
}

export class RegistrarClienteParaVentaUseCase {
  async execute(data: RegistrarClienteVentaData, negocio_id: string): Promise<ClienteObtenidoDetalle>
}
```

- Acepta solo nombre y NIT
- Valida que no exista un cliente duplicado
- Campos adicionales (DPI, email, etc.) se establecen como null/vacíos
- Campo teléfono se establece como string vacío (es obligatorio en la BD)

## Archivos Modificados

### 1. Módulo de ventas
**Archivo:** `src/modules/ventas/venta.module.ts`

Cambios:
- Importación del `PrismaClienteRepository`
- Importación de los nuevos casos de uso
- Creación de instancia del repositorio de clientes
- Creación de instancias de los nuevos casos de uso
- Inyección en el controlador

### 2. Controlador de ventas
**Archivo:** `src/modules/ventas/presentation/venta.controller.ts`

Nuevos métodos:
```typescript
buscarClientePorNit = async (_req: Request, res: Response, next: NextFunction) => {
  // GET /ventas/clientes/buscar-por-nit?nit=...
}

registrarCliente = async (req: Request, res: Response, next: NextFunction) => {
  // POST /ventas/clientes con body { nombre, nit }
}
```

### 3. Rutas de ventas
**Archivo:** `src/modules/ventas/presentation/venta.routes.ts`

Nuevas rutas:
```
GET  /ventas/clientes/buscar-por-nit?nit=<valor>
POST /ventas/clientes
```

Ambas rutas requieren permiso `CREAR_VENTAS`

## Endpoints Nuevos

### 1. Buscar cliente por NIT
**Endpoint:** `GET /api/ventas/clientes/buscar-por-nit`

**Query Parameters:**
- `nit` (string, obligatorio): NIT del cliente a buscar

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Búsqueda de cliente completada",
  "data": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "telefono": "12345678",
    "email": null,
    "nit": "1234567890",
    "dpi": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Respuesta cuando no existe (200):**
```json
{
  "success": true,
  "message": "Búsqueda de cliente completada",
  "data": null
}
```

### 2. Crear cliente desde ventas
**Endpoint:** `POST /api/ventas/clientes`

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "nit": "1234567890"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Cliente creado con éxito",
  "data": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "apellido": null,
    "telefono": "",
    "email": null,
    "nit": "1234567890",
    "dpi": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Respuesta de error - Cliente duplicado (409):**
```json
{
  "success": false,
  "message": "El cliente ya existe en este negocio",
  "code": "DATA_ALREADY_EXISTS",
  "statusCode": 409
}
```

## Módulo de Clientes - Sin cambios

El módulo de clientes continúa funcionando sin cambios:

### Endpoints del módulo de clientes (intactos)
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente por ID
- `GET /api/clientes/buscar?nit=...&dpi=...` - Buscar por NIT o DPI
- `POST /api/clientes` - Crear cliente (acepta nombre, apellido, teléfono, email, NIT, DPI)
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

El flujo de creación/búsqueda en el módulo de clientes sigue permitiendo NIT y DPI como antes.

## Casos de Uso y Validaciones

### Búsqueda en ventas:
- Solo NIT es aceptado
- No se puede buscar por DPI en ventas
- Si no existe cliente, retorna `null`

### Creación en ventas:
- Obligatorios: `nombre` y `nit`
- Opcionales/automatizados: `apellido` (null), `email` (null), `dpi` (null), `teléfono` ("")
- Validación de unicidad: El cliente no puede existir ya en el negocio
- Si el NIT ya existe, retorna error 409 Conflict

## Flujo de Ventas Simplificado

### Crear venta con cliente nuevo:
1. Usuario accede al flujo de creación de venta
2. Usuario tiene opción "Crear cliente rápido"
3. Formulario solicita: **Nombre** y **NIT**
4. Sistema crea cliente y lo asigna a la venta

### Crear venta con cliente existente:
1. Usuario accede al flujo de creación de venta
2. Usuario busca cliente por **NIT**
3. Sistema retorna cliente encontrado (o null si no existe)
4. Usuario puede seleccionar el cliente para la venta

## Arquitectura y Patrones

Se mantiene la arquitectura hexagonal:
- **Domain:** Interfaces de repositorio (sin cambios)
- **Application:** Nuevos casos de uso específicos para ventas
- **Infrastructure:** Usa repositorio existente de Prisma
- **Presentation:** Validadores y controladores específicos para ventas

## Persistencia en Base de Datos

No hay cambios en el schema de la base de datos:
- Campos `nit` y `dpi` continúan siendo opcionales en la tabla `cliente`
- Clientes creados desde ventas tendrán `dpi = NULL` y `teléfono = ""`
- Otros módulos pueden seguir usando ambos campos

## Permisos Requeridos

- `CREAR_VENTAS`: Requerido para ambas operaciones (buscar y crear clientes en ventas)

## Consideraciones

1. **Teléfono vacío:** El campo teléfono es obligatorio en la BD pero no en el formulario de ventas. Se almacena como string vacío `""`.

2. **DPI no elimido:** El campo DPI se mantiene en la BD pero no se utiliza en el flujo de ventas para simplificar la UX.

3. **Compatibilidad:** El módulo de clientes general continúa permitiendo NIT y DPI. Solo el flujo de ventas fue simplificado.

4. **Índices:** Se recomienda tener un índice en `(negocio_id, nit)` para optimizar búsquedas rápidas.

## Próximos Pasos Opcionales

Si lo deseas, se podría:
1. Optimizar la UI del frontend para el nuevo flujo
2. Añadir validación del NIT en el lado del cliente
3. Implementar auto-complete en la búsqueda de clientes por NIT
4. Crear una vista específica para el manager de clientes en ventas
