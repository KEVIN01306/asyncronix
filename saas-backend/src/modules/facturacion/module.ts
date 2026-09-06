import { PrismaFacturaRepository } from "./infrastructure/repositories/prisma-factura.repository.js";
import { ObtenerTokenDigifactUseCase } from "./application/use-cases/obtener-token-digifact.usecase.js";
import { CrearYCertificarFacturaUseCase } from "./application/use-cases/crear-y-certificar-factura.usecase.js";
import { AnularFacturaUseCase } from "./application/use-cases/anular-factura.usecase.js";
import { DigifactProvider } from "../../shared/infrastructure/providers/digifact/digifact.provider.js";
import { CloudflareR2StorageProvider } from "../../shared/infrastructure/storage/cloudflare-r2.provider.js";
import prisma from "@infrastructure/config/prisma.js";

const prismaFacturaRepository = new PrismaFacturaRepository(prisma);
const digifactProvider = new DigifactProvider();
const storageProvider = new CloudflareR2StorageProvider();

const obtenerTokenDigifactUseCase = new ObtenerTokenDigifactUseCase(prismaFacturaRepository, digifactProvider);

export const crearYCertificarFacturaUseCase = new CrearYCertificarFacturaUseCase(
    prismaFacturaRepository,
    obtenerTokenDigifactUseCase,
    digifactProvider,
    storageProvider
);

export const anularFacturaUseCase = new AnularFacturaUseCase(
    prismaFacturaRepository,
    digifactProvider,
    obtenerTokenDigifactUseCase,
    storageProvider
);

import { ConsultarNitUseCase } from "./application/use-cases/consultar-nit.usecase.js";
import { FacturacionController } from "./presentation/controllers/facturacion.controller.js";

export const consultarNitUseCase = new ConsultarNitUseCase(
    prismaFacturaRepository,
    digifactProvider,
    obtenerTokenDigifactUseCase
);

export const facturacionController = new FacturacionController(consultarNitUseCase);

// Aquí podrían ir los controllers y definirse el router si el módulo tuviera endpoints públicos,
// pero por ahora solo expone casos de uso para ser llamados internamente por Ventas.
