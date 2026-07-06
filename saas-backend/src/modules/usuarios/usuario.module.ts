import { ActualizarUsuarioUseCase } from "./application/actualizar-usuario.usecase.js";
import { EliminarUsuarioUseCase } from "./application/eliminar-usuario.usecase.js";
import { ObtenerUsuarioUseCase } from "./application/obtener-usuario.usecase.js";
import { ObtenerUsuariosUseCase } from "./application/obtener-usuarios.usecase.js";
import { RegistrarUsuarioUseCase } from "./application/registrar-usuario.usecase.js";
import { ActualizarPerfilUseCase } from "./application/actualizar-perfil.usecase.js";
import { ActualizarAvatarUseCase } from "./application/actualizar-avatar.usecase.js";
import { CambiarPasswordUseCase } from "./application/cambiar-password.usecase.js";
import { ActualizarPinCajaUseCase } from "./application/actualizar-pin-caja.usecase.js";
import { ActualizarPinModeloUseCase } from "./application/actualizar-pin-modelo.usecase.js";
import { ActualizarPinSucursalUseCase } from "./application/actualizar-pin-sucursal.usecase.js";
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
const actualizarPerfilUseCase = new ActualizarPerfilUseCase(usuarioRepository)
const actualizarAvatarUseCase = new ActualizarAvatarUseCase(usuarioRepository)
const cambiarPasswordUseCase = new CambiarPasswordUseCase(usuarioRepository, hashProvider)
const actualizarPinCajaUseCase = new ActualizarPinCajaUseCase(usuarioRepository, hashProvider)
const actualizarPinModeloUseCase = new ActualizarPinModeloUseCase(usuarioRepository, hashProvider)
const actualizarPinSucursalUseCase = new ActualizarPinSucursalUseCase(usuarioRepository, hashProvider)

export const usuarioController = new UsuarioController(
    obtenerUsuarioUseCase,
    obtenerUsuariosUseCase,
    registrarUsuarioUseCase,
    actualizarUsuarioUseCase,
    eliminarUsuarioUseCase,
    actualizarPerfilUseCase,
    actualizarAvatarUseCase,
    cambiarPasswordUseCase,
    actualizarPinCajaUseCase,
    actualizarPinModeloUseCase,
    actualizarPinSucursalUseCase
);