import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { ArrowBack, Transform, Edit, PictureAsPdf } from '@mui/icons-material';
import { toast } from 'sonner';

import QuotationForm from '../components/QuotationForm';
import QuotationConvertDialog from '../components/QuotationConvertDialog';
import StockWarningModal from '../components/StockWarningModal';
import { CotizacionPdf } from '../../infrastructure/repositories/CotizacionPdf';
import { useAuthStore } from '../../../../core/store/authStore';
import { pdf } from '@react-pdf/renderer';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { cotizacionRepository } from '../../infrastructure/cotizacion.repository';
import { type Cotizacion, EstadoCotizacion } from '../../domain/interfaces/cotizacion.interface';
import QuotationStatusBadge from '../components/QuotationStatusBadge';

export default function CotizacionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const [stockWarningParams, setStockWarningParams] = useState<{ open: boolean; message: string; data: any }>({ open: false, message: '', data: null });
    const user = useAuthStore((state: any) => state.user);

    useEffect(() => {
        if (!id) return;
        const fetchCotizacion = async () => {
            try {
                const response = await cotizacionRepository.obtener(id);
                setCotizacion(response.data);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar la cotización');
                navigate('/cotizaciones');
            } finally {
                setLoading(false);
            }
        };
        fetchCotizacion();
    }, [id, navigate]);

    const handleConvert = async (data: any, ignoreStock: boolean = false) => {
        if (!id) return;
        try {
            await cotizacionRepository.convertir(id, { ...data, ignoreStock });
            toast.success('Cotización convertida exitosamente');
            setConvertModalOpen(false);
            setStockWarningParams({ open: false, message: '', data: null });
            navigate('/cotizaciones');
        } catch (error: any) {
            const code = error.response?.data?.code;
            if (code === 'NO_LOTE_DISPONIBLE' || code === 'INSUFICIENTE_STOCK') {
                const msg = error.response?.data?.message || 'Algunos artículos no tienen stock suficiente.';
                setStockWarningParams({ open: true, message: msg, data });
            } else {
                toast.error(error.response?.data?.message || 'Error al convertir la cotización');
            }
        }
    };

    const handleConfirmStockWarning = () => {
        handleConvert(stockWarningParams.data, true);
    };

    const handleDownloadPdf = () => {
        if (!cotizacion) return;
        const promise = (async () => {
            const blob = await pdf(<CotizacionPdf cotizacion={cotizacion} user={user} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cotizacion-${cotizacion.codigo}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        })();

        toast.promise(promise, {
            loading: 'Generando PDF...',
            success: 'PDF descargado con éxito',
            error: 'Error al generar el PDF'
        });
    };

    if (loading || !cotizacion) return <Loading />;

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => navigate('/cotizaciones')}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4">
                        Cotización {cotizacion.codigo}
                    </Typography>
                    <QuotationStatusBadge estado={cotizacion.estado} size="medium" />
                </Box>
                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<PictureAsPdf />}
                        onClick={handleDownloadPdf}
                    >
                        Descargar PDF
                    </Button>
                    {cotizacion.estado === EstadoCotizacion.PENDIENTE && (
                        <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => navigate(`/cotizaciones/editar/${id}`)}
                        >
                            Editar
                        </Button>
                    )}
                    {cotizacion.estado === EstadoCotizacion.ACEPTADA && !cotizacion.venta_id && !cotizacion.preventa_id && !cotizacion.servicio_id && (
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<Transform />}
                            onClick={() => setConvertModalOpen(true)}
                        >
                            Convertir
                        </Button>
                    )}
                </Box>
            </Box>

            <QuotationForm
                isReadOnly
                defaultValues={{
                    cliente_id: cotizacion.cliente_id,
                    vehiculo_id: cotizacion.vehiculo_id,
                    tipo_destino: cotizacion.tipo_destino,
                    fecha_validez: cotizacion.fecha_validez ? new Date(cotizacion.fecha_validez).toISOString().split('T')[0] : null,
                    terminos: cotizacion.terminos,
                    detalles: cotizacion.detalles.map(d => ({
                        id: d.id,
                        tipo: d.variante_id ? 'PRODUCTO' : (d.tipo_servicio_id ? 'SERVICIO' : 'MANO_OBRA_PERSONALIZADA'),
                        variante_id: d.variante_id,
                        tipo_servicio_id: d.tipo_servicio_id,
                        descripcion: d.descripcion,
                        cantidad: d.cantidad,
                        precio_unitario: d.precio_unitario,
                        descuento: d.descuento
                    }))
                }}
                onSubmit={() => { }}
            />

            <QuotationConvertDialog
                open={convertModalOpen}
                cotizacion={cotizacion}
                onClose={() => setConvertModalOpen(false)}
                onConfirm={handleConvert}
            />

            <StockWarningModal
                open={stockWarningParams.open}
                message={stockWarningParams.message}
                onClose={() => setStockWarningParams(prev => ({ ...prev, open: false }))}
                onConfirm={handleConfirmStockWarning}
            />
        </Box>
    );
}
