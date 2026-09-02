import type { DivisionNivel1, DivisionNivel2 } from "./geografia.entity.js";

export interface GeografiaRepository {
    obtenerDepartamentosPorPais(pais_id: string): Promise<DivisionNivel1[]>;
    obtenerMunicipiosPorDepartamento(departamento_id: string): Promise<DivisionNivel2[]>;
}
