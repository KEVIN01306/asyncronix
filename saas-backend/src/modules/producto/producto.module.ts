import { ActualizarProductoUseCase } from "./application/actualizar-producto.usecase.js";
import { EliminarProductoUseCase } from "./application/eliminar-producto.usecase.js";
import { ObtenerProductoUseCase } from "./application/obtener-producto.usecase.js";
import { ObtenerProductosUseCase } from "./application/obtener-productos.usecase.js";
import { RegistrarProductoUseCase } from "./application/registrar-producto.usecase.js";
import { SubirImagenProductoUseCase } from "./application/subir-imagen-producto.usecase.js";
import { ActualizarImagenProductoUseCase } from "./application/actualizar-imagen-producto.usecase.js";
import { EliminarImagenProductoUseCase } from "./application/eliminar-imagen-producto.usecase.js";
import { EliminarImagenesProductoUseCase } from "./application/eliminar-imagenes-producto.usecase.js";
import { PrismaProductoRepository } from "./infrastructure/prisma-producto.repository.js";
import { ProductoController } from "./presentation/producto.controller.js";
import prisma from "@infrastructure/config/prisma.js";

const productoRepository = new PrismaProductoRepository(prisma);

const obtenerProductoUseCase = new ObtenerProductoUseCase(productoRepository);
const obtenerProductosUseCase = new ObtenerProductosUseCase(productoRepository);
const registrarProductoUseCase = new RegistrarProductoUseCase(productoRepository);
const actualizarProductoUseCase = new ActualizarProductoUseCase(productoRepository);
const eliminarProductoUseCase = new EliminarProductoUseCase(productoRepository);

const subirImagenProductoUseCase = new SubirImagenProductoUseCase(productoRepository);
const actualizarImagenProductoUseCase = new ActualizarImagenProductoUseCase(productoRepository);
const eliminarImagenProductoUseCase = new EliminarImagenProductoUseCase(productoRepository);
const eliminarImagenesProductoUseCase = new EliminarImagenesProductoUseCase(productoRepository);

export const productoController = new ProductoController(
    obtenerProductoUseCase,
    obtenerProductosUseCase,
    registrarProductoUseCase,
    actualizarProductoUseCase,
    eliminarProductoUseCase,
    subirImagenProductoUseCase,
    actualizarImagenProductoUseCase,
    eliminarImagenProductoUseCase,
    eliminarImagenesProductoUseCase
);
