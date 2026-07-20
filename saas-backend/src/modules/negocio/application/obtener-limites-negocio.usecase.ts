import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";
import { LimiteNegocio, type NegocioLimiteItem } from "../domain/negocio-limite.entity.js";
import type { UsuarioRepository } from "../../usuarios/domain/usuario.repository.js";
import type { SucursalRepository } from "../../sucursal/domain/sucursal.repository.js";
import type { ProductoRepository } from "../../producto/domain/producto.repository.js";
import type { VarianteRepository } from "../../producto/domain/variante.repository.js";
import type { VehiculoRepository } from "../../vehiculo/domain/vehiculo.repository.js";
import type { CajaRepository } from "../../caja/domain/caja.repository.js";
import type { CuentaBancariaRepository } from "../../cuenta-bancaria/domain/cuenta-bancaria.repository.js";

export class ObtenerLimitesNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository,
        private readonly usuarioRepository: UsuarioRepository,
        private readonly sucursalRepository: SucursalRepository,
        private readonly productoRepository: ProductoRepository,
        private readonly varianteRepository: VarianteRepository,
        private readonly vehiculoRepository: VehiculoRepository,
        private readonly cajaRepository: CajaRepository,
        private readonly cuentaBancariaRepository: CuentaBancariaRepository
    ) { }

    async execute(negocioId: string): Promise<{ generales: NegocioLimiteItem[], storage: { storage_bytes_used: number, storage_max_bytes: number | null } }> {
        try {
            const limites = await this.negocioRepository.obtenerLimites(negocioId);

            const [
                usuariosCount,
                sucursalesCount,
                productosCount,
                variantesCount,
                vehiculosCount,
                cajasCount,
                cuentasCount
            ] = await Promise.all([
                this.usuarioRepository.contar(negocioId),
                this.sucursalRepository.contar(negocioId),
                this.productoRepository.contar(negocioId),
                this.varianteRepository.contar(negocioId),
                this.vehiculoRepository.contar(negocioId),
                this.cajaRepository.contar(negocioId),
                this.cuentaBancariaRepository.contar(negocioId)
            ]);

            return {
                generales: [
                    this.buildItem(LimiteNegocio.USUARIOS, limites.max_usuarios, usuariosCount),
                    this.buildItem(LimiteNegocio.SUCURSALES, limites.max_sucursales, sucursalesCount),
                    this.buildItem(LimiteNegocio.PRODUCTOS, limites.max_productos, productosCount),
                    this.buildItem(LimiteNegocio.VARIANTES, limites.max_variantes, variantesCount),
                    this.buildItem(LimiteNegocio.VEHICULOS, limites.max_vehiculos, vehiculosCount),
                    this.buildItem(LimiteNegocio.CAJAS, limites.max_cajas, cajasCount),
                    this.buildItem(LimiteNegocio.CUENTAS_BANCARIAS, limites.max_cuentas_bancarias, cuentasCount)
                ],
                storage: {
                    storage_bytes_used: Number(limites.storage_bytes_used ?? 0),
                    storage_max_bytes: limites.storage_max_bytes ? Number(limites.storage_max_bytes) : null
                }
            };

        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos al obtener límites', 'DATABASE_ERROR', 500)
            }
            throw error;
        }
    }

    private buildItem(nombre: string, maximo: number, utilizados: number): NegocioLimiteItem {
        const ilimitado = maximo === -1;
        const disponibles = ilimitado ? null : Math.max(0, maximo - utilizados);
        
        let porcentaje_utilizado: number | null = null;
        if (!ilimitado) {
            porcentaje_utilizado = maximo > 0 ? (utilizados / maximo) * 100 : 100;
            // Redondear a 2 decimales
            porcentaje_utilizado = Math.round(porcentaje_utilizado * 100) / 100;
        }
        
        const limite_alcanzado = ilimitado ? false : utilizados >= maximo;

        return {
            nombre,
            limite: maximo,
            utilizados,
            disponibles,
            porcentaje_utilizado,
            ilimitado,
            limite_alcanzado
        };
    }
}
