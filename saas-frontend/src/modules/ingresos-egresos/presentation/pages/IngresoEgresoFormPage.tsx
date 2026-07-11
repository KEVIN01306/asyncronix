import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Alert, Box, Button, Card, CardContent, FormControl,
    FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup,
    Stack, TextField, Typography, Grid, Divider, Paper
} from '@mui/material';
import { AccountBalanceWallet, DateRange, Description, Receipt } from '@mui/icons-material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAuthStore } from '../../../../core/store/authStore';
import ingresoEgresoRepository from '../../infrastructure/ingresoEgreso.repository';
import { cajaRepository } from '../../../caja/infrastructure/caja.repository';
import { cuentaBancariaRepository } from '../../../cuenta-bancaria/infrastructure/cuenta-bancaria.repository';
import { categoriaTransaccionRepository } from '../../../categorias-transaccion/infrastructure/categoria-transaccion.repository';
import type { Caja } from '../../../caja/domain/interfaces/caja.interface';
import type { CuentaBancaria } from '../../../cuenta-bancaria/domain/interfaces/cuenta-bancaria.interface';
import type { CategoriaTransaccion } from '../../../categorias-transaccion/domain/interfaces/categoria-transaccion.interface';
import type { IngresoEgresoFormValues } from '../../domain/interfaces/ingresoEgreso.interface';
import { ingresoEgresoSchema } from '../../domain/interfaces/ingresoEgreso.schema';

export default function IngresoEgresoFormPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [cajas, setCajas] = useState<Caja[]>([]);
    const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
    const [categorias, setCategorias] = useState<CategoriaTransaccion[]>([]);
    const [selectedCuenta, setSelectedCuenta] = useState<CuentaBancaria | null>(null);
    const [monedaSeleccionada, setMonedaSeleccionada] = useState<'base' | 'cuenta'>('base');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm<IngresoEgresoFormValues>({
        resolver: zodResolver(ingresoEgresoSchema),
        defaultValues: {
            tipo_movimiento: undefined,
            entidad_tipo: undefined,
            fecha_transaccion: new Date().toISOString().slice(0, 10),
        },
    });

    const tipoMovimiento = watch('tipo_movimiento');
    const entidadTipo = watch('entidad_tipo');
    const entidadId = watch('entidad_id');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cajasRes, cuentasRes] = await Promise.all([
                    cajaRepository.listar(99, 0),
                    cuentaBancariaRepository.listar(99, 0),
                ]);
                setCajas(cajasRes.data || []);
                setCuentas(cuentasRes.data || []);
            } catch (error) {
                console.error(error);
                setFormError('Error cargando parámetros de tesorería');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const loadCategorias = async () => {
            if (!tipoMovimiento) {
                setCategorias([]);
                return;
            }
            try {
                const res = await categoriaTransaccionRepository.listar(99, 0, undefined, tipoMovimiento);
                setCategorias(res.data || []);
            } catch (error) {
                console.error(error);
                setFormError('Error cargando catálogo de cuentas/categorías');
            }
        };
        loadCategorias();
    }, [tipoMovimiento]);

    const isDifferentCurrency =
        entidadTipo === 'CUENTA' &&
        selectedCuenta?.moneda_id &&
        user?.negocio?.moneda?.id &&
        selectedCuenta.moneda_id !== user.negocio.moneda.id;

    useEffect(() => {
        if (entidadTipo === 'CUENTA' && entidadId) {
            const cuenta = cuentas.find((c) => c.id === entidadId);
            setSelectedCuenta(cuenta || null);
        } else {
            setSelectedCuenta(null);
        }
    }, [entidadTipo, entidadId, cuentas]);

    useEffect(() => {
        setValue('monto_original', undefined);
        setValue('monto_moneda_base', undefined);
        clearErrors(['monto_original', 'monto_moneda_base']);
        setMonedaSeleccionada('base');
    }, [entidadTipo, entidadId, setValue, clearErrors]);

    useEffect(() => {
        if (!isDifferentCurrency) {
            setMonedaSeleccionada('base');
            return;
        }
        if (monedaSeleccionada === 'base') {
            setValue('monto_original', undefined);
            clearErrors('monto_original');
        } else {
            setValue('monto_moneda_base', undefined);
            clearErrors('monto_moneda_base');
        }
    }, [isDifferentCurrency, monedaSeleccionada, setValue, clearErrors]);

    const amountFieldName =
        entidadTipo === 'CAJA' || (entidadTipo === 'CUENTA' && !isDifferentCurrency)
            ? 'monto_original'
            : monedaSeleccionada === 'cuenta'
                ? 'monto_original'
                : 'monto_moneda_base';

    const amountCurrency =
        amountFieldName === 'monto_original'
            ? isDifferentCurrency && entidadTipo === 'CUENTA'
                ? selectedCuenta?.moneda?.codigo
                : user?.negocio?.moneda?.codigo
            : user?.negocio?.moneda?.codigo;

    const amountLabel = `Importe Líquido (${amountCurrency || 'N/A'})`;

    const onSubmit = async (data: IngresoEgresoFormValues) => {
        setSaving(true);
        setFormError(null);
        try {
            const payload = { ...data } as IngresoEgresoFormValues;
            if (amountFieldName === 'monto_original') {
                delete payload.monto_moneda_base;
            } else {
                delete payload.monto_original;
            }
            await ingresoEgresoRepository.crear(payload);
            toast.success('Asiento contable indexado con éxito');
            navigate('/ingresos-egresos');
        } catch (err: any) {
            setFormError(err.message || 'Fallo de validación en servidor');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box py={8}><Loading /></Box>;

    return (
        <Box py={4} px={{ xs: 2, sm: 4 }} maxWidth="900px" margin="auto">
            <Card variant="outlined" sx={{ borderRadius: 2 }}>

                {/* Cabecera del Formulario */}
                <Box p={3} borderBottom="1px solid" borderColor="divider">
                    <Typography variant="h6" fontWeight={700}>
                        Apertura de Asiento / Movimiento Financiero
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Complete los datos del formulario para registrar la transacción en el libro diario.
                    </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3.5}>

                            {formError && <Alert severity="error" variant="outlined">{formError}</Alert>}

                            {/* SECCIÓN 1: Clasificación de Operación */}
                            <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Receipt fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Clasificación Básica</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="tipo_movimiento"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select size="small" fullWidth label="Naturaleza del Flujo"
                                                    {...field} error={Boolean(errors.tipo_movimiento)}
                                                    helperText={errors.tipo_movimiento?.message}
                                                >
                                                    <MenuItem value="INGRESO">Ingreso (Crédito / +)</MenuItem>
                                                    <MenuItem value="EGRESO">Egreso (Débito / -)</MenuItem>
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="categoria_id"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select size="small" fullWidth label="Categoría Contable"
                                                    {...field} error={Boolean(errors.categoria_id)}
                                                    helperText={errors.categoria_id?.message} disabled={!tipoMovimiento}
                                                >
                                                    {categorias.map((cat) => (
                                                        <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* SECCIÓN 2: Origen y Destino de Fondos */}
                            <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <AccountBalanceWallet fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Instrumentación de Fondos</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Controller
                                            name="entidad_tipo"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select size="small" fullWidth label="Tipo de Instrumento"
                                                    {...field} error={Boolean(errors.entidad_tipo)}
                                                    helperText={errors.entidad_tipo?.message} disabled={!tipoMovimiento}
                                                >
                                                    <MenuItem value="CAJA">Caja General / Efectivo</MenuItem>
                                                    <MenuItem value="CUENTA">Cuenta Bancaria</MenuItem>
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <Controller
                                            name="entidad_id"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select size="small" fullWidth label="Entidad Asignada"
                                                    {...field} error={Boolean(errors.entidad_id)}
                                                    helperText={errors.entidad_id?.message} disabled={!entidadTipo}
                                                >
                                                    {entidadTipo === 'CAJA'
                                                        ? cajas.map((caja) => (
                                                            <MenuItem key={caja.id} value={caja.id}>{caja.nombre}</MenuItem>
                                                        ))
                                                        : cuentas.map((cuenta) => (
                                                            <MenuItem key={cuenta.id} value={cuenta.id}>
                                                                {`${cuenta.numero_cuenta} - ${cuenta.banco?.nombre_comercial ?? 'Sin banco'} (${cuenta.moneda?.codigo ?? 'N/A'})`}
                                                            </MenuItem>
                                                        ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* SECCIÓN 3: Cuantía y Fecha */}
                            <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <DateRange fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Liquidación e Importe</Typography>
                                </Box>

                                <Grid container spacing={2} alignItems="flex-start">
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="fecha_transaccion"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    label="Fecha Valor" type="date" size="small"
                                                    {...field} InputLabelProps={{ shrink: true }} fullWidth
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name={amountFieldName}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    label={amountLabel} type="number" size="small"
                                                    inputProps={{ step: '0.01', min: '0', style: { fontFamily: 'monospace', fontWeight: 600 } }}
                                                    {...field}
                                                    onChange={(event) =>
                                                        field.onChange(event.target.value === '' ? undefined : parseFloat(event.target.value))
                                                    }
                                                    fullWidth error={Boolean(errors[amountFieldName as keyof typeof errors])}
                                                    helperText={errors[amountFieldName as keyof typeof errors]?.message as string || undefined}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Manejo Dinámico Multidivisa en Contenedor Dedicado */}
                                {isDifferentCurrency && (
                                    <Paper sx={{ p: 2, mt: 2, bgcolor: 'action.hover', borderRadius: 1.5, border: '1px dashed', borderColor: 'divider' }}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Paridad Monetaria de Registro</FormLabel>
                                            <RadioGroup
                                                row value={monedaSeleccionada}
                                                onChange={(event) => setMonedaSeleccionada(event.target.value as 'base' | 'cuenta')}
                                            >
                                                <FormControlLabel
                                                    value="base" control={<Radio size="small" />}
                                                    label={<Typography variant="body2">Divisa Base ({user?.negocio?.moneda?.codigo})</Typography>}
                                                />
                                                <FormControlLabel
                                                    value="cuenta" control={<Radio size="small" />}
                                                    label={<Typography variant="body2">Divisa Cuenta ({selectedCuenta?.moneda?.codigo})</Typography>}
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                    </Paper>
                                )}
                            </Box>

                            <Divider />

                            {/* SECCIÓN 4: Auditoría y Comentarios */}
                            <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Description fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Documentación de Respaldo</Typography>
                                </Box>
                                <Controller
                                    name="descripcion"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            label="Concepto General / Glosa" multiline minRows={2} size="small"
                                            placeholder="Detalle los motivos del movimiento..." {...field} fullWidth
                                        />
                                    )}
                                />
                            </Box>

                            {/* Acciones del Formulario */}
                            <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
                                <Button variant="text" color="inherit" size="medium" onClick={() => navigate('/ingresos-egresos')} sx={{ textTransform: 'none' }}>
                                    Descartar
                                </Button>
                                <Button variant="contained" type="submit" size="medium" disableElevation disabled={saving} sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}>
                                    {saving ? 'Procesando Asiento...' : 'Confirmar Registro'}
                                </Button>
                            </Box>

                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
