import type { CategoriaProducto } from "@prisma/client";
import type { CategoriaSimple } from "../../domain/categoria.entity.js";

export class CategoriaMapper {
    static mapSimple(categoria: CategoriaProducto): CategoriaSimple {
        return {
            id: categoria.id,
            categoria: categoria.categoria,
            default_categoria: categoria.default_categoria,
            activo: categoria.activo
        }
    }
}
