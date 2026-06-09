import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, Alert, Paper } from '@mui/material';
import { toast } from 'sonner';
import { bajarCalidadImagen } from '../../../../core/utils/bajarCalidadImagen';

import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import type { Producto } from '../../domain/interfaces/producto.interface';
import ProductoDetailHeader from './components/ProductoDetailHeader';
import ProductoImageCard from './components/ProductoImageCard';
import ProductoDetailsPanel from './components/ProductoDetailsPanel';
import ProductoQrCard from './components/ProductoQrCard';
import ProductoSummaryCard from './components/ProductoSummaryCard';
import ProductoLotesTab from './components/ProductoLotesTab';
import ProductoVariantesTab from './components/ProductoVariantesTab';
import { Tabs, Tab } from '@mui/material';

const ProductoDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingQr, setGeneratingQr] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const ImageSource = producto?.url_imagen ? `${import.meta.env.VITE_API_URL}/${producto.url_imagen}` : undefined;
    const QrImageSource = producto?.qr_imagen ? `${import.meta.env.VITE_API_URL}/${producto.qr_imagen}` : undefined;

    const [tab, setTab] = useState(0);

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

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        setUploading(true);
        try {
            const compressedFile = await bajarCalidadImagen(file);
            const updatedProduct = await ProductoRepository.subirImagen(id, compressedFile);
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

            <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Detalles" />
                <Tab label="Variantes" />
                <Tab label="Lotes" />
            </Tabs>

            {tab === 0 ? (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <ProductoImageCard
                            nombre={producto.nombre}
                            imageSource={ImageSource}
                            uploading={uploading}
                            onUploadImage={handleUploadImage}
                            fileInputRef={fileInputRef}
                            onFileChange={handleFileChange}
                        />
                        <ProductoDetailsPanel
                            categoria={producto.categoria}
                            codigo={producto.codigo}
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
                        <ProductoVariantesTab productoId={id as string} onRefresh={fetchProducto} />
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
