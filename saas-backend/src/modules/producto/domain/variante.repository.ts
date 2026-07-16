import type { VarianteActualizar, VarianteCrear, VarianteDetalle } from './variante.entity.js';

export interface VarianteRepository {
    crear(variante: VarianteCrear, negocio_id: string): Promise<VarianteDetalle>;
    actualizar(id: string, variante: VarianteActualizar, negocio_id: string): Promise<VarianteDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<VarianteDetalle | null>;
    obtenerPorCodigo(codigo: string, negocio_id: string): Promise<VarianteDetalle | null>;
    listarPorProducto(producto_id: string, negocio_id: string, sucursal_id?: string): Promise<VarianteDetalle[]>;
    listarPorNegocio(negocio_id: string, sucursal_id?: string): Promise<VarianteDetalle[]>;
    actualizarCodigoBarras(id: string, codigo_barras: string | null, negocio_id: string): Promise<VarianteDetalle>;
    generarQr(id: string, negocio_id: string): Promise<VarianteDetalle>;
    contar(negocio_id: string): Promise<number>;
}
