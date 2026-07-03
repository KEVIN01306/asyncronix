import AppError from "@shared/errors/AppError.js";
import type { CategoriaJerarquiaCompleta, CategoriaSimple } from "../../domain/categoria.entity.js";
import type { CategoriaRepository } from "../../domain/categoria.repository.js";

type JerarquiaNodo = CategoriaJerarquiaCompleta["jerarquia"][number];

export class CategoriaJerarquiaService {
    constructor(private readonly repository: CategoriaRepository) {}

    async construirJerarquiaAscendente(categoriaId: string, negocioId: string): Promise<JerarquiaNodo[]> {
        return this.construirJerarquiaRecursiva(categoriaId, negocioId, 0, new Set<string>());
    }

    async esDescendienteOIgual(categoriaId: string, posiblePadreId: string, negocioId: string): Promise<boolean> {
        return this.existeEnCadenaDePadres(categoriaId, posiblePadreId, negocioId, new Set<string>());
    }

    async obtenerDescendientes(categoriaPadreId: string, negocioId: string): Promise<CategoriaSimple[]> {
        return this.obtenerDescendientesRecursivo(categoriaPadreId, negocioId, new Set<string>());
    }

    private async construirJerarquiaRecursiva(
        categoriaId: string,
        negocioId: string,
        nivel: number,
        visitados: Set<string>
    ): Promise<JerarquiaNodo[]> {
        if (visitados.has(categoriaId)) {
            throw new AppError('Se detecto un ciclo en la jerarquia de categorias', 'INVALID_DATA', 400);
        }

        visitados.add(categoriaId);

        const categoria = await this.repository.obtenerPorId(categoriaId, negocioId);
        if (!categoria) {
            return [];
        }

        const jerarquia: JerarquiaNodo[] = [{
            id: categoria.id,
            categoria: categoria.categoria,
            nivel
        }];

        if (categoria.categoria_padre_id) {
            const jerarquiaPadre = await this.construirJerarquiaRecursiva(
                categoria.categoria_padre_id,
                negocioId,
                nivel + 1,
                visitados
            );
            jerarquia.push(...jerarquiaPadre);
        }

        return jerarquia;
    }

    private async existeEnCadenaDePadres(
        categoriaId: string,
        posiblePadreId: string,
        negocioId: string,
        visitados: Set<string>
    ): Promise<boolean> {
        if (categoriaId === posiblePadreId) {
            return true;
        }

        if (visitados.has(posiblePadreId)) {
            throw new AppError('Se detecto un ciclo en la jerarquia de categorias', 'INVALID_DATA', 400);
        }

        visitados.add(posiblePadreId);
        const categoria = await this.repository.obtenerPorId(posiblePadreId, negocioId);

        if (!categoria?.categoria_padre_id) {
            return false;
        }

        return this.existeEnCadenaDePadres(categoriaId, categoria.categoria_padre_id, negocioId, visitados);
    }

    private async obtenerDescendientesRecursivo(
        categoriaPadreId: string,
        negocioId: string,
        visitados: Set<string>
    ): Promise<CategoriaSimple[]> {
        if (visitados.has(categoriaPadreId)) {
            throw new AppError('Se detecto un ciclo en la jerarquia de categorias', 'INVALID_DATA', 400);
        }

        visitados.add(categoriaPadreId);
        const subcategorias = await this.repository.obtenerSubcategorias(categoriaPadreId, negocioId);
        const descendientes: CategoriaSimple[] = [];

        for (const subcategoria of subcategorias) {
            descendientes.push(subcategoria);
            const masDescendientes = await this.obtenerDescendientesRecursivo(subcategoria.id, negocioId, visitados);
            descendientes.push(...masDescendientes);
        }

        return descendientes;
    }
}