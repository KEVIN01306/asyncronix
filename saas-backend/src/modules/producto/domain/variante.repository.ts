import type { VarianteActualizar, VarianteCrear, VarianteDetalle } from './variante.entity.js';

export interface VarianteRepository {
    crear(variante: VarianteCrear, negocio_id: string): Promise<VarianteDetalle>;
    actualizar(id: string, variante: VarianteActualizar, negocio_id: string): Promise<VarianteDetalle>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<VarianteDetalle | null>;
    obtenerPorSku(sku: string, negocio_id: string): Promise<VarianteDetalle | null>;
    listarPorProducto(producto_id: string, negocio_id: string): Promise<VarianteDetalle[]>;
    actualizarCodigoBarras(id: string, codigo_barras: string | null, negocio_id: string): Promise<VarianteDetalle>;
    generarQr(id: string, negocio_id: string): Promise<VarianteDetalle>;
    subirImagen(id: string, url_imagen: string, negocio_id: string): Promise<VarianteDetalle>;
}
