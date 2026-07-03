import { useEffect, useState, useRef } from 'react';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    CircularProgress,
    Typography,
    Box
} from '@mui/material';

import { modelosRepository } from '../../../modelos/infrastructure/modelos.repository';
import { marcasRepository } from '../../../marcas/infrastructure/marcas.repository';
import { lineasRepository } from '../../../lineas/infrastructure/lineas.repository';
import { cilindradasRepository, type Cilindrada } from '../../../cilindradas/infrastructure/cilindradas.repository';
import { vehiculoTipoRepository } from '../../infrastructure/vehiculo-tipo.repository';
import type { Marca } from '../../../marcas/domain/interface/marca.interface';
import type { Linea } from '../../../lineas/domain/interface/linea.interface';
import type { VehiculoTipo } from '../../domain/interfaces/vehiculo-tipo.interface';
import type { Modelo } from '../../../modelos/domain/interface/modelo.interface';

interface Props {
    open: boolean;
    onClose: () => void;
    initialText?: string;
    onCreated: (created: Modelo) => void;
}

const CreateModeloModal = ({ open, onClose, initialText = '', onCreated }: Props) => {
    // El nombre del modelo se genera automáticamente en el backend (marca + línea + año)
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [marca, setMarca] = useState<Marca | null>(null);
    const [linea, setLinea] = useState<Linea | null>(null);
    const [cilindrada, setCilindrada] = useState<Cilindrada | null>(null);
    const [vehiculoTipo, setVehiculoTipo] = useState<VehiculoTipo | null>(null);
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [marcaInput, setMarcaInput] = useState('');
    const [lineaInput, setLineaInput] = useState('');
    const [cilindradaInput, setCilindradaInput] = useState('');
    const marcaAbortRef = useRef<AbortController | null>(null);
    const lineaAbortRef = useRef<AbortController | null>(null);
    const cilindradaAbortRef = useRef<AbortController | null>(null);
    const debouncedMarca = useDebounce(marcaInput, 300);
    const debouncedLinea = useDebounce(lineaInput, 300);
    const debouncedCilindrada = useDebounce(cilindradaInput, 300);
    const [marcaLoading, setMarcaLoading] = useState(false);
    const [lineaLoading, setLineaLoading] = useState(false);
    const [cilindradaLoading, setCilindradaLoading] = useState(false);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [lineas, setLineas] = useState<Linea[]>([]);
    const [cilindradas, setCilindradas] = useState<Cilindrada[]>([]);
    const [tipos, setTipos] = useState<VehiculoTipo[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!open) return;

        setAnio(new Date().getFullYear());
        setMarca(null);
        setLinea(null);
        setCilindrada(null);
        setVehiculoTipo(null);
        setPin('');
        setErrorMessage('');
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const loadOptions = async () => {
            setIsLoadingOptions(true);

            try {
                const [marcasRes, lineasRes, cilindradasRes, tiposRes] = await Promise.all([
                    marcasRepository.listar(10, 0),
                    lineasRepository.listar(10, 0),
                    cilindradasRepository.listar(10, 0),
                    vehiculoTipoRepository.listar(100, 0),
                ]);

                setMarcas(marcasRes.data);
                setLineas(lineasRes.data);
                setCilindradas(cilindradasRes.data);
                setTipos(tiposRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        loadOptions();
    }, [open]);

    useEffect(() => {
        marcaAbortRef.current?.abort();
        const controller = new AbortController();
        marcaAbortRef.current = controller;
        setMarcaLoading(true);

        marcasRepository.listar(10, 0, debouncedMarca || undefined, controller.signal)
            .then((res) => setMarcas(res.data))
            .catch((error) => {
                if ((error as any)?.name === 'CanceledError' || (error as any)?.code === 'ERR_CANCELED') return;
                console.error(error);
            })
            .finally(() => setMarcaLoading(false));
    }, [debouncedMarca, open]);

    useEffect(() => {
        lineaAbortRef.current?.abort();
        const controller = new AbortController();
        lineaAbortRef.current = controller;
        setLineaLoading(true);

        lineasRepository.listar(10, 0, debouncedLinea || undefined, controller.signal)
            .then((res) => setLineas(res.data))
            .catch((error) => {
                if ((error as any)?.name === 'CanceledError' || (error as any)?.code === 'ERR_CANCELED') return;
                console.error(error);
            })
            .finally(() => setLineaLoading(false));
    }, [debouncedLinea, open]);

    useEffect(() => {
        cilindradaAbortRef.current?.abort();
        const controller = new AbortController();
        cilindradaAbortRef.current = controller;
        setCilindradaLoading(true);

        cilindradasRepository.listar(10, 0, debouncedCilindrada || undefined, controller.signal)
            .then((res) => setCilindradas(res.data))
            .catch((error) => {
                if ((error as any)?.name === 'CanceledError' || (error as any)?.code === 'ERR_CANCELED') return;
                console.error(error);
            })
            .finally(() => setCilindradaLoading(false));
    }, [debouncedCilindrada, open]);

    const handleCreate = async () => {
        if (!marca || !linea || !cilindrada || !vehiculoTipo || !pin.trim()) {
                setErrorMessage('Completa todos los campos requeridos antes de continuar.');
                return;
            }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await modelosRepository.crear({
                anio,
                marca_id: marca.id,
                linea_id: linea.id,
                cilindrada_id: cilindrada.id,
                vehiculo_tipo_id: vehiculoTipo.id,
                pin_modelo: pin,
            });

            onCreated(response.data);
        } catch (error) {
            console.error(error);
            setErrorMessage('No se pudo crear el modelo. Verifica el PIN y los datos ingresados.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} fullWidth maxWidth="sm">
            <DialogTitle>Crear nuevo modelo</DialogTitle>
            <DialogContent>
                <Box mt={1} mb={2}>
                    <Typography color="text.secondary">
                        El nombre del modelo se generará automáticamente a partir de Marca + Línea + Año.
                    </Typography>
                </Box>
                <Box display="grid" gap={2} sx={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                        <Autocomplete
                            options={marcas}
                            getOptionLabel={(option) => option.marca}
                            value={marca}
                            inputValue={marcaInput}
                            onInputChange={(_e, value) => setMarcaInput(value)}
                            onChange={(_event, value) => setMarca(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Marca"
                                    fullWidth
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={marcaLoading}
                            filterOptions={(opts) => opts}
                        />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                        <Autocomplete
                            options={lineas}
                            getOptionLabel={(option) => option.linea}
                            value={linea}
                            inputValue={lineaInput}
                            onInputChange={(_e, value) => setLineaInput(value)}
                            onChange={(_event, value) => setLinea(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Línea"
                                    fullWidth
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={lineaLoading}
                            filterOptions={(opts) => opts}
                        />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                        <Autocomplete
                            options={cilindradas}
                            getOptionLabel={(option) => `${option.cilindrada} cc`}
                            value={cilindrada}
                            inputValue={cilindradaInput}
                            onInputChange={(_e, value) => setCilindradaInput(value)}
                            onChange={(_event, value) => setCilindrada(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Cilindrada"
                                    fullWidth
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={cilindradaLoading}
                            filterOptions={(opts) => opts}
                        />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                        <Autocomplete
                            options={tipos}
                            getOptionLabel={(option) => option.tipo}
                            value={vehiculoTipo}
                            onChange={(_event, value) => setVehiculoTipo(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tipo de vehículo"
                                    fullWidth
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={isLoadingOptions}
                        />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                        <TextField
                            label="Año"
                            type="number"
                            value={anio}
                            onChange={(event) => setAnio(Number(event.target.value) || new Date().getFullYear())}
                            fullWidth
                        />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                        <TextField
                            label="PIN de modelo"
                            type="password"
                            value={pin}
                            onChange={(event) => setPin(event.target.value)}
                            fullWidth
                        />
                    </Box>
                </Box>
                {errorMessage ? (
                    <Typography mt={2} color="error">
                        {errorMessage}
                    </Typography>
                ) : null}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleCreate}
                    disabled={isLoading || isLoadingOptions}
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                    startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                    {isLoading ? 'Creando...' : 'Crear modelo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateModeloModal;
