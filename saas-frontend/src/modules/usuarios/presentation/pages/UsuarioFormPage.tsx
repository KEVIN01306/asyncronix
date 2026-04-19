import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { usuarioSchema, type UsuarioFormValues } from '../../domain/schemas/usuario.schema';
import { usuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import type { RolUsuario } from '../../domain/enums/rol.enum';

const UsuarioFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UsuarioFormValues>({
        resolver: zodResolver(usuarioSchema)
    });

    useEffect(() => {
        if (isEdit && id) {
            const fetchSucursal = async () => {
                setLoading(true);
                try {
                    const data = await usuarioRepository.obtener(id);
                    reset({
                        nombre: data.nombre,
                        telefono: data.telefono,
                        rol: data.rol as RolUsuario,
                        sucursal_id: data.sucursal ? data.sucursal.id : undefined,
                    });
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };

            fetchSucursal();
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: UsuarioFormValues) => {
        try {
            if (isEdit && id) {
                await usuarioRepository.actualizar(id, data);
                toast.success('Usuario actualizado correctamente');
            } else {
                await usuarioRepository.registrar(data);
                toast.success('Usuario creado correctamente');
            }
            navigate('/usuarios');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box p={4} maxWidth="600px" mx="auto">
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => navigate(-1)} 
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar Sucursal' : 'Nueva Sucursal'}
                </Typography>

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            label="Nombre del Usuario"
                            fullWidth
                            {...register('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />

                        <TextField
                            label="Telefono"
                            fullWidth
                            {...register('telefono')}
                            error={!!errors.telefono}
                            helperText={errors.telefono?.message}
                        />

                        <TextField
                            label="Password"
                            fullWidth
                            {...register('password_hash')}
                            error={!!errors.password_hash}
                            helperText={errors.password_hash?.message}
                        />

                        <TextField
                            label="Rol"
                            fullWidth
                            {...register('rol')}
                            error={!!errors.rol}
                            helperText={errors.rol?.message}
                        />

                        <TextField
                            label="Sucursal"
                            fullWidth
                            {...register('sucursal_id')}
                            error={!!errors.sucursal_id}
                            helperText={errors.sucursal_id?.message || 'Dejar vacío si el usuario no pertenece a una sucursal'}
                        />



                        <SubmitButton 
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar Cambios' : 'Registrar Sucursal'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default UsuarioFormPage;