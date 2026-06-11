import type { ProductoCategoria } from "modules/producto/domain/producto.entity.js";
import type { ProductoSimple, ProductoDetalle } from "../../domain/producto.entity.js";

type ProductoConVariantes = ProductoSimple & {
    variantes?: Array<{
        sku: string;
        precio_sugerido: number;
        stock_total: number;
    }>;
};

const mapVariantFields = (producto: ProductoConVariantes) => {
    const variant = producto.variantes?.[0];

    return {
        sku: producto.codigo ?? '',
        precio_sugerido: variant?.precio_sugerido ?? producto.precio_sugerido ?? 0,
        stock_total: variant?.stock_total ?? producto.stock_total ?? 0
    };
};

export class ProductoMapper {
    static mapSimple(producto: ProductoSimple): ProductoSimple {
        const variant = mapVariantFields(producto as ProductoConVariantes);

        return {
            id: producto.id,
            categoria_id: producto.categoria_id,
            marca_id: producto.marca?.id ?? producto.marca_id,
            nombre: producto.nombre,
            codigo: producto.codigo ?? null,
            sku: variant.sku, // Product SKU is its codigo
            descripcion: producto.descripcion ?? null,
            precio_sugerido: variant.precio_sugerido,
            stock_total: variant.stock_total,
            url_imagen: producto.url_imagen,
            activo: producto.activo,
            categoria: producto.categoria ? {
                id: producto.categoria.id,
                categoria: producto.categoria.categoria
            } : null,
            marca: producto.marca ? { id: producto.marca.id, marca: producto.marca.marca } : null
        };
    }

    static mapDetalle(producto: ProductoDetalle): ProductoDetalle {
        const variant = mapVariantFields(producto as ProductoConVariantes);

        return {
            id: producto.id,
            categoria_id: producto.categoria_id,
            marca_id: producto.marca?.id ?? producto.marca_id,
            nombre: producto.nombre,
            codigo: producto.codigo ?? null,
            sku: variant.sku, // Product SKU is its codigo
            descripcion: producto.descripcion ?? null,
            precio_sugerido: variant.precio_sugerido,
            stock_total: variant.stock_total,
            url_imagen: producto.url_imagen,
            activo: producto.activo,
            categoria: producto.categoria ? {
                id: producto.categoria.id,
                categoria: producto.categoria.categoria
            } : null,
            marca: producto.marca ? { id: producto.marca.id, marca: producto.marca.marca } : null,
            negocio: (producto as any).negocio ? { id: (producto as any).negocio.id, slug: (producto as any).negocio.slug } : undefined,
            ...(producto.atributos ? {
                atributos: producto.atributos.map((atributo: any) => ({ id: atributo.id, nombre: atributo.nombre }))
            } : {}),
            variantes: producto.variantes?.map(v => ({
                id: v?.id ?? '',
                sku: v?.sku ?? undefined,
                precio_sugerido: v?.precio_sugerido ?? undefined,
                stock_total: v?.stock_total ?? undefined,
                codigo_barras: (v as any)?.codigo_barras ?? null,
                qr_codigo: (v as any)?.qr_codigo ?? null,
                valores: (v as any)?.valores?.map((val: any) => ({ id: val.id, valor: val.valor, atributo: val.atributo ? { id: val.atributo.id, nombre: val.atributo.nombre } : undefined })) ?? []
            })) ?? []
        };
    }
}

