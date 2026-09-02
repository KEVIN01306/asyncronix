import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerDepartamentosUseCase } from "../application/obtener-departamentos.usecase.js";
import type { ObtenerMunicipiosUseCase } from "../application/obtener-municipios.usecase.js";
import AppError from "@shared/errors/AppError.js";

export class GeografiaController extends BaseController {
    constructor(
        private readonly obtenerDepartamentosUseCase: ObtenerDepartamentosUseCase,
        private readonly obtenerMunicipiosUseCase: ObtenerMunicipiosUseCase
    ) { super(); }

    departamentos = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const pais_id = req.query.pais_id as string;
            if (!pais_id) {
                throw new AppError('El parámetro pais_id es requerido', 'BAD_REQUEST', 400);
            }
            const departamentos = await this.obtenerDepartamentosUseCase.execute(pais_id);
            res.status(200).json(Respuesta.exito('Departamentos obtenidos con éxito', departamentos));
        } catch (error) {
            next(error);
        }
    }

    municipios = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const departamento_id = req.query.departamento_id as string;
            if (!departamento_id) {
                throw new AppError('El parámetro departamento_id es requerido', 'BAD_REQUEST', 400);
            }
            const municipios = await this.obtenerMunicipiosUseCase.execute(departamento_id);
            res.status(200).json(Respuesta.exito('Municipios obtenidos con éxito', municipios));
        } catch (error) {
            next(error);
        }
    }
}
