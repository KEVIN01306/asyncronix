import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Grid, Alert, Paper } from '@mui/material';
import { toast } from 'sonner';

import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import type { Producto } from '../../domain/interfaces/producto.interface';
import ProductoDetailHeader from './components/ProductoDetailHeader';
import ProductoDetailsPanel from './components/ProductoDetailsPanel';
import ProductoSummaryCard from './components/ProductoSummaryCard';
import ProductoLotesTab from './components/ProductoLotesTab';
import ProductoVariantesTab from './components/ProductoVariantesTab';
import ProductoAtributosTab from './components/ProductoAtributosTab';
import ProductoImagenesTab from './components/ProductoImagenesTab';
import { Tabs, Tab } from '@mui/material';
import { formatImage } from '../../../../core/utils/formatImage';


const ProductoDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const principalImage = producto?.imagenes?.find((img) => img.es_principal) ?? producto?.imagenes?.[0];
    const ImageSource = principalImage?.url ? formatImage(principalImage.url) : undefined;

    // Read tab from URL query params, default to 0
    const [tab, setTabState] = useState(() => {
        const tabParam = searchParams.get('tab');
        return tabParam ? parseInt(tabParam, 10) : 0;
    });

    // Update tab state when query param changes
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setTabState(parseInt(tabParam, 10));
        }
    }, [searchParams]);

    // Handle tab change - update both state and URL
    const handleTabChange = (_e: any, newValue: number) => {
        setTabState(newValue);
        setSearchParams({ tab: newValue.toString() });
    };

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

    if (loading) return <Loading />;
    if (!producto) return <ErrorPageLoading text="Producto no encontrado" navigate={() => navigate('/productos')} />;

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <ProductoDetailHeader
                nombre={producto.nombre}
                onBack={() => navigate('/productos')}
                onEdit={() => navigate(`/productos/${id}/editar`)}
                onDelete={() => setOpenDelete(true)}
            />

            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2, overflowX: 'auto' }} variant="scrollable" scrollButtons="auto">
                <Tab label="Información General" />
                <Tab label="Atributos" />
                <Tab label="Variantes" />
                <Tab label="Imágenes" />
                <Tab label="Lotes" />
            </Tabs>

            {tab === 0 ? (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            {ImageSource ? <Box component="img" src={ImageSource} alt={producto.nombre} sx={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }} /> : null}
                            <ProductoDetailsPanel
                                categoria={producto.categoria}
                                sku={producto.sku}
                                precio_sugerido={producto.precio_sugerido}
                                stock_total={producto.stock_total}
                                activo={producto.activo}
                            />
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <ProductoSummaryCard categoria={producto.categoria} activo={producto.activo} />
                            <Alert severity="warning" variant="outlined">
                                Recuerda mantener la imagen actualizada para mejorar la visibilidad de este producto en el catálogo.
                            </Alert>
                        </Box>
                    </Grid>
                </Grid>
            ) : tab === 1 ? (
                <Box>
                    <Paper sx={{ p: 2 }}>
                        <ProductoAtributosTab productoId={id as string} onRefresh={fetchProducto} />
                    </Paper>
                </Box>
            ) : tab === 2 ? (
                <Box>
                    <Paper sx={{ p: 2 }}>
                        <ProductoVariantesTab productoId={id as string} producto={producto} onRefresh={fetchProducto} />
                    </Paper>
                </Box>
            ) : tab === 3 ? (
                <Box>
                    <Paper sx={{ p: 2 }}>
                        <ProductoImagenesTab productoId={id as string} onRefresh={fetchProducto} />
                    </Paper>
                </Box>
            ) : (
                <Box>
                    <Paper sx={{ p: 2 }}>
                        <ProductoLotesTab productoId={id as string} />
                    </Paper>
                </Box>
            )}

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
