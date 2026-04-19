import { ActualizarUsuarioUseCase } from "./application/actualizar-usuario.usecase.js";
import { EliminarUsuarioUseCase } from "./application/eliminar-usuario.usecase.js";
import { ObtenerUsuarioUseCase } from "./application/obtener-usuario.usecase.js";
import { ObtenerUsuariosUseCase } from "./application/obtener-usuarios.usecase.js";
import { RegistrarUsuarioUseCase } from "./application/registrar-usuario.usecase.js";
import { PrismaUsuarioRepository } from "./infrastructure/prisma-usuario.repository.js";
import { UsuarioController } from "./presentation/usuario.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { Argon2HashProvider } from "@shared/infrastructure/argon2-hash.provider.js";


const usuarioRepository = new PrismaUsuarioRepository(prisma);
const hashProvider = new Argon2HashProvider()

const obtenerUsuarioUseCase = new ObtenerUsuarioUseCase(usuarioRepository);
const obtenerUsuariosUseCase = new ObtenerUsuariosUseCase(usuarioRepository);
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepository, hashProvider)
const actualizarUsuarioUseCase = new ActualizarUsuarioUseCase(usuarioRepository)
const eliminarUsuarioUseCase = new EliminarUsuarioUseCase(usuarioRepository)

export const usuarioController = new UsuarioController(
    obtenerUsuarioUseCase,
    obtenerUsuariosUseCase,
    registrarUsuarioUseCase,
    actualizarUsuarioUseCase,
    eliminarUsuarioUseCase
);