import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerVehiculosUseCase } from "../application/obtener-vehiculos.usecase.js";
import type { ObtenerVehiculoUseCase } from "../application/obtener-vehiculo.usecase.js";
import type { ObtenerVehiculoPorPlacaUseCase } from "../application/obtener-vehiculo-por-placa.usecase.js";
import type { RegistrarVehiculoUseCase } from "../application/registrar-vehiculo.usecase.js";
import type { ActualizarVehiculoUseCase } from "../application/actualizar-vehiculo.usecase.js";
import type { SubirAvatarVehiculoUseCase } from "../application/subir-avatar.usecase.js";
import type { SubirCalcomaniaVehiculoUseCase } from "../application/subir-calcomania.usecase.js";
import type { AsociarClienteVehiculoUseCase } from "../application/asociar-cliente.usecase.js";
import type { CrearYAsociarClienteUseCase } from "../application/crear-y-asociar-cliente.usecase.js";
import AppError from "@shared/errors/AppError.js";
import type { IStorageProvider } from "@shared/domain/providers/storage.provider.js";

export class VehiculoController extends BaseController {
    constructor(
        private readonly obtenerVehiculosUseCase: ObtenerVehiculosUseCase,
        private readonly obtenerVehiculoUseCase: ObtenerVehiculoUseCase,
        private readonly obtenerVehiculoPorPlacaUseCase: ObtenerVehiculoPorPlacaUseCase,
        private readonly registrarVehiculoUseCase: RegistrarVehiculoUseCase,
        private readonly actualizarVehiculoUseCase: ActualizarVehiculoUseCase,
        private readonly subirAvatarUseCase: SubirAvatarVehiculoUseCase,
        private readonly subirCalcomaniaUseCase: SubirCalcomaniaVehiculoUseCase,
        private readonly asociarClienteUseCase: AsociarClienteVehiculoUseCase,
        private readonly crearYAsociarClienteUseCase: CrearYAsociarClienteUseCase,
        private readonly storageProvider: IStorageProvider
    ) { super(); }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const query = res.locals.query as any;
            const { limit, offset } = query;
            const page = Math.floor(offset / limit) + 1;
            const filters = {
                q: query.q,
                placa: query.placa,
                vehiculo_tipo_id: query.vehiculo_tipo_id,
                modelo_id: query.modelo_id,
                marca_id: query.marca_id,
                linea_id: query.linea_id,
                cliente_dpi: query.cliente_dpi
            };
            const result = await this.obtenerVehiculosUseCase.execute(negocio_id, page, limit as number, filters) as any;
            res.status(200).json(Respuesta.paginacion('Vehículos obtenidos', result.data, result.total, limit as number, offset as number));
        } catch (error) { next(error); }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const v = await this.obtenerVehiculoUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Vehículo obtenido', v));
        } catch (error) { next(error); }
    }

    obtenerPorPlaca = async (req: Request<{ placa: string }>, res: Response, next: NextFunction) => {
        try {
            const { placa } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const v = await this.obtenerVehiculoPorPlacaUseCase.execute(placa, negocio_id);
            res.status(200).json(Respuesta.exito('Vehículo obtenido por placa', v));
        } catch (error) { next(error); }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const created = await this.registrarVehiculoUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Vehículo creado', created));
        } catch (error) { next(error); }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const updated = await this.actualizarVehiculoUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Vehículo actualizado', updated));
        } catch (error) { next(error); }
    }

    subirAvatar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);
            await this.subirAvatarUseCase.execute(id, negocio_id, req.file);
            res.status(200).json(Respuesta.exito('Avatar actualizado', null));
        } catch (error) { next(error); }
    }

    subirCalcomania = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'FILE_REQUIRED', 400);
            await this.subirCalcomaniaUseCase.execute(id, negocio_id, req.file);
            res.status(200).json(Respuesta.exito('Calcomanía actualizada', null));
        } catch (error) { next(error); }
    }

    asociarCliente = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { nit } = req.body;
            const updated = await this.asociarClienteUseCase.execute(id, nit, negocio_id);
            res.status(200).json(Respuesta.exito('Cliente asociado al vehículo', updated));
        } catch (error) { next(error); }
    }

    crearYAsociarCliente = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const payload = req.body;
            const result = await this.crearYAsociarClienteUseCase.execute(id, payload, negocio_id);
            res.status(201).json(Respuesta.exito('Cliente creado y asociado al vehículo', result));
        } catch (error) { next(error); }
    }
}
