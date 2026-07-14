import AppError from '@shared/errors/AppError.js';
import type { ReporteRepository } from '../../domain/repositories/reporte.repository.js';
import type { ReporteFinanciero, FiltrosReporteFinanciero } from '../../domain/models/reporte-financiero.model.js';

export class ObtenerReporteFinancieroUseCase {
    constructor(
        private readonly reporteRepository: ReporteRepository
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

        // Recalcular saldo_actual basado en la moneda base
        reporte.conciliacion.saldo_actual =
            reporte.distribucion.entidades.cajas.reduce((acc, c) => acc + c.saldo, 0) +
            reporte.distribucion.entidades.cuentas.reduce((acc, c) => acc + c.saldo, 0);

        reporte.conciliacion.diferencia = reporte.conciliacion.saldo_actual - reporte.conciliacion.saldo_esperado;

        return reporte;
    }
}
