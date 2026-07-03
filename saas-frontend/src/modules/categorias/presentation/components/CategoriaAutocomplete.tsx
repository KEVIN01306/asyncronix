import { useMemo } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { usePadresDisponibles } from '../hooks/usePadresDisponibles';

interface CategoriaAutocompleteProps {
    label?: string;
    placeholder?: string;
    categoriaActualId?: string;
    disabled?: boolean;
}

/**
 * Componente Autocomplete para seleccionar categoría padre
 * Filtra:
 * - Categorías default del sistema
 * - Categorías activas del negocio
 * - Excluye la categoría actual y sus descendientes
 * - Agrupa por nivel jerárquico
 */
export const CategoriaAutocomplete: React.FC<CategoriaAutocompleteProps> = ({
    label = 'Categoría Padre',
    placeholder = 'Seleccionar categoría padre...',
    categoriaActualId,
    disabled = false
}) => {
    const { control, formState: { errors } } = useFormContext();
    const { categorias, loading } = usePadresDisponibles(categoriaActualId);

    const categoriasPadreValidas = useMemo(() => {
        return categorias.filter(cat => cat.activo);
    }, [categorias]);

    return (
        <Controller
            name="categoria_padre_id"
            control={control}
            render={({ field }) => (
                <Autocomplete
                    options={categoriasPadreValidas}
                    loading={loading}
                    disabled={disabled || loading}
                    disableClearable
                    value={categoriasPadreValidas.find(cat => cat.id === field.value)}
                    onChange={(_event, value) => field.onChange(value.id)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => option.categoria}
                    groupBy={(option) => option.default_categoria ? 'Categorías Default' : 'Categorías de Mi Negocio'}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            {option.categoria}
                            {option.default_categoria && (
                                <Chip
                                    label="Sistema"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ ml: 1, height: 20 }}
                                />
                            )}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={label}
                            placeholder={placeholder}
                            error={!!errors.categoria_padre_id}
                            helperText={typeof errors.categoria_padre_id?.message === 'string' ? errors.categoria_padre_id.message : undefined}
                        />
                    )}
                />
            )}
        />
    );
};
