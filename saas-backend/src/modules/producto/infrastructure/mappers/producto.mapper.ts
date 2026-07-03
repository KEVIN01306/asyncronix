import type { ProductoCategoria } from "modules/producto/domain/producto.entity.js";
import type { ProductoSimple, ProductoDetalle } from "../../domain/producto.entity.js";

type ProductoConVariantes = ProductoSimple & {
    variantes?: Array<{
        sku: string;
        correlativo?: string | null;
        precio_sugerido: number;
        stock_total: number;
        codigo_barras?: string | null;
        qr_codigo?: string | null;
    }>;
};

const mapVariantFields = (producto: ProductoConVariantes) => {
    const variant = producto.variantes?.[0];
    const imagenPrincipal = (producto as any).imagenes?.find((img: any) => img.es_principal) ?? (producto as any).imagenes?.[0];

    return {
        sku: producto.sku ?? '',
        precio_sugerido: variant?.precio_sugerido ?? producto.precio_sugerido ?? 0,
        stock_total: variant?.stock_total ?? producto.stock_total ?? 0,
        url_imagen: imagenPrincipal?.url ?? null
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
            sku: variant.sku,
            descripcion: producto.descripcion ?? null,
            precio_sugerido: variant.precio_sugerido,
            stock_total: variant.stock_total,
            url_imagen: variant.url_imagen,
            activo: producto.activo,
                categoria: producto.categoria ? {
                    id: producto.categoria.id,
                    categoria: producto.categoria.categoria,
                    categoria_padre_id: producto.categoria.categoria_padre_id ?? undefined
                } : null,
            marca: producto.marca ? { id: producto.marca.id, marca: producto.marca.marca } : null
        };
    }

    static mapDetalle(producto: any): ProductoDetalle {
        const variant = mapVariantFields(producto as ProductoConVariantes);

        return {
            id: producto.id,
            categoria_id: producto.categoria_id,
            marca_id: producto.marca?.id ?? producto.marca_id,
            nombre: producto.nombre,
            sku: variant.sku,
            descripcion: producto.descripcion ?? null,
            precio_sugerido: variant.precio_sugerido,
            stock_total: variant.stock_total,
            url_imagen: variant.url_imagen,
            activo: producto.activo,
                categoria: producto.categoria ? {
                    id: producto.categoria.id,
                    categoria: producto.categoria.categoria,
                    categoria_padre_id: producto.categoria.categoria_padre_id ?? undefined
                } : null,
            marca: producto.marca ? { id: producto.marca.id, marca: producto.marca.marca } : null,
            negocio: (producto as any).negocio ? { id: (producto as any).negocio.id, slug: (producto as any).negocio.slug } : undefined,
            imagenes: ((producto as any).imagenes ?? []).map((img: any) => ({
                id: img.id,
                producto_id: img.producto_id,
                url: img.url,
                descripcion: img.descripcion ?? null,
                es_principal: !!img.es_principal,
                created_at: img.created_at,
                updated_at: img.updated_at
            })),
            ...(producto.productoAtributos ? {
                atributos: producto.productoAtributos.map((item: any) => ({
                    id: item.atributo.id,
                    nombre: item.atributo.nombre,
                    orden: item.orden
                }))
            } : {}),
            variantes: producto.variantes?.map((v: any) => ({
                id: v?.id ?? '',
                sku: v?.sku ?? undefined,
                correlativo: v?.correlativo ?? null,
                precio_sugerido: v?.precio_sugerido ?? undefined,
                stock_total: v?.stock_total ?? undefined,
                codigo_barras: (v as any)?.codigo_barras ?? null,
                qr_codigo: (v as any)?.qr_codigo ?? null,
                imagen_id: (v as any)?.imagen_id ?? null,
                imagen: (v as any)?.imagen ? {
                    id: (v as any).imagen.id,
                    url: (v as any).imagen.url,
                    descripcion: (v as any).imagen.descripcion ?? null,
                    es_principal: !!(v as any).imagen.es_principal
                } : null,
                valores: (v as any)?.valores?.map((val: any) => ({ id: val.id, valor: val.valor, atributo: val.atributo ? { id: val.atributo.id, nombre: val.atributo.nombre } : undefined })) ?? []
            })) ?? []
        };
    }
}

