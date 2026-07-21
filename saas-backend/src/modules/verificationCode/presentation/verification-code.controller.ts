import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { CrearVerificationCodeUseCase } from '../application/crear-verification-code.usecase.js';
import type { VerificarEmailUsuarioUseCase } from '../application/verificar-email-usuario.usecase.js';
import type { ObtenerEstadoCodigoUseCase } from '../application/obtener-estado-codigo.usecase.js';
import { TipoVerificacion } from '../domain/verification-code.entity.js';
import type { UsuarioRepository } from '../../usuarios/domain/usuario.repository.js';
import AppError from '@shared/errors/AppError.js';

export class VerificationCodeController extends BaseController {
  constructor(
    private readonly crearVerificationCodeUseCase: CrearVerificationCodeUseCase,
    private readonly verificarEmailUsuarioUseCase: VerificarEmailUsuarioUseCase,
    private readonly obtenerEstadoCodigoUseCase: ObtenerEstadoCodigoUseCase,
    private readonly usuarioRepository: UsuarioRepository
  ) { super(); }

  status = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entorno = this.obtenerEntorno(res);

      const usuario = await this.usuarioRepository.obtener(entorno.id, entorno.negocio_id);
      if (!usuario || !usuario.email) {
        throw new AppError('El usuario no tiene un correo electrónico configurado', 'NO_EMAIL', 400);
      }

      const status = await this.obtenerEstadoCodigoUseCase.run({
        negocio_id: entorno.negocio_id,
        email: usuario.email,
        tipo: TipoVerificacion.REGISTRO_USUARIO,
      });

      res.status(200).json(Respuesta.exito('Estado del código', status));
    } catch (error) { next(error); }
  };

  send = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entorno = this.obtenerEntorno(res);

      const usuario = await this.usuarioRepository.obtener(entorno.id, entorno.negocio_id);

      if (!usuario || !usuario.email) {
        throw new AppError('El usuario no tiene un correo electrónico configurado', 'NO_EMAIL', 400);
      }

      await this.crearVerificationCodeUseCase.run({
        negocio_id: entorno.negocio_id,
        email: usuario.email,
        tipo: TipoVerificacion.REGISTRO_USUARIO,
      });

      res.status(200).json(Respuesta.exito('Código de verificación enviado correctamente', null));
    } catch (error) { next(error); }
  };

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entorno = this.obtenerEntorno(res);

      const usuario = await this.usuarioRepository.obtener(entorno.id, entorno.negocio_id);
      if (!usuario || !usuario.email) {
        throw new AppError('El usuario no tiene un correo electrónico configurado', 'NO_EMAIL', 400);
      }

      const { code } = req.body;

      await this.verificarEmailUsuarioUseCase.run({
        usuario_id: entorno.id,
        negocio_id: entorno.negocio_id,
        email: usuario.email,
        code,
      });

      res.status(200).json(Respuesta.exito('Correo electrónico verificado con éxito', null));
    } catch (error) { next(error); }
  };
}
