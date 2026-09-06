import type { Request, Response } from "express";
import { ConsultarNitUseCase } from "../../application/use-cases/consultar-nit.usecase.js";
import AppError from "@shared/errors/AppError.js";
import BaseController from "@shared/presentation/base.controller.js";

export class FacturacionController extends BaseController {
    constructor(private readonly consultarNitUseCase: ConsultarNitUseCase) {
        super();
    }

    consultarNit = async (req: Request, res: Response): Promise<void> => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const nit = req.params.nit as string;

            if (!negocio_id) {
                throw new AppError("No se ha proporcionado el ID del negocio", "NEGOCIO_REQUERIDO", 400);
            }

            if (!nit) {
                throw new AppError("El NIT es requerido", "NIT_REQUERIDO", 400);
            }

            const resultado = await this.consultarNitUseCase.execute(nit, negocio_id);
            
            res.json({
                success: true,
                data: resultado
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    errorCode: error.code
                });
            } else {
                console.error("Error inesperado en consultarNit:", error);
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor al consultar NIT",
                    errorCode: "INTERNAL_SERVER_ERROR"
                });
            }
        }
    };
}
