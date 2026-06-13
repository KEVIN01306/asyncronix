import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';
import { bajarCalidadImagen } from '../../../../core/utils/bajarCalidadImagen';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { negocioEditSchema, type NegocioEditFormValues } from '../../domain/negocio.schema';
import { negocioRepository } from '../../infrastructure/repositories/negocio.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const NegocioEditPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<NegocioEditFormValues>({
        resolver: zodResolver(negocioEditSchema),
        defaultValues: {
            nombre: '',
            nombre_comercial: null,
            nit_rut: null,
            slogan: null,
            instagram_id: null,
            facebook_id: null,
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const negocio = await negocioRepository.obtenerMiNegocio();

                setValue('nombre', negocio.nombre);
                setValue('nombre_comercial', negocio.nombre_comercial ?? null);
                setValue('nit_rut', negocio.nit_rut ?? null);
                setValue('slogan', negocio.slogan ?? null);
                setValue('instagram_id', negocio.instagram_id ?? null);
                setValue('facebook_id', negocio.facebook_id ?? null);
                setLogoPreview(negocio.logo_url ? `${import.meta.env.VITE_API_URL}/${negocio.logo_url}` : null);
            } catch (error) {
                console.error(error);
                toast.error('No se pudieron cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setValue]);

    const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setLogoFile(file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        return () => {
            if (logoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const onSubmit = async (data: NegocioEditFormValues) => {
        try {
            const formData = new FormData();
            formData.append('nombre', data.nombre);
            formData.append('nombre_comercial', data.nombre_comercial ?? '');
            formData.append('nit_rut', data.nit_rut ?? '');
            formData.append('slogan', data.slogan ?? '');
            formData.append('instagram_id', data.instagram_id ?? '');
            formData.append('facebook_id', data.facebook_id ?? '');
            if (logoFile) {
                const compressedLogo = await bajarCalidadImagen(logoFile, 0.4, 'png');
                formData.append('logo', compressedLogo);
            }

            await negocioRepository.actualizarMiNegocio(formData);
            toast.success('Negocio actualizado correctamente');
            navigate('/negocio');
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar el negocio');
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <Box p={2} maxWidth="900px" mx="auto">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/negocio')}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="h5" fontWeight={700} mb={4}>
                    Configuración del Negocio
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Nombre Legal"
                                fullWidth
                                {...register('nombre')}
                                error={!!errors.nombre}
                                helperText={errors.nombre?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Nombre Comercial"
                                fullWidth
                                {...register('nombre_comercial')}
                                error={!!errors.nombre_comercial}
                                helperText={errors.nombre_comercial?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="NIT / RUT"
                                fullWidth
                                {...register('nit_rut')}
                                error={!!errors.nit_rut}
                                helperText={errors.nit_rut?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Eslogan"
                                fullWidth
                                {...register('slogan')}
                                error={!!errors.slogan}
                                helperText={errors.slogan?.message}
                            />
                        </Grid>

                        <Grid size={ 12 }>
                            <Grid container sx={{ 
                                p: 3, 
                                border: '1px dashed', 
                                borderColor: 'divider', 
                                borderRadius: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4,
                                bgcolor: 'background.paper'
                            }}>
                                <Grid sx={{ position: 'relative' }} size={{ xs: 12, md: 3 }}>
                                    {logoPreview ? (
                                        <Box
                                            component="img"
                                            src={logoPreview}
                                            sx={{ width: 110, height: 110, objectFit: 'contain', borderRadius: 2, bgcolor: 'white', border: '1px solid #eee' }}
                                        />
                                    ) : (
                                        <Box sx={{ width: 110, height: 110, bgcolor: 'white', border: '1px solid #eee', borderRadius: 2, display: 'grid', placeItems: 'center', color: 'text.disabled' }}>
                                            Sin Logo
                                        </Box>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>Logo del Negocio</Typography>
                                    <Typography variant="body2" color="text.secondary" mb={2}>Recomendado: 512x512px (PNG o JPG)</Typography>
                                    <Button variant="contained" component="label" size="small" disableElevation>
                                        Subir Nueva Imagen
                                        <input hidden accept="image/*" type="file" onChange={handleLogoChange} />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Instagram ID"
                                fullWidth
                                placeholder="@usuario"
                                {...register('instagram_id')}
                                error={!!errors.instagram_id}
                                helperText={errors.instagram_id?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Facebook ID"
                                fullWidth
                                {...register('facebook_id')}
                                error={!!errors.facebook_id}
                                helperText={errors.facebook_id?.message}
                            />
                        </Grid>

                        {/* Botón de Guardado */}
                        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                            <SubmitButton
                                isSubmitting={isSubmitting}
                                text="Guardar Cambios"
                                loadingText="Procesando..."
                                icon={<Save />}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default NegocioEditPage;