import { useEffect, useState } from 'react';
import { CategoriaRepository } from '../../../categorias/infrastructure/repositories/categoria.repository';
import type { CategoriaJerarquia } from '../../../categorias/domain/interfaces/categoria.interface';

interface UseJerarquiaProductoCategoriaResult {
    jerarquia: CategoriaJerarquia[];
    loading: boolean;
    error: string | null;
}

/**
 * Hook para obtener la jerarquía completa de la categoría de un producto
 * Retorna la ruta desde la categoría raíz hasta la categoría seleccionada
 */
export const useJerarquiaProductoCategoria = (
    categoriaId?: string
): UseJerarquiaProductoCategoriaResult => {
    const [jerarquia, setJerarquia] = useState<CategoriaJerarquia[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!categoriaId) {
            setJerarquia([]);
            return;
        }

        const obtenerJerarquia = async () => {
            try {
                setLoading(true);
                const response = await CategoriaRepository.obtenerConJerarquia(categoriaId);
                setJerarquia(response.data.jerarquia || []);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al obtener jerarquía');
                setJerarquia([]);
            } finally {
                setLoading(false);
            }
        };

        obtenerJerarquia();
    }, [categoriaId]);

    return { jerarquia, loading, error };
};
