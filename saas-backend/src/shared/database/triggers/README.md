# Auditoría y Tratamiento de Triggers y Procedimientos Almacenados de Inventario

Este documento detalla el análisis arquitectónico, estado y tratamiento de los triggers y procedimientos almacenados del sistema en relación con la centralización de los movimientos de stock (`descontarStock` e `incrementarStock`).

---

## 1. Estado en la Base de Datos

Se realizó una inspección directa del motor MySQL conectado (`SHOW TRIGGERS` y `SHOW PROCEDURE STATUS WHERE Db = DATABASE()`):
- **Triggers activos en base de datos:** Ninguno (`0 triggers instalados`).
- **Procedimientos almacenados activos de inventario:** Ninguno.
- **Archivos en repositorio:** Se encontraron scripts SQL de referencia en `src/shared/database/triggers/`.

---

## 2. Inventario de Triggers de Referencia y Análisis de Impacto

### 2.1. `descontar_stock_lote` (`BEFORE INSERT ON venta_detalles`)
- **Comportamiento original:** Al insertar una fila en `venta_detalles`, consultaba `lotes.cantidad_actual`. Si era menor que `NEW.cantidad`, emitía un error `45000: Stock insuficiente en el lote`. En caso contrario, restaba `cantidad_actual` y desactivaba el lote si llegaba a cero.
- **Deficiencias críticas identificadas:**
  1. **Incompatibilidad con stock negativo:** Bloqueaba las ventas con stock negativo (`SYS_LOTE_NEGATIVO`), que requieren permitir `cantidad_actual < 0`.
  2. **Inconsistencia de agregado:** No actualizaba `variantes_producto.stock_total`, dejando desincronizado el stock global respecto a la suma de lotes.
  3. **Riesgo de doble descuento:** Si la aplicación restaba stock y el trigger se activaba, se descontaba el doble.
- **Decisión:** **Sustituido y superado por `descontarStock()`**. La lógica ahora se ejecuta a nivel de aplicación dentro de la transacción de venta, permitiendo stock negativo cuando corresponde y manteniendo sincronizado `stock_total`. Los archivos SQL se conservan como documentación histórica.

### 2.2. `devolver_stock_lote` (`BEFORE DELETE ON venta_detalles`)
- **Comportamiento original:** Al eliminar una fila de `venta_detalles`, sumaba `OLD.cantidad` al lote correspondiente.
- **Deficiencias críticas identificadas:**
  1. No actualizaba `variantes_producto.stock_total`.
  2. No validaba negocio ni trazabilidad transaccional coordinada con preventas o devoluciones.
- **Decisión:** **Sustituido por `incrementarStock()`**. Invocado directamente por `PrismaVentaRepository.eliminarDetalle()`.

### 2.3. `devolver_stock_venta_anulada` (`BEFORE UPDATE ON ventas`)
- **Comportamiento original:** Al cambiar el estado de una venta a `'ANULADA'`, realizaba un `UPDATE lotes INNER JOIN venta_detalles` sumando las cantidades.
- **Deficiencias críticas identificadas:**
  1. No actualizaba `variantes_producto.stock_total`.
  2. **Riesgo de restitución duplicada:** Cuando una venta cuenta con factura asociada, la anulación puede detonarse desde facturación (`anular-factura`) o desde ventas (`anular-venta`). Un trigger automático a nivel de fila competiría con la restitución de facturación, provocando incremento duplicado del stock.
- **Decisión:** **Sustituido por `incrementarStock()`** coordinado de manera idempotente entre `AnularVentaUseCase` y `AnularFacturaUseCase` / `PrismaFacturaRepository.marcarComoAnulada()`.

### 2.4. `descontar_stock_lote_repuestos` (`BEFORE INSERT ON servicios_repuestos`)
- **Comportamiento original:** Al asociar repuestos a una orden de servicio de taller, descontaba del lote.
- **Deficiencias críticas identificadas:**
  1. No sincronizaba `variantes_producto.stock_total`.
  2. No contemplaba actualizaciones parciales de cantidad (`actualizarCantidadRepuesto`).
- **Decisión:** **Sustituido por `descontarStock()`**. Invocado en `PrismaServicioVehiculoRepository.crearRepuesto()` y `crearRepuestosAtomicos()`.

### 2.5. `devolver_stock_lote_repuestos` (`BEFORE DELETE ON servicios_repuestos`)
- **Comportamiento original:** Al desvincular un repuesto de un servicio, devolvía las unidades al lote.
- **Deficiencias críticas identificadas:**
  1. No sincronizaba `variantes_producto.stock_total`.
- **Decisión:** **Sustituido por `incrementarStock()`**. Invocado en `PrismaServicioVehiculoRepository.eliminarRepuesto()` y en `actualizarCantidadRepuesto()` ante reducciones de cantidad.

---

## 3. Resumen de Decisiones y Garantías Arquitectónicas

1. **Sin doble ejecución:** Ningún trigger de actualización de stock debe desplegarse en la base de datos de producción; la aplicación asume la responsabilidad exclusiva mediante `descontarStock` e `incrementarStock`.
2. **Sincronización Total:** Cada movimiento actualiza tanto `lotes.cantidad_actual` como `variantes_producto.stock_total` de forma atómica dentro de la misma transacción Prisma (`$transaction`).
3. **Consistencia de Concurrencia:** `descontarStock` utiliza cláusulas atómicas condicionadas (`where: { id, cantidad_actual: { gte: cantidad } }, data: { cantidad_actual: { decrement: cantidad } }`) para prevenir condiciones de carrera sin bloqueos pesados de tabla.
4. **Trazabilidad y Stock Negativo:** El soporte para `SYS_LOTE_NEGATIVO` y la regularización de lotes entrantes (`regularizarStockNegativoUseCase`) están garantizados al 100% en la capa de aplicación.
