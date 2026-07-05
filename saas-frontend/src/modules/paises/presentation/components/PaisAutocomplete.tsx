import { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { paisesRepository } from '../../infrastructure/paises.repository';
import type { Pais } from '../../domain/interface/pais.interface';

interface PaisAutocompleteProps {
    value: Pais | null;
    onChange: (pais: Pais | null) => void;
    disabled?: boolean;
}

export const PaisAutocomplete = ({ value, onChange, disabled = false }: PaisAutocompleteProps) => {
    const [paises, setPaises] = useState<Pais[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fetchPaises = async () => {
            setLoading(true);
            try {
                const response = await paisesRepository.listar(100, 0, inputValue || undefined);
                setPaises(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchPaises();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [inputValue]);

    return (
        <Autocomplete
            options={paises}
            getOptionLabel={(option) => option.nombre}
            value={value}
            onChange={(_, newValue) => onChange(newValue)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            loading={loading}
            disabled={disabled}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="País"
                    placeholder="Busca un país"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            noOptionsText="No se encontraron países"
            isOptionEqualToValue={(option, val) => option.id === val?.id}
        />
    );
};
