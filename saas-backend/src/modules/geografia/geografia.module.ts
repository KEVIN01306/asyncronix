import { PrismaGeografiaRepository } from "./infrastructure/prisma-geografia.repository.js";
import { ObtenerDepartamentosUseCase } from "./application/obtener-departamentos.usecase.js";
import { ObtenerMunicipiosUseCase } from "./application/obtener-municipios.usecase.js";
import { GeografiaController } from "./presentation/geografia.controller.js";

const geografiaRepository = new PrismaGeografiaRepository();

const obtenerDepartamentosUseCase = new ObtenerDepartamentosUseCase(geografiaRepository);
const obtenerMunicipiosUseCase = new ObtenerMunicipiosUseCase(geografiaRepository);

export const geografiaController = new GeografiaController(
    obtenerDepartamentosUseCase,
    obtenerMunicipiosUseCase
);
