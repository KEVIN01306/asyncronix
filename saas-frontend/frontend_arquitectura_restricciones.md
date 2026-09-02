Guía de Arquitectura y Restricciones — Frontend

1. Propósito

Este documento define el estándar que debe seguir cualquier nuevo módulo o modificación dentro del frontend.

El objetivo es mantener un frontend:

Consistente.

Escalable.

Reutilizable.

Tipado.

Fácil de mantener.

Desacoplado de detalles innecesarios del backend.

Consistente visualmente.

Seguro frente a errores de API.

Compatible con la arquitectura actual del sistema.

Reglas principales:

React + TypeScript.

React Hook Form para formularios.

Zod para validación.

Componentes reutilizables.

Separación de responsabilidades.

Interfaces/types correctamente definidos.

Servicios/API separados de los componentes visuales.

Manejo uniforme de loading, errores y estados vacíos.

Componentes menores a 150 líneas siempre que sea posible.

Mantener la línea gráfica existente.

No duplicar lógica.

No hacer consultas directamente desde componentes si existe una capa de servicios/hooks establecida.

El frontend nunca debe asumir que el backend devolverá datos válidos o completos.

2. Estructura general recomendada

Una estructura puede ser:

src/
└── modules/
    └── nombreModulo/
        ├── components/
        ├── pages/
        ├── hooks/
        ├── services/
        ├── schemas/
        ├── interfaces/
        ├── utils/
        └── routes/

La estructura exacta debe respetar el patrón ya existente en el proyecto.

No crear estructuras completamente diferentes para cada módulo.

La consistencia entre módulos es prioritaria.

3. Modules

Cada módulo representa una funcionalidad del sistema.

Ejemplos:

productos
ventas
servicios
sucursales
finanzas
movimientos
reportes
usuarios

Un módulo debe agrupar únicamente lo relacionado con esa funcionalidad.

Evitar colocar componentes específicos de un módulo dentro de carpetas globales si realmente no son reutilizables.

4. Pages

Las Pages representan pantallas completas.

Ejemplos:

ProductoListPage
ProductoCreatePage
ProductoEditPage
ProductoDetailPage

Una Page debe encargarse principalmente de:

Coordinar componentes.

Obtener parámetros de navegación.

Consumir hooks.

Controlar el flujo general de la pantalla.

Mostrar estados de loading/error.

Componer componentes.

No debe contener cientos de líneas de JSX.

Si una sección crece demasiado, extraerla a un componente.

5. Componentes

Los componentes deben tener una responsabilidad clara.

Ejemplo:

ProductoCard
ProductoFilters
ProductoForm
ProductoTable
ProductoImageGallery

Evitar componentes gigantes.

Regla del proyecto:

Componente < 150 líneas

Si supera ese tamaño de forma significativa, revisar si puede dividirse.

6. Componentes reutilizables

Antes de crear un componente nuevo revisar si ya existe uno que pueda reutilizarse.

Ejemplos:

Tablas.

Cards.

Modales.

Formularios.

Autocomplete.

Selects.

Alerts.

Confirm dialogs.

Paginación.

Inputs.

Botones.

Loading.

Empty states.

No duplicar un componente únicamente porque otro módulo necesita una pequeña variación.

Si el comportamiento es general, crear o extender el componente reutilizable.

7. Formularios

Todos los formularios complejos deben utilizar:

React Hook Form
+
Zod

Ejemplo conceptual:

Form
 ↓
React Hook Form
 ↓
Zod Resolver
 ↓
Submit
 ↓
Service/API

No manejar manualmente decenas de estados independientes para un formulario.

Evitar:

const [nombre, setNombre] = useState("");
const [descripcion, setDescripcion] = useState("");
const [precio, setPrecio] = useState(0);

cuando React Hook Form resuelve correctamente el caso.

8. Zod

Zod se utiliza para validar datos de entrada.

Debe existir un schema para formularios importantes.

Ejemplo:

const productoSchema = z.object({
    nombre: z.string().min(1),
    categoria_id: z.string().uuid(),
    precio: z.number().positive()
});

El schema debe validar:

Campos requeridos.

Formatos.

Longitudes.

Tipos.

Valores mínimos/máximos.

Dependencias simples entre campos.

9. Validación frontend vs backend

El frontend valida para mejorar UX.

El backend sigue siendo la autoridad.

Nunca asumir:

"Como Zod lo validó, el backend lo aceptará."

Puede ocurrir:

Frontend válido
+
Backend rechaza por regla de negocio

Por ejemplo:

Frontend:
cantidad > 0

Backend:
cantidad no puede superar stock

Ambas validaciones son necesarias.

10. Interfaces / Types

Todas las respuestas importantes del API deben tener interfaces/types.

Ejemplo:

interface Producto {
    id: string;
    nombre: string;
    descripcion?: string;
}

No utilizar:

any

como solución rápida.

Si la respuesta cambia, actualizar la interfaz correspondiente.

11. Respuestas complejas

No asumir que la respuesta del backend tiene exactamente la misma estructura que Prisma.

Por ejemplo, si el backend devuelve:

{
    "monto_moneda": {
        "monto": 100,
        "moneda": {
            "codigo": "GTQ",
            "simbolo": "Q"
        }
    }
}

La interfaz debe representar esa estructura.

No intentar acceder a:

data.monto_moneda_base

si ese campo ya no forma parte del contrato.

12. Services / API

Las llamadas al backend deben estar separadas de los componentes.

Ejemplo:

services/
└── producto.service.ts

El componente no debería contener directamente toda la configuración de HTTP.

Incorrecto:

axios.get("/productos?...").then(...)

repetido en múltiples componentes.

Preferir:

productoService.listar(...)

Esto permite:

Reutilización.

Tipado.

Centralización.

Cambios más fáciles.

Manejo uniforme.

13. Hooks

Los hooks deben encapsular lógica reutilizable relacionada con React.

Ejemplos:

useProductos
useProducto
useCrearProducto
useActualizarProducto
usePagination
useDebounce

Un hook puede coordinar:

Estado.

Queries.

Mutaciones.

Loading.

Error.

Refetch.

Paginación.

No convertir todos los componentes en hooks gigantes.

14. Estado

Diferenciar:

Estado local
Estado de formulario
Estado global
Estado remoto

No utilizar un store global para cualquier dato.

Ejemplo:

Modal abierto
→ useState

Formulario
→ React Hook Form

Usuario autenticado
→ store/context existente

Datos del backend
→ patrón de fetching existente

15. Loading

Toda operación asíncrona importante debe contemplar loading.

Ejemplos:

Crear.

Editar.

Eliminar.

Buscar.

Cargar detalle.

Cargar filtros.

Subir archivos.

Asociar caja.

Finalizar venta.

No permitir que el usuario pueda ejecutar múltiples veces una operación crítica mientras está procesándose.

16. Manejo de errores

Nunca ignorar errores.

Incorrecto:

try {
    await service.crear(data);
} catch {}

El usuario debe recibir información útil.

Ejemplo:

API
 ↓
error
 ↓
service/hook
 ↓
UI
 ↓
mensaje

Utilizar el sistema de manejo de errores existente.

No crear mensajes diferentes para cada módulo si existe un sistema centralizado.

17. Errores provenientes del backend

El frontend debe interpretar correctamente los errores del API.

Ejemplos:

401 → sesión/token
403 → permisos
404 → recurso no encontrado
409 → conflicto/regla de negocio
422 → validación
500 → error inesperado

Los códigos exactos deben respetar el estándar implementado en el proyecto.

18. Token / autenticación

El frontend debe respetar el mecanismo de autenticación existente.

Si el sistema utiliza refresh token:

401 TOKEN_EXPIRED
        ↓
refresh token
        ↓
actualizar sesión
        ↓
repetir solicitud

No duplicar lógica de refresh en cada servicio.

Debe existir un mecanismo centralizado.

19. Permisos

El frontend puede utilizar permisos para controlar la interfaz.

Ejemplo:

VER_PRODUCTOS
CREAR_PRODUCTOS
EDITAR_PRODUCTOS
ELIMINAR_PRODUCTOS
ADMIN_REPORTES
VENTAS_FORZAR_STOCK

Los permisos sirven para:

Ocultar botones.

Deshabilitar acciones.

Mostrar/ocultar tabs.

Proteger rutas.

Pero:

Los permisos del frontend NO reemplazan la autorización del backend.

El backend debe validar siempre el permiso.

20. Rutas protegidas

Las rutas que requieran autenticación o permisos deben utilizar el mecanismo de protección existente.

Ejemplo:

/private
    ↓
auth
    ↓
permission
    ↓
page

No confiar únicamente en ocultar elementos visuales.

21. Listados

Los listados deben utilizar el componente estándar existente cuando sea posible.

Ejemplo:

ListTableSimple

o el componente equivalente que utilice actualmente el proyecto.

Mantener:

Paginación.

Loading.

Empty state.

Error state.

Filtros.

Ordenamiento si existe.

Responsive.

22. Paginación

La paginación debe ser controlada por el backend cuando el endpoint sea paginado.

No descargar todos los registros para después paginarlos en React.

Flujo:

Frontend
page=2
limit=10
   ↓
Backend
   ↓
10 registros

El componente de paginación debe recibir los datos necesarios.

23. Filtros

Los filtros deben respetar el comportamiento del backend.

Si el API utiliza:

?q=honda

el frontend debe enviar la consulta al backend.

No:

obtener todos
↓
filter(...)

si el backend ya soporta búsqueda.

24. Debounce

Para búsquedas mientras el usuario escribe:

Usuario escribe
↓
debounce
↓
API
↓
resultados

Evitar lanzar una solicitud por cada tecla si el patrón del proyecto utiliza debounce.

Ejemplo:

H
Ho
Hon
Hond
Honda

debe convertirse en una cantidad razonable de consultas.

25. Autocomplete remoto

Los Autocomplete conectados al backend deben separar:

value

de:

inputValue

Ejemplo conceptual:

value
→ objeto seleccionado

inputValue
→ texto que está escribiendo el usuario

Esto es especialmente importante para:

Marca.

Línea.

Cilindrada.

Cliente.

Producto.

Cuenta.

Caja.

Categoría.

El usuario debe poder escribir libremente.

26. Evitar errores comunes con Autocomplete

No controlar incorrectamente:

value
inputValue
onChange
onInputChange

No reemplazar el texto escrito por el valor seleccionado accidentalmente.

No bloquear el input mientras se consulta el API.

27. Modales

Los modales deben utilizar el componente estándar del sistema.

Un modal debe:

Tener propósito claro.

Mostrar título.

Explicar acciones destructivas o sensibles.

Permitir cancelar.

Bloquear correctamente durante una operación.

Mostrar errores.

Cerrar únicamente cuando corresponde.

28. Confirmaciones

Las acciones críticas requieren confirmación.

Ejemplos:

Eliminar.

Desasociar.

Cambiar moneda.

Forzar stock.

Cambiar imagen principal.

Eliminar imagen.

Finalizar venta.

Anular operación.

La confirmación debe explicar qué ocurrirá.

No utilizar simplemente:

¿Está seguro?

si la acción tiene consecuencias importantes.

29. Operaciones financieras

Las operaciones financieras deben tener UX especialmente clara.

Ejemplos:

Finalizar venta
Crear movimiento
Transferir dinero
Cambiar moneda
Forzar stock

Mostrar:

Resumen.

Moneda.

Monto.

Cuenta/caja.

Estado de operación.

Loading.

Error.

Confirmación.

Evitar acciones ambiguas.

30. Montos y monedas

Utilizar el helper global del proyecto para dinero.

Ejemplo:

formatMoney(...)

No repetir manualmente:

`Q ${amount.toFixed(2)}`

en cada componente.

La representación debe respetar la moneda correspondiente.

31. Fechas

Utilizar el helper o librería estándar existente.

No implementar diferentes formatos manualmente en cada módulo.

Mantener un formato consistente.

32. Archivos e imágenes

La interfaz debe trabajar con el contrato del Storage/API.

El frontend no debe asumir cómo se almacena una imagen.

No debe conocer:

R2
S3
bucket
credentials

El frontend solamente debe recibir y utilizar la URL o identificador que el backend entregue.

33. Upload

Las cargas deben contemplar:

Loading.

Validación de tipo.

Validación de tamaño.

Error.

Preview cuando corresponda.

Eliminación/cancelación si aplica.

Para imágenes, utilizar las funciones de compresión/calidad existentes cuando el proyecto las requiera.

34. Tablas vs Cards

No todos los datos deben mostrarse en tablas.

Elegir la representación según el contenido.

Ejemplo:

Caja
→ Card estilo cuenta/caja

Cuenta bancaria
→ Card estilo cuenta bancaria

Mientras que:

Historial
→ Tabla

Mantener paginación aunque se utilicen Cards.

El componente debe recibir los datos del endpoint y encargarse únicamente de presentarlos.

35. Tabs

Los Tabs deben representar secciones claramente relacionadas.

Ejemplo:

Mi sucursal
├── Información general
├── Cajas
└── Cuentas bancarias

No crear una pantalla nueva si una sección naturalmente pertenece al detalle mediante un tab.

36. Responsive

Toda nueva interfaz debe funcionar correctamente en:

Desktop.

Tablet.

Mobile.

No diseñar únicamente pensando en desktop.

En móvil:

Las columnas pueden convertirse en bloques.

Las imágenes pueden pasar arriba.

Los filtros pueden reorganizarse.

Las tablas pueden convertirse en Cards cuando corresponda.

Los botones deben seguir siendo accesibles.

37. Diseño

Mantener la línea gráfica existente.

Antes de crear un diseño nuevo:

Buscar un módulo similar.

Reutilizar componentes.

Revisar espaciados.

Revisar tipografía.

Revisar bordes.

Revisar colores.

Revisar estados.

Revisar responsive.

El módulo de Sucursales, por ejemplo, puede utilizarse como referencia cuando se solicite explícitamente ese patrón.

38. Estados de UI

Una pantalla debe contemplar como mínimo:

Loading
Success
Empty
Error

Ejemplo:

Cargando productos...

No existen productos.

Error al obtener productos.

Productos encontrados.

No dejar una pantalla vacía cuando el API falla.

39. Empty States

Un listado vacío debe explicar qué ocurre.

Ejemplo:

No hay cuentas bancarias asociadas

y cuando tenga sentido:

+ Agregar cuenta

No mostrar simplemente una tabla vacía.

40. Acciones condicionadas

Los botones pueden depender de:

Permisos.

Estado del registro.

Estado del proceso.

Existencia de datos.

Selección actual.

Ejemplo:

Servicio = RECEPCION
→ permitir editar

Servicio = FINALIZADO
→ no permitir editar

Estas condiciones deben ser claras y centralizadas cuando sea posible.

41. Estados de procesos

Cuando un proceso tenga múltiples pasos, la UI debe representar claramente el estado.

Ejemplo:

Recepción
→ Servicio
→ Pruebas
→ Listo
→ Finalizado

No permitir acciones que no correspondan al estado actual.

42. Operaciones largas

Para procesos importantes puede utilizarse una pantalla de progreso.

Ejemplo:

✓ Obtención de IP
✓ Configuración de token
✓ Guardando datos
● Finalizando

Esto es especialmente útil para:

Asociación de dispositivos.

Procesamiento de archivos.

Operaciones financieras complejas.

Procesos con múltiples llamadas.

43. Notificaciones

Utilizar el sistema existente de:

Snackbar.

Toast.

Alert.

Dialog.

No mezclar varias librerías para realizar la misma función.

Las notificaciones deben indicar:

Éxito.

Error.

Advertencia.

Información.

44. Confirmación de éxito

Después de una operación exitosa, la UI debe actualizar el estado necesario.

No depender únicamente de:

"Guardado correctamente"

si la pantalla debe reflejar inmediatamente el nuevo dato.

Puede utilizar:

Refetch.

Actualización local.

Invalidación de query.

Actualización del store.

según el patrón existente.

45. Navegación

Después de una operación, navegar únicamente cuando corresponda.

Ejemplo:

Crear producto
→ detalle producto

o:

Crear registro
→ listado

No navegar automáticamente si el usuario necesita continuar editando.

46. Parámetros de URL

Cuando una pantalla depende de un ID:

/productos/:id

validar que el ID exista antes de realizar la consulta.

Si el ID no es válido:

mostrar error.

redirigir.

o mostrar estado correspondiente.

No ejecutar llamadas innecesarias.

47. LocalStorage

Utilizar localStorage únicamente para información que realmente deba persistir en el navegador.

Ejemplos válidos según el sistema:

token autorizado de caja
id de caja asociada
preferencias

No almacenar:

Contraseñas.

PIN.

Datos sensibles innecesarios.

Respuestas completas del backend sin razón.

Cuando exista un store en memoria para la información de usuario, respetar ese patrón.

48. Tipado de API

Los servicios deben devolver tipos.

Ejemplo:

async listarProductos(): Promise<PaginatedResponse<Producto>> {
    ...
}

Evitar:

Promise<any>

Esto permite detectar cambios del contrato durante desarrollo.

49. Contratos Backend ↔ Frontend

El frontend debe adaptarse al contrato real del backend.

Cuando el backend cambie:

Actualizar interfaces.

Actualizar schemas.

Actualizar services.

Actualizar hooks.

Actualizar componentes.

Revisar estados.

Revisar formularios.

No mantener compatibilidad ficticia con una respuesta antigua si el backend ya cambió intencionalmente.

50. Manejo de cambios de API

Si un endpoint mantiene su URL pero cambia su estructura:

Backend
→ nueva respuesta

Frontend
→ actualizar interface
→ actualizar mapper/adaptador si existe
→ actualizar componentes

Si se requiere compatibilidad temporal, debe implementarse explícitamente, no mediante any o propiedades opcionales indiscriminadas.

51. Adaptadores / Mappers Frontend

Cuando la respuesta del backend no coincide con lo que necesita un componente, puede utilizarse un adaptador.

Ejemplo:

API Response
     ↓
Mapper
     ↓
UI Model
     ↓
Component

Esto evita que componentes visuales conozcan estructuras complejas del API.

52. Evitar lógica de negocio en UI

El frontend puede controlar UX, pero no debe ser la autoridad del negocio.

Incorrecto:

if (stock >= cantidad) {
    finalizarVenta();
}

Esto puede servir como validación visual, pero el backend debe volver a validar.

La UI nunca debe asumir que una condición visual garantiza la operación.

53. Operaciones de stock

En ventas:

Frontend
→ solicita operación

Backend
→ valida stock
→ procesa
→ responde

Si el backend devuelve variantes sin stock:

Frontend
→ muestra modal
→ Cancelar
→ Forzar stock

La decisión real y la autorización deben permanecer en backend.

54. Manejo de operaciones en dos pasos

Para operaciones como:

Finalizar venta
→ detectar stock insuficiente
→ pedir autorización
→ finalizar

el frontend debe conservar el contexto necesario para continuar.

Ejemplo:

Intento de finalizar
       ↓
Backend responde STOCK_INSUFICIENTE
       ↓
guardar contexto
       ↓
mostrar modal
       ↓
PIN
       ↓
backend autoriza
       ↓
continuar operación

No duplicar la lógica de negocio en React.

55. Formularios dinámicos

Cuando un campo dependa de otro:

Tipo de entidad
   ↓
CAJA
   ↓
listar cajas

CUENTA
   ↓
listar cuentas

La UI debe limpiar estados que ya no sean válidos.

Ejemplo:

Selecciona Caja
↓
cambia a Cuenta
↓
limpiar caja seleccionada

Esto evita enviar información inconsistente.

56. Dependencias entre Autocomplete

Ejemplo:

Marca
↓
Línea
↓
Modelo

Cuando cambie el elemento padre:

Marca cambia
↓
limpiar Línea
↓
limpiar Modelo
↓
consultar nuevas opciones

No conservar valores incompatibles.

57. Modales con formularios

Un modal con formulario debe:

Inicializar valores correctamente.

Limpiar estado cuando se cierre si corresponde.

No conservar errores antiguos accidentalmente.

Deshabilitar submit durante loading.

Mostrar errores del API.

Permitir cancelar.

58. Edición

Al entrar a editar:

ID
↓
obtener registro
↓
loading
↓
reset(form)
↓
usuario edita
↓
submit

No mostrar campos vacíos mientras todavía se está cargando información.

59. Crear vs editar

Si crear y editar comparten la mayoría del formulario:

EntidadForm

puede reutilizarse.

La Page determina:

crear

o:

editar

No duplicar todo el formulario.

60. Detalle

El detalle debe mostrar la información relevante del registro.

Si existen relaciones importantes, mostrarlas de manera estructurada.

Ejemplo:

Producto
├── Información
├── Imágenes
├── Variantes
└── Atributos

No mostrar toda la respuesta del backend sin criterio.

61. Listado + Detalle

Mantener una navegación coherente:

Listado
 ↓
Detalle
 ↓
Editar

Los botones y permisos deben respetar el flujo.

62. Performance

Evitar:

Renderizados innecesarios.

Consultas duplicadas.

Fetch dentro de múltiples componentes para el mismo recurso.

Imágenes excesivamente grandes.

Cálculos costosos en cada render.

Utilizar memoización únicamente cuando realmente aporte valor.

No utilizar useMemo/useCallback indiscriminadamente.

63. useEffect

Utilizar useEffect únicamente cuando exista un efecto secundario real.

No utilizarlo para sustituir lógica que puede resolverse directamente con:

Eventos.

React Hook Form.

Hooks de fetching.

Estado derivado.

Evitar cadenas complejas de useEffect.

64. Estado derivado

No guardar en estado información que puede calcularse.

Evitar:

const [total, setTotal] = useState(0);

si:

const total = detalles.reduce(...);

es suficiente.

Esto evita inconsistencias.

65. Accesibilidad

Los componentes deben contemplar:

Labels.

Botones identificables.

Focus.

Navegación por teclado cuando corresponda.

Contraste.

Mensajes de error asociados a campos.

No utilizar únicamente color para comunicar un estado.

66. Formularios y errores

Los errores de campos deben aparecer cerca del campo correspondiente.

Ejemplo:

Número de cuenta
[____________]

Número de cuenta ya registrada.

Los errores generales deben utilizar el sistema de notificaciones correspondiente.

67. Eliminaciones

Una eliminación debe seguir:

Botón eliminar
↓
confirmación
↓
API
↓
loading
↓
éxito/error
↓
actualizar listado

No eliminar visualmente antes de que el backend confirme, salvo que exista una estrategia optimista explícita.

68. Acciones destructivas

Usar visualización diferenciada para acciones destructivas cuando el sistema lo permita.

Ejemplos:

Eliminar
Desactivar
Anular
Desasociar

Siempre explicar consecuencias cuando sean importantes.

69. Datos sensibles

Nunca mostrar innecesariamente:

Tokens.

PIN.

API keys.

Credenciales.

Secretos.

Si un token autorizado debe persistir en localStorage por requisito del sistema, no mostrarlo al usuario ni imprimirlo en logs.

70. Logs

No dejar:

console.log(response);
console.log(token);
console.log(pin);

con información sensible en producción.

Los logs de desarrollo deben eliminarse o controlarse antes de finalizar.

71. Reutilización de helpers

Utilizar helpers globales existentes para:

Moneda.

Fechas.

Errores.

Archivos.

Validaciones.

Formateos.

Permisos.

No duplicar helpers existentes.

72. Componentes de selección

Cuando un selector tenga muchos registros:

Autocomplete

es preferible a un Select gigante.

Si los datos vienen del backend:

Autocomplete remoto

debe utilizar búsqueda remota.

73. Cards

Las Cards deben ser reutilizables cuando exista un patrón repetido.

Ejemplo:

CajaCard
CuentaBancariaCard

Deben recibir datos:

<CajaCard caja={caja} />

No deben realizar por sí mismas toda la carga de datos del módulo.

74. Paginación en Cards

Si una API devuelve:

data
pagination

el componente puede renderizar:

Cards
+
Pagination

No perder la paginación simplemente porque se reemplazó una tabla por Cards.

75. Tablas

Las tablas deben utilizarse cuando los datos sean naturalmente tabulares.

Ejemplos:

Historial.

Detalles de venta.

Movimientos.

Reportes.

Transacciones.

Mantener responsive.

76. Reportes

Los reportes deben separar:

Filtros
KPI
Gráficas
Tablas

No colocar todo en un componente gigante.

Ejemplo:

ReporteFinancieroPage
├── ReporteFilters
├── ReporteKpis
├── ReporteDistribucion
├── ReporteFlujo
└── ReporteDetalle

77. Filtros de fecha

Los filtros deben soportar el contrato del backend.

Ejemplo:

Hoy
Ayer
Últimos 7 días
Último mes
Personalizado

Si se selecciona personalizado:

Fecha inicial
Fecha final

deben habilitarse.

78. MultiSelect

Cuando se permita seleccionar múltiples:

Sucursales
Métodos de pago

usar un componente consistente con el sistema.

Mostrar claramente:

Seleccionados.

Cantidad.

Opción para limpiar.

Estado de loading si consulta API.

79. Permisos en filtros

Ejemplo:

ADMIN_REPORTES

Puede determinar si el usuario puede seleccionar múltiples sucursales.

Frontend:

Tiene permiso
→ selector habilitado

No tiene permiso
→ únicamente su sucursal

Backend:

debe volver a validar

80. Notificaciones persistentes

Para casos como:

Ventas pendientes

puede utilizarse:

campana
+
badge
+
modal

El contador debe provenir del backend cuando represente información real del sistema.

81. Flujos pendientes

Cuando una operación pueda quedar pendiente:

PreVenta

el frontend debe permitir:

listar
→ seleccionar
→ continuar

y no permitir acciones que pertenecen a otra etapa del flujo.

82. Evitar inconsistencias de estado

Después de modificar un recurso:

crear
editar
eliminar

actualizar el estado de la UI.

No dejar:

API = actualizado
UI = antiguo

83. Abort / Race Conditions

En búsquedas remotas:

Honda
↓
consulta A

Honda M
↓
consulta B

Si A responde después de B, no debe sobrescribir los resultados más recientes.

Utilizar el mecanismo de cancelación, request ID o estrategia de fetching que ya utilice el proyecto.

84. Reglas para nuevos módulos

Antes de crear un nuevo módulo:

Buscar módulos similares.

Identificar componentes reutilizables.

Revisar el contrato del backend.

Crear interfaces.

Crear schemas.

Crear services.

Crear hooks si son necesarios.

Crear Pages.

Crear componentes.

Agregar rutas.

Agregar permisos.

Implementar estados.

Probar responsive.

Revisar errores.

85. Checklist de implementación

Arquitectura

El módulo sigue la estructura existente.

No se duplicó lógica existente.

Services separados de componentes.

Hooks utilizados donde corresponde.

Interfaces creadas/actualizadas.

Schemas Zod creados/actualizados.

Formularios

React Hook Form.

Zod.

Errores visibles.

Loading.

Submit bloqueado durante operación.

API

Contrato revisado.

Tipos correctos.

Paginación.

Filtros.

Manejo de errores.

Refetch/actualización después de mutaciones.

Seguridad

Permisos revisados.

Rutas protegidas.

No se almacenan secretos innecesarios.

No se exponen tokens/PIN.

UX

Loading.

Empty state.

Error state.

Confirmaciones.

Notificaciones.

Responsive.

Accesibilidad básica.

Calidad

Componentes menores a 150 líneas cuando sea posible.

No any innecesarios.

No console.log sensibles.

No lógica de negocio crítica en frontend.

No consultas duplicadas.

No filtrado local cuando el API soporta filtros.

No código duplicado.

86. Regla principal

Cuando exista duda sobre dónde colocar una lógica, utilizar esta guía:

Presentación visual
→ Component

Pantalla completa
→ Page

Lógica reutilizable de React
→ Hook

Comunicación con API
→ Service

Validación de formulario
→ Zod Schema

Contrato de datos
→ Interface / Type

Transformación de datos para UI
→ Mapper / Adapter

Estado global
→ Store existente

Navegación
→ Route

Autorización visual
→ Permission

Formularios
→ React Hook Form

Y recordar:

Frontend
    ↓
UX + presentación + validación de entrada
    ↓
API
    ↓
Backend
    ↓
Reglas reales del negocio

El frontend debe ofrecer una experiencia clara y segura al usuario, pero nunca debe convertirse en la autoridad de las reglas del negocio.