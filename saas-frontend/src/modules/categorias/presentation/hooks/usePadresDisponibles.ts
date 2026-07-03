import { useEffect, useState } from 'react';
import { CategoriaRepository } from '../../infrastructure/repositories/categoria.repository';
import type { Categoria } from '../../domain/interfaces/categoria.interface';

export const usePadresDisponibles = (categoriaIdExcluir?: string) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const obtenerPadres = async () => {
            try {
                setLoading(true);
                const response = await CategoriaRepository.obtenerPadresDisponibles(categoriaIdExcluir);
                setCategorias(response.data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al obtener padres disponibles');
                setCategorias([]);
            } finally {
                setLoading(false);
            }
        };

        obtenerPadres();
    }, [categoriaIdExcluir]);

    return { categorias, loading, error };
};
