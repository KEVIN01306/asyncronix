import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { useJerarquiaTexto, useRutaCategoria } from '../hooks/useJerarquiaTexto';
import type { CategoriaJerarquia } from '../../domain/interfaces/categoria.interface';

interface CategoriaJerarquiaChipsProps {
    jerarquia?: CategoriaJerarquia[];
    size?: 'small' | 'medium';
    clickable?: boolean;
    onCategoryClick?: (categoriaId: string) => void;
}

/**
 * Componente que muestra la jerarquía de categorías de forma visual
 * Ejemplo: [Vehículos] > [Autos] > [Sedanes]
 */
export const CategoriaJerarquiaChips: React.FC<CategoriaJerarquiaChipsProps> = ({
    jerarquia,
    size = 'small',
    clickable = false,
    onCategoryClick
}) => {
    const rutaCompleta = useRutaCategoria(jerarquia);

    if (!rutaCompleta || rutaCompleta.length === 0) {
        return <Typography variant="caption" color="text.secondary">Sin categoría asignada</Typography>;
    }

    return (
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            {rutaCompleta.map((nivel, idx) => (
                <Box key={nivel.id} display="flex" alignItems="center" gap={0.5}>
                    <Chip
                        label={nivel.categoria}
                        size={size === 'small' ? 'small' : 'medium'}
                        variant={idx === 0 ? 'filled' : 'outlined'}
                        color={idx === 0 ? 'primary' : 'default'}
                        onClick={clickable && onCategoryClick ? () => onCategoryClick(nivel.id) : undefined}
                        sx={{
                            cursor: clickable ? 'pointer' : 'default',
                            fontWeight: idx === 0 ? 600 : 500
                        }}
                    />
                    {idx < rutaCompleta.length - 1 && (
                        <ChevronRight sx={{ fontSize: size === 'small' ? 16 : 20, color: 'text.secondary' }} />
                    )}
                </Box>
            ))}
        </Stack>
    );
};

/**
 * Componente simple que muestra la jerarquía como texto
 * Ejemplo: "Vehículos > Autos > Sedanes"
 */
interface CategoriaJerarquiaTextoProps {
    jerarquia?: CategoriaJerarquia[];
    variant?: 'body1' | 'body2' | 'caption' | 'subtitle2';
}

export const CategoriaJerarquiaTexto: React.FC<CategoriaJerarquiaTextoProps> = ({
    jerarquia,
    variant = 'body2'
}) => {
    const jerarquiaTexto = useJerarquiaTexto(jerarquia);

    if (!jerarquiaTexto) {
        return <Typography variant={variant} color="text.secondary">Sin categoría asignada</Typography>;
    }

    return <Typography variant={variant}>{jerarquiaTexto}</Typography>;
};
