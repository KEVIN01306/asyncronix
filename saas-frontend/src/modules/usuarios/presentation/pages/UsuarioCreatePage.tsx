import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Autocomplete,
    Grid,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { usuarioCreateSchema, type UsuarioCreateFormValues } from '../../domain/schemas/usuario.schema';
import { usuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { sucursalRepository } from '../../../sucursales/infrastructure/repositories/sucursal.repository';
import type { Sucursal } from '../../../sucursales/domain/interfaces/sucursal.interface';
import type { Rol } from '../../../roles/domain/interfaces/rol.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const UsuarioCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);

    const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<UsuarioCreateFormValues>({
        resolver: zodResolver(usuarioCreateSchema),
        defaultValues: {
            nombre: '',
            apellido: null,
            email: '',
            telefono: '',
            password: '',
            confirmPassword: '',
            roles: [],
            sucursal_id: null,
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sucursalesRes, rolesRes] = await Promise.all([
                    sucursalRepository.listar(100, 0),
                    usuarioRepository.listarRoles(),
                ]);
                setSucursales(sucursalesRes.data);
                setRoles(rolesRes.data);
            } catch (error) {
                console.error(error);
                toast.error('No se pudieron cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const onSubmit = async (data: UsuarioCreateFormValues) => {
        try {
            await usuarioRepository.registrar({
                nombre: data.nombre,
                apellido: data.apellido ?? null,
                email: data.email,
                telefono: data.telefono,
                rolIds: data.roles,
                sucursal_id: data.sucursal_id ?? null,
                password_hash: data.password,
            });
            toast.success('Usuario creado correctamente');
            navigate('/usuarios');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear el usuario');
        }
    };

    if (loading) return <Loading/>;

    return (
        <Box p={4} maxWidth="800px" mx="auto">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    Crear Nuevo Usuario
                </Typography>

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        {/* Fila 1: Nombre y Apellido */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Nombre"
                                fullWidth
                                {...register('nombre')}
                                error={!!errors.nombre}
                                helperText={errors.nombre?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Apellido"
                                fullWidth
                                {...register('apellido')}
                                error={!!errors.apellido}
                                helperText={errors.apellido?.message}
                            />
                        </Grid>

                        {/* Fila 2: Email y Teléfono */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Email"
                                fullWidth
                                type="email"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Teléfono"
                                fullWidth
                                {...register('telefono')}
                                error={!!errors.telefono}
                                helperText={errors.telefono?.message}
                            />
                        </Grid>

                        {/* Fila 3: Contraseñas */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Contraseña"
                                fullWidth
                                type="password"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Confirmar Contraseña"
                                fullWidth
                                type="password"
                                {...register('confirmPassword')}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                            />
                        </Grid>

                        {/* Fila 4: Sucursal y Roles */}
                        <Grid size={{ xs: 12, md: 6 }}>
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
                                <FormHelperText>{errors.sucursal_id?.message || 'Opcional'}</FormHelperText>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="roles"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        multiple
                                        options={roles}
                                        getOptionLabel={(option) => option.nombre}
                                        value={roles.filter((rol) => field.value.includes(rol.id))}
                                        onChange={(_, value) => field.onChange(value.map((rol) => rol.id))}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Roles"
                                                placeholder="Selecciona roles"
                                                error={!!errors.roles}
                                                helperText={errors.roles?.message || 'Selecciona uno o más roles'}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Botón de envío: Ocupa todo el ancho */}
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ mt: 1 }}>
                                <SubmitButton
                                    isSubmitting={isSubmitting}
                                    text="Crear Usuario"
                                    loadingText="Creando..."
                                    icon={<Save />}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default UsuarioCreatePage;