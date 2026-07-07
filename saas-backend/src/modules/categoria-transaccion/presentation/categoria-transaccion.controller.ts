import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { ObtenerCategoriasTransaccionUseCase } from '../application/obtener-categorias-transaccion.usecase.js';
import type { ObtenerCategoriaTransaccionUseCase } from '../application/obtener-categoria-transaccion.usecase.js';
import type { RegistrarCategoriaTransaccionUseCase } from '../application/registrar-categoria-transaccion.usecase.js';
import type { ActualizarCategoriaTransaccionUseCase } from '../application/actualizar-categoria-transaccion.usecase.js';
import type { EliminarCategoriaTransaccionUseCase } from '../application/eliminar-categoria-transaccion.usecase.js';

export class CategoriaTransaccionController extends BaseController {
  constructor(
    private readonly obtenerCategoriaTransaccionUseCase: ObtenerCategoriaTransaccionUseCase,
    private readonly obtenerCategoriasTransaccionUseCase: ObtenerCategoriasTransaccionUseCase,
    private readonly registrarCategoriaTransaccionUseCase: RegistrarCategoriaTransaccionUseCase,
    private readonly actualizarCategoriaTransaccionUseCase: ActualizarCategoriaTransaccionUseCase,
    private readonly eliminarCategoriaTransaccionUseCase: EliminarCategoriaTransaccionUseCase
  ) {
    super();
  }

  listar = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { negocio_id } = this.obtenerEntorno(res);
      const { limit, offset, q, tipo } = res.locals.query;
      const page = Math.floor(offset / limit) + 1;
      const { total, data } = await this.obtenerCategoriasTransaccionUseCase.execute(negocio_id, page, limit, { q, tipo });
      res.status(200).json(Respuesta.paginacion('Categorías de transacción obtenidas con éxito', data, total, limit, offset));
    } catch (error) {
      next(error);
    }
  };

  obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { negocio_id } = this.obtenerEntorno(res);
      const categoria = await this.obtenerCategoriaTransaccionUseCase.execute(id, negocio_id);
      res.status(200).json(Respuesta.exito('Categoría de transacción obtenida con éxito', categoria));
    } catch (error) {
      next(error);
    }
  };

  registrar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { negocio_id } = this.obtenerEntorno(res);
      const categoria = await this.registrarCategoriaTransaccionUseCase.execute(req.body, negocio_id);
      res.status(201).json(Respuesta.exito('Categoría de transacción creada con éxito', categoria));
    } catch (error) {
      next(error);
    }
  };

  actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { negocio_id } = this.obtenerEntorno(res);
      const categoria = await this.actualizarCategoriaTransaccionUseCase.execute(id, negocio_id, req.body);
      res.status(200).json(Respuesta.exito('Categoría de transacción actualizada con éxito', categoria));
    } catch (error) {
      next(error);
    }
  };

  eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { negocio_id } = this.obtenerEntorno(res);
      await this.eliminarCategoriaTransaccionUseCase.execute(id, negocio_id);
      res.status(200).json(Respuesta.exito('Categoría de transacción eliminada con éxito', null));
    } catch (error) {
      next(error);
    }
  };
}
