import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, MenuItem, Autocomplete } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { productoSchema, type ProductoFormValues } from '../../domain/schemas/producto.schema';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import { CategoriaRepository } from '../../../categorias/infrastructure/repositories/categoria.repository';
import { marcasRepository } from '../../../marcas/infrastructure/marcas.repository';
import type { Categoria } from '../../../categorias/domain/interfaces/categoria.interface';
import type { Marca } from '../../../marcas/domain/interface/marca.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatearJerarquiaTexto } from '../../../categorias/presentation/hooks/useJerarquiaTexto';

interface CategoriaConRuta extends Categoria {
    ruta: string;
}

const ProductoFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [categorias, setCategorias] = useState<CategoriaConRuta[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);

    const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProductoFormValues>({
        resolver: zodResolver(productoSchema),
        defaultValues: {
            categoria_id: '',
            marca_id: '',
            nombre: '',
            precio_sugerido: 0,
        }
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [categoriaResponse, marcaResponse] = await Promise.all([
                    CategoriaRepository.listar(100, 0),
                    marcasRepository.listar(100, 0)
                ]);
                const categoriasConRuta = await Promise.all(
                    categoriaResponse.data.map(async (categoria) => {
                        try {
                            const jerarquia = await CategoriaRepository.obtenerConJerarquia(categoria.id);
                            const ruta = formatearJerarquiaTexto(jerarquia.data.jerarquia) || categoria.categoria;
                            return { ...categoria, ruta };
                        } catch {
                            return { ...categoria, ruta: categoria.categoria };
                        }
                    })
                );

                setCategorias(categoriasConRuta);
                setMarcas(marcaResponse.data);
            } catch (error) {
                console.error("Error al listar categorías o marcas:", error);
            }

            if (isEdit && id) {
                try {
                    const product = await ProductoRepository.obtener(id);
                    setValue('categoria_id', product.categoria_id);
                    setValue('marca_id', product.marca_id);
                    setValue('nombre', product.nombre);
                    setValue('precio_sugerido', product.precio_sugerido);
                } catch (error) {
                    console.error("Error al obtener el producto:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [id, isEdit, setValue]);

    const onSubmit = async (data: ProductoFormValues) => {
        try {
            if (isEdit && id) {
                await ProductoRepository.actualizar(id, data);
                toast.success('Producto actualizado correctamente');
            } else {
                await ProductoRepository.registrar(data);
                toast.success('Producto registrado correctamente');
            }
            navigate('/productos');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar el producto');
        }
    };

    if (loading) {
        return <Loading />
    }

    return (
        <Box p={2} maxWidth="700px" mx="auto">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <Controller
                            name="categoria_id"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={categorias}
                                    value={categorias.find((categoria) => categoria.id === field.value) ?? null}
                                    onChange={(_event, value) => field.onChange(value?.id ?? '')}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    getOptionLabel={(option) => option.ruta}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Categoría"
                                            error={!!errors.categoria_id}
                                            helperText={errors.categoria_id?.message}
                                        />
                                    )}
                                />
                            )}
                        />

                        <TextField
                            select
                            label="Marca"
                            fullWidth
                            {...register('marca_id')}
                            error={!!errors.marca_id}
                            helperText={errors.marca_id?.message}
                        >
                            <MenuItem value="">Selecciona una marca</MenuItem>
                            {marcas.map((marca) => (
                                <MenuItem key={marca.id} value={marca.id}>
                                    {marca.marca}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Nombre"
                            fullWidth
                            {...register('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />

                        <TextField
                            label="Precio sugerido"
                            fullWidth
                            type="number"
                            inputProps={{ min: 0, step: 0.01 }}
                            {...register('precio_sugerido', { valueAsNumber: true })}
                            error={!!errors.precio_sugerido}
                            helperText={errors.precio_sugerido?.message}
                        />

                        <SubmitButton
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar cambios' : 'Registrar producto'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProductoFormPage;
