import crypto from 'node:crypto';
import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { CajaObtenidoDetalle } from '../domain/caja.entity.js';
import type { CajaRepository } from '../domain/caja.repository.js';
import type { UsuarioRepository } from '../../usuarios/domain/usuario.repository.js';
import type { HashProvider } from '@shared/domain/hash.provider.js';

export class AsociarDispositivoCajaUseCase {
    constructor(
        private readonly cajaRepository: CajaRepository,
        private readonly usuarioRepository: UsuarioRepository,
        private readonly hashProvider: HashProvider
    ) {}

    async execute(
        caja_id: string,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string,
        pin_sucursal: string,
        ip_autorizada: string | null
    ): Promise<CajaObtenidoDetalle> {
        try {
            const pinSucursalHash = await this.usuarioRepository.obtenerPinSucursal(usuario_id, negocio_id);

            if (!pinSucursalHash) {
                throw new AppError('El PIN de sucursal no está configurado', 'PIN_SUCURSAL_NO_CONFIGURADO', 400);
            }

            const coincide = await this.hashProvider.compare(pin_sucursal, pinSucursalHash);
            if (!coincide) {
                throw new AppError('PIN de sucursal inválido', 'PIN_SUCURSAL_INVALIDO', 400);
            }

            const caja = await this.cajaRepository.obtener(caja_id, negocio_id, sucursal_id);
            if (!caja) {
                throw new AppError('Caja no encontrada', 'CAJA_NO_ENCONTRADA', 404);
            }

            if (caja.token_autorizado || caja.ip_autorizada) {
                throw new AppError('La caja ya tiene un dispositivo asociado', 'CAJA_DISPOSITIVO_ASOCIADO', 400);
            }

            const token_autorizado = crypto.randomUUID();
            const asociacion_id = crypto.randomUUID();
            return await this.cajaRepository.asociarDispositivo(caja_id, negocio_id, sucursal_id, token_autorizado, ip_autorizada, asociacion_id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
