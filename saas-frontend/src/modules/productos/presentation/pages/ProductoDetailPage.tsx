import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Divider,
    Stack,
    Grid,
    Card,
    CardContent,
    Chip,
    Alert,
    Link as MuiLink,
    Breadcrumbs,
} from '@mui/material';
import { Edit, Delete, ArrowBack, PhotoCamera } from '@mui/icons-material';
import { toast } from 'sonner';

import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import type { Producto } from '../../domain/interfaces/producto.interface';

const ProductoDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const ImageSource = producto?.url_imagen ? `${import.meta.env.VITE_API_URL}/${producto.url_imagen}` : undefined;


    const fetchProducto = useCallback(async () => {
        if (!id) return;
        try {
            const data = await ProductoRepository.obtener(id);
            setProducto(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProducto();
    }, [fetchProducto]);

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);

        try {
            await ProductoRepository.eliminar(id);
            toast.success('Producto eliminado correctamente');
            navigate('/productos');
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar el producto');
        } finally {
            setIsDeleting(false);
            setOpenDelete(false);
        }
    };

    const handleUploadImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        setUploading(true);
        try {
            const updatedProduct = await ProductoRepository.subirImagen(id, file);
            setProducto(updatedProduct);
            toast.success('Imagen del producto actualizada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <Loading />;
    if (!producto) return <ErrorPageLoading text="Producto no encontrado" navigate={() => navigate('/productos')} />;

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <MuiLink
                            underline="hover"
                            color="inherit"
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                            onClick={() => navigate('/productos')}
                        >
                            <ArrowBack sx={{ fontSize: 16 }} /> Productos
                        </MuiLink>
                        <Typography color="text.primary">Detalle del producto</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        {producto.nombre}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} width={{ xs: '100%', sm: 'auto' }}>
                    <Button
                        variant="outlined"
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        startIcon={<Edit />}
                        onClick={() => navigate(`/productos/${id}/editar`)}
                    >
                        Editar
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        startIcon={<Delete />}
                        onClick={() => setOpenDelete(true)}
                    >
                        Eliminar
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }} >
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={4} alignItems="flex-start">
                            <Box flex={1}>
                                {ImageSource ? (
                                    <Box component="img"
                                        src={ImageSource}
                                        alt={producto.nombre}
                                        sx={{ width: '100%', maxHeight: 350, objectFit: 'contain', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 280,
                                            bgcolor: 'background.default',
                                            borderRadius: 2,
                                            border: (theme) => `1px dashed ${theme.palette.divider}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <PhotoCamera sx={{ fontSize: 48, color: 'text.disabled' }} />
                                    </Box>
                                )}
                            </Box>
                            <Stack spacing={2} flex={1}>
                                <Button variant="contained" onClick={handleUploadImage} disabled={uploading}>
                                    {uploading ? 'Subiendo...' : 'Cambiar imagen'}
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleFileChange}
                                />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Selecciona una imagen JPG o PNG para actualizar la vista del producto.
                                </Typography>
                            </Stack>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Categoría</Typography>
                                <Typography variant="body1">{producto.categoria?.categoria || 'Sin categoría'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Código</Typography>
                                <Typography variant="body1">{producto.codigo || 'N/A'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Precio sugerido</Typography>
                                <Typography variant="body1">$ {producto.precio_sugerido.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Stock total</Typography>
                                <Typography variant="body1">{producto.stock_total}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                                <Chip label={producto.activo ? 'Activo' : 'Inactivo'} color={producto.activo ? 'success' : 'default'} size="small" />
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4}}>
                    <Stack spacing={3}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom fontWeight={700}>Resumen</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Stack spacing={2}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2">Categoría</Typography>
                                        <Typography variant="body2" fontWeight={700}>{producto.categoria?.categoria || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2">Activo</Typography>
                                        <Typography variant="body2" fontWeight={700}>{producto.activo ? 'Sí' : 'No'}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                        <Alert severity="warning" variant="outlined">
                            Recuerda mantener la imagen actualizada para mejorar la visibilidad de este producto en el catálogo.
                        </Alert>
                    </Stack>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={openDelete}
                title="¿Eliminar producto?"
                description={`Estás a punto de eliminar ${producto.nombre}. Esta acción es irreversible.`}
                onClose={() => !isDeleting && setOpenDelete(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default ProductoDetailPage;
