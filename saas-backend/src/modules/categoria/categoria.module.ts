import { ActualizarCategoriaUseCase } from "./application/actualizar-categoria.usecase.js";
import { EliminarCategoriaUseCase } from "./application/eliminar-categoria.usecase.js";
import { ObtenerCategoriaUseCase } from "./application/obtener-categoria.usecase.js";
import { ObtenerCategoriasUseCase } from "./application/obtener-categorias.usecase.js";
import { RegistrarCategoriaUseCase } from "./application/registrar-categoria.usecase.js";
import { ObtenerCategoriaJerarquiaUseCase } from "./application/obtener-categoria-jerarquia.usecase.js";
import { ObtenerCategoriasDisponiblesComoPadreUseCase } from "./application/obtener-categorias-disponibles-como-padre.usecase.js";
import { CategoriaJerarquiaService } from "./application/services/categoria-jerarquia.service.js";
import { PrismaCategoriaRepository } from "./infrastructure/prisma-categoria.repository.js";
import { CategoriaController } from "./presentation/categoria.controller.js";
import prisma from "@infrastructure/config/prisma.js";

const categoriaRepository = new PrismaCategoriaRepository(prisma);
const categoriaJerarquiaService = new CategoriaJerarquiaService(categoriaRepository);

const obtenerCategoriaUseCase = new ObtenerCategoriaUseCase(categoriaRepository);
const obtenerCategoriasUseCase = new ObtenerCategoriasUseCase(categoriaRepository);
const registrarCategoriaUseCase = new RegistrarCategoriaUseCase(categoriaRepository);
const actualizarCategoriaUseCase = new ActualizarCategoriaUseCase(categoriaRepository, categoriaJerarquiaService);
const eliminarCategoriaUseCase = new EliminarCategoriaUseCase(categoriaRepository);
const obtenerCategoriaJerarquiaUseCase = new ObtenerCategoriaJerarquiaUseCase(categoriaRepository, categoriaJerarquiaService);
const obtenerCategoriasDisponiblesComoPadreUseCase = new ObtenerCategoriasDisponiblesComoPadreUseCase(categoriaRepository, categoriaJerarquiaService);

export const categoriaController = new CategoriaController(
    obtenerCategoriaUseCase,
    obtenerCategoriasUseCase,
    registrarCategoriaUseCase,
    actualizarCategoriaUseCase,
    eliminarCategoriaUseCase,
    obtenerCategoriaJerarquiaUseCase,
    obtenerCategoriasDisponiblesComoPadreUseCase
);
