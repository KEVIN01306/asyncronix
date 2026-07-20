import type { ProductoDetalle } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import AppError from "@shared/errors/AppError.js";

interface Params {
    producto_id: string;
    file: FileDTO;
    descripcion?: string | null;
    negocio_id: string;
}

import type { CrearMediaUseCase } from "../../media/application/crear-media.usecase.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";

export class SubirImagenProductoUseCase {
    constructor(private readonly repository: ProductoRepository, private readonly crearMediaUseCase: CrearMediaUseCase) { }

    async execute({ producto_id, file, descripcion, negocio_id }: Params): Promise<ProductoDetalle> {
        const producto = await this.repository.obtener(producto_id, negocio_id);
        if (!producto) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);

                const path = `tenant_${negocio_id}/products/prod_${producto_id}`;
        const url = await this.crearMediaUseCase.execute(file, negocio_id, path);
        return await this.repository.registrarImagen(producto_id, url, descripcion ?? null, negocio_id);
    }
}
