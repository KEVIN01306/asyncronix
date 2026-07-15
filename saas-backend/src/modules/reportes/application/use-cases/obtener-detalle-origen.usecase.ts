import type { ReporteRepository } from '../../domain/repositories/reporte.repository.js';
import type { DetalleOrigenReporte, FiltrosReporteFinanciero } from '../../domain/models/reporte-financiero.model.js';

export class ObtenerDetalleOrigenUseCase {
    constructor(
        private readonly reporteRepository: ReporteRepository
    ) { }

    async execute(
        filtros: any,
        origen: string,
        usuario: any
    ): Promise<DetalleOrigenReporte> {
        // Validación de permisos básicos se asume cubierta por el AuthGuard y RoleGuard (se requiere LEER_REPORTES)

        // Mapear filtros del query a los requeridos por el dominio
        const filtrosDominio: FiltrosReporteFinanciero = {
            negocio_id: usuario.negocio_id,
            sucursal_ids: [],
        };

        // Procesar sucursales
        if (filtros.sucursal_ids) {
            if (Array.isArray(filtros.sucursal_ids)) {
                filtrosDominio.sucursal_ids = filtros.sucursal_ids;
            } else if (typeof filtros.sucursal_ids === 'string') {
                filtrosDominio.sucursal_ids = filtros.sucursal_ids.split(',');
            }
        }

        // Si no es ADMIN_REPORTES, forzamos que solo vea las sucursales donde tiene asignación
        if (!usuario.permisos.includes('ADMIN_REPORTES')) {
            filtrosDominio.sucursal_ids = usuario.sucursales_ids || [];
        } else if (filtrosDominio.sucursal_ids.length === 0 && filtros.sucursal_ids === undefined) {
            // Si es admin y no manda filtro, dejamos sucursal_ids vacío para que traiga de todas
            filtrosDominio.sucursal_ids = [];
        }

        // Procesar fechas
        if (filtros.fecha_inicio) {
            filtrosDominio.fecha_inicio = filtros.fecha_inicio;
        }
        if (filtros.fecha_fin) {
            filtrosDominio.fecha_fin = filtros.fecha_fin;
        }

        // Procesar métodos de pago
        if (filtros.metodos_pago) {
            if (Array.isArray(filtros.metodos_pago)) {
                filtrosDominio.metodos_pago = filtros.metodos_pago;
            } else if (typeof filtros.metodos_pago === 'string') {
                filtrosDominio.metodos_pago = filtros.metodos_pago.split(',');
            }
        }

        // Procesar tipos de entidad
        if (filtros.entidad_tipos) {
            if (Array.isArray(filtros.entidad_tipos)) {
                filtrosDominio.entidad_tipos = filtros.entidad_tipos as ('CAJA' | 'CUENTA')[];
            } else if (typeof filtros.entidad_tipos === 'string') {
                filtrosDominio.entidad_tipos = filtros.entidad_tipos.split(',') as ('CAJA' | 'CUENTA')[];
            }
        }

        const detalle = await this.reporteRepository.obtenerDetallePorOrigen(filtrosDominio, origen);

        return detalle;
    }
}
