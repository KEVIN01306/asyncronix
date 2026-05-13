import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { usuarioSchema, type UsuarioFormValues } from '../../domain/schemas/usuario.schema';
import { usuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { sucursalRepository } from '../../../sucursales/infrastructure/repositories/sucursal.repository';
import type { Sucursal } from '../../../sucursales/domain/interfaces/sucursal.interface';

const UsuarioFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);

    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UsuarioFormValues>({
        resolver: zodResolver(usuarioSchema)
    });


    const fetchSucursales = async () => {
            setLoading(true);
            try {
                const response = await sucursalRepository.listar(100, 0);
                setSucursales(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchSucursales();
    }, []);

    useEffect(() => {
        if (isEdit && id) {
            const fetchUsuario = async () => {
                setLoading(true);
                try {
                    const data = await usuarioRepository.obtener(id);
                    console.log(data);
                    reset({
                        nombre: data.nombre,
                        telefono: data.telefono,
                        roles: data.roles,
                        apellido: data.apellido,
                        email: data.email,
                        sucursal_id: data.sucursal ? data.sucursal.id : undefined,
                    });
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUsuario();
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
        <Box p={2} maxWidth="1200px" mx="auto">
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => navigate(-1)} 
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                            label="Apellido del Usuario"
                            fullWidth
                            {...register('apellido')}
                            error={!!errors.apellido}
                            helperText={errors.apellido?.message}
                        />

                        <TextField
                            label="Telefono"
                            fullWidth
                            {...register('telefono')}
                            error={!!errors.telefono}
                            helperText={errors.telefono?.message}
                        />

                        <TextField
                            label="Email"
                            fullWidth
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />

                        <TextField
                            label="Password"
                            fullWidth
                            {...register('password_hash')}
                            error={!!errors.password_hash}
                            helperText={errors.password_hash?.message}
                        />

                        <TextField
                            label="Roles"
                            fullWidth
                            {...register('roles')}
                            error={!!errors.roles}
                            helperText={errors.roles?.message}
                        />

                        <FormControl fullWidth error={!!errors.sucursal_id}>
                            <InputLabel id="sucursal-label">Sucursal</InputLabel>
                            <Controller
                                name="sucursal_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        labelId="sucursal-label"
                                        label="Sucursal"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(event) => field.onChange(event.target.value === '' ? null : event.target.value)}
                                    >
                                        <MenuItem value="">
                                            <em>Sin sucursal</em>
                                        </MenuItem>
                                        {sucursales.map((sucursal) => (
                                            <MenuItem key={sucursal.id} value={sucursal.id}>
                                                {sucursal.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            <FormHelperText>{errors.sucursal_id?.message || 'Dejar vacío si el usuario no pertenece a una sucursal'}</FormHelperText>
                        </FormControl>

                        <SubmitButton 
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar Cambios' : 'Registrar Usuario'}
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