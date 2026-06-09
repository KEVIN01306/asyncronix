import { PrismaVentaRepository } from "./infrastructure/prisma-venta.repository.js";
import { RegistrarVentaUseCase } from "./application/registrar-venta.usecase.js";
import { ActualizarVentaUseCase } from "./application/actualizar-venta.usecase.js";
import { AnularVentaUseCase } from "./application/anular-venta.usecase.js";
import { ObtenerVentaUseCase } from "./application/obtener-venta.usecase.js";
import { ObtenerVentasUseCase } from "./application/obtener-ventas.usecase.js";
import { CrearDetalleVentaUseCase } from "./application/crear-detalle-venta.usecase.js";
import { CrearDetalleVentaPorSkuUseCase } from "./application/crear-detalle-venta-por-sku.usecase.js";
import { BuscarProductoPorSkuUseCase } from "./application/buscar-producto-por-sku.usecase.js";
import { EliminarDetalleVentaUseCase } from "./application/eliminar-detalle-venta.usecase.js";
import { FinalizarVentaUseCase } from "./application/finalizar-venta.usecase.js";
import { BuscarClientePorNitVentaUseCase } from "./application/buscar-cliente-por-nit.usecase.js";
import { RegistrarClienteParaVentaUseCase } from "./application/registrar-cliente-para-venta.usecase.js";
import { VentaController } from "./presentation/venta.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { PrismaLoteRepository } from "../lote/infrastructure/prisma-lote.repository.js";
import { PrismaProductoRepository } from "../producto/infrastructure/prisma-producto.repository.js";
import { PrismaVarianteRepository } from "../producto/infrastructure/prisma-variante.repository.js";
import { PrismaClienteRepository } from "../cliente/infrastructure/prisma-cliente.repository.js";


const ventaRepository = new PrismaVentaRepository(prisma);
const loteRepository = new PrismaLoteRepository(prisma);
const productoRepository = new PrismaProductoRepository(prisma);
const varianteRepository = new PrismaVarianteRepository(prisma);
const clienteRepository = new PrismaClienteRepository(prisma);

const registrarVentaUseCase = new RegistrarVentaUseCase(ventaRepository, loteRepository, varianteRepository);
const crearDetalleVentaUseCase = new CrearDetalleVentaUseCase(ventaRepository, loteRepository, varianteRepository);
const crearDetalleVentaPorSkuUseCase = new CrearDetalleVentaPorSkuUseCase(ventaRepository, loteRepository, varianteRepository);
const buscarProductoPorSkuUseCase = new BuscarProductoPorSkuUseCase(varianteRepository);
const eliminarDetalleVentaUseCase = new EliminarDetalleVentaUseCase(ventaRepository);
const finalizarVentaUseCase = new FinalizarVentaUseCase(ventaRepository);
const actualizarVentaUseCase = new ActualizarVentaUseCase(ventaRepository);
const anularVentaUseCase = new AnularVentaUseCase(ventaRepository);
const obtenerVentaUseCase = new ObtenerVentaUseCase(ventaRepository);
const obtenerVentasUseCase = new ObtenerVentasUseCase(ventaRepository);
const buscarClientePorNitVentaUseCase = new BuscarClientePorNitVentaUseCase(clienteRepository);
const registrarClienteParaVentaUseCase = new RegistrarClienteParaVentaUseCase(clienteRepository);


export const ventaController = new VentaController(
    registrarVentaUseCase,
    actualizarVentaUseCase,
    anularVentaUseCase,
    obtenerVentaUseCase,
    obtenerVentasUseCase,
    crearDetalleVentaUseCase,
    crearDetalleVentaPorSkuUseCase,
    buscarProductoPorSkuUseCase,
    eliminarDetalleVentaUseCase,
    finalizarVentaUseCase,
    buscarClientePorNitVentaUseCase,
    registrarClienteParaVentaUseCase
);
