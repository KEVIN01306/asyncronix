import { gastos_categoria_gasto, type gastos } from "@prisma/client";
import { CategoriaGasto } from "../../domain/gastos_categoria.enum.js";
import type { GastoDetalle, GastoSimple } from "../../domain/gasto.entity.js";

export class GastoMapper {

    static mapCategoriaVista(categoria: gastos_categoria_gasto): CategoriaGasto {
        const map: Record<gastos_categoria_gasto, CategoriaGasto> = {
            ALQUILER: CategoriaGasto.ALQUILER,
            SERVICIOS: CategoriaGasto.SERVICIOS,
            NOMINA: CategoriaGasto.NOMINA,
            MARKETING: CategoriaGasto.MARKETING,
            OTROS: CategoriaGasto.OTROS
        }

        return map[categoria]
    }

    static mapCategoriaBaseDatos(categoria: CategoriaGasto): gastos_categoria_gasto {
        const map: Record<CategoriaGasto, gastos_categoria_gasto> = {
            ALQUILER: gastos_categoria_gasto.ALQUILER,
            SERVICIOS: gastos_categoria_gasto.SERVICIOS,
            NOMINA: gastos_categoria_gasto.NOMINA,
            MARKETING: gastos_categoria_gasto.MARKETING,
            OTROS: gastos_categoria_gasto.OTROS
        }

        return map[categoria]
    }

    static mapDetalle(gasto: any): GastoDetalle {
        return {
            id: gasto.id,
            monto: Number(gasto.monto),
            descripcion: gasto.descripcion,
            categoria_gasto: this.mapCategoriaVista(gasto.categoria_gasto),
            fecha: gasto.fecha,
            sucursal: {
                id: gasto.sucursales.id,
                nombre: gasto.sucursales.nombre
            }
        }
    }

    static mapSimple(gasto: any): GastoSimple {
        return {
            id: gasto.id,
            monto: Number(gasto.monto),
            categoria_gasto: this.mapCategoriaVista(gasto.categoria_gasto),
            fecha: gasto.fecha,
            sucursal: {
                id: gasto.sucursales.id,
                nombre: gasto.sucursales.nombre
            }
        }
    }
}
