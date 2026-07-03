import { useMemo } from 'react';
import type { CategoriaJerarquia } from '../../domain/interfaces/categoria.interface';

export const ordenarJerarquiaPorRuta = (jerarquia?: CategoriaJerarquia[]): CategoriaJerarquia[] => {
    if (!jerarquia || jerarquia.length === 0) return [];
    return [...jerarquia].sort((a, b) => b.nivel - a.nivel);
};

export const formatearJerarquiaTexto = (jerarquia?: CategoriaJerarquia[]): string => {
    return ordenarJerarquiaPorRuta(jerarquia).map(j => j.categoria).join(' > ');
};

/**
 * Hook para formatear jerarquía de categorías en un string legible
 * Ejemplo: "Vehículos > Autos > Sedanes"
 */
export const useJerarquiaTexto = (jerarquia?: CategoriaJerarquia[]): string => {
    return useMemo(() => {
        return formatearJerarquiaTexto(jerarquia);
    }, [jerarquia]);
};

/**
 * Hook para obtener solo el padre inmediato de una categoría
 */
export const usePadreInmediato = (jerarquia?: CategoriaJerarquia[]): CategoriaJerarquia | null => {
    return useMemo(() => {
        if (!jerarquia || jerarquia.length < 2) return null;

        // El padre inmediato es el segundo elemento cuando está ordenado por nivel descendente
        const ordenada = ordenarJerarquiaPorRuta(jerarquia);
        return ordenada[1] || null;
    }, [jerarquia]);
};

/**
 * Hook para obtener la ruta completa de categorías
 * Retorna un array de objetos con id, nombre y nivel
 */
export const useRutaCategoria = (jerarquia?: CategoriaJerarquia[]) => {
    return useMemo(() => {
        return ordenarJerarquiaPorRuta(jerarquia);
    }, [jerarquia]);
};
