import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import {
    descontarStock,
    incrementarStock,
    devolverStock,
} from '../application/services/stock-movement.service.js';
import { StockInsuficienteError } from '../domain/errors/stock-insuficiente.error.js';
import { CantidadInvalidaError } from '../domain/errors/cantidad-invalida.error.js';
import { LoteNoEncontradoError } from '../domain/errors/lote-no-encontrado.error.js';
import { RegularizarStockNegativoUseCase } from '../application/regularizar-stock-negativo.usecase.js';
import { PrismaVentaRepository } from '../../ventas/infrastructure/prisma-venta.repository.js';
import { PrismaServicioVehiculoRepository } from '../../servicioVehiculo/infrastructure/prisma-servicio-vehiculo.repository.js';
import { PrismaFacturaRepository } from '../../facturacion/infrastructure/repositories/prisma-factura.repository.js';

const prisma = new PrismaClient();

describe('Centralización de Movimientos de Stock - Pruebas Obligatorias', () => {
    let negocioId: string;
    let sucursalId: string;
    let usuarioId: string;
    let proveedorId: string;
    let categoriaId: string;
    let productoTestId: string;
    let varianteTestId: string;
    let vehiculoId: string;

    const ventaRepo = new PrismaVentaRepository(prisma);
    const servicioRepo = new PrismaServicioVehiculoRepository(prisma);
    const facturaRepo = new PrismaFacturaRepository(prisma);
    const regularizarUseCase = new RegularizarStockNegativoUseCase();

    // Helper para crear un lote de prueba asociado a la variante
    async function crearLoteTest(params: {
        codigo: string;
        cantidad: number;
        costo?: number;
        precio?: number;
        activo?: boolean;
    }) {
        const lote = await prisma.lote.create({
            data: {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                variante_id: varianteTestId,
                proveedor_id: proveedorId,
                codigo_lote: params.codigo,
                cantidad_inicial: params.cantidad,
                cantidad_actual: params.cantidad,
                costo_compra: params.costo ?? 10.0,
                precio_venta: params.precio ?? 25.0,
                fecha_ingreso: new Date(),
                activo: params.activo ?? params.cantidad > 0,
            },
        });

        // Actualizar stock_total en la variante
        await prisma.varianteProducto.update({
            where: { id: varianteTestId },
            data: { stock_total: { increment: params.cantidad } },
        });

        return lote;
    }

    before(async () => {
        // Cargar o verificar tenant base existente
        const negocio = await prisma.negocio.findFirst({
            include: { sucursales: true, usuarios: true },
        });
        assert.ok(negocio, 'Debe existir un negocio en la base de datos');
        assert.ok(negocio.sucursales.length > 0, 'Debe existir al menos una sucursal');
        assert.ok(negocio.usuarios.length > 0, 'Debe existir al menos un usuario');
        negocioId = negocio.id;
        sucursalId = negocio.sucursales[0]!.id;
        usuarioId = negocio.usuarios[0]!.id;

        const prov = await prisma.proveedor.findFirst({ where: { negocio_id: negocioId } });
        assert.ok(prov, 'Debe existir un proveedor en la base de datos');
        proveedorId = prov.id;

        const cat = await prisma.categoriaProducto.findFirst({ where: { negocio_id: negocioId } });
        assert.ok(cat, 'Debe existir una categoría en la base de datos');
        categoriaId = cat.id;

        const vehiculo = await prisma.vehiculo.findFirst({ where: { negocio_id: negocioId } });
        if (vehiculo) {
            vehiculoId = vehiculo.id;
        } else {
            const nuevoVehiculo = await prisma.vehiculo.create({
                data: {
                    negocio_id: negocioId,
                    placa: `TEST-${Date.now().toString().slice(-4)}`,
                    marca: 'Toyota',
                    modelo: 'Corolla',
                    anio: 2020,
                },
            });
            vehiculoId = nuevoVehiculo.id;
        }

        // Crear Producto y Variante exclusivos para el suite de pruebas
        const prod = await prisma.producto.create({
            data: {
                negocio_id: negocioId,
                categoria_id: categoriaId,
                nombre: `Producto Test Stock ${Date.now()}`,
                descripcion: 'Producto para pruebas de consistencia de stock',
                activo: true,
            },
        });
        productoTestId = prod.id;

        const variante = await prisma.varianteProducto.create({
            data: {
                producto_id: prod.id,
                negocio_id: negocioId,
                sku: `SKU-STOCK-${Date.now()}`,
                precio_sugerido: 25.0,
                stock_total: 0,
                activo: true,
            },
        });
        varianteTestId = variante.id;
    });

    after(async () => {
        // Limpieza de datos creados en el test suite
        try {
            await prisma.servicioRepuesto.deleteMany({
                where: { variante_id: varianteTestId },
            });
            await prisma.ventaDetalle.deleteMany({
                where: { variante_id: varianteTestId },
            });
            await prisma.lote.deleteMany({
                where: { variante_id: varianteTestId },
            });
            await prisma.varianteProducto.deleteMany({
                where: { id: varianteTestId },
            });
            await prisma.producto.deleteMany({
                where: { id: productoTestId },
            });
        } catch (e) {
            console.warn('Error en cleanup final de pruebas:', e);
        } finally {
            await prisma.$disconnect();
        }
    });

    // =========================================================================
    // 1. Descuento válido de stock de un lote
    // =========================================================================
    test('1. Descuento válido de stock de un lote', async () => {
        const lote = await crearLoteTest({ codigo: 'LOTE-T1', cantidad: 20 });

        const resultado = await descontarStock(prisma, {
            lote_id: lote.id,
            cantidad: 5,
            negocio_id: negocioId,
        });

        assert.strictEqual(resultado.cantidad_anterior, 20);
        assert.strictEqual(resultado.cantidad_modificada, 5);
        assert.strictEqual(resultado.cantidad_actual, 15);
        assert.strictEqual(resultado.activo, true);

        // Verificación directa en base de datos
        const loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 15);
        assert.strictEqual(loteDb?.activo, true);

        const varianteDb = await prisma.varianteProducto.findUnique({ where: { id: varianteTestId } });
        assert.strictEqual(varianteDb?.stock_total, 15);
    });

    // =========================================================================
    // 2. Incremento válido de stock de un lote
    // =========================================================================
    test('2. Incremento válido de stock de un lote', async () => {
        const lote = await prisma.lote.findFirst({
            where: { codigo_lote: 'LOTE-T1', variante_id: varianteTestId },
        });
        assert.ok(lote);

        const resultado = await incrementarStock(prisma, {
            lote_id: lote.id,
            cantidad: 7,
            negocio_id: negocioId,
        });

        assert.strictEqual(resultado.cantidad_anterior, 15);
        assert.strictEqual(resultado.cantidad_modificada, 7);
        assert.strictEqual(resultado.cantidad_actual, 22);

        // Verificación en base de datos
        const loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 22);

        const varianteDb = await prisma.varianteProducto.findUnique({ where: { id: varianteTestId } });
        assert.strictEqual(varianteDb?.stock_total, 22);
    });

    // =========================================================================
    // 3. Intento de descontar una cantidad no permitida por las reglas actuales
    // =========================================================================
    test('3. Intento de descontar una cantidad no permitida por las reglas actuales', async () => {
        const lote = await prisma.lote.findFirst({
            where: { codigo_lote: 'LOTE-T1', variante_id: varianteTestId },
        });
        assert.ok(lote);

        // Cantidad <= 0
        await assert.rejects(
            async () => {
                await descontarStock(prisma, { lote_id: lote.id, cantidad: 0, negocio_id: negocioId });
            },
            (err: any) => err instanceof CantidadInvalidaError
        );

        // Cantidad negativa
        await assert.rejects(
            async () => {
                await descontarStock(prisma, { lote_id: lote.id, cantidad: -4, negocio_id: negocioId });
            },
            (err: any) => err instanceof CantidadInvalidaError
        );

        // Cantidad decimal/no entera
        await assert.rejects(
            async () => {
                await descontarStock(prisma, { lote_id: lote.id, cantidad: 3.5, negocio_id: negocioId });
            },
            (err: any) => err instanceof CantidadInvalidaError
        );

        // Stock insuficiente (intentar descontar 100 cuando hay 22)
        await assert.rejects(
            async () => {
                await descontarStock(prisma, { lote_id: lote.id, cantidad: 100, negocio_id: negocioId });
            },
            (err: any) => err instanceof StockInsuficienteError
        );

        // Verificar que el stock en DB permanece inalterado en 22
        const loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 22);
    });

    // =========================================================================
    // 4. Venta que consume existencias de varios lotes
    // =========================================================================
    test('4. Venta que consume existencias de varios lotes', async () => {
        const loteA = await crearLoteTest({ codigo: 'LOTE-MULTI-A', cantidad: 10 });
        const loteB = await crearLoteTest({ codigo: 'LOTE-MULTI-B', cantidad: 15 });

        // Crear venta consumiendo 4 de loteA y 6 de loteB
        const venta = await prisma.venta.create({
            data: {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                usuario_id: usuarioId,
                total: 250.0,
                total_costo: 100.0,
                estado: 'COMPLETADA',
                detalles: {
                    create: [
                        {
                            variante_id: varianteTestId,
                            lote_id: loteA.id,
                            descripcion: 'Producto parte A',
                            cantidad: 4,
                            precio_unitario: 25.0,
                            costo_unitario: 10.0,
                        },
                        {
                            variante_id: varianteTestId,
                            lote_id: loteB.id,
                            descripcion: 'Producto parte B',
                            cantidad: 6,
                            precio_unitario: 25.0,
                            costo_unitario: 10.0,
                        },
                    ],
                },
            },
            include: { detalles: true },
        });

        // Descontar existencias usando la función centralizada en cada detalle
        for (const detalle of venta.detalles) {
            await descontarStock(prisma, {
                lote_id: detalle.lote_id!,
                cantidad: detalle.cantidad,
                negocio_id: negocioId,
            });
        }

        const loteADb = await prisma.lote.findUnique({ where: { id: loteA.id } });
        const loteBDb = await prisma.lote.findUnique({ where: { id: loteB.id } });

        assert.strictEqual(loteADb?.cantidad_actual, 6); // 10 - 4
        assert.strictEqual(loteBDb?.cantidad_actual, 9); // 15 - 6
    });

    // =========================================================================
    // 5. Adición de repuestos a un servicio
    // =========================================================================
    test('5. Adición de repuestos a un servicio', async () => {
        const loteRep = await crearLoteTest({ codigo: 'LOTE-REP-1', cantidad: 12 });

        const servicio = await prisma.servicio.create({
            data: {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                subtotal: 0,
                total: 0,
                activo: true,
                servicioVehiculo: {
                    create: {
                        vehiculo_id: vehiculoId,
                        kilometraje: 50000,
                        estado: 'RECEPCION',
                    },
                },
            },
        });

        // Agregar repuesto usando el repositorio que implementa descontarStock
        const repuesto = await servicioRepo.crearRepuesto(
            servicio.id,
            {
                lote_id: loteRep.id,
                variante_id: varianteTestId,
                cantidad: 4,
                precio_venta: 25.0,
                costo: 10.0,
            },
            negocioId,
            sucursalId
        );

        assert.ok(repuesto);
        assert.strictEqual(repuesto.cantidad, 4);

        // Verificar en BD que el lote fue descontado en 4 unidades
        const loteDb = await prisma.lote.findUnique({ where: { id: loteRep.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 8); // 12 - 4
    });

    // =========================================================================
    // 6. Eliminación completa de un repuesto de un servicio
    // =========================================================================
    test('6. Eliminación completa de un repuesto de un servicio', async () => {
        const loteRep = await prisma.lote.findFirst({
            where: { codigo_lote: 'LOTE-REP-1', variante_id: varianteTestId },
        });
        assert.ok(loteRep);

        const repuesto = await prisma.servicioRepuesto.findFirst({
            where: { lote_id: loteRep.id, activo: true },
        });
        assert.ok(repuesto);

        // Eliminar repuesto usando el repositorio que implementa incrementarStock
        await servicioRepo.eliminarRepuesto(repuesto.id, repuesto.servicio_id!, negocioId, sucursalId);

        // Verificar que el repuesto fue eliminado y el lote recuperó sus 4 unidades
        const loteDb = await prisma.lote.findUnique({ where: { id: loteRep.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 12); // 8 + 4 = 12

        const repuestoDb = await prisma.servicioRepuesto.findUnique({ where: { id: repuesto.id } });
        assert.strictEqual(repuestoDb, null);
    });

    // =========================================================================
    // 7. Modificación parcial de la cantidad de un repuesto
    // =========================================================================
    test('7. Modificación parcial de la cantidad de un repuesto', async () => {
        const lote = await prisma.lote.findFirst({
            where: { codigo_lote: 'LOTE-REP-1', variante_id: varianteTestId },
        });
        assert.ok(lote);
        // Actualmente lote tiene 12 unidades

        const servicio = await prisma.servicio.findFirst({
            where: { negocio_id: negocioId, activo: true },
        });
        assert.ok(servicio);

        // 1. Agregar repuesto inicial con 5 unidades (lote pasa de 12 a 7)
        const rep = await servicioRepo.crearRepuesto(
            servicio.id,
            {
                lote_id: lote.id,
                variante_id: varianteTestId,
                cantidad: 5,
                precio_venta: 25.0,
                costo: 10.0,
            },
            negocioId,
            sucursalId
        );

        let loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 7);

        // 2. Incrementar repuesto de 5 a 8 unidades (diff +3): debe descontar 3 adicionales
        await servicioRepo.actualizarCantidadRepuesto(rep.id, 8, servicio.id, negocioId, sucursalId);
        loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 4); // 7 - 3 = 4

        // 3. Reducir repuesto de 8 a 3 unidades (diff -5): debe restituir 5 unidades al lote original
        await servicioRepo.actualizarCantidadRepuesto(rep.id, 3, servicio.id, negocioId, sucursalId);
        loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 9); // 4 + 5 = 9

        // Cleanup del repuesto
        await servicioRepo.eliminarRepuesto(rep.id, servicio.id, negocioId, sucursalId);
        loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 12); // 9 + 3 = 12
    });

    // =========================================================================
    // 8. Anulación de una factura con productos provenientes de varios lotes
    // =========================================================================
    test('8. Anulación de una factura con productos provenientes de varios lotes', async () => {
        const loteF1 = await crearLoteTest({ codigo: 'LOTE-FAC-1', cantidad: 10 });
        const loteF2 = await crearLoteTest({ codigo: 'LOTE-FAC-2', cantidad: 15 });

        // Venta que consume 3 de loteF1 y 5 de loteF2
        const venta = await prisma.venta.create({
            data: {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                usuario_id: usuarioId,
                total: 200.0,
                total_costo: 80.0,
                estado: 'COMPLETADA',
                detalles: {
                    create: [
                        {
                            variante_id: varianteTestId,
                            lote_id: loteF1.id,
                            descripcion: 'Línea 1',
                            cantidad: 3,
                            precio_unitario: 25.0,
                            costo_unitario: 10.0,
                        },
                        {
                            variante_id: varianteTestId,
                            lote_id: loteF2.id,
                            descripcion: 'Línea 2',
                            cantidad: 5,
                            precio_unitario: 25.0,
                            costo_unitario: 10.0,
                        },
                    ],
                },
            },
            include: { detalles: true },
        });

        // Descontar existencias
        for (const det of venta.detalles) {
            await descontarStock(prisma, {
                lote_id: det.lote_id!,
                cantidad: det.cantidad,
                negocio_id: negocioId,
            });
        }

        let l1 = await prisma.lote.findUnique({ where: { id: loteF1.id } });
        let l2 = await prisma.lote.findUnique({ where: { id: loteF2.id } });
        assert.strictEqual(l1?.cantidad_actual, 7);  // 10 - 3
        assert.strictEqual(l2?.cantidad_actual, 10); // 15 - 5

        // Crear factura vinculada a la venta
        const numeroFactura = `FAC-TEST-${Date.now()}`;
        const factura = await prisma.factura.create({
            data: {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                usuario_id: usuarioId,
                venta_id: venta.id,
                tipo_dte: 'FACT',
                serie: 'TEST',
                numero_factura: numeroFactura,
                subtotal_sin_iva: 178.57,
                total_impuestos: 21.43,
                total: 200.0,
                estado: 'CERTIFICADA',
                receptor_nit: 'CF',
                receptor_nombre: 'Consumidor Final',
            },
        });

        // Anular la factura mediante PrismaFacturaRepository
        await facturaRepo.marcarComoAnulada(
            factura.id,
            'Anulación por devolución del cliente',
            'ACUSE-SAT-12345',
            '<xml>anulado</xml>'
        );

        // Verificar que ambos lotes recuperaron exactamente sus existencias
        l1 = await prisma.lote.findUnique({ where: { id: loteF1.id } });
        l2 = await prisma.lote.findUnique({ where: { id: loteF2.id } });
        assert.strictEqual(l1?.cantidad_actual, 10); // Restituido a 10
        assert.strictEqual(l2?.cantidad_actual, 15); // Restituido a 15

        // Factura en BD debe estar en estado ANULADA
        const facDb = await prisma.factura.findUnique({ where: { id: factura.id } });
        assert.strictEqual(facDb?.estado, 'ANULADA');
    });

    // =========================================================================
    // 9. Intento de anular o procesar dos veces una misma operación
    // =========================================================================
    test('9. Intento de anular o procesar dos veces una misma operación', async () => {
        const lote = await prisma.lote.findFirst({
            where: { codigo_lote: 'LOTE-FAC-1', variante_id: varianteTestId },
        });
        assert.ok(lote);
        const stockAntes = lote.cantidad_actual;

        const factura = await prisma.factura.findFirst({
            where: { estado: 'ANULADA', negocio_id: negocioId },
        });
        assert.ok(factura);

        // Segundo intento de anulación debe fallar
        await assert.rejects(
            async () => {
                await facturaRepo.marcarComoAnulada(
                    factura.id,
                    'Segundo intento de anulación',
                    'ACUSE-RETRY',
                    '<xml></xml>'
                );
            },
            (err: any) => err.message.includes('ya se encuentra anulada')
        );

        // El stock no debe haber sido duplicado
        const loteDespues = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDespues?.cantidad_actual, stockAntes);
    });

    // =========================================================================
    // 10. Ingreso de un lote con saldo negativo previo
    // =========================================================================
    test('10. Ingreso de un lote con saldo negativo previo', async () => {
        // Crear un lote negativo de sistema con 0 unidades iniciales
        const loteNegativo = await prisma.lote.create({
            data: {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                variante_id: varianteTestId,
                proveedor_id: proveedorId,
                codigo_lote: 'SYS_LOTE_NEGATIVO',
                cantidad_inicial: 0,
                cantidad_actual: 0,
                costo_compra: 0,
                precio_venta: 25.0,
                fecha_ingreso: new Date(),
                activo: true,
            },
        });

        // Simular consumo con saldo negativo usando la función centralizada descontarStock
        await descontarStock(prisma, {
            lote_id: loteNegativo.id,
            cantidad: 5,
            negocio_id: negocioId,
            permitirStockNegativo: true,
        });

        // Crear una venta pendiente vinculada al lote negativo
        const venta = await prisma.venta.create({
            data: {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                usuario_id: usuarioId,
                total: 125.0,
                total_costo: 0,
                estado: 'COMPLETADA',
                detalles: {
                    create: [
                        {
                            variante_id: varianteTestId,
                            lote_id: loteNegativo.id,
                            descripcion: 'Venta con stock negativo',
                            cantidad: 5,
                            precio_unitario: 25.0,
                            costo_unitario: 0,
                        },
                    ],
                },
            },
            include: { detalles: true },
        });

        // Nuevo lote entrante con 12 unidades disponibles
        const nuevoLote = await crearLoteTest({
            codigo: 'LOTE-ENTRANTE-12',
            cantidad: 12,
            costo: 15.0,
            precio: 30.0,
        });

        // Ejecutar regularización dentro de una transacción
        const resRegularizacion = await prisma.$transaction(async (tx) => {
            return await regularizarUseCase.execute(tx, {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                variante_id: varianteTestId,
                lote_nuevo_id: nuevoLote.id,
                stock_nuevo_lote: 12,
            });
        });

        assert.strictEqual(resRegularizacion.regularizacionAutomatica, true);
        assert.strictEqual(resRegularizacion.stockRegularizado, 5);
        assert.strictEqual(resRegularizacion.stockPendiente, 0);

        // Verificar estados en DB:
        // 1. El lote negativo quedó saldado (cantidad_actual = 0 y activo = false)
        const loteNegDb = await prisma.lote.findUnique({ where: { id: loteNegativo.id } });
        assert.strictEqual(loteNegDb?.cantidad_actual, 0);
        assert.strictEqual(loteNegDb?.activo, false);

        // 2. El nuevo lote fue descontado en 5 unidades: quedan 7 disponibles
        const nuevoLoteDb = await prisma.lote.findUnique({ where: { id: nuevoLote.id } });
        assert.strictEqual(nuevoLoteDb?.cantidad_actual, 7); // 12 - 5 = 7
        assert.strictEqual(nuevoLoteDb?.activo, true);

        // 3. El detalle de venta ahora apunta al nuevo lote con el nuevo costo de compra (15.0)
        const detDb = await prisma.ventaDetalle.findUnique({ where: { id: venta.detalles[0].id } });
        assert.strictEqual(detDb?.lote_id, nuevoLote.id);
        assert.strictEqual(Number(detDb?.costo_unitario), 15.0);
    });

    // =========================================================================
    // 11. Ingreso de un lote sin saldo negativo
    // =========================================================================
    test('11. Ingreso de un lote sin saldo negativo', async () => {
        // Ingresar un lote cuando ya no hay deuda pendiente
        const nuevoLote = await crearLoteTest({ codigo: 'LOTE-LIMPIO-10', cantidad: 10 });

        const resRegularizacion = await prisma.$transaction(async (tx) => {
            return await regularizarUseCase.execute(tx, {
                negocio_id: negocioId,
                sucursal_id: sucursalId,
                variante_id: varianteTestId,
                lote_nuevo_id: nuevoLote.id,
                stock_nuevo_lote: 10,
            });
        });

        assert.strictEqual(resRegularizacion.regularizacionAutomatica, false);
        assert.strictEqual(resRegularizacion.stockRegularizado, 0);

        // El lote nuevo conserva íntegras sus 10 unidades
        const loteDb = await prisma.lote.findUnique({ where: { id: nuevoLote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 10);
    });

    // =========================================================================
    // 12. Fallo durante una operación y verificación de que la transacción revierte todos los cambios
    // =========================================================================
    test('12. Fallo durante una operación y verificación de rollback atómico', async () => {
        const lote = await crearLoteTest({ codigo: 'LOTE-ROLLBACK', cantidad: 20 });
        const varianteAntes = await prisma.varianteProducto.findUnique({ where: { id: varianteTestId } });
        const stockTotalAntes = varianteAntes?.stock_total ?? 0;

        await assert.rejects(
            async () => {
                await prisma.$transaction(async (tx) => {
                    // Descontar 5 unidades exitosamente dentro de la transacción
                    await descontarStock(tx, {
                        lote_id: lote.id,
                        cantidad: 5,
                        negocio_id: negocioId,
                    });

                    // Forzar un fallo intencional posterior
                    throw new Error('Error simulado para verificar rollback');
                });
            },
            (err: any) => err.message === 'Error simulado para verificar rollback'
        );

        // Comprobar que en la base de datos el lote y el stock_total volvieron a sus valores originales
        const loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 20);

        const varianteDb = await prisma.varianteProducto.findUnique({ where: { id: varianteTestId } });
        assert.strictEqual(varianteDb?.stock_total, stockTotalAntes);
    });

    // =========================================================================
    // 13. Ejecuciones concurrentes que puedan afectar las mismas existencias
    // =========================================================================
    test('13. Ejecuciones concurrentes que intentan sobrepasar el stock disponible', async () => {
        const lote = await crearLoteTest({ codigo: 'LOTE-CONCURRENTE', cantidad: 10 });

        // Dos operaciones intentan descontar 7 unidades cada una en paralelo (7 + 7 = 14 > 10)
        const resultados = await Promise.allSettled([
            descontarStock(prisma, { lote_id: lote.id, cantidad: 7, negocio_id: negocioId }),
            descontarStock(prisma, { lote_id: lote.id, cantidad: 7, negocio_id: negocioId }),
        ]);

        const exitosas = resultados.filter((r) => r.status === 'fulfilled');
        const fallidas = resultados.filter((r) => r.status === 'rejected');

        // Exactamente una debe haber triunfado y exactamente una debe haber fallado por stock insuficiente
        assert.strictEqual(exitosas.length, 1, 'Exactamente una solicitud concurrente debe tener éxito');
        assert.strictEqual(fallidas.length, 1, 'Exactamente una solicitud concurrente debe fallar');

        const error = (fallidas[0] as PromiseRejectedResult).reason;
        assert.ok(
            error instanceof StockInsuficienteError || error.message.includes('insuficiente'),
            'El error debe ser por stock insuficiente'
        );

        // El stock final en DB debe ser exactamente 3 (10 - 7 = 3)
        const loteDb = await prisma.lote.findUnique({ where: { id: lote.id } });
        assert.strictEqual(loteDb?.cantidad_actual, 3);
    });

    // =========================================================================
    // 14. Consistencia entre el stock de los lotes, el stock total y cualquier saldo derivado
    // =========================================================================
    test('14. Consistencia estricta entre sumatoria de lotes y stock_total de variante', async () => {
        // Sumar todos los lotes activos de la variante de prueba
        const agg = await prisma.lote.aggregate({
            where: {
                variante_id: varianteTestId,
                activo: true,
            },
            _sum: { cantidad_actual: true },
        });

        const sumatoriaLotes = Number(agg._sum.cantidad_actual ?? 0);

        // Consultar el campo agregado varianteProducto.stock_total
        const variante = await prisma.varianteProducto.findUnique({
            where: { id: varianteTestId },
            select: { stock_total: true },
        });

        const stockTotalVariante = Number(variante?.stock_total ?? 0);

        assert.strictEqual(
            sumatoriaLotes,
            stockTotalVariante,
            `Inconsistencia detectada: Sumatoria lotes (${sumatoriaLotes}) !== variante.stock_total (${stockTotalVariante})`
        );
    });
});
