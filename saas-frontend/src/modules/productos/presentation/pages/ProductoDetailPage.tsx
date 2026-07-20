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
import ProductoQrCard from './components/ProductoQrCard';
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
    const [generatingQr, setGeneratingQr] = useState(false);
    const principalImage = producto?.imagenes?.find((img) => img.es_principal) ?? producto?.imagenes?.[0];
    const ImageSource = principalImage?.url ? formatImage(principalImage.url) : undefined;
    const QrImageSource = producto?.qr_imagen ? formatImage(producto.qr_imagen) : undefined;

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

    const handleGenerateQr = async () => {
        if (!id) return;
        setGeneratingQr(true);

        try {
            const qr_imagen = await ProductoRepository.generarQr(id);
            setProducto((prev) => prev ? { ...prev, qr_imagen } : prev);
            toast.success('QR generado correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al generar el QR');
        } finally {
            setGeneratingQr(false);
        }
    };

    const handlePrintQr = () => {
        if (!QrImageSource) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimir QR</title>
                    <style>
                        body {
                            margin: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                        }
                        
                        .qr-image {
                            width: 18cm;
                            height: 18cm;
                            
                            image-rendering: pixelated; 
                            image-rendering: crisp-edges;
                        }
                        @media print {
                            body {
                                height: auto;
                            }
                            .qr-image {
                                max-width: 90vw; 
                                max-height: 90vh;
                            }
                        }
                    </style>
                </head>
                <body>
                    <img src="${QrImageSource}" alt="QR" class="qr-image" />
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleDownloadQr = async () => {
        if (!QrImageSource) return;

        try {
            const response = await fetch(QrImageSource);
            const blob = await response.blob();

            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${producto?.sku ?? 'producto'}-qr.png`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Error al descargar el QR:", error);
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
                            <ProductoQrCard
                                qrImageSource={QrImageSource}
                                sku={producto.sku}
                                generatingQr={generatingQr}
                                onGenerateQr={handleGenerateQr}
                                onPrintQr={handlePrintQr}
                                onDownloadQr={handleDownloadQr}
                            />
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
                        <ProductoVariantesTab productoId={id as string} onRefresh={fetchProducto} />
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
