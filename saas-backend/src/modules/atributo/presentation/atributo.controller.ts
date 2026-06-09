import type { Request, Response, NextFunction } from 'express';
import Respuesta from '@app/http/respuesta.js';
import BaseController from '@shared/presentation/base.controller.js';
import type { PrismaClient } from '@prisma/client';
import { PrismaAtributoRepository } from '../infrastructure/prisma-atributo.repository.js';
import AppError from '@shared/errors/AppError.js';

export class AtributoController extends BaseController {
    private repository: any;

    constructor(prisma: PrismaClient) {
        super();
        this.repository = new PrismaAtributoRepository(prisma);
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const data = await this.repository.listar(negocio_id);
            const atributos = Array.isArray(data) ? data : [];
            res.status(200).json(Respuesta.exito('Atributos obtenidos con exito', {
                data: atributos,
                meta: {
                    total: atributos.length,
                    limit: atributos.length,
                    offset: 0
                }
            }));
        } catch (error) {
            next(error);
        }
    }

    crear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const body = req.body;
            const creado = await this.repository.crear(body, negocio_id);
            res.status(201).json(Respuesta.exito('Atributo creado con exito', creado));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const actualizado = await this.repository.actualizar(id, req.body, negocio_id);
            res.status(200).json(Respuesta.exito('Atributo actualizado con exito', actualizado));
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.repository.eliminar(id, negocio_id);
            res.status(200).json(Respuesta.exito('Atributo eliminado con exito', null));
        } catch (error) {
            next(error);
        }
    }

    // valores
    listarValores = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const atributo = await this.repository.obtener(id, this.obtenerEntorno(res).negocio_id);
            if (!atributo) throw new AppError('Atributo no encontrado', 'ATRIBUTO_NOT_FOUND', 404);
            res.status(200).json(Respuesta.exito('Valores obtenidos', atributo.valores ?? []));
        } catch (error) {
            next(error);
        }
    }

    crearValor = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { valor } = req.body;
            const created = await this.repository.crearValor({ atributo_id: id, valor });
            res.status(201).json(Respuesta.exito('Valor creado', created));
        } catch (error) {
            next(error);
        }
    }

    actualizarValor = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const updated = await this.repository.actualizarValor(id, req.body);
            res.status(200).json(Respuesta.exito('Valor actualizado', updated));
        } catch (error) {
            next(error);
        }
    }

    eliminarValor = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await this.repository.eliminarValor(id);
            res.status(200).json(Respuesta.exito('Valor eliminado', null));
        } catch (error) {
            next(error);
        }
    }
}

export default AtributoController;
