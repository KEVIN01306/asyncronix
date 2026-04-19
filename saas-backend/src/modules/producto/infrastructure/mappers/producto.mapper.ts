import type { productos, producto_imagenes, categorias } from "@prisma/client";
import type { ProductoSimple, ProductoImagen, ProductoDetalle } from "../../domain/producto.entity.js";

type ProductoConRelaciones = productos & {
    categorias: categorias | null;
    producto_imagenes: producto_imagenes[];
};

export class ProductoMapper {
    static mapImagen(imagen: producto_imagenes): ProductoImagen {
        return {
            id: imagen.id,
            producto_id: imagen.producto_id,
            sku_id: imagen.sku_id,
            url_imagen: imagen.url_imagen,
            es_principal: imagen.es_principal ?? false
        }
    }

    static mapSimple(producto: ProductoConRelaciones): ProductoSimple {
        return {
            id: producto.id,
            categoria_id: producto.categoria_id,
            nombre: producto.nombre,
            categoria: producto.categorias ? {
                id: producto.categorias.id,
                nombre: producto.categorias.nombre
            } : null
        }
    }

    static mapDetalle(producto: ProductoConRelaciones): ProductoDetalle {
        return {
            id: producto.id,
            categoria_id: producto.categoria_id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            categoria: producto.categorias ? {
                id: producto.categorias.id,
                nombre: producto.categorias.nombre
            } : null,
            imagenes: producto.producto_imagenes.map(this.mapImagen)
        }
    }
}

