import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { clienteFormSchema, type ClienteFormInput } from '../../domain/cliente.schema';
import { clienteRepository } from '../../infrastructure/clientes.repository';
import type { ClienteCreateFormValues } from '../../domain/interfaces/cliente.interface';

const ClienteFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClienteFormInput>({
        resolver: zodResolver(clienteFormSchema),
        defaultValues: {
            nombre: '',
            telefono: '',
            apellido: undefined,
            email: '',
            nit: '',
            dpi: '',
        }
    });

    useEffect(() => {
        if (isEdit && id) {
            const fetchCliente = async () => {
                setLoading(true);
                try {
                    const response = await clienteRepository.obtener(id);
                    const cliente = response.data;
                    reset({
                        nombre: cliente.nombre,
                        apellido: cliente.apellido,
                        telefono: cliente.telefono,
                        email: cliente.email,
                        nit: cliente.nit,
                        dpi: cliente.dpi,
                    });
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };

            fetchCliente();
        } else {
            const nitFromQuery = searchParams.get('nit');
            if (nitFromQuery) {
                reset((current) => ({
                    ...current,
                    nit: nitFromQuery,
                }));
            }
        }
    }, [id, isEdit, reset, searchParams]);

    const onSubmit: SubmitHandler<ClienteFormInput> = async (data) => {
        try {
            if (isEdit && id) {
                await clienteRepository.actualizar(id, data as ClienteCreateFormValues);
                toast.success('Cliente actualizado correctamente');
            } else {
                await clienteRepository.registrar(data as ClienteCreateFormValues);
                toast.success('Cliente creado correctamente');
            }
            navigate(-1);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar el cliente');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box p={2} maxWidth="800px" mx="auto">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                </Typography>

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            label="Nombre"
                            fullWidth
                            {...register('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />

                        <TextField
                            label="Apellido"
                            fullWidth
                            {...register('apellido')}
                            error={!!errors.apellido}
                            helperText={errors.apellido?.message}
                        />

                        <TextField
                            label="Teléfono"
                            fullWidth
                            {...register('telefono')}
                            error={!!errors.telefono}
                            helperText={errors.telefono?.message}
                        />

                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />

                        <TextField
                            label="NIT"
                            fullWidth
                            {...register('nit')}
                            error={!!errors.nit}
                            helperText={errors.nit?.message}
                        />

                        <TextField
                            label="DPI"
                            fullWidth
                            {...register('dpi')}
                            error={!!errors.dpi}
                            helperText={errors.dpi?.message}
                        />

                        <SubmitButton
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Actualizar Cliente' : 'Crear Cliente'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default ClienteFormPage;
