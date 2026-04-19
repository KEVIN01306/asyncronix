import type { GastoSimple } from "../domain/gasto.entity.js";
import type { GastoRepository } from "../domain/gasto.reposity.js";
import type { Pagination } from "@shared/domain/pagination.js";

interface ObtenerGastosParams {
    negocio_id: string
    pagination: Pagination
    sucursal_ids?: string[] | undefined
}



export class ObtenerGastosUseCase {

    constructor(
        private readonly gastoRepository: GastoRepository
    ) { }

    async execute({ negocio_id, pagination, sucursal_ids }: ObtenerGastosParams): Promise<{ total: number, gastos: GastoSimple[] }> {

        const { total, data } = await this.gastoRepository.listar(negocio_id, pagination, sucursal_ids)

        return {
            total,
            gastos: data
        }
    }
}
