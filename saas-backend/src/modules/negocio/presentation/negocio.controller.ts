import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";

import ManejadorArchivosUtils from "../infrastructure/utils/manejadorArchivos.utils.js";
import type { RegistrarNegocioUseCase } from "../application/registrar-negocio.usecase.js";
import type { ActualizarNegocioUseCase } from "../application/actualizar-negocio.usecase.js";
import type { ObtenerNegocioUseCase } from "../application/obtener-negocio.usecase.js";
import type { ObtenerMiNegocioUseCase } from "../application/obtener-mi-negocio.usecase.js";
import type { ActualizarMiNegocioUseCase } from "../application/actualizar-mi-negocio.usecase.js";
import type { CambiarMonedaNegocioUseCase } from "../application/cambiar-moneda-negocio.usecase.js";
import type { ObtenerLimitesNegocioUseCase } from "../application/obtener-limites-negocio.usecase.js";

export class NegocioController extends BaseController {

    constructor(
        private readonly registrarNegocioUseCase: RegistrarNegocioUseCase,
        private readonly actualizarNegocioUseCase: ActualizarNegocioUseCase,
        private readonly obtenerNegocioUseCase: ObtenerNegocioUseCase,
        private readonly obtenerMiNegocioUseCase: ObtenerMiNegocioUseCase,
        private readonly actualizarMiNegocioUseCase: ActualizarMiNegocioUseCase,
        private readonly cambiarMonedaNegocioUseCase: CambiarMonedaNegocioUseCase,
        private readonly obtenerLimitesNegocioUseCase: ObtenerLimitesNegocioUseCase
    ) {
        super()
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const negocio = await this.obtenerNegocioUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Negocio obtenido con éxito', negocio))
        } catch (error) {
            next(error)
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const logo = req.file;
            const logoPath = logo ? ManejadorArchivosUtils.formatearRuta(logo.path) : 'uploads/negocios/default.png';

            const negocio = await this.registrarNegocioUseCase.execute(data, logoPath)
            res.status(201).json(Respuesta.exito('Negocio creado con éxito', negocio))
        } catch (error) {
            next(error)
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const data = req.body
            const { negocio_id } = this.obtenerEntorno(res)
            const logo = req.file
            const logoPath = logo ? ManejadorArchivosUtils.formatearRuta(logo.path) : undefined

            const negocio = await this.actualizarNegocioUseCase.execute(id, data, logoPath, negocio_id)
            res.status(200).json(Respuesta.exito('Negocio actualizado con éxito', negocio))
        } catch (error) {
            next(error)
        }
    }

    me = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const negocio = await this.obtenerMiNegocioUseCase.execute(negocio_id);
            res.status(200).json(Respuesta.exito('Negocio obtenido con éxito', negocio))
        } catch (error) {
            next(error)
        }
    }

    editMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const data = req.body
            const logo = req.file
            const logoPath = logo ? ManejadorArchivosUtils.formatearRuta(logo.path) : undefined

            const negocio = await this.actualizarMiNegocioUseCase.execute(negocio_id, data, logoPath)
            res.status(200).json(Respuesta.exito('Negocio actualizado con éxito', negocio))
        } catch (error) {
            next(error)
        }
    }

    cambiarMoneda = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const { moneda_id } = req.body
            const negocio = await this.cambiarMonedaNegocioUseCase.execute(negocio_id, moneda_id)
            res.status(200).json(Respuesta.exito('Moneda actualizada con éxito', negocio))
        } catch (error) {
            next(error)
        }
    }

    limites = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const limites = await this.obtenerLimitesNegocioUseCase.execute(negocio_id)
            res.status(200).json(Respuesta.exito('Límites del negocio obtenidos con éxito', limites))
        } catch (error) {
            next(error)
        }
    }
}
