import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, Alert, AlertTitle } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { clienteFormSchema, type ClienteFormInput } from '../../domain/cliente.schema';
import { clienteRepository } from '../../infrastructure/clientes.repository';
import type { Cliente, ClienteCreateFormValues } from '../../domain/interfaces/cliente.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ClienteFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [clienteExistente, setClienteExistente] = useState<Cliente | null>(null);

    const { register, handleSubmit, reset, setValue, getValues, formState: { errors, isSubmitting } } = useForm<ClienteFormInput>({
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

    const verificarDocumento = async (tipo: 'dpi' | 'nit', valor: string) => {
        if (isEdit || !valor || valor.trim().length < 3) return;
        const clean = valor.trim();
        if (tipo === 'nit' && (clean.toUpperCase() === 'CF' || clean.toUpperCase() === 'C/F')) return;
        try {
            const res = await clienteRepository.buscarPorDocumento({
                dpi: tipo === 'dpi' ? clean : undefined,
                nit: tipo === 'nit' ? clean : undefined,
            });
            if (res.data) {
                const c = res.data;
                setClienteExistente(c);
                if (!getValues('nombre') && c.nombre) setValue('nombre', c.nombre);
                if (!getValues('apellido') && c.apellido) setValue('apellido', c.apellido);
                if (!getValues('telefono') && c.telefono) setValue('telefono', c.telefono);
                if (!getValues('email') && c.email) setValue('email', c.email);
                if (!getValues('nit') && c.nit) setValue('nit', c.nit);
                if (!getValues('dpi') && c.dpi) setValue('dpi', c.dpi);
                toast.info(`Cliente encontrado en el sistema: ${c.nombre}. Los datos faltantes que ingreses se completarán en su registro.`);
            }
        } catch {
            // Ignorar si no existe
        }
    };

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
            const dpiFromQuery = searchParams.get('dpi');
            if (dpiFromQuery) {
                reset((current) => ({
                    ...current,
                    dpi: dpiFromQuery,
                }));
                verificarDocumento('dpi', dpiFromQuery);
            }
        }
    }, [id, isEdit, reset, searchParams]);

    const onSubmit: SubmitHandler<ClienteFormInput> = async (data) => {
        try {
            if (isEdit && id) {
                await clienteRepository.actualizar(id, data as ClienteCreateFormValues);
                toast.success('Cliente actualizado correctamente');
            } else {
                const res = await clienteRepository.registrar(data as ClienteCreateFormValues);
                if (res.data?.reutilizado) {
                    toast.info('El cliente ya existía en la plataforma. Se vinculó a este negocio y se completaron los datos faltantes que ingresaste.');
                } else {
                    toast.success('Cliente creado y credenciales de acceso generadas exitosamente');
                }
            }
            navigate(-1);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al guardar el cliente';
            toast.error(msg);
        }
    };

    if (loading) return <Loading />

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

                {clienteExistente && !isEdit && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <AlertTitle>Cliente existente detectado ({clienteExistente.nombre} {clienteExistente.apellido || ''})</AlertTitle>
                        Este cliente ya cuenta con un perfil global. Cualquier campo que esté vacío en su registro actual y que ingreses a continuación (como teléfono, correo o NIT) se incorporará automáticamente a su cuenta.
                    </Alert>
                )}

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            label="DPI (CUI - 13 dígitos)"
                            fullWidth
                            {...register('dpi', {
                                onBlur: (e) => verificarDocumento('dpi', e.target.value),
                            })}
                            error={!!errors.dpi}
                            helperText={errors.dpi?.message ?? 'Identificador principal para acceso a la plataforma y servicios'}
                        />

                        <TextField
                            label="NIT"
                            fullWidth
                            {...register('nit', {
                                onBlur: (e) => verificarDocumento('nit', e.target.value),
                            })}
                            error={!!errors.nit}
                            helperText={errors.nit?.message ?? 'Opcional para facturación (CF si no tiene)'}
                        />

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
                            helperText={errors.telefono?.message ?? 'Opcional'}
                        />

                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message ?? 'Se enviarán las credenciales de acceso a este correo si se crea la cuenta'}
                        />

                        <SubmitButton
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Actualizar Cliente' : 'Guardar Cliente'}
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
