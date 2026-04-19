import { ActualizarCategoriaUseCase } from "./application/actualizar-categoria.usecase.js";
import { EliminarCategoriaUseCase } from "./application/eliminar-categoria.usecase.js";
import { ObtenerCategoriaUseCase } from "./application/obtener-categoria.usecase.js";
import { ObtenerCategoriasUseCase } from "./application/obtener-categorias.usecase.js";
import { RegistrarCategoriaUseCase } from "./application/registrar-categoria.usecase.js";
import { PrismaCategoriaRepository } from "./infrastructure/prisma-categoria.repository.js";
import { CategoriaController } from "./presentation/categoria.controller.js";
import prisma from "@infrastructure/config/prisma.js";

const categoriaRepository = new PrismaCategoriaRepository(prisma);

const obtenerCategoriaUseCase = new ObtenerCategoriaUseCase(categoriaRepository);
const obtenerCategoriasUseCase = new ObtenerCategoriasUseCase(categoriaRepository);
const registrarCategoriaUseCase = new RegistrarCategoriaUseCase(categoriaRepository);
const actualizarCategoriaUseCase = new ActualizarCategoriaUseCase(categoriaRepository);
const eliminarCategoriaUseCase = new EliminarCategoriaUseCase(categoriaRepository);

export const categoriaController = new CategoriaController(
    obtenerCategoriaUseCase,
    obtenerCategoriasUseCase,
    registrarCategoriaUseCase,
    actualizarCategoriaUseCase,
    eliminarCategoriaUseCase
);
