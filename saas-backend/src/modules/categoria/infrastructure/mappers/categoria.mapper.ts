import type { CategoriaProducto } from "@prisma/client";
import type { CategoriaSimple, CategoriaConJerarquia, CategoriaPadre } from "../../domain/categoria.entity.js";

export class CategoriaMapper {
    static mapSimple(categoria: CategoriaProducto): CategoriaSimple {
        return {
            id: categoria.id,
            categoria: categoria.categoria,
            default_categoria: categoria.default_categoria,
            activo: categoria.activo,
            categoria_padre_id: categoria.categoria_padre_id || undefined
        }
    }

    static mapConJerarquia(categoria: CategoriaProducto & { categoria_padre?: CategoriaProducto | null; subcategorias?: CategoriaProducto[] }): CategoriaConJerarquia {
        return {
            id: categoria.id,
            categoria: categoria.categoria,
            default_categoria: categoria.default_categoria,
            activo: categoria.activo,
            categoria_padre_id: categoria.categoria_padre_id || undefined,
            categoria_padre: categoria.categoria_padre ? {
                id: categoria.categoria_padre.id,
                categoria: categoria.categoria_padre.categoria,
                default_categoria: categoria.categoria_padre.default_categoria
            } : undefined,
            subcategorias: categoria.subcategorias?.map(sub => this.mapSimple(sub))
        }
    }
}
