import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { ProductoDetalle, ProductoCrear } from "../domain/producto.entity.js";
import type { ProductoRepository } from "../domain/producto.repository.js";
import type { VarianteRepository } from "../domain/variante.repository.js";
import type { ObtenerSecuenciaUseCase } from "./obtener-secuencia.usecase.js";
import { GenerarSku } from "../domain/actions/generarSku.action.js";
import { crearCodigoSecuencial } from "@shared/infrastructure/codigo-secuencial.util.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";

export class RegistrarProductoUseCase {
    constructor(
        private readonly repository: ProductoRepository,
        private readonly varianteRepository: VarianteRepository,
        private readonly obtenerSecuencia: ObtenerSecuenciaUseCase
    ) { }

    async execute(data: ProductoCrear, negocio_id: string): Promise<ProductoDetalle> {
        try {
            const createdProduct = await this.repository.registrar(data, negocio_id);
            const productoConNegocio = await this.repository.obtener(createdProduct.id, negocio_id);
            if (!productoConNegocio) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);

            const productoCodigo = data.codigo?.trim() || this.generarCodigoProducto(
                productoConNegocio.negocio?.slug ?? '',
                productoConNegocio.marca?.marca ?? '',
                productoConNegocio.nombre,
                []
            );

            if (!data.codigo?.trim()) {
                await this.repository.actualizar(createdProduct.id, { codigo: productoCodigo }, negocio_id);
            }

            const skuVariante = GenerarSku.ejecutar({
                negocioCodigo: productoConNegocio.negocio?.slug ?? '',
                marcaCodigo: productoConNegocio.marca?.marca ?? '',
                categoriaCodigo: productoConNegocio.categoria?.categoria ?? '',
                productoCodigo: productoConNegocio.nombre,
                valores: []
            });

            const secuencia = await this.obtenerSecuencia.execute();
            const codigoSecuencial = crearCodigoSecuencial(secuencia);

            await this.varianteRepository.crear({
                producto_id: createdProduct.id,
                precio_sugerido: 0,
                codigo_barras: null,
                valor_atributo_ids: [],
                sku: skuVariante,
                codigo_secuencial: codigoSecuencial
            }, negocio_id);

            const productoFinal = await this.repository.obtener(createdProduct.id, negocio_id);
            if (!productoFinal) throw new AppError('Producto no encontrado', 'PRODUCTO_NOT_FOUND', 404);

            return productoFinal;
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El producto ya existe', 'DATA_ALREADY_EXISTS', 409);
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }

            throw error;
        }
    }

    private generarCodigoProducto(negocioCodigo: string, marcaCodigo: string, productoNombre: string, tributos: string[]): string {
        const normalizar = (valor: string): string => valor
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '-')
            .replace(/[^A-Z0-9-]/g, '');

        const segmentoNegocio = normalizar(negocioCodigo).substring(0, 3) || 'NEG';
        const segmentoMarca = normalizar(marcaCodigo).substring(0, 5) || 'MARCA';
        const primerPalabraProducto = productoNombre.trim().split(/\s+/)[0] ?? '';
        const segmentoProducto = normalizar(primerPalabraProducto) || 'PROD';
        const segmentosTributos = (tributos ?? []).map(normalizar).filter(Boolean);

        return [segmentoNegocio, segmentoMarca, segmentoProducto, ...segmentosTributos]
            .filter(Boolean)
            .join('-');
    }
}
