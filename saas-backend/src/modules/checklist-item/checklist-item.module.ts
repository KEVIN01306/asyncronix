import prisma from "@infrastructure/config/prisma.js";
import { ActualizarChecklistItemUseCase } from "./application/actualizar-checklist-item.usecase.js";
import { EliminarChecklistItemUseCase } from "./application/eliminar-checklist-item.usecase.js";
import { ObtenerChecklistItemUseCase } from "./application/obtener-checklist-item.usecase.js";
import { ObtenerChecklistItemsUseCase } from "./application/obtener-checklist-items.usecase.js";
import { RegistrarChecklistItemUseCase } from "./application/registrar-checklist-item.usecase.js";
import { PrismaChecklistItemRepository } from "./infrastructure/prisma-checklist-item.repository.js";
import { ChecklistItemController } from "./presentation/checklist-item.controller.js";

const checklistItemRepository = new PrismaChecklistItemRepository(prisma);

const obtenerChecklistItemsUseCase = new ObtenerChecklistItemsUseCase(checklistItemRepository);
const obtenerChecklistItemUseCase = new ObtenerChecklistItemUseCase(checklistItemRepository);
const registrarChecklistItemUseCase = new RegistrarChecklistItemUseCase(checklistItemRepository);
const actualizarChecklistItemUseCase = new ActualizarChecklistItemUseCase(checklistItemRepository);
const eliminarChecklistItemUseCase = new EliminarChecklistItemUseCase(checklistItemRepository);

export const checklistItemController = new ChecklistItemController(
    obtenerChecklistItemUseCase,
    obtenerChecklistItemsUseCase,
    registrarChecklistItemUseCase,
    actualizarChecklistItemUseCase,
    eliminarChecklistItemUseCase
);
