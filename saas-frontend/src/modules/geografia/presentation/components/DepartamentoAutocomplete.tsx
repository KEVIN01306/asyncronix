import { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { geografiaRepository } from '../../infrastructure/geografia.repository';
import type { Departamento } from '../../domain/interface/geografia.interface';

interface DepartamentoAutocompleteProps {
    value: string | null;
    onChange: (departamentoId: string | null) => void;
    paisId?: string;
    disabled?: boolean;
}

export const DepartamentoAutocomplete = ({ value, onChange, paisId, disabled = false }: DepartamentoAutocompleteProps) => {
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (!paisId) {
            setDepartamentos([]);
            return;
        }

        const fetchDepartamentos = async () => {
            setLoading(true);
            try {
                const data = await geografiaRepository.obtenerDepartamentos(paisId);
                setDepartamentos(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartamentos();
    }, [paisId]);

    return (
        <Autocomplete
            options={departamentos}
            getOptionLabel={(option) => option.nombre}
            value={departamentos.find(d => d.id === value) || null}
            onChange={(_, newValue) => onChange(newValue?.id || null)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            loading={loading}
            disabled={disabled || !paisId}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Departamento"
                    placeholder={!paisId ? "Selecciona un país primero" : "Selecciona un departamento"}
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
            noOptionsText={!paisId ? "Selecciona un país primero" : "No se encontraron departamentos"}
            isOptionEqualToValue={(option, val) => option.id === val?.id}
        />
    );
};
