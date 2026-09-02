import { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { geografiaRepository } from '../../infrastructure/geografia.repository';
import type { Municipio } from '../../domain/interface/geografia.interface';

interface MunicipioAutocompleteProps {
    value: string | null;
    onChange: (municipioId: string | null) => void;
    departamentoId?: string;
    disabled?: boolean;
}

export const MunicipioAutocomplete = ({ value, onChange, departamentoId, disabled = false }: MunicipioAutocompleteProps) => {
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (!departamentoId) {
            setMunicipios([]);
            return;
        }

        const fetchMunicipios = async () => {
            setLoading(true);
            try {
                const data = await geografiaRepository.obtenerMunicipios(departamentoId);
                setMunicipios(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMunicipios();
    }, [departamentoId]);

    return (
        <Autocomplete
            options={municipios}
            getOptionLabel={(option) => option.nombre}
            value={municipios.find(m => m.id === value) || null}
            onChange={(_, newValue) => onChange(newValue?.id || null)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            loading={loading}
            disabled={disabled || !departamentoId}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Municipio"
                    placeholder={!departamentoId ? "Selecciona un departamento primero" : "Selecciona un municipio"}
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
            noOptionsText={!departamentoId ? "Selecciona un departamento primero" : "No se encontraron municipios"}
            isOptionEqualToValue={(option, val) => option.id === val?.id}
        />
    );
};
