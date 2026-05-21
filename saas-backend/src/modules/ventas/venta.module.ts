import { PrismaVentaRepository } from "./infrastructure/prisma-venta.repository.js";
import { RegistrarVentaUseCase } from "./application/registrar-venta.usecase.js";
import { ActualizarVentaUseCase } from "./application/actualizar-venta.usecase.js";
import { AnularVentaUseCase } from "./application/anular-venta.usecase.js";
import { ObtenerVentaUseCase } from "./application/obtener-venta.usecase.js";
import { ObtenerVentasUseCase } from "./application/obtener-ventas.usecase.js";
import { CrearDetalleVentaUseCase } from "./application/crear-detalle-venta.usecase.js";
import { EliminarDetalleVentaUseCase } from "./application/eliminar-detalle-venta.usecase.js";
import { FinalizarVentaUseCase } from "./application/finalizar-venta.usecase.js";
import { VentaController } from "./presentation/venta.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { PrismaLoteRepository } from "../lote/infrastructure/prisma-lote.repository.js";


const ventaRepository = new PrismaVentaRepository(prisma);
const loteRepository = new PrismaLoteRepository(prisma);

const registrarVentaUseCase = new RegistrarVentaUseCase(ventaRepository, loteRepository);
const crearDetalleVentaUseCase = new CrearDetalleVentaUseCase(ventaRepository, loteRepository);
const eliminarDetalleVentaUseCase = new EliminarDetalleVentaUseCase(ventaRepository);
const finalizarVentaUseCase = new FinalizarVentaUseCase(ventaRepository);
const actualizarVentaUseCase = new ActualizarVentaUseCase(ventaRepository);
const anularVentaUseCase = new AnularVentaUseCase(ventaRepository);
const obtenerVentaUseCase = new ObtenerVentaUseCase(ventaRepository);
const obtenerVentasUseCase = new ObtenerVentasUseCase(ventaRepository);

export const ventaController = new VentaController(
    registrarVentaUseCase,
    actualizarVentaUseCase,
    anularVentaUseCase,
    obtenerVentaUseCase,
    obtenerVentasUseCase,
    crearDetalleVentaUseCase,
    eliminarDetalleVentaUseCase,
    finalizarVentaUseCase
);
