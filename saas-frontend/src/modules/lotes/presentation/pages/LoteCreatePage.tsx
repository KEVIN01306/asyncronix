import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { Box, Typography, Paper, TextField, Stack, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, Grid } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { LoteRepository } from '../../infrastructure/repositories/lote.repository';
import { ProductoRepository } from '../../../productos/infrastructure/repositories/producto.repository';
import { sucursalRepository } from '../../../sucursales/infrastructure/repositories/sucursal.repository';
import type { Producto } from '../../../productos/domain/interfaces/producto.interface';
import type { Sucursal } from '../../../sucursales/domain/interfaces/sucursal.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

interface LoteFormValues {
    producto_id: string;
    sucursal_id: string;
    cantidad_actual: number;
    costo_compra: number;
    precio_venta: number;
}

const LoteCreatePage = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const params = new URLSearchParams(search);
    const productoIdFromQuery = params.get('producto_id') || '';

    const [productos, setProductos] = useState<Producto[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoteFormValues>({
        defaultValues: {
            producto_id: productoIdFromQuery,
            sucursal_id: '',
            cantidad_actual: 0,
            costo_compra: 0,
            precio_venta: 0,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productosResponse, sucursalesResponse] = await Promise.all([
                    ProductoRepository.listar(100, 0),
                    sucursalRepository.listar(100, 0),
                ]);
                setProductos(productosResponse.data);
                setSucursales(sucursalesResponse.data);
                if (productoIdFromQuery) {
                    setValue('producto_id', productoIdFromQuery);
                }
            } catch (error) {
                console.error(error);
                toast.error('No se pudo cargar información de productos o sucursales');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productoIdFromQuery, setValue]);

    const onSubmit = async (data: LoteFormValues) => {
        setLoading(true);
        try {
            await LoteRepository.registrar(data);
            toast.success('Lote creado');
            navigate('/lotes');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear lote');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <Box p={isMobile ? 2 : 4} maxWidth="700px" mx="auto">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    Crear lote
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="producto_id"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.producto_id}>
                                        <InputLabel id="producto-label">Producto</InputLabel>
                                        <Select
                                            labelId="producto-label"
                                            label="Producto"
                                            {...field}
                                            value={field.value ?? ''}
                                        >
                                            <MenuItem value="">
                                                <em>Selecciona un producto</em>
                                            </MenuItem>
                                            {productos.map((producto) => (
                                                <MenuItem key={producto.id} value={producto.id}>
                                                    {producto.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>{errors.producto_id?.message || ''}</FormHelperText>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="sucursal_id"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.sucursal_id}>
                                        <InputLabel id="sucursal-label">Sucursal</InputLabel>
                                        <Select
                                            labelId="sucursal-label"
                                            label="Sucursal"
                                            {...field}
                                            value={field.value ?? ''}
                                        >
                                            <MenuItem value="">
                                                <em>Selecciona una sucursal</em>
                                            </MenuItem>
                                            {sucursales.map((sucursal) => (
                                                <MenuItem key={sucursal.id} value={sucursal.id}>
                                                    {sucursal.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>{errors.sucursal_id?.message || ''}</FormHelperText>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                label="Cantidad actual"
                                type="number"
                                fullWidth
                                {...register('cantidad_actual', { valueAsNumber: true })}
                                error={!!errors.cantidad_actual}
                                helperText={errors.cantidad_actual?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                label="Costo compra"
                                type="number"
                                fullWidth
                                {...register('costo_compra', { valueAsNumber: true })}
                                error={!!errors.costo_compra}
                                helperText={errors.costo_compra?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                label="Precio venta"
                                type="number"
                                fullWidth
                                {...register('precio_venta', { valueAsNumber: true })}
                                error={!!errors.precio_venta}
                                helperText={errors.precio_venta?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2}>
                                <SubmitButton
                                    isSubmitting={isSubmitting}
                                    text="Crear lote"
                                    loadingText="Creando..."
                                    icon={<Save />}
                                />
                                <Button variant="outlined" onClick={() => navigate(-1)}>
                                    Cancelar
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoteCreatePage;
