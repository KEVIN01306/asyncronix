import { PrismaVentaRepository } from "./infrastructure/prisma-venta.repository.js";
import { RegistrarVentaUseCase } from "./application/registrar-venta.usecase.js";
import { ActualizarVentaUseCase } from "./application/actualizar-venta.usecase.js";
import { AnularVentaUseCase } from "./application/anular-venta.usecase.js";
import { ObtenerVentaUseCase } from "./application/obtener-venta.usecase.js";
import { ObtenerVentasUseCase } from "./application/obtener-ventas.usecase.js";
import { VentaController } from "./presentation/venta.controller.js";
import prisma from "@infrastructure/config/prisma.js";


const ventaRepository = new PrismaVentaRepository(prisma);

const registrarVentaUseCase = new RegistrarVentaUseCase(ventaRepository);
const actualizarVentaUseCase = new ActualizarVentaUseCase(ventaRepository);
const anularVentaUseCase = new AnularVentaUseCase(ventaRepository);
const obtenerVentaUseCase = new ObtenerVentaUseCase(ventaRepository);
const obtenerVentasUseCase = new ObtenerVentasUseCase(ventaRepository);

export const ventaController = new VentaController(
    registrarVentaUseCase,
    actualizarVentaUseCase,
    anularVentaUseCase,
    obtenerVentaUseCase,
    obtenerVentasUseCase
);
