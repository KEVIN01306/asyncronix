import { PrismaFacturaRepository } from "./infrastructure/repositories/prisma-factura.repository.js";
import { ObtenerTokenDigifactUseCase } from "./application/use-cases/obtener-token-digifact.usecase.js";
import { CrearYCertificarFacturaUseCase } from "./application/use-cases/crear-y-certificar-factura.usecase.js";
import { AnularFacturaUseCase } from "./application/use-cases/anular-factura.usecase.js";
import { ConsultarNitUseCase } from "./application/use-cases/consultar-nit.usecase.js";
import { ListarFacturasUseCase } from "./application/use-cases/listar-facturas.usecase.js";
import { ObtenerResumenFiscalUseCase } from "./application/use-cases/obtener-resumen-fiscal.usecase.js";
import { ObtenerDocumentoFacturaUseCase } from "./application/use-cases/obtener-documento-factura.usecase.js";
import { ObtenerConfiguracionFiscalUseCase } from "./application/use-cases/obtener-configuracion-fiscal.usecase.js";
import { ActualizarConfiguracionFiscalUseCase } from "./application/use-cases/actualizar-configuracion-fiscal.usecase.js";
import { FacturacionController } from "./presentation/controllers/facturacion.controller.js";
import { DigifactProvider } from "../../shared/infrastructure/providers/digifact/digifact.provider.js";
import { CloudflareR2StorageProvider } from "../../shared/infrastructure/storage/cloudflare-r2.provider.js";
import prisma from "../../infrastructure/config/prisma.js";

export const prismaFacturaRepository = new PrismaFacturaRepository(prisma);
const digifactProvider = new DigifactProvider();
const storageProvider = new CloudflareR2StorageProvider();

export const obtenerTokenDigifactUseCase = new ObtenerTokenDigifactUseCase(
    prismaFacturaRepository, 
    digifactProvider
);

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

export const consultarNitUseCase = new ConsultarNitUseCase(
    prismaFacturaRepository,
    digifactProvider,
    obtenerTokenDigifactUseCase
);

export const listarFacturasUseCase = new ListarFacturasUseCase(prismaFacturaRepository);
export const obtenerResumenFiscalUseCase = new ObtenerResumenFiscalUseCase(prismaFacturaRepository);
export const obtenerDocumentoFacturaUseCase = new ObtenerDocumentoFacturaUseCase(prismaFacturaRepository);
export const obtenerConfiguracionFiscalUseCase = new ObtenerConfiguracionFiscalUseCase(prismaFacturaRepository);
export const actualizarConfiguracionFiscalUseCase = new ActualizarConfiguracionFiscalUseCase(prismaFacturaRepository);

export const facturacionController = new FacturacionController(
    listarFacturasUseCase,
    obtenerResumenFiscalUseCase,
    obtenerDocumentoFacturaUseCase,
    obtenerConfiguracionFiscalUseCase,
    actualizarConfiguracionFiscalUseCase,
    consultarNitUseCase
);
