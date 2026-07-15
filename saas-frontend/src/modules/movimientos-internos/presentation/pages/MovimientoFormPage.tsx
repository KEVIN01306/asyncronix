import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box, Button, Card, CardContent,
    Stack, TextField, Typography, Grid, Divider, MenuItem
} from '@mui/material';
import { AccountBalanceWallet, Description, SwapHoriz } from '@mui/icons-material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { movimientosRepository } from '../../infrastructure/movimientos.repository';
import { cajaRepository } from '../../../caja/infrastructure/caja.repository';
import { cuentaBancariaRepository } from '../../../cuenta-bancaria/infrastructure/cuenta-bancaria.repository';
import type { Caja } from '../../../caja/domain/interfaces/caja.interface';
import type { CuentaBancaria } from '../../../cuenta-bancaria/domain/interfaces/cuenta-bancaria.interface';
import { movimientoInternoSchema } from '../../domain/movimientos.schema';
import type { MovimientoInternoFormValues } from '../../domain/movimientos.schema';

export default function MovimientoFormPage() {
    const navigate = useNavigate();
    const [cajas, setCajas] = useState<Caja[]>([]);
    const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<MovimientoInternoFormValues>({
        resolver: zodResolver(movimientoInternoSchema),
        defaultValues: {
            origen_entidad: undefined,
            origen_id: '',
            destino_entidad: undefined,
            destino_id: '',
            monto_original: undefined,
            descripcion: '',
        },
    });

    const origenEntidad = watch('origen_entidad');
    const destinoEntidad = watch('destino_entidad');

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
                toast.error('Error cargando parámetros de tesorería');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        setValue('origen_id', '');
    }, [origenEntidad, setValue]);

    useEffect(() => {
        setValue('destino_id', '');
    }, [destinoEntidad, setValue]);

    const onSubmit = async (data: MovimientoInternoFormValues) => {
        setSaving(true);
        try {
            await movimientosRepository.crearMovimiento(data);
            toast.success('Movimiento interno registrado con éxito');
            navigate('/movimientos-internos');
        } catch (err: any) {
            toast.error(err.message || 'Fallo de validación en servidor');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box py={8}><Loading /></Box>;

    return (
        <Box py={4} px={{ xs: 2, sm: 4 }} maxWidth="900px" margin="auto">
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <Box p={3} borderBottom="1px solid" borderColor="divider">
                    <Typography variant="h6" fontWeight={700}>
                        Nuevo Movimiento Interno
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Registre un traslado de fondos entre cajas o cuentas de la empresa.
                    </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3.5}>
                            {/* Origen */}
                            <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <AccountBalanceWallet fontSize="small" color="error" />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Entidad de Origen (Débito)</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Controller
                                            name="origen_entidad"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select size="small" fullWidth label="Tipo de Origen"
                                                    {...field} error={Boolean(errors.origen_entidad)}
                                                    helperText={errors.origen_entidad?.message}
                                                >
                                                    <MenuItem value="CAJA">Caja General</MenuItem>
                                                    <MenuItem value="CUENTA">Cuenta Bancaria</MenuItem>
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <Controller
                                            name="origen_id"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select size="small" fullWidth label="Seleccione Origen"
                                                    {...field} error={Boolean(errors.origen_id)}
                                                    helperText={errors.origen_id?.message} disabled={!origenEntidad}
                                                >
                                                    {origenEntidad === 'CAJA' && cajas.map(c => (
                                                        <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                                                    ))}
                                                    {origenEntidad === 'CUENTA' && cuentas.map(c => (
                                                        <MenuItem key={c.id} value={c.id}>
                                                            {c.banco?.nombre_comercial} - {c.numero_cuenta}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider>
                                <SwapHoriz color="disabled" />
                            </Divider>

                            {/* Destino */}
                            <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <AccountBalanceWallet fontSize="small" color="success" />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Entidad de Destino (Crédito)</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Controller
                                            name="destino_entidad"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select size="small" fullWidth label="Tipo de Destino"
                                                    {...field} error={Boolean(errors.destino_entidad)}
                                                    helperText={errors.destino_entidad?.message}
                                                >
                                                    <MenuItem value="CAJA">Caja General</MenuItem>
                                                    <MenuItem value="CUENTA">Cuenta Bancaria</MenuItem>
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <Controller
                                            name="destino_id"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select size="small" fullWidth label="Seleccione Destino"
                                                    {...field} error={Boolean(errors.destino_id)}
                                                    helperText={errors.destino_id?.message} disabled={!destinoEntidad}
                                                >
                                                    {destinoEntidad === 'CAJA' && cajas.map(c => (
                                                        <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                                                    ))}
                                                    {destinoEntidad === 'CUENTA' && cuentas.map(c => (
                                                        <MenuItem key={c.id} value={c.id}>
                                                            {c.banco?.nombre_comercial} - {c.numero_cuenta}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Monto y Descripción */}
                            <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Description fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Detalles del Movimiento</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Controller
                                            name="monto_original"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    size="small" fullWidth label="Monto a trasladar"
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                    error={Boolean(errors.monto_original)}
                                                    helperText={errors.monto_original?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <Controller
                                            name="descripcion"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    size="small" fullWidth label="Glosa o Justificación"
                                                    multiline rows={2}
                                                    {...field} error={Boolean(errors.descripcion)}
                                                    helperText={errors.descripcion?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Submit */}
                            <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
                                <Button variant="outlined" color="inherit" onClick={() => navigate('/movimientos-internos')} disabled={saving}>
                                    Descartar
                                </Button>
                                <Button variant="contained" color="primary" type="submit" disabled={saving}>
                                    {saving ? 'Registrando...' : 'Confirmar Movimiento'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
