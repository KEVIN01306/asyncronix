import AppError from "@shared/errors/AppError.js";
import type { ProductoDetalle } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import type { QrCodeProvider } from "@shared/infrastructure/qrcode.provider.js";

export class GenerarQrProductoUseCase {
    constructor(
        private readonly productoRepository: ProductoRepository,
        private readonly qrCodeProvider: QrCodeProvider
    ) { }

    async execute(producto_id: string, negocio_id: string): Promise<ProductoDetalle> {
        const producto = await this.productoRepository.obtener(producto_id, negocio_id);

        if (!producto) {
            throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);
        }

        if (producto.qr_imagen) {
            throw new AppError('El producto ya tiene un QR generado', 'QR_ALREADY_EXISTS', 400);
        }

        const qr_imagen = await this.qrCodeProvider.generar(producto.sku);
        return await this.productoRepository.actualizarQrImagen(producto_id, qr_imagen, negocio_id);
    }
}
