import type { categorias } from "@prisma/client";
import type { CategoriaSimple } from "../../domain/categoria.entity.js";

export class CategoriaMapper {
    static mapSimple(categoria: categorias): CategoriaSimple {
        return {
            id: categoria.id,
            nombre: categoria.nombre,
            descripcion: categoria.descripcion
        }
    }
}
