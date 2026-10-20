import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Tooltip,
    Stack,
    Paper,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Search,
    PictureAsPdf,
    Code as XmlIcon,
    ContentCopy,
    Check,
    ReceiptLongOutlined,
    Refresh
} from '@mui/icons-material';
import { toast } from 'sonner';

import ListTable from '../../../../shared/components/ui/tables/ListTable';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { useAuthStore } from '../../../../core/store/authStore';

import { facturacionRepository } from '../../infrastructure/repositories/facturacion.repository';
import type { FacturaEmitida } from '../../domain/interfaces/factura.interface';
import { 
    FacturacionPeriodFilter, 
    type PeriodFilterState 
} from '../components/FacturacionPeriodFilter';
import { ExcelDownloader } from '../../../../shared/components/download/ExcelDownloader';
import { generarFacturasEmitidasExcel } from '../../infrastructure/FacturasEmitidasExcel';
import { negocioRepository } from '../../../../modules/negocio/infrastructure/repositories/negocio.repository';

export const FacturasEmitidasPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const user = useAuthStore(state => state.user);
    const canDownload = user?.permisos?.includes('DESCARGAR_FACTURAS') ?? false;

    // Estados de filtros y paginación
    const [periodFilter, setPeriodFilter] = useState<PeriodFilterState>({
        periodo: 'este_mes',
        fecha_inicio: undefined,
        fecha_fin: undefined
    });
    const [busqueda, setBusqueda] = useState('');
    const debouncedBusqueda = useDebounce(busqueda, 400);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    const [facturas, setFacturas] = useState<FacturaEmitida[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

    const abortableFetch = useAbortableFetch();

    const cargarFacturas = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const resp = await facturacionRepository.listar({
                periodo: periodFilter.periodo,
                fecha_inicio: periodFilter.fecha_inicio,
                fecha_fin: periodFilter.fecha_fin,
                page: page + 1,
                limit,
                q: debouncedBusqueda.trim() || undefined
            }, signal);

            setFacturas(resp.data || []);
            setTotal(resp.pagination?.total || 0);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error('Error al cargar facturas emitidas:', error);
            toast.error('No se pudieron cargar las facturas emitidas');
        } finally {
            setLoading(false);
        }
    }, [periodFilter, debouncedBusqueda, page, limit]);

    useEffect(() => {
        abortableFetch(cargarFacturas);
    }, [abortableFetch, cargarFacturas]);

    const handleCopyUuid = (uuid: string) => {
        navigator.clipboard.writeText(uuid);
        setCopiedUuid(uuid);
        toast.success('UUID copiado al portapapeles');
        setTimeout(() => setCopiedUuid(null), 2000);
    };

    const handleDescargar = async (id: string, tipo: 'xml' | 'pdf', numero: string) => {
        try {
            toast.promise(
                facturacionRepository.descargarArchivo(id, tipo, `factura-${numero}`),
                {
                    loading: `Descargando ${tipo.toUpperCase()}...`,
                    success: `${tipo.toUpperCase()} descargado con éxito`,
                    error: `Error al descargar ${tipo.toUpperCase()}`
                }
            );
        } catch (error: any) {
            toast.error(error.message || `No se pudo descargar el ${tipo.toUpperCase()}`);
        }
    };

    const handleExportarExcel = async () => {
        try {
            // Se exportan todas las facturas del rango de fechas seleccionado (sin limitarse a la paginación de la tabla)
            const [respAll, negocioInfo] = await Promise.all([
                facturacionRepository.listar({
                    periodo: periodFilter.periodo,
                    fecha_inicio: periodFilter.fecha_inicio,
                    fecha_fin: periodFilter.fecha_fin,
                    page: 1,
                    limit: 10000,
                    q: debouncedBusqueda.trim() || undefined
                }),
                negocioRepository.obtenerMiNegocio().catch(() => null)
            ]);

            const todasFacturas = respAll.data || [];
            if (todasFacturas.length === 0) {
                toast.info('No se encontraron facturas para exportar en el período seleccionado');
            }

            const periodoLabelMap: Record<string, string> = {
                '24_horas': 'Últimas 24 Horas',
                '7_dias': 'Últimos 7 Días',
                '30_dias': 'Últimos 30 Días',
                'este_mes': 'Este Mes',
                'custom': 'Período Personalizado'
            };

            const periodoTexto = periodoLabelMap[periodFilter.periodo] || periodFilter.periodo;
            let rangoTexto = '';
            if (respAll.rango?.fecha_inicio && respAll.rango?.fecha_fin) {
                const fInicio = new Date(respAll.rango.fecha_inicio).toLocaleDateString('es-GT');
                const fFin = new Date(respAll.rango.fecha_fin).toLocaleDateString('es-GT');
                rangoTexto = `${fInicio} al ${fFin}`;
            }

            return await generarFacturasEmitidasExcel({
                facturas: todasFacturas,
                negocioNombre: negocioInfo?.nombre_comercial || negocioInfo?.nombre || 'Mi Negocio',
                negocioNit: negocioInfo?.nit_rut || 'C/F',
                periodoLabel: periodoTexto,
                rangoFechas: rangoTexto,
                filtroBusqueda: debouncedBusqueda.trim() || undefined,
                monedaSimbolo: 'Q'
            });
        } catch (error) {
            console.error('Error al exportar facturas a Excel:', error);
            toast.error('Ocurrió un error al generar el archivo Excel');
            throw error;
        }
    };

    const columns = [
        {
            id: 'dte_uuid',
            name: 'UUID / Autorización DTE',
            format: (uuid: string | null) => {
                if (!uuid) return <Typography variant="caption" color="text.secondary">Sin certificar</Typography>;
                const shortUuid = uuid.length > 18 ? `${uuid.substring(0, 14)}...` : uuid;
                return (
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Tooltip title={uuid} arrow>
                            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                                {shortUuid}
                            </Typography>
                        </Tooltip>
                        <Tooltip title="Copiar UUID completo" arrow>
                            <IconButton size="small" onClick={() => handleCopyUuid(uuid)} sx={{ p: 0.5 }}>
                                {copiedUuid === uuid ? <Check fontSize="inherit" color="success" /> : <ContentCopy fontSize="inherit" />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            }
        },
        {
            id: 'numero_factura',
            name: 'Serie / No.',
            format: (_: any, row: FacturaEmitida) => {
                const serie = row.serie || '';
                const num = row.numero_factura || '---';
                return (
                    <Box>
                        <Typography variant="body2" fontWeight={600}>
                            {serie ? `${serie} - ${num}` : num}
                        </Typography>
                        {row.tipo_dte && (
                            <Chip 
                                label={row.tipo_dte} 
                                size="small" 
                                variant="outlined" 
                                sx={{ height: 18, fontSize: '0.65rem', mt: 0.2 }} 
                            />
                        )}
                    </Box>
                );
            }
        },
        {
            id: 'fecha_emision',
            name: 'Fecha Emisión',
            format: (fecha: string) => {
                if (!fecha) return '---';
                const d = new Date(fecha);
                return (
                    <Typography variant="body2">
                        {d.toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })}
                        <Typography component="span" variant="caption" color="text.secondary" display="block">
                            {d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Typography>
                );
            }
        },
        {
            id: 'receptor_nombre',
            name: 'Receptor (Cliente)',
            format: (_: any, row: FacturaEmitida) => (
                <Box>
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 180 }}>
                        {row.receptor_nombre || 'CONSUMIDOR FINAL'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        NIT: {row.receptor_nit || 'CF'}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'emisor_afiliacion_iva',
            name: 'Régimen',
            format: (reg: string) => {
                const isPeq = reg === 'PEQ';
                return (
                    <Chip
                        label={isPeq ? 'Pequeño (5%)' : 'General (12%)'}
                        size="small"
                        color={isPeq ? 'secondary' : 'default'}
                        variant={isPeq ? 'filled' : 'outlined'}
                        sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                );
            }
        },
        {
            id: 'total',
            name: 'Total',
            format: (total: number, row: FacturaEmitida) => (
                <Box>
                    <Typography variant="body2" fontWeight={700}>
                        {formatMoney(total)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Imp: {formatMoney(row.total_impuestos || 0)}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'estado',
            name: 'Estado',
            format: (estado: string) => {
                let color: 'success' | 'error' | 'warning' | 'default' = 'default';
                let label = estado;

                if (estado === 'EMITIDA' || estado === 'CERTIFICADA') {
                    color = 'success';
                    label = 'Certificada';
                } else if (estado === 'ANULADA') {
                    color = 'error';
                    label = 'Anulada';
                } else if (estado === 'ERROR') {
                    color = 'warning';
                    label = 'Error';
                }

                return (
                    <Chip 
                        label={label} 
                        color={color} 
                        size="small" 
                        sx={{ fontWeight: 600, height: 22, fontSize: '0.72rem' }} 
                    />
                );
            }
        }
    ];

    const actions = [
        {
            name: 'Descargar XML',
            icon: <XmlIcon fontSize="small" />,
            color: 'primary',
            onClick: (row: FacturaEmitida) => handleDescargar(row.id, 'xml', row.numero_factura),
            visible: (row: FacturaEmitida) => Boolean(canDownload && row.tiene_xml)
        },
        {
            name: 'Descargar PDF',
            icon: <PictureAsPdf fontSize="small" />,
            color: 'error',
            onClick: (row: FacturaEmitida) => handleDescargar(row.id, 'pdf', row.numero_factura),
            visible: (row: FacturaEmitida) => Boolean(canDownload && row.tiene_pdf)
        }
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: (t) => t.palette.primary.light + '22',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ReceiptLongOutlined />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Facturas Emitidas
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Consulta fiscal de documentos tributarios electrónicos certificados en SAT
                        </Typography>
                    </Box>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <ExcelDownloader
                        generateWorkbook={handleExportarExcel}
                        fileName={`facturas-emitidas-${periodFilter.periodo}-${new Date().toISOString().slice(0, 10)}.xlsx`}
                        buttonText="Exportar a Excel"
                        variant="contained"
                        color="success"
                        size="small"
                    />
                    <Tooltip title="Actualizar datos" arrow>
                        <IconButton onClick={() => abortableFetch(cargarFacturas)} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Filtros de período */}
            <FacturacionPeriodFilter
                filterState={periodFilter}
                onChange={(newFilters) => {
                    setPeriodFilter(newFilters);
                    setPage(0);
                }}
                disabled={loading}
            />

            {/* Barra de búsqueda */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    border: (t) => `1px solid ${t.palette.divider}`,
                    backgroundColor: 'background.paper'
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar por UUID, número de factura, cliente o NIT..."
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPage(0);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            )
                        }}
                    />
                </Stack>
            </Paper>

            {/* Tabla de Facturas */}
            {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <Loading />
                </Box>
            ) : facturas.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        border: (t) => `1px solid ${t.palette.divider}`,
                        borderRadius: 2
                    }}
                >
                    <ReceiptLongOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        No se encontraron facturas emitidas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        No hay documentos emitidos para el período seleccionado o no coinciden con los criterios de búsqueda.
                    </Typography>
                </Paper>
            ) : (
                <ListTable
                    columns={columns}
                    data={facturas}
                    actions={actions}
                    pagination={{
                        total,
                        limit,
                        offset: page * limit,
                        onPageChange: (newPage: number) => setPage(newPage),
                        onRowsPerPageChange: (newLimit: number) => {
                            setLimit(newLimit);
                            setPage(0);
                        }
                    }}
                />
            )}
        </Box>
    );
};

export default FacturasEmitidasPage;
