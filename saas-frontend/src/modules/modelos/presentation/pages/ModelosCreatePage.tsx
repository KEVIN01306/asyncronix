import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Grid, Button, Autocomplete } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { toast } from 'sonner';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { modelosRepository } from '../../infrastructure/modelos.repository';
import { marcasRepository } from '../../../marcas/infrastructure/marcas.repository';
import { lineasRepository } from '../../../lineas/infrastructure/lineas.repository';
import { cilindradasRepository, type Cilindrada } from '../../../cilindradas/infrastructure/cilindradas.repository';
import { vehiculoTipoRepository } from '../../../vehiculos/infrastructure/vehiculo-tipo.repository';
import type { Marca } from '../../../marcas/domain/interface/marca.interface';
import type { Linea } from '../../../lineas/domain/interface/linea.interface';
import type { VehiculoTipo } from '../../../vehiculos/domain/interfaces/vehiculo-tipo.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ModelosCreatePage = () => {
    const navigate = useNavigate();
    const [anio, setAnio] = useState<number>(new Date().getFullYear());
    const [marca, setMarca] = useState<Marca | null>(null);
    const [linea, setLinea] = useState<Linea | null>(null);
    const [cilindrada, setCilindrada] = useState<Cilindrada | null>(null);
    const [vehiculoTipo, setVehiculoTipo] = useState<VehiculoTipo | null>(null);
    const [pin, setPin] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [lineas, setLineas] = useState<Linea[]>([]);
    const [cilindradas, setCilindradas] = useState<Cilindrada[]>([]);
    const [tipos, setTipos] = useState<VehiculoTipo[]>([]);
    const [marcaLoading, setMarcaLoading] = useState(false);
    const [lineaLoading, setLineaLoading] = useState(false);
    const [cilindradaLoading, setCilindradaLoading] = useState(false);
    const [marcaInput, setMarcaInput] = useState('');
    const [lineaInput, setLineaInput] = useState('');
    const [cilindradaInput, setCilindradaInput] = useState('');
    const marcaAbortRef = useRef<AbortController | null>(null);
    const lineaAbortRef = useRef<AbortController | null>(null);
    const cilindradaAbortRef = useRef<AbortController | null>(null);
    const debouncedMarca = useDebounce(marcaInput, 300);
    const debouncedLinea = useDebounce(lineaInput, 300);
    const debouncedCilindrada = useDebounce(cilindradaInput, 300);

    useEffect(() => {
        const loadTipos = async () => {
            setIsLoading(true);
            try {
                const tiposRes = await vehiculoTipoRepository.listar(100, 0);
                setTipos(tiposRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTipos();
    }, []);

    useEffect(() => {
        if (!debouncedMarca && marcaAbortRef.current == null) {
            // load initial 10 marcas
        }

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
    }, [debouncedMarca]);

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
    }, [debouncedLinea]);

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
    }, [debouncedCilindrada]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!marca || !linea || !cilindrada || !vehiculoTipo || !pin.trim()) {
            setErrorMessage('Completa todos los campos obligatorios y el PIN antes de continuar.');
            return;
        }

        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await modelosRepository.crear({
                anio,
                marca_id: marca.id,
                linea_id: linea.id,
                cilindrada_id: cilindrada.id,
                vehiculo_tipo_id: vehiculoTipo.id,
                pin_modelo: pin,
            });

            toast.success('Modelo creado con éxito.');
            navigate('/modelos');
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error?.response?.data?.message || 'No se pudo crear el modelo. Verifica el PIN y los datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loading />;

    return (
        <Box p={4} maxWidth="900px" mx="auto">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    Crear Modelo
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Año"
                            type="number"
                            fullWidth
                            value={anio}
                            onChange={(event) => setAnio(Number(event.target.value) || new Date().getFullYear())}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={marcas}
                            getOptionLabel={(option) => option.marca}
                            value={marca}
                            inputValue={marcaInput}
                            onInputChange={(_e, value) => setMarcaInput(value)}
                            onChange={(_, value) => setMarca(value)}
                            renderInput={(params) => <TextField {...params} label="Marca" fullWidth />}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            loading={marcaLoading}
                            filterOptions={(opts) => opts}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={lineas}
                            getOptionLabel={(option) => option.linea}
                            value={linea}
                            inputValue={lineaInput}
                            onInputChange={(_e, value) => setLineaInput(value)}
                            onChange={(_, value) => setLinea(value)}
                            renderInput={(params) => <TextField {...params} label="Línea" fullWidth />}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            loading={lineaLoading}
                            filterOptions={(opts) => opts}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={cilindradas}
                            getOptionLabel={(option) => `${option.cilindrada} cc`}
                            value={cilindrada}
                            inputValue={cilindradaInput}
                            onInputChange={(_e, value) => setCilindradaInput(value)}
                            onChange={(_, value) => setCilindrada(value)}
                            renderInput={(params) => <TextField {...params} label="Cilindrada" fullWidth />}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            loading={cilindradaLoading}
                            filterOptions={(opts) => opts}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={tipos}
                            getOptionLabel={(option) => option.tipo}
                            value={vehiculoTipo}
                            onChange={(_, value) => setVehiculoTipo(value)}
                            renderInput={(params) => <TextField {...params} label="Tipo de vehículo" fullWidth required />}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 12 }}>
                        <TextField
                            label="PIN de modelo"
                            type="password"
                            fullWidth
                            value={pin}
                            onChange={(event) => setPin(event.target.value)}
                        />
                    </Grid>
                    </Grid>

                    {errorMessage ? (
                        <Typography mt={2} color="error">
                            {errorMessage}
                        </Typography>
                    ) : null}

                    <Box mt={4} display="flex" gap={2} flexWrap="wrap">
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancelar
                    </Button>
                    <SubmitButton
                        isSubmitting={isSubmitting}
                        text="Crear modelo"
                        loadingText="Creando..."
                    />
                </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default ModelosCreatePage;
