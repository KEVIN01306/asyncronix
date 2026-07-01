import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { proveedoresRepository } from '../../infrastructure/proveedores.repository';
import type { ProveedorCreateFormValues, ProveedorUpdateFormValues } from '../../domain/interfaces/proveedor.interface';
import { z } from 'zod';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const proveedorFormSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    contacto: z.string().optional().nullable(),
    telefono: z.string().optional().nullable(),
    email: z.union([z.string().email('El correo no es válido'), z.literal('')]).optional().nullable(),
    nit: z.string().optional().nullable(),
});

type FormInput = z.infer<typeof proveedorFormSchema>;

const ProveedorFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput>({
        resolver: zodResolver(proveedorFormSchema),
        defaultValues: { nombre: '', contacto: '', telefono: '', email: '', nit: '' }
    });

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true);
            proveedoresRepository.obtener(id)
                .then((res) => {
                    const p = res.data;
                    reset({ nombre: p.nombre, contacto: p.contacto ?? '', telefono: p.telefono, email: p.email ?? '', nit: p.nit ?? '' });
                })
                .catch(() => toast.error('Error al cargar proveedor'))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, reset]);

    const onSubmit: SubmitHandler<FormInput> = async (data) => {
        try {
            if (isEdit && id) {
                await proveedoresRepository.actualizar(id, data as ProveedorUpdateFormValues);
                toast.success('Proveedor actualizado correctamente');
            } else {
                await proveedoresRepository.registrar(data as ProveedorCreateFormValues);
                toast.success('Proveedor creado correctamente');
            }
            navigate(-1);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar el proveedor');
        }
    };

    if (loading) return <Loading />

    return (
        <Box p={2} maxWidth="800px" mx="auto">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none' }}>Volver</Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>{isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</Typography>

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField label="Nombre" fullWidth {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
                        <TextField label="Contacto" fullWidth {...register('contacto')} error={!!errors.contacto} helperText={errors.contacto?.message} />
                        <TextField label="Teléfono" fullWidth {...register('telefono')} error={!!errors.telefono} helperText={errors.telefono?.message} />
                        <TextField label="Email" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
                        <TextField label="NIT" fullWidth {...register('nit')} error={!!errors.nit} helperText={errors.nit?.message} />

                        <SubmitButton isSubmitting={isSubmitting} text={isEdit ? 'Actualizar Proveedor' : 'Crear Proveedor'} loadingText="Guardando..." icon={<Save />} />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProveedorFormPage;
