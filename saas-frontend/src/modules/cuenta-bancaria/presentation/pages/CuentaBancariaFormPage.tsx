import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Autocomplete, Box, Button, Paper, TextField, Switch, FormControlLabel, Typography, MenuItem, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { cuentaBancariaRepository } from '../../infrastructure/cuenta-bancaria.repository';
import { bancosRepository } from '../../../bancos/infrastructure/bancos.repository';
import { monedasRepository } from '../../../monedas/infrastructure/monedas.repository';
import type { CuentaBancariaCreateFormValues, CuentaBancariaUpdateFormValues } from '../../domain/interfaces/cuenta-bancaria.interface';
import type { Moneda } from '../../../monedas/domain/interface/moneda.interface';

interface BancoOption {
    id: string;
    nombre: string;
}

const defaultValues: CuentaBancariaCreateFormValues = {
    banco_id: '',
    moneda_id: null,
    numero_cuenta: '',
    nombre_titular: '',
    tipo: 'MONETARIA',
    activo: true,
};

export default function CuentaBancariaFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bankOptions, setBankOptions] = useState<BancoOption[]>([]);
    const [monedaOptions, setMonedaOptions] = useState<Moneda[]>([]);
    const [bankSearch, setBankSearch] = useState('');
    const [monedaSearch, setMonedaSearch] = useState('');
    const [selectedBank, setSelectedBank] = useState<BancoOption | null>(null);
    const [selectedMoneda, setSelectedMoneda] = useState<Moneda | null>(null);
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CuentaBancariaCreateFormValues>({
        defaultValues,
    });

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            setLoading(true);
            cuentaBancariaRepository.obtener(id)
                .then(async (res) => {
                    const cuenta = res.data;
                    reset({
                        banco_id: cuenta.banco_id,
                        moneda_id: cuenta.moneda_id,
                        numero_cuenta: cuenta.numero_cuenta,
                        nombre_titular: cuenta.nombre_titular,
                        tipo: cuenta.tipo,
                        activo: cuenta.activo,
                    });

                    if (cuenta.banco_id) {
                        const bancoResponse = await bancosRepository.obtener(cuenta.banco_id);
                        if (bancoResponse?.data) {
                            setSelectedBank({ id: bancoResponse.data.id, nombre: bancoResponse.data.nombre_comercial });
                        }
                    }

                    if (cuenta.moneda_id) {
                        const monedaResponse = await monedasRepository.obtener(cuenta.moneda_id);
                        if (monedaResponse?.data) {
                            setSelectedMoneda(monedaResponse.data);
                        }
                    }
                })
                .catch(() => navigate('/cuentas-bancarias'))
                .finally(() => setLoading(false));
        }
    }, [id, navigate, reset]);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        const fetchBanks = async () => {
            try {
                const response = await bancosRepository.listar(50, 0, bankSearch, controller.signal);
                if (!active) return;
                setBankOptions(response.data.map((bank) => ({ id: bank.id, nombre: bank.nombre_comercial })));
            } catch (error) {
                if ((error as any).name !== 'AbortError') {
                    console.error('Error fetching banks', error);
                }
            }
        };

        fetchBanks();

        return () => {
            active = false;
            controller.abort();
        };
    }, [bankSearch]);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        const fetchMonedas = async () => {
            try {
                const response = await monedasRepository.listar(50, 0, monedaSearch, controller.signal);
                if (!active) return;
                setMonedaOptions(response.data || []);
            } catch (error) {
                if ((error as any).name !== 'AbortError') {
                    console.error('Error fetching monedas', error);
                }
            }
        };

        fetchMonedas();

        return () => {
            active = false;
            controller.abort();
        };
    }, [monedaSearch]);

    const onSubmit = async (data: CuentaBancariaUpdateFormValues) => {
        setLoading(true);
        try {
            if (isEditMode && id) {
                await cuentaBancariaRepository.actualizar(id, data);
                toast.success('Cuenta bancaria actualizada con éxito');
            } else {
                await cuentaBancariaRepository.registrar(data);
                toast.success('Cuenta bancaria registrada con éxito');
            }
            navigate('/cuentas-bancarias');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar la cuenta bancaria');
        } finally {
            setLoading(false);
        }
    };

    return (
<Box p={4}>
    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/cuentas-bancarias')} sx={{ mb: 2, textTransform: 'none' }}>
        Volver
    </Button>

    <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
            {isEditMode ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Contenedor principal del Grid con espaciado */}
            <Grid container spacing={3}>
                
                {/* Banco - Ocupa mitad en pantallas medianas */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                        name="banco_id"
                        control={control}
                        rules={{ required: 'Banco es requerido' }}
                        render={({ field }) => (
                            <Autocomplete
                                fullWidth
                                options={bankOptions}
                                getOptionLabel={(option) => option.nombre || ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={selectedBank}
                                onChange={(_, newValue) => {
                                    setSelectedBank(newValue);
                                    field.onChange(newValue?.id ?? '');
                                }}
                                onInputChange={(_, newInputValue) => setBankSearch(newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Banco"
                                        error={!!errors.banco_id}
                                        helperText={errors.banco_id?.message}
                                    />
                                )}
                            />
                        )}
                    />
                </Grid>

                {/* Moneda - Ocupa mitad en pantallas medianas */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                        name="moneda_id"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                fullWidth
                                options={monedaOptions}
                                getOptionLabel={(option) => `${option.nombre} (${option.codigo})`}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={selectedMoneda}
                                onChange={(_, newValue) => {
                                    setSelectedMoneda(newValue);
                                    field.onChange(newValue?.id ?? null);
                                }}
                                onInputChange={(_, newInputValue) => setMonedaSearch(newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Moneda"
                                    />
                                )}
                            />
                        )}
                    />
                </Grid>

                {/* Número de Cuenta - Ocupa 8 columnas (de 12) en MD */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                        label="Número de cuenta"
                        fullWidth
                        {...register('numero_cuenta', { required: 'Número de cuenta es requerido' })}
                        error={!!errors.numero_cuenta}
                        helperText={errors.numero_cuenta?.message}
                    />
                </Grid>

                {/* Tipo de Cuenta - Ocupa 4 columnas (de 12) en MD */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        select
                        label="Tipo"
                        fullWidth
                        defaultValue="MONETARIA"
                        {...register('tipo')}
                    >
                        <MenuItem value="MONETARIA">Monetaria</MenuItem>
                        <MenuItem value="AHORRO">Ahorro</MenuItem>
                        <MenuItem value="PLANILLA">Planilla</MenuItem>
                    </TextField>
                </Grid>

                {/* Nombre del Titular - Ocupa todo el ancho */}
                <Grid size={{ xs: 12 }}>
                    <TextField
                        label="Nombre del titular"
                        fullWidth
                        {...register('nombre_titular', { required: 'Titular es requerido' })}
                        error={!!errors.nombre_titular}
                        helperText={errors.nombre_titular?.message}
                    />
                </Grid>

                {/* Estado Activo y Botón de Guardar alineados abajo */}
                <Grid size={{ xs: 12 }} display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <FormControlLabel
                        control={<Switch defaultChecked {...register('activo')} />}
                        label="Activo"
                    />
                    <Button type="submit" variant="contained" disabled={loading} size="large">
                        Guardar
                    </Button>
                </Grid>

            </Grid>
        </Box>
    </Paper>
</Box>
    );
}
