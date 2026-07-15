import type { NextFunction, Request, Response } from 'express';
import type { ObtenerReporteFinancieroUseCase } from '../application/use-cases/obtener-reporte-financiero.usecase.js';
import { ObtenerDetalleOrigenUseCase } from '../application/use-cases/obtener-detalle-origen.usecase.js';
import Respuesta from '@app/http/respuesta.js';


export class ReporteController {
    constructor(
        private readonly obtenerReporteFinancieroUseCase: ObtenerReporteFinancieroUseCase,
        private readonly obtenerDetalleOrigenUseCase: ObtenerDetalleOrigenUseCase
    ) { }

    obtenerReporteFinanciero = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuario = (req as any).usuario;
            const filtrosFront = {
                sucursal_ids: req.query.sucursal_ids ? (req.query.sucursal_ids as string).split(',') : undefined,
                fecha_inicio: req.query.fecha_inicio as string,
                fecha_fin: req.query.fecha_fin as string,
                metodos_pago: req.query.metodos_pago ? (req.query.metodos_pago as string).split(',') : undefined,
                entidad_tipos: req.query.entidad_tipos ? (req.query.entidad_tipos as string).split(',') as any : undefined,
            };

            const reporte = await this.obtenerReporteFinancieroUseCase.execute(usuario, filtrosFront);
            res.status(200).json(Respuesta.exito('Reporte financiero obtenido exitosamente', reporte));
        } catch (error) {
            next(error);
        }
    };

    obtenerDetalleOrigen = async (req: any, res: Response): Promise<void> => {
        try {
            const usuario = req.usuario;
            const { origen } = req.params;
            const filtros = req.query;

            const reporte = await this.obtenerDetalleOrigenUseCase.execute(filtros, origen, usuario);

            res.json(Respuesta.exito('Detalle de origen obtenido exitosamente', reporte));
        } catch (error: any) {
            console.error('Error en obtenerDetalleOrigen:', error);
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error interno del servidor',
                code: error.code || 'INTERNAL_SERVER_ERROR'
            });
        }
    };
}
