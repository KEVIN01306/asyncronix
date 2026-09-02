import type { PrismaClient } from "@prisma/client";
import prisma from "@infrastructure/config/prisma.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import type { DivisionNivel1, DivisionNivel2 } from "../domain/geografia.entity.js";
import type { GeografiaRepository } from "../domain/geografia.repository.js";

export class PrismaGeografiaRepository implements GeografiaRepository {
    async obtenerDepartamentosPorPais(pais_id: string): Promise<DivisionNivel1[]> {
        try {
            return await prisma.divisionNivel1.findMany({
                where: { pais_id, activo: true },
                orderBy: { nombre: 'asc' }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtenerMunicipiosPorDepartamento(departamento_id: string): Promise<DivisionNivel2[]> {
        try {
            return await prisma.divisionNivel2.findMany({
                where: { division_nivel1_id: departamento_id, activo: true },
                orderBy: { nombre: 'asc' }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
