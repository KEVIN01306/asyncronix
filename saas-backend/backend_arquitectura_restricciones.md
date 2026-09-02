# Guía de Arquitectura y Restricciones — Backend

## 1. Propósito

Este documento define el estándar que debe seguir cualquier nuevo módulo del backend del sistema.

El objetivo es mantener una arquitectura desacoplada, mantenible, testeable y consistente entre todos los módulos.

Principios obligatorios:

- Clean Architecture.
- Separación clara de responsabilidades.
- Casos de Uso para la lógica de negocio.
- Repositories únicamente para persistencia.
- Controllers únicamente para manejar HTTP.
- Providers para servicios externos.
- Interfaces en Domain cuando una dependencia externa deba estar desacoplada.
- Validación de entrada mediante Zod.
- Manejo centralizado y controlado de errores.
- Inyección de dependencias.
- No mezclar lógica de negocio con infraestructura.
- No acceder directamente a Prisma desde Controllers o Use Cases.
- No colocar lógica de negocio dentro de Routes.
- Mantener los módulos independientes y fáciles de extender.

---

# 2. Estructura general de un módulo

Una estructura recomendada es:

```text
src/
└── modules/
    └── nombreModulo/
        ├── application/
        │   ├── dto/
        │   └── use-cases/
        │
        ├── domain/
        │   ├── entities/
        │   ├── interfaces/
        │   └── errors/
        │
        ├── infrastructure/
        │   ├── repositories/
        │   ├── providers/
        │   └── mappers/
        │
        ├── presentation/
        │   ├── controllers/
        │   ├── schemas/
        │   └── routes/
        │
        └── module.ts
```

La estructura exacta puede adaptarse al estándar actual del proyecto, pero las responsabilidades deben mantenerse.

---

# 3. Domain

El Domain contiene las reglas y contratos del negocio.

Debe ser la capa más independiente del sistema.

No debe conocer:

- Express.
- Prisma.
- HTTP.
- Resend.
- Cloudflare R2.
- Multer.
- APIs externas.
- Implementaciones concretas de infraestructura.

---

# 4. Entities

Las Entities representan conceptos importantes del negocio.

Ejemplos:

```text
Usuario
Producto
Venta
Caja
CuentaBancaria
Transaccion
Servicio
```

Una Entity debe representar información y comportamiento propio del dominio cuando realmente corresponda.

No debe convertirse en un modelo de Prisma.

Prisma pertenece a Infrastructure.

---

# 5. Interfaces

Las interfaces definen contratos que necesita el dominio o la aplicación.

Ejemplo:

```ts
export interface UsuarioRepository {
    crear(data: CrearUsuarioData): Promise<Usuario>;
    obtenerPorId(id: string): Promise<Usuario | null>;
}
```

La interfaz no debe saber cómo se almacenan los datos.

No debe contener:

```ts
PrismaClient
```

ni código SQL.

## ¿Por qué?

Porque el Use Case debe depender de una abstracción:

```text
Use Case
   ↓
Interface
   ↓
Repository concreto
   ↓
Prisma
```

y no directamente:

```text
Use Case
   ↓
Prisma
```

---

# 6. Repository Interface

Los repositories representan las operaciones de persistencia que necesita el negocio.

Ejemplo:

```ts
interface ProductoRepository {
    crear(...);
    obtenerPorId(...);
    listar(...);
    actualizar(...);
}
```

Debe definir solamente operaciones necesarias.

No crear métodos innecesarios "por si algún día se utilizan".

---

# 7. Repositories

Los repositories concretos pertenecen a Infrastructure.

Ejemplo:

```text
infrastructure/
└── repositories/
    └── prisma-producto.repository.ts
```

Su única responsabilidad es comunicarse con la base de datos.

Puede utilizar:

- Prisma.
- SQL.
- transacciones.
- queries.
- includes.
- filtros.
- paginación.

Pero no debe contener reglas de negocio.

---

# 8. Regla crítica de los Repositories

Los repositories únicamente deben lanzar errores derivados de:

```text
PersistenceError
```

No deben lanzar errores de negocio.

Incorrecto:

```ts
throw new StockInsuficienteError();
```

Correcto:

```text
Repository
    ↓
PersistenceError
    ↓
Use Case interpreta el problema
    ↓
Error de negocio
```

La razón es que el repository no debe decidir qué significa un dato para el negocio.

---

# 9. Use Cases

Los Use Cases contienen la lógica de negocio.

Cada acción importante del sistema debe tener su propio Caso de Uso.

Ejemplos:

```text
CrearProducto
ActualizarProducto
EliminarProducto
ObtenerProducto
ListarProductos
CrearVenta
FinalizarVenta
VerificarEmailUsuario
CrearTransaccion
DebitarCaja
AcreditarCuentaBancaria
```

---

# 10. Responsabilidades de un Use Case

Un Use Case puede:

- Validar reglas de negocio.
- Coordinar repositories.
- Coordinar otros Use Cases.
- Validar permisos cuando corresponda.
- Ejecutar operaciones transaccionales.
- Validar estados.
- Validar límites.
- Validar stock.
- Calcular valores.
- Decidir qué operación debe ejecutarse.
- Utilizar Providers mediante interfaces.
- Convertir información de infraestructura a información del negocio.
- Lanzar errores de negocio controlados.

Ejemplo conceptual:

```text
CrearVenta
   ↓
validar usuario
   ↓
obtener cliente
   ↓
obtener variantes
   ↓
validar stock
   ↓
calcular totales
   ↓
crear venta
   ↓
crear detalles
   ↓
registrar transacción
```

---

# 11. Lo que NO debe hacer un Use Case

No debe:

- Manejar `req` o `res`.
- Conocer Express.
- Leer directamente `req.body`.
- Acceder directamente a Prisma.
- Construir respuestas HTTP.
- Decidir códigos HTTP.
- Depender de un Provider concreto.
- Contener lógica específica de HTTP.

Incorrecto:

```ts
async execute(req, res) {
    const producto = await prisma.producto.create(...);
    return res.json(producto);
}
```

Correcto:

```text
Controller
   ↓
Use Case
   ↓
Repository Interface
   ↓
Repository
```

---

# 12. Use Cases y otros Use Cases

Cuando una lógica ya existe como Caso de Uso y debe reutilizarse, puede ser invocada desde otro Caso de Uso.

Ejemplo:

```text
FinalizarVenta
   ↓
DebitarCaja
   ↓
AcreditarCuenta
```

Esto evita duplicar reglas.

Sin embargo, no se deben crear Use Cases artificiales para operaciones triviales que no representen una acción de negocio independiente.

---

# 13. Transacciones

Cuando una operación de negocio requiera que varias modificaciones se realicen juntas, debe utilizar una transacción.

Ejemplo:

```text
Crear venta
+
Crear detalles
+
Actualizar referencias
+
Eliminar preventa
```

Si una operación falla, todo debe revertirse.

La transacción debe estar coordinada desde la capa correspondiente sin colocar reglas de negocio dentro del repository.

---

# 14. Providers

Los Providers encapsulan servicios externos.

Ejemplos:

```text
EmailProvider
StorageProvider
ExchangeRateProvider
```

Casos actuales del proyecto:

```text
Resend
Cloudflare R2
Frankfurter
```

El Use Case nunca debería depender directamente de ellos.

Incorrecto:

```ts
import { Resend } from "resend";
```

dentro de un Use Case.

Correcto:

```text
Use Case
   ↓
EmailProvider
   ↓
ResendProvider
   ↓
Resend
```

---

# 15. Provider Interface

La interfaz debe estar en Domain/Shared cuando el servicio pueda ser utilizado por distintos módulos.

Ejemplo:

```ts
interface EmailProvider {
    sendEmail(
        email: string,
        subject: string,
        template: string
    ): Promise<void>;
}
```

El contrato debe expresar qué necesita el sistema, no cómo funciona el proveedor externo.

---

# 16. Provider concreto

La implementación pertenece a Infrastructure.

Ejemplo:

```text
shared/
└── infrastructure/
    └── providers/
        └── resend.provider.ts
```

Aquí sí puede existir:

```ts
import { Resend } from "resend";
```

El Provider es responsable de traducir el contrato interno al SDK/API externo.

---

# 17. Storage

Para archivos e imágenes debe utilizarse una abstracción.

Ejemplo:

```ts
interface StorageProvider {
    upload(...): Promise<string>;
    delete(...): Promise<void>;
}
```

El resto del sistema no debe saber si el archivo está almacenado en:

- Cloudflare R2.
- S3.
- almacenamiento local.
- otro proveedor.

La implementación concreta pertenece a Infrastructure.

---

# 18. Controllers

Los Controllers son responsables de HTTP.

Sus responsabilidades son:

1. Recibir la solicitud.
2. Obtener parámetros.
3. Obtener body.
4. Obtener usuario autenticado.
5. Validar mediante schemas.
6. Ejecutar el Use Case.
7. Convertir el resultado a una respuesta HTTP.
8. Delegar errores al sistema de manejo de errores.

Ejemplo:

```text
HTTP Request
     ↓
Controller
     ↓
Schema
     ↓
Use Case
     ↓
Response
```

---

# 19. Lo que NO debe hacer un Controller

No debe:

- Consultar Prisma.
- Ejecutar queries.
- Contener reglas de negocio.
- Calcular stock.
- Validar permisos de negocio complejos.
- Crear transacciones de base de datos por su cuenta.
- Implementar lógica de archivos.
- Comunicarse directamente con APIs externas.

Debe ser delgado.

---

# 20. Schemas

Los schemas definen y validan la entrada externa.

Utilizar Zod.

Ejemplo:

```ts
const crearProductoSchema = z.object({
    nombre: z.string().min(1),
    categoria_id: z.string().uuid(),
    precio_sugerido: z.number().positive()
});
```

La validación de estructura y formato debe realizarse antes de ejecutar el Use Case.

---

# 21. Schema vs regla de negocio

No confundir validación de entrada con lógica de negocio.

Schema:

```text
cantidad debe ser número
email debe tener formato válido
id debe ser UUID
```

Use Case:

```text
no permitir vender más stock disponible
no permitir eliminar una categoría con determinada condición
no permitir cambiar moneda sin permiso
```

---

# 22. Routes

Las Routes únicamente conectan HTTP con Controllers.

Ejemplo:

```text
POST /productos
      ↓
crearProductoController
```

No deben contener lógica de negocio.

Evitar:

```ts
router.post("/", async (req, res) => {
    // 100 líneas de lógica
});
```

La Route debe ser simple.

---

# 23. Middleware

Los Middleware manejan preocupaciones transversales de HTTP.

Ejemplos:

- Autenticación.
- Refresh token.
- Permisos.
- Manejo de headers.
- Validaciones generales.
- Rate limiting.

Cuando un endpoint requiere un permiso:

```text
authMiddleware
      ↓
permissionMiddleware
      ↓
controller
```

Los permisos deben validarse también en el backend aunque el frontend oculte botones.

Nunca confiar únicamente en el frontend para seguridad.

---

# 24. Permisos

Cada módulo que requiera control de acceso debe definir sus permisos en el Seed.

Ejemplo:

```ts
{
    nombre: "MOVIMIENTOS",
    permisos: [
        "VER_MOVIMIENTOS",
        "VER_MOVIMIENTOS_DETALLE",
        "CREAR_MOVIMIENTOS"
    ]
}
```

El frontend utiliza los permisos para controlar la interfaz.

El backend los utiliza para proteger realmente los endpoints.

---

# 25. module.ts

`module.ts` es el punto de composición del módulo.

Su responsabilidad principal es conectar las implementaciones concretas.

Debe realizar la inyección de dependencias.

Ejemplo conceptual:

```text
Repository concreto
        ↓
Use Case
        ↓
Controller
        ↓
Route
```

El `module.ts` puede crear:

```ts
const repository = new PrismaProductoRepository();

const crearProductoUseCase =
    new CrearProductoUseCase(repository);

const controller =
    new CrearProductoController(crearProductoUseCase);
```

---

# 26. Qué NO debe hacer module.ts

No debe:

- Contener lógica de negocio.
- Ejecutar queries.
- Procesar requests.
- Validar formularios.
- Contener reglas de negocio.
- Resolver operaciones de negocio.

Es un archivo de composición, no de lógica.

---

# 27. DTOs

Los DTOs definen los datos que entran o salen de una operación.

Ejemplo:

```ts
interface CrearProductoDTO {
    negocio_id: string;
    nombre: string;
    categoria_id: string;
}
```

El DTO no debe convertirse en una copia exacta obligatoria del modelo de Prisma.

Debe representar las necesidades del caso de uso.

---

# 28. Mappers

Los Mappers transforman estructuras.

Ejemplo:

```text
PrismaProducto
      ↓
ProductoEntity / Response
```

Son útiles cuando la estructura de persistencia no debe exponerse directamente.

Especialmente importantes cuando el API debe devolver estructuras diferentes a las tablas.

Ejemplo:

Incorrecto:

```json
{
    "monto_moneda_base": 100,
    "moneda_id": "..."
}
```

Si el contrato del API requiere:

```json
{
    "monto_moneda": {
        "monto": 100,
        "moneda": {}
    }
}
```

El Mapper/transformación debe construir esa respuesta.

---

# 29. Responses

Las respuestas del API deben ser consistentes.

No exponer automáticamente modelos completos de Prisma.

El backend debe construir explícitamente la respuesta necesaria para el frontend.

Evitar respuestas con campos internos innecesarios.

---

# 30. Paginación

Los endpoints de listado deben utilizar paginación cuando el módulo lo requiera.

La respuesta debe mantener el estándar existente del proyecto.

Conceptualmente:

```json
{
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10
    }
}
```

Nunca traer miles de registros para filtrarlos en memoria si la búsqueda puede realizarse directamente en la base de datos.

---

# 31. Búsquedas

Los filtros deben ejecutarse en la base de datos.

Ejemplo:

```text
?q=honda
```

Debe traducirse a una consulta del repository.

No:

```text
obtener todos
↓
filtrar con JavaScript
```

Sí:

```text
filtro
↓
repository
↓
query SQL/Prisma
```

---

# 32. Errores

El sistema debe utilizar errores controlados y tipados.

Separar:

```text
PersistenceError
BusinessError
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
```

Los nombres exactos deben respetar las clases existentes del proyecto.

---

# 33. PersistenceError

Es responsabilidad de Infrastructure.

Ejemplo:

```text
Prisma falla
    ↓
Repository
    ↓
PersistenceError
```

No permitir que errores específicos de Prisma se filtren directamente hacia el Controller.

---

# 34. Errores de negocio

Los Use Cases deben lanzar errores relacionados con reglas del negocio.

Ejemplos:

```text
StockInsuficiente
LimiteNegocioExcedido
MetodoPagoInvalido
PinInvalido
CuentaSinSaldo
CajaSinSaldo
OperacionNoPermitida
```

El Controller no debería decidir si una operación de negocio es válida.

---

# 35. Variables de entorno

Las credenciales y configuraciones sensibles deben vivir en `.env`.

Ejemplos:

```text
DATABASE_URL
RESEND_API_KEY
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
```

Nunca:

- hardcodear API keys.
- subir secretos al repositorio.
- colocar credenciales dentro de Use Cases.
- colocar credenciales dentro de Controllers.

---

# 36. Servicios externos

Cuando se integre una API externa:

```text
Domain Interface
       ↓
Infrastructure Provider
       ↓
API externa
```

Ejemplo de tipo de cambio:

```text
ExchangeRateProvider
       ↓
FrankfurterProvider
       ↓
Frankfurter API
```

El Use Case solamente conoce:

```ts
getRate(base, quote)
```

No conoce la URL externa.

---

# 37. Reglas para Prisma

Prisma pertenece exclusivamente a Infrastructure.

No importar Prisma directamente en:

- Controllers.
- Routes.
- Use Cases.
- Entities.
- Domain interfaces.

Las operaciones deben pasar por repositories.

---

# 38. Reglas para relaciones

Cuando una operación modifica entidades relacionadas, el Use Case debe controlar las reglas.

Ejemplo:

```text
Eliminar ImagenProducto
```

El Use Case debe validar:

- que exista.
- que pertenezca al producto.
- que no sea principal.
- que el usuario tenga autorización.

Después el Repository realiza la persistencia.

---

# 39. Seguridad

Toda operación sensible debe validarse en backend.

Ejemplos:

- Cambiar moneda.
- Forzar stock.
- Crear modelos administrativos.
- Asociar una caja a una PC.
- Cambiar información sensible.
- Operaciones financieras.

Aunque el frontend oculte el botón, el backend debe impedir la operación si no existe autorización.

---

# 40. Pines y credenciales internas

Cuando el sistema utilice PIN:

1. Recibir el PIN.
2. Obtener el usuario autorizado correspondiente.
3. Comparar utilizando la función de comparación existente.
4. Nunca comparar contraseñas/PIN sensibles como texto plano si están almacenados de forma protegida.
5. Verificar el rol/permisos correspondientes.
6. Autorizar o rechazar la operación.

El PIN nunca debe guardarse en texto plano si la arquitectura actual utiliza hashing/encriptación.

---

# 41. Archivos

Cuando un módulo trabaje con imágenes/documentos:

```text
Controller
   ↓
Use Case
   ↓
StorageProvider
   ↓
R2
```

No colocar llamadas directas a R2 en Controllers.

Si se reemplaza Multer o el almacenamiento local, los módulos deben seguir dependiendo de la interfaz, no del proveedor concreto.

---

# 42. Lógica de negocio financiera

Las operaciones financieras deben tratarse como operaciones críticas.

Ejemplo:

```text
DebitarCaja
AcreditarCaja
DebitarCuenta
AcreditarCuenta
```

Antes de debitar:

- verificar existencia.
- verificar saldo.
- validar moneda cuando corresponda.
- validar que la operación esté permitida.

Nunca permitir que un débito produzca saldo negativo accidentalmente si la regla del negocio no lo permite.

---

# 43. Operaciones con stock

La lógica de stock debe centralizarse.

Si existen triggers de base de datos que actualizan stock automáticamente:

- no modificar manualmente el stock nuevamente.
- evitar doble descuento.
- respetar la responsabilidad de los triggers.
- coordinar correctamente las operaciones dentro de transacciones.

---

# 44. Límites del negocio

Cuando exista `NegocioLimite`, las operaciones de creación que puedan exceder límites deben consultar el Caso de Uso correspondiente.

Ejemplo:

```text
CrearUsuario
    ↓
ObtenerLimiteNegocio
    ↓
contar usuarios
    ↓
comparar
    ↓
crear
```

Si el límite es:

```text
-1
```

se interpreta como ilimitado.

---

# 45. Clean Architecture — Regla de dependencia

Las dependencias deben apuntar hacia el interior:

```text
Presentation
     ↓
Application
     ↓
Domain

Infrastructure
     ↓
implementa contratos del Domain
```

El Domain no debe depender de Infrastructure.

---

# 46. Ejemplo de flujo completo

Para crear un producto:

```text
HTTP
 ↓
Route
 ↓
Controller
 ↓
Zod
 ↓
CrearProductoUseCase
 ↓
Validar reglas
 ↓
Repository Interface
 ↓
PrismaProductoRepository
 ↓
Prisma
 ↓
Database
```

Si necesita almacenamiento:

```text
CrearProductoUseCase
 ↓
StorageProvider
 ↓
R2Provider
 ↓
Cloudflare R2
```

---

# 47. Checklist obligatorio para nuevos módulos

Antes de considerar terminado un módulo revisar:

## Domain

- [ ] Entity cuando sea necesaria.
- [ ] Interfaces.
- [ ] Errores de dominio cuando correspondan.
- [ ] Sin dependencias de Infrastructure.

## Application

- [ ] Use Cases.
- [ ] DTOs cuando sean necesarios.
- [ ] Reglas de negocio dentro de Use Cases.
- [ ] Sin Prisma.
- [ ] Sin Express.

## Infrastructure

- [ ] Repository concreto.
- [ ] Provider concreto si existe servicio externo.
- [ ] Mappers cuando sean necesarios.
- [ ] `PersistenceError` para errores de persistencia.

## Presentation

- [ ] Controller.
- [ ] Schemas Zod.
- [ ] Routes.
- [ ] Middleware correspondiente.

## Composition

- [ ] `module.ts`.
- [ ] Inyección de dependencias correcta.
- [ ] Interfaces conectadas con sus implementaciones.

## Seguridad

- [ ] Autenticación.
- [ ] Permisos.
- [ ] Validaciones en backend.
- [ ] Sin secretos hardcodeados.

## API

- [ ] Respuestas consistentes.
- [ ] Paginación.
- [ ] Filtros en base de datos.
- [ ] No exponer modelos Prisma directamente.
- [ ] Manejo correcto de errores.

---

# 48. Regla principal

Cuando exista duda sobre dónde colocar una lógica, preguntarse:

> "¿Esto es una regla del negocio, una operación HTTP, una operación de persistencia o una integración externa?"

Entonces:

```text
Regla del negocio
→ Use Case

HTTP
→ Controller

Persistencia
→ Repository

Servicio externo
→ Provider

Contrato
→ Interface

Validación de entrada
→ Zod

Composición
→ module.ts

Ruteo
→ Route

Autenticación/autorización transversal
→ Middleware
```

La prioridad es mantener cada responsabilidad en su lugar y evitar que un archivo termine haciendo el trabajo de varias capas.
