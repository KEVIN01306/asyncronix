import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../../shared/presentation/base.controller.js";
import Respuesta from "../../../../app/http/respuesta.js";
import type { ListarFacturasUseCase } from "../../application/use-cases/listar-facturas.usecase.js";
import type { ObtenerResumenFiscalUseCase } from "../../application/use-cases/obtener-resumen-fiscal.usecase.js";
import type { ObtenerDocumentoFacturaUseCase } from "../../application/use-cases/obtener-documento-factura.usecase.js";
import type { ObtenerConfiguracionFiscalUseCase } from "../../application/use-cases/obtener-configuracion-fiscal.usecase.js";
import type { ActualizarConfiguracionFiscalUseCase } from "../../application/use-cases/actualizar-configuracion-fiscal.usecase.js";
import type { ConsultarNitUseCase } from "../../application/use-cases/consultar-nit.usecase.js";

export class FacturacionController extends BaseController {
    constructor(
        private readonly listarFacturasUseCase: ListarFacturasUseCase,
        private readonly obtenerResumenFiscalUseCase: ObtenerResumenFiscalUseCase,
        private readonly obtenerDocumentoFacturaUseCase: ObtenerDocumentoFacturaUseCase,
        private readonly obtenerConfiguracionFiscalUseCase: ObtenerConfiguracionFiscalUseCase,
        private readonly actualizarConfiguracionFiscalUseCase: ActualizarConfiguracionFiscalUseCase,
        private readonly consultarNitUseCase: ConsultarNitUseCase
    ) {
        super();
    }

    listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const querySource = (res.locals.query || req.query) as any;

            const resultado = await this.listarFacturasUseCase.execute({
                negocio_id,
                periodo: querySource.periodo,
                fecha_inicio: querySource.fecha_inicio,
                fecha_fin: querySource.fecha_fin,
                page: querySource.page,
                limit: querySource.limit,
                q: querySource.q
            });

            res.status(200).json(Respuesta.exito("Facturas emitidas obtenidas correctamente", resultado));
        } catch (error) {
            next(error);
        }
    };

    resumen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const querySource = (res.locals.query || req.query) as any;

            const resultado = await this.obtenerResumenFiscalUseCase.execute({
                negocio_id,
                periodo: querySource.periodo,
                fecha_inicio: querySource.fecha_inicio,
                fecha_fin: querySource.fecha_fin
            });

            res.status(200).json(Respuesta.exito("Resumen fiscal obtenido correctamente", resultado));
        } catch (error) {
            next(error);
        }
    };

    obtenerConfiguracion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const config = await this.obtenerConfiguracionFiscalUseCase.execute(negocio_id);

            res.status(200).json(Respuesta.exito("Configuración fiscal obtenida correctamente", config));
        } catch (error) {
            next(error);
        }
    };

    actualizarConfiguracion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const resultado = await this.actualizarConfiguracionFiscalUseCase.execute(negocio_id, req.body);

            res.status(200).json(Respuesta.exito("Configuración fiscal actualizada correctamente", resultado));
        } catch (error) {
            next(error);
        }
    };

    descargarDocumento = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { id, tipo } = req.params as { id: string; tipo: 'xml' | 'pdf' };

            const resultado = await this.obtenerDocumentoFacturaUseCase.execute(id, tipo, negocio_id);

            res.status(200).json(Respuesta.exito("Documento obtenido correctamente", resultado));
        } catch (error) {
            next(error);
        }
    };

    consultarNit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const nit = req.params.nit as string;

            const resultado = await this.consultarNitUseCase.execute(nit, negocio_id);

            res.status(200).json(Respuesta.exito("Información de NIT obtenida", resultado));
        } catch (error) {
            next(error);
        }
    };
}
