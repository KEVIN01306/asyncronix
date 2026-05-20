import type { Producto, ProductoCategoria } from "modules/producto/domain/producto.entity.js";
import type { ProductoSimple, ProductoDetalle } from "../../domain/producto.entity.js";

export class ProductoMapper {
    static mapSimple(producto: ProductoSimple): ProductoSimple {
        return {
            id: producto.id,
            categoria_id: producto.categoria_id,
            nombre: producto.nombre,
            codigo: producto.codigo,
            precio_sugerido: producto.precio_sugerido,
            stock_total: producto.stock_total,
            url_imagen: producto.url_imagen,
            qr_imagen: producto.qr_imagen ?? null,
            activo: producto.activo,
            categoria: producto.categoria ? {
                id: producto.categoria.id,
                categoria: producto.categoria.categoria
            } : null
        }
    }

    static mapDetalle(producto: ProductoDetalle): ProductoDetalle {
        return {
            id: producto.id,
            categoria_id: producto.categoria_id,
            nombre: producto.nombre,
            codigo: producto.codigo,
            sku: producto.sku,
            precio_sugerido: producto.precio_sugerido,
            stock_total: producto.stock_total,
            url_imagen: producto.url_imagen,
            qr_imagen: producto.qr_imagen ?? null,
            activo: producto.activo,
            categoria: producto.categoria ? {
                id: producto.categoria.id,
                categoria: producto.categoria.categoria
            } : null
        }
    }
}

