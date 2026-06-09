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
import { proveedoresRepository } from '../../../proveedores/infrastructure/proveedores.repository';
import type { Producto } from '../../../productos/domain/interfaces/producto.interface';
import type { Sucursal } from '../../../sucursales/domain/interfaces/sucursal.interface';
import type { Proveedor } from '../../../proveedores/domain/interfaces/proveedor.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

interface LoteFormValues {
    producto_id: string;
    variante_id: string;
    proveedor_id: string;
    cantidad_inicial: number;
    sucursal_id: string;
    cantidad_actual: number;
    costo_compra: number;
    precio_venta: number;
    fecha_vencimiento?: string;
}

const LoteCreatePage = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const params = new URLSearchParams(search);
    const productoIdFromQuery = params.get('producto_id') || '';

    const [productos, setProductos] = useState<Producto[]>([]);
    const [variantes, setVariantes] = useState<any[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<LoteFormValues>({
        defaultValues: {
            producto_id: productoIdFromQuery,
            sucursal_id: '',
            variante_id: '',
            proveedor_id: '',
            cantidad_inicial: 0,
            cantidad_actual: 0,
            costo_compra: 0,
            precio_venta: 0,
            fecha_vencimiento: undefined,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productosResponse, sucursalesResponse, proveedoresResponse] = await Promise.all([
                    ProductoRepository.listar(100, 0),
                    sucursalRepository.listar(100, 0),
                    proveedoresRepository.listar(100, 0),
                ]);
                setProductos(productosResponse.data);
                setSucursales(sucursalesResponse.data);
                setProveedores(proveedoresResponse.data);
                if (productoIdFromQuery) {
                    setValue('producto_id', productoIdFromQuery);
                }
            } catch (error) {
                console.error(error);
                toast.error('No se pudo cargar información de productos, sucursales o proveedores');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productoIdFromQuery, setValue]);

    const productoId = watch('producto_id');

    useEffect(() => {
        const loadVariantes = async () => {
            if (!productoId) {
                setVariantes([]);
                return;
            }
            try {
                const prod = await ProductoRepository.obtener(productoId);
                setVariantes(prod.variantes ?? []);
            } catch (err) {
                console.error(err);
                setVariantes([]);
            }
        };

        loadVariantes();
    }, [productoId]);


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
                                            onChange={async (e) => {
                                                field.onChange(e);
                                                const prodId = e.target.value as string;
                                                try {
                                                    const prod = await ProductoRepository.obtener(prodId);
                                                    setVariantes(prod.variantes ?? []);
                                                } catch (err) {
                                                    console.error(err);
                                                    setVariantes([]);
                                                }
                                            }}
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
                                name="variante_id"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.variante_id}>
                                        <InputLabel id="variante-label">Variante</InputLabel>
                                        <Select
                                            labelId="variante-label"
                                            label="Variante"
                                            {...field}
                                            value={field.value ?? ''}
                                        >
                                            <MenuItem value="">
                                                <em>Selecciona una variante</em>
                                            </MenuItem>
                                            {variantes.map((v) => (
                                                <MenuItem key={v.id} value={v.id}>
                                                    {v.sku ?? v.id} {v.precio_sugerido ? `- ${v.precio_sugerido}` : ''}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>{errors.variante_id?.message || ''}</FormHelperText>
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
                                label="Cantidad inicial"
                                type="number"
                                fullWidth
                                {...register('cantidad_inicial', { valueAsNumber: true })}
                                error={!!errors.cantidad_inicial}
                                helperText={errors.cantidad_inicial?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                label="Fecha de vigencia"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                {...register('fecha_vencimiento')}
                                error={!!errors.fecha_vencimiento}
                                helperText={errors.fecha_vencimiento?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Controller
                                name="proveedor_id"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.proveedor_id}>
                                        <InputLabel id="proveedor-label">Proveedor</InputLabel>
                                        <Select
                                            labelId="proveedor-label"
                                            label="Proveedor"
                                            {...field}
                                            value={field.value ?? ''}
                                        >
                                            <MenuItem value="">
                                                <em>Selecciona un proveedor</em>
                                            </MenuItem>
                                            {proveedores.map((proveedor) => (
                                                <MenuItem key={proveedor.id} value={proveedor.id}>
                                                    {proveedor.nombre} {proveedor.nit ? `- ${proveedor.nit}` : ''}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>{errors.proveedor_id?.message || ''}</FormHelperText>
                                    </FormControl>
                                )}
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
