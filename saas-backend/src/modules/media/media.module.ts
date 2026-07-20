import { PrismaMediaRepository } from "./infrastructure/prisma-media.repository.js";
import { CrearMediaUseCase } from "./application/crear-media.usecase.js";
import { EliminarMediaUseCase } from "./application/eliminar-media.usecase.js";
import { ReemplazarMediaUseCase } from "./application/reemplazar-media.usecase.js";
import { ListarMediasUseCase } from "./application/listar-medias.usecase.js";
import { MediaController } from "./presentation/media.controller.js";
import { storageProvider } from "../../shared/infrastructure/storage/storage.module.js";
import { PrismaNegocioRepository } from "../negocio/infrastructure/prisma-negocio.repository.js";

import prisma from "@infrastructure/config/prisma.js";

const mediaRepository = new PrismaMediaRepository(prisma as any);
const negocioRepository = new PrismaNegocioRepository(prisma as any);

export const crearMediaUseCase = new CrearMediaUseCase(storageProvider, mediaRepository, negocioRepository);
export const eliminarMediaUseCase = new EliminarMediaUseCase(storageProvider, mediaRepository, negocioRepository);
export const reemplazarMediaUseCase = new ReemplazarMediaUseCase(storageProvider, mediaRepository, negocioRepository);
export const listarMediasUseCase = new ListarMediasUseCase(mediaRepository);

export const mediaController = new MediaController(listarMediasUseCase);
