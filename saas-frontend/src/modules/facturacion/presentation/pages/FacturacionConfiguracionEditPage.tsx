import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    TextField,
    Button,
    Paper,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormHelperText,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Close, SettingsSuggestOutlined } from '@mui/icons-material';
import { toast } from 'sonner';

import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';

import { facturacionRepository } from '../../infrastructure/repositories/facturacion.repository';
import {
    facturacionConfigSchema,
    type FacturacionConfigFormValues
} from '../../domain/schemas/facturacion-config.schema';

export const FacturacionConfiguracionEditPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FacturacionConfigFormValues>({
        resolver: zodResolver(facturacionConfigSchema) as any,
        defaultValues: {
            nit_emisor: '',
            nombre_emisor: '',
            nombre_comercial: '',
            correo_emisor: '',
            afiliacion_iva: 'GEN',
            tipo_frase: 1,
            codigo_escenario: 1,
            fel_username: '',
            fel_password: '',
            fel_ambiente: 'PRUEBAS'
        }
    });

    useEffect(() => {
        let isMounted = true;
        const cargarConfig = async () => {
            setLoading(true);
            try {
                const config = await facturacionRepository.obtenerConfiguracion();
                if (config && isMounted) {
                    reset({
                        nit_emisor: config.nit_emisor,
                        nombre_emisor: config.nombre_emisor,
                        nombre_comercial: config.nombre_comercial,
                        correo_emisor: config.correo_emisor,
                        afiliacion_iva: config.afiliacion_iva as 'GEN' | 'PEQ',
                        tipo_frase: config.tipo_frase,
                        codigo_escenario: config.codigo_escenario,
                        fel_username: config.fel_username,
                        fel_password: '',
                        fel_ambiente: config.fel_ambiente as 'PRUEBAS' | 'PRODUCCION'
                    });
                }
            } catch (error) {
                console.error('Error al cargar configuración:', error);
                toast.error('No se pudo cargar la configuración actual');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        cargarConfig();
        return () => {
            isMounted = false;
        };
    }, [reset]);

    const onSubmit = async (data: FacturacionConfigFormValues) => {
        try {
            await facturacionRepository.actualizarConfiguracion(data);
            toast.success('Configuración fiscal actualizada correctamente');
            navigate('/facturacion/configuracion');
        } catch (error: any) {
            console.error('Error al guardar configuración:', error);
            const msg = error.response?.data?.message || 'Error al guardar la configuración fiscal';
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <Loading />
            </Box>
        );
    }

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: (t) => t.palette.primary.light + '22',
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <SettingsSuggestOutlined />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                Editar Configuración Fiscal
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Actualiza los datos del emisor, régimen tributario y credenciales Digifact
                            </Typography>
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<Close />}
                            onClick={() => navigate('/facturacion/configuracion')}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <SubmitButton
                            text="Guardar Cambios"
                            icon={<Save />}
                            isSubmitting={isSubmitting}
                        />
                    </Stack>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    Los cambios de régimen afectarán a las nuevas facturas emitidas. Las facturas certificadas previamente conservarán su régimen histórico y cálculos fiscales correspondientes.
                </Alert>

                <Grid container spacing={3}>
                    {/* Sección 1: Datos del Emisor */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                Información del Emisor
                            </Typography>

                            <Stack spacing={2.5}>
                                <TextField
                                    label="NIT Emisor (sin guiones)"
                                    fullWidth
                                    {...register('nit_emisor')}
                                    error={!!errors.nit_emisor}
                                    helperText={errors.nit_emisor?.message}
                                />

                                <TextField
                                    label="Nombre o Razón Social del Emisor"
                                    fullWidth
                                    {...register('nombre_emisor')}
                                    error={!!errors.nombre_emisor}
                                    helperText={errors.nombre_emisor?.message}
                                />

                                <TextField
                                    label="Nombre Comercial"
                                    fullWidth
                                    {...register('nombre_comercial')}
                                    error={!!errors.nombre_comercial}
                                    helperText={errors.nombre_comercial?.message}
                                />

                                <TextField
                                    label="Correo Electrónico Emisor"
                                    type="email"
                                    fullWidth
                                    {...register('correo_emisor')}
                                    error={!!errors.correo_emisor}
                                    helperText={errors.correo_emisor?.message}
                                />
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Sección 2: Régimen y Certificador FEL */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                Régimen SAT y Credenciales FEL
                            </Typography>

                            <Stack spacing={2.5}>
                                <Controller
                                    name="afiliacion_iva"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.afiliacion_iva}>
                                            <InputLabel>Afiliación IVA / Régimen</InputLabel>
                                            <Select {...field} label="Afiliación IVA / Régimen">
                                                <MenuItem value="GEN">Régimen General (GEN) - 12% IVA (FACT)</MenuItem>
                                                <MenuItem value="PEQ">Pequeño Contribuyente (PEQ) - 5% Flat (FPEQ)</MenuItem>
                                            </Select>
                                            {errors.afiliacion_iva && (
                                                <FormHelperText>{errors.afiliacion_iva.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />

                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <TextField
                                            label="Tipo de Frase SAT"
                                            type="number"
                                            fullWidth
                                            {...register('tipo_frase')}
                                            error={!!errors.tipo_frase}
                                            helperText={errors.tipo_frase?.message || 'Ej. 1 para retención o régimen'}
                                        />
                                    </Grid>
                                    <Grid size={6} >
                                        <TextField
                                            label="Código de Escenario SAT"
                                            type="number"
                                            fullWidth
                                            {...register('codigo_escenario')}
                                            error={!!errors.codigo_escenario}
                                            helperText={errors.codigo_escenario?.message || 'Ej. 1 para pagos trimestrales'}
                                        />
                                    </Grid>
                                </Grid>

                                <TextField
                                    label="Usuario FEL (Digifact)"
                                    fullWidth
                                    {...register('fel_username')}
                                    error={!!errors.fel_username}
                                    helperText={errors.fel_username?.message}
                                />

                                <TextField
                                    label="Contraseña FEL"
                                    type="password"
                                    fullWidth
                                    {...register('fel_password')}
                                    error={!!errors.fel_password}
                                    helperText={errors.fel_password?.message || 'Dejar en blanco si no deseas cambiar la contraseña actual'}
                                />

                                <Controller
                                    name="fel_ambiente"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.fel_ambiente}>
                                            <InputLabel>Ambiente FEL</InputLabel>
                                            <Select {...field} label="Ambiente FEL">
                                                <MenuItem value="PRUEBAS">Ambiente de Pruebas (Test Digifact)</MenuItem>
                                                <MenuItem value="PRODUCCION">Producción Oficial SAT</MenuItem>
                                            </Select>
                                            {errors.fel_ambiente && (
                                                <FormHelperText>{errors.fel_ambiente.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default FacturacionConfiguracionEditPage;
