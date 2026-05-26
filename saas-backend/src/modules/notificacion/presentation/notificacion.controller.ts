import type { NextFunction, Request, Response } from "express";
import type { GuardarTokenNotificacionUseCase } from '../application/guardar-token-notificacion.usecase.js';
import  AppError  from '../../../shared/errors/AppError.js';
import Respuesta from "../../../app/http/respuesta.js";
import BaseController from "../../../shared/presentation/base.controller.js";


export class NotificacionController extends BaseController{
  constructor(
    private guardarTokenNotificacionUseCase: GuardarTokenNotificacionUseCase

  ) {
    super();
  }

  guardarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {
      const { token } = req.body;
      const { id: usuarioId } = this.obtenerEntorno(res);

      if (!usuarioId) {
        throw new AppError('Usuario no encontrado en el token', "DATA_NOT_FOUND", 401);
      }

      const notificacionToken = await this.guardarTokenNotificacionUseCase.execute(usuarioId, token);

      res.status(201).json(Respuesta.exito('Token FCM guardado correctamente', notificacionToken));
    } catch (error) {
      console.error('Error en NotificacionController.guardarToken:', error);
      next(error);
    }
  }
}
