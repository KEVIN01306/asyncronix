import { useEffect, useState } from 'react';
import { Box, Typography, Stack, TextField, Button, Grid, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Save, Close } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../../shared/components/button/SubmitButton';
import Loading from '../../../../../shared/components/ui/Loaders/Loading';
import { negocioFacturacionSchema, type NegocioFacturacionFormValues } from '../../../domain/schemas/negocio-facturacion.schema';
import { negocioFacturacionRepository } from '../../../infrastructure/repositories/negocio-facturacion.repository';
import { negocioRepository } from '../../../infrastructure/repositories/negocio.repository';
import type { NegocioFacturacionConfig } from '../../../domain/interface/negocio-facturacion.interface';
import { sucursalRepository } from '../../../../sucursales/infrastructure/repositories/sucursal.repository';
import { FacturaTermicaPreview } from '../../../../../shared/components/ui/FacturaTermicaPreview';
import { mockFacturaTermicaData } from '../../../../../shared/mocks/factura-termica.mock';
import { useAuthStore } from '../../../../../core/store/authStore';
import { LocalPrintshop as PrintIcon } from '@mui/icons-material';

export const NegocioFacturacionTab = () => {
    const user = useAuthStore(state => state.user);
    const [facturacion, setFacturacion] = useState<NegocioFacturacionConfig | null>(null);
    const [negocio, setNegocio] = useState<any>(null);
    const [sucursal, setSucursal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<NegocioFacturacionFormValues>({
        resolver: zodResolver(negocioFacturacionSchema) as any
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dataFacturacion, dataNegocio, dataSucursal] = await Promise.all([
                negocioFacturacionRepository.obtener().catch(() => null),
                negocioRepository.obtenerMiNegocio().catch(() => null),
                sucursalRepository.obtenerMiSucursal().catch(() => null)
            ]);

            setFacturacion(dataFacturacion);
            setNegocio(dataNegocio);
            setSucursal(dataSucursal);

            if (dataFacturacion) {
                reset({
                    nit_emisor: dataFacturacion.nit_emisor,
                    nombre_emisor: dataFacturacion.nombre_emisor,
                    nombre_comercial: dataFacturacion.nombre_comercial,
                    afiliacion_iva: dataFacturacion.afiliacion_iva,
                    tipo_frase: dataFacturacion.tipo_frase,
                    codigo_escenario: dataFacturacion.codigo_escenario,
                    correo_emisor: dataFacturacion.correo_emisor,
                    fel_username: dataFacturacion.fel_username,
                    fel_password: '',
                    fel_ambiente: dataFacturacion.fel_ambiente,
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handlePrint = () => {
        window.print();
    };

    const onSubmit = async (data: NegocioFacturacionFormValues) => {
        try {
            const result = await negocioFacturacionRepository.actualizar(data);
            setFacturacion(result);
            setIsEditing(false);
            toast.success('Información fiscal actualizada correctamente');
        } catch (error) {
            console.error(error);
        }
    };

    const handleCancel = () => {
        if (facturacion) {
            reset(facturacion);
        } else {
            reset({
                nit_emisor: '',
                nombre_emisor: '',
                nombre_comercial: '',
                afiliacion_iva: 'GEN',
                tipo_frase: 1,
                codigo_escenario: 1,
                correo_emisor: '',
                fel_username: '',
                fel_password: '',
                fel_ambiente: 'PRUEBAS'
            });
        }
        setIsEditing(false);
    };

    if (loading) return <Loading />;

    const renderContent = () => {
        if (!isEditing) {
            return (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight="bold">Configuración Fiscal (Facturación Electrónica)</Typography>
                        <Button startIcon={<Edit />} variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                            {facturacion ? 'Editar' : 'Configurar'}
                        </Button>
                    </Box>

                    {!facturacion ? (
                        <Typography color="text.secondary">No hay configuración fiscal establecida.</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">NIT Emisor</Typography>
                                <Typography variant="body1" mb={2}>{facturacion.nit_emisor}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Nombre Emisor</Typography>
                                <Typography variant="body1" mb={2}>{facturacion.nombre_emisor}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Nombre Comercial</Typography>
                                <Typography variant="body1" mb={2}>{facturacion.nombre_comercial}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Correo Emisor</Typography>
                                <Typography variant="body1" mb={2}>{facturacion.correo_emisor}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Afiliación IVA</Typography>
                                <Typography variant="body1" mb={2}>{facturacion.afiliacion_iva}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Tipo Frase / Escenario</Typography>
                                <Typography variant="body1" mb={2}>{facturacion.tipo_frase} / {facturacion.codigo_escenario}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">FEL Username</Typography>
                                <Typography variant="body1" mb={2}>{facturacion.fel_username}</Typography>

                                <Typography variant="subtitle2" color="text.secondary">FEL Password</Typography>
                                <Typography variant="body1" mb={2}>********</Typography>

                                <Typography variant="subtitle2" color="text.secondary">Ambiente FEL</Typography>
                                <Typography variant="body1" mb={2}>{facturacion.fel_ambiente}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            );
        }

        return (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold">Editar Configuración Fiscal</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button startIcon={<Close />} variant="outlined" color="inherit" onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <SubmitButton text="Guardar" icon={<Save />} isSubmitting={isSubmitting} />
                    </Stack>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <TextField
                                label="NIT Emisor"
                                fullWidth
                                {...register('nit_emisor')}
                                error={!!errors.nit_emisor}
                                helperText={errors.nit_emisor?.message}
                            />
                            <TextField
                                label="Nombre Emisor"
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
                                label="Correo Emisor"
                                fullWidth
                                {...register('correo_emisor')}
                                error={!!errors.correo_emisor}
                                helperText={errors.correo_emisor?.message}
                            />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <Controller
                                name="afiliacion_iva"
                                control={control}
                                defaultValue="GEN"
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.afiliacion_iva}>
                                        <InputLabel>Afiliación IVA</InputLabel>
                                        <Select {...field} label="Afiliación IVA">
                                            <MenuItem value="GEN">General (GEN)</MenuItem>
                                            <MenuItem value="PEQ">Pequeño Contribuyente (PEQ)</MenuItem>
                                        </Select>
                                        {errors.afiliacion_iva && <FormHelperText>{errors.afiliacion_iva.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                            <TextField
                                label="Tipo de Frase"
                                type="number"
                                fullWidth
                                {...register('tipo_frase')}
                                error={!!errors.tipo_frase}
                                helperText={errors.tipo_frase?.message}
                            />
                            <TextField
                                label="Código de Escenario"
                                type="number"
                                fullWidth
                                {...register('codigo_escenario')}
                                error={!!errors.codigo_escenario}
                                helperText={errors.codigo_escenario?.message}
                            />
                            <TextField
                                label="FEL Username"
                                fullWidth
                                {...register('fel_username')}
                                error={!!errors.fel_username}
                                helperText={errors.fel_username?.message}
                            />
                            <TextField
                                label="FEL Password"
                                type="password"
                                fullWidth
                                {...register('fel_password')}
                                error={!!errors.fel_password}
                                helperText={errors.fel_password?.message || 'Déjalo en blanco si no deseas cambiarlo'}
                            />
                            <Controller
                                name="fel_ambiente"
                                control={control}
                                defaultValue="PRUEBAS"
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.fel_ambiente}>
                                        <InputLabel>Ambiente FEL</InputLabel>
                                        <Select {...field} label="Ambiente FEL">
                                            <MenuItem value="PRUEBAS">Pruebas</MenuItem>
                                            <MenuItem value="PRODUCCION">Producción</MenuItem>
                                        </Select>
                                        {errors.fel_ambiente && <FormHelperText>{errors.fel_ambiente.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <Box>
            {renderContent()}

            {/* Factura Preview Section */}
            <Box mt={6} pt={4} borderTop={1} borderColor="divider">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Preview de Factura Térmica</Typography>
                        <Typography variant="body2" color="text.secondary">Así se verá el formato al imprimir tickets</Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        disableRipple
                        disableFocusRipple
                        onClick={() => setTimeout(() => handlePrint(), 300)}
                    >
                        Imprimir factura de prueba
                    </Button>
                </Box>

                <Box bgcolor="grey.100" p={4} borderRadius={2} display="flex" justifyContent="center">
                    <FacturaTermicaPreview
                        data={{
                            ...mockFacturaTermicaData,
                            negocio_nombre: facturacion?.nombre_comercial || negocio?.nombre_comercial || 'NEGOCIO DE PRUEBA',
                            negocio_nit: facturacion?.nit_emisor || negocio?.nit_rut || '12345678',
                            negocio_telefono: sucursal?.telefono || '---',
                            sucursal_direccion: sucursal?.direccion || 'Dirección de la sucursal actual',
                            slogan: negocio?.slogan || '¡Gracias por su preferencia!',
                            atendido_por: user?.nombre || 'Usuario',
                            certificador_nit: '77454820', // Digifact
                            certificador_nombre: 'Digifact S.A.',
                        } as any}
                        width="80mm"
                    />
                </Box>
            </Box>
        </Box>
    );
};
