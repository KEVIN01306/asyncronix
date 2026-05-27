import prisma from "@infrastructure/config/prisma.js";
import { PrismaNotificacionRepository } from './infrastructure/prisma-notificacion.repository.js';
import { GuardarTokenNotificacionUseCase } from './application/guardar-token-notificacion.usecase.js';
import { NotificacionController } from './presentation/notificacion.controller.js';
import { PrismaAuthRespository } from "modules/auth/infrastructure/prisma-auth.repository.js";
import { EnviarNotificacionUseCase } from "./application/enviar-notificacion.usecase.js";
import { FirebaseNotificacionRepository } from "./infrastructure/firebase-notificacion.repository.js";

const notificacionRepository = new PrismaNotificacionRepository(prisma);
const fcmRepository = new FirebaseNotificacionRepository();
const authRepository = new PrismaAuthRespository(prisma)
const guardarTokenNotificacionUseCase = new GuardarTokenNotificacionUseCase(notificacionRepository);

export const enviarNotificacionUseCase = new EnviarNotificacionUseCase(fcmRepository, authRepository);

export const notificacionController = new NotificacionController(guardarTokenNotificacionUseCase);