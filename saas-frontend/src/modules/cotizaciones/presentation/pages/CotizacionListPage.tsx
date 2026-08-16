import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Button, Typography, TextField, InputAdornment,
    useTheme, useMediaQuery
} from '@mui/material';
import { Add, Search, FilterList, Visibility, Edit, CheckCircle, Cancel, Transform, PictureAsPdf } from '@mui/icons-material';
import { toast } from 'sonner';
import { pdf } from '@react-pdf/renderer';

import ListTable from '../../../../shared/components/ui/tables/ListTable';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { formatMoney } from '../../../../core/utils/formatMoney';

import type { Cotizacion } from '../../domain/interfaces/cotizacion.interface';
import { EstadoCotizacion } from '../../domain/interfaces/cotizacion.interface';
import { cotizacionRepository } from '../../infrastructure/cotizacion.repository';
import QuotationStatusBadge from '../components/QuotationStatusBadge';
import QuotationFilters from '../components/QuotationFilters';
import QuotationConvertDialog from '../components/QuotationConvertDialog';
import StockWarningModal from '../components/StockWarningModal';
import { CotizacionPdf } from '../../infrastructure/repositories/CotizacionPdf';
import { useAuthStore } from '../../../../core/store/authStore';

export default function CotizacionListPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const user = useAuthStore((state: any) => state.user);

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [filtroQ, setFiltroQ] = useState<string | null>(() => searchParams.get('q'));
    const debouncedFiltroQ = useDebounce(filtroQ, 300);

    const [filtroEstado, setFiltroEstado] = useState<string | null>(() => searchParams.get('estado'));
    const [filtroClienteId, setFiltroClienteId] = useState<string | null>(() => searchParams.get('cliente_id'));
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const [stockWarningParams, setStockWarningParams] = useState<{ open: boolean; message: string; data: any }>({ open: false, message: '', data: null });
    const [cotizacionToConvert, setCotizacionToConvert] = useState<any>(null);

    const abortableFetch = useAbortableFetch();

    const fetchCotizaciones = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const response = await cotizacionRepository.listar(
                limit,
                offset,
                debouncedFiltroQ || null,
                filtroEstado || null,
                filtroClienteId || null,
                signal
            );
            setCotizaciones(response.data);
            setTotal(response.meta?.total ?? 0);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error(error);
            toast.error('Error al cargar cotizaciones');
        } finally {
            setLoading(false);
        }
    }, [limit, offset, debouncedFiltroQ, filtroEstado, filtroClienteId]);

    useEffect(() => {
        abortableFetch(fetchCotizaciones);
    }, [abortableFetch, fetchCotizaciones]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroQ(e.target.value);
        searchParams.set('q', e.target.value);
        searchParams.set('offset', '0');
        setSearchParams(searchParams);
    };

    const handleApplyFilters = (estado: string | null, clienteId: string | null) => {
        setFiltroEstado(estado);
        setFiltroClienteId(clienteId);
        if (estado) searchParams.set('estado', estado);
        else searchParams.delete('estado');
        if (clienteId) searchParams.set('cliente_id', clienteId);
        else searchParams.delete('cliente_id');
        searchParams.set('offset', '0');
        setSearchParams(searchParams);
    };

    const handleChangeEstado = async (id: string, nuevoEstado: EstadoCotizacion) => {
        try {
            await cotizacionRepository.actualizarEstado(id, nuevoEstado);
            toast.success(`Cotización marcada como ${nuevoEstado}`);
            abortableFetch(fetchCotizaciones);
        } catch (error) {
            toast.error('Ocurrió un error al actualizar el estado');
        }
    };

    const handleConvert = async (data: any, ignoreStock: boolean = false) => {
        try {
            await cotizacionRepository.convertir(cotizacionToConvert.id, { ...data, ignoreStock });
            toast.success('Cotización convertida con éxito');
            setConvertModalOpen(false);
            setCotizacionToConvert(null);
            setStockWarningParams({ open: false, message: '', data: null });
            abortableFetch(fetchCotizaciones);
        } catch (error: any) {
            const code = error.response?.data?.code;
            if (code === 'NO_LOTE_DISPONIBLE' || code === 'INSUFICIENTE_STOCK') {
                const msg = error.response?.data?.message || 'Algunos artículos no tienen stock suficiente.';
                setStockWarningParams({ open: true, message: msg, data });
            } else {
                toast.error(error.response?.data?.message || 'Ocurrió un error al convertir la cotización');
            }
        }
    };

    const handleConfirmStockWarning = () => {
        handleConvert(stockWarningParams.data, true);
    };

    const columns = [
        { id: 'codigo', name: 'Código' },
        { id: 'cliente_nombre', name: 'Cliente', format: (v: any, row: Cotizacion) => row.cliente?.nombre || 'C/F' },
        { id: 'vehiculo_placa', name: 'Vehículo', format: (v: any, row: Cotizacion) => row.vehiculo?.placa || 'N/A' },
        { id: 'fecha_emision', name: 'Emisión', format: (v: any) => new Date(v).toLocaleDateString() },
        { id: 'total', name: 'Total', format: (v: any) => formatMoney(v) },
        { id: 'estado', name: 'Estado', format: (v: any) => <QuotationStatusBadge estado={v} /> },
        { id: 'tipo_destino', name: 'Destino' },
    ];

    if (loading && cotizaciones.length === 0) return <Loading />;

    const handleDownloadPdf = (id: string) => {
        const promise = (async () => {
            const { data } = await cotizacionRepository.obtener(id);
            const blob = await pdf(<CotizacionPdf cotizacion={data} user={user} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cotizacion-${data.codigo}.pdf`;
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

    const handleOpenConvert = async (row: any) => {
        try {
            const { data } = await cotizacionRepository.obtener(row.id);
            setCotizacionToConvert(data);
            setConvertModalOpen(true);
        } catch (error) {
            toast.error('Error al obtener los detalles de la cotización');
        }
    };

    const actionsList = [
        { name: 'Ver', icon: <Visibility fontSize="small" />, color: 'info', onClick: (row: any) => navigate(`/cotizaciones/${row.id}`) },
        { name: 'Descargar PDF', icon: <PictureAsPdf fontSize="small" />, color: 'inherit', onClick: (row: any) => handleDownloadPdf(row.id) },
        { name: 'Editar', icon: <Edit fontSize="small" />, color: 'primary', onClick: (row: any) => navigate(`/cotizaciones/editar/${row.id}`), visible: (row: any) => row.estado === EstadoCotizacion.PENDIENTE },
        { name: 'Aprobar', icon: <CheckCircle fontSize="small" />, color: 'success', onClick: (row: any) => handleChangeEstado(row.id, EstadoCotizacion.ACEPTADA), visible: (row: any) => row.estado === EstadoCotizacion.PENDIENTE },
        { name: 'Rechazar', icon: <Cancel fontSize="small" />, color: 'error', onClick: (row: any) => handleChangeEstado(row.id, EstadoCotizacion.RECHAZADA), visible: (row: any) => row.estado === EstadoCotizacion.PENDIENTE },
        { name: 'Convertir', icon: <Transform fontSize="small" />, color: 'secondary', onClick: handleOpenConvert, visible: (row: any) => row.estado === EstadoCotizacion.ACEPTADA && !row.venta_id && !row.preventa_id && !row.servicio_id },
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h4">Cotizaciones</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/cotizaciones/nuevo')}
                >
                    Nueva Cotización
                </Button>
            </Box>

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    placeholder="Buscar por código, cliente..."
                    size="small"
                    value={filtroQ || ''}
                    onChange={handleSearch}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                    }}
                    sx={{ maxWidth: 300, flexGrow: 1 }}
                />
                <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => setFilterModalOpen(true)}
                    color={filtroEstado || filtroClienteId ? 'primary' : 'inherit'}
                >
                    Filtros
                </Button>
            </Box>

            <ListTable
                columns={columns}
                data={cotizaciones}
                page={Math.floor(offset / limit)}
                rowsPerPage={limit}
                total={total}
                loading={loading}
                onPageChange={(_, newPage) => {
                    searchParams.set('offset', (newPage * limit).toString());
                    setSearchParams(searchParams);
                }}
                onRowsPerPageChange={(e) => {
                    const newLimit = parseInt(e.target.value, 10);
                    searchParams.set('limit', newLimit.toString());
                    searchParams.set('offset', '0');
                    setSearchParams(searchParams);
                }}
                actions={actionsList}
            />

            <QuotationFilters
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                currentEstado={filtroEstado}
                currentClienteId={filtroClienteId}
                onApply={handleApplyFilters}
            />

            <QuotationConvertDialog
                open={convertModalOpen}
                cotizacion={cotizacionToConvert}
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
