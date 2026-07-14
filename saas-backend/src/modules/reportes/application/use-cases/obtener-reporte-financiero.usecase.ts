import AppError from '@shared/errors/AppError.js';
import type { ReporteRepository } from '../../domain/repositories/reporte.repository.js';
import type { ReporteFinanciero, FiltrosReporteFinanciero } from '../../domain/models/reporte-financiero.model.js';

import type { ExchangeRateProvider } from '@shared/domain/providers/ExchangeRateProvider.js';
import type { NegocioRepository } from 'modules/negocio/domain/negocio.repository.js';

export class ObtenerReporteFinancieroUseCase {
    constructor(
        private readonly reporteRepository: ReporteRepository,
        private readonly negocioRepository: NegocioRepository,
        private readonly exchangeRateProvider: ExchangeRateProvider
    ) { }

    async execute(
        usuario: { id: string, negocio_id: string, sucursal_id?: string | null, permisos: string[] },
        filtrosFront: {
            sucursal_ids?: string[] | undefined;
            fecha_inicio?: string | undefined;
            fecha_fin?: string | undefined;
            metodos_pago?: string[] | undefined;
            entidad_tipos?: ('CAJA' | 'CUENTA')[] | undefined;
        }
    ): Promise<ReporteFinanciero> {

        let sucursalesAFiltrar: string[] = [];

        // Validar permisos de sucursales
        const esAdminReportes = usuario.permisos.includes('ADMIN_REPORTES');

        if (esAdminReportes) {
            // Si es admin y mandó filtro, usar el filtro. Si no, listar de todas.
            if (filtrosFront.sucursal_ids && filtrosFront.sucursal_ids.length > 0) {
                sucursalesAFiltrar = filtrosFront.sucursal_ids;
            }
        } else {
            // Si no es admin, forzosamente solo puede ver su propia sucursal
            if (!usuario.sucursal_id) {
                throw new AppError('Usuario no tiene sucursal asignada', 'SUCURSAL_REQUIRED', 400);
            }
            sucursalesAFiltrar = [usuario.sucursal_id];
        }

        const filtrosDominio: FiltrosReporteFinanciero = {
            negocio_id: usuario.negocio_id,
            sucursal_ids: sucursalesAFiltrar,
        };

        if (filtrosFront.fecha_inicio) filtrosDominio.fecha_inicio = new Date(filtrosFront.fecha_inicio);
        if (filtrosFront.fecha_fin) {
            const end = new Date(filtrosFront.fecha_fin);
            end.setHours(23, 59, 59, 999);
            filtrosDominio.fecha_fin = end;
        }
        if (filtrosFront.metodos_pago) filtrosDominio.metodos_pago = filtrosFront.metodos_pago;
        if (filtrosFront.entidad_tipos) filtrosDominio.entidad_tipos = filtrosFront.entidad_tipos;

        const reporte = await this.reporteRepository.obtenerReporteFinanciero(filtrosDominio);

        // Ajustar el saldo de las cuentas a la moneda base si es necesario
        const negocio = await this.negocioRepository.obtener(usuario.negocio_id);
        const baseCurrency = negocio?.moneda?.codigo || 'USD';

        for (const cuenta of reporte.distribucion.entidades.cuentas) {
            if (cuenta.moneda_codigo && cuenta.moneda_codigo !== baseCurrency) {
                try {
                    // Para pasar de moneda extranjera a moneda base
                    const exchangeRate = await this.exchangeRateProvider.getRate(cuenta.moneda_codigo, baseCurrency);
                    cuenta.tasa_cambio = exchangeRate.rate;
                    cuenta.saldo = cuenta.saldo_original * exchangeRate.rate;
                } catch (e) {
                    console.error(`Error al obtener tasa de cambio para cuenta ${cuenta.id}`, e);
                }
            } else {
                cuenta.tasa_cambio = 1.0;
                cuenta.saldo = cuenta.saldo_original;
            }
        }

        // Recalcular saldo_actual basado en la moneda base
        reporte.conciliacion.saldo_actual =
            reporte.distribucion.entidades.cajas.reduce((acc, c) => acc + c.saldo, 0) +
            reporte.distribucion.entidades.cuentas.reduce((acc, c) => acc + c.saldo, 0);

        reporte.conciliacion.diferencia = reporte.conciliacion.saldo_actual - reporte.conciliacion.saldo_esperado;

        return reporte;
    }
}
