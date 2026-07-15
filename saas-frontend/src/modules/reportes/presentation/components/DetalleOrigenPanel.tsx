import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ArrowBack, AccountBalanceWallet, AccountBalance } from '@mui/icons-material';
import { toast } from 'sonner';
import { reportesService } from '../../infrastructure/reportes.service';
import type { FiltrosReporteFinanciero, DetalleOrigenReporte } from '../../domain/reportes.model';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { useAuthStore } from '../../../../core/store/authStore';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { ExcelDownloader } from '../../../../shared/components/download/ExcelDownloader';
import { generarDetalleOrigenExcel } from '../../infrastructure/DetalleOrigenExcel';

interface Props {
    origen: string;
    filtros: FiltrosReporteFinanciero;
    onBack: () => void;
}

const DetalleOrigenPanel = ({ origen, filtros, onBack }: Props) => {
    const { user } = useAuthStore();
    const monedaCodigo = user?.negocio?.moneda?.codigo || 'USD';

    const [cargando, setCargando] = useState(true);
    const [detalle, setDetalle] = useState<DetalleOrigenReporte | null>(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            setCargando(true);
            try {
                const data = await reportesService.obtenerDetalleOrigen(origen, filtros);
                setDetalle(data);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar el detalle por origen');
                onBack();
            } finally {
                setCargando(false);
            }
        };
        cargarDetalle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [origen, filtros]); // Si cambian los filtros se recarga (aunque idealmente DetalleOrigenPanel se renderiza estable con filtros)

    if (cargando) return <Loading />;

    if (!detalle) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No se pudo cargar la información.</Typography>
                <Button onClick={onBack} sx={{ mt: 2 }} variant="outlined">Volver al Reporte</Button>
            </Paper>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={onBack}
                >
                    Volver al Reporte General
                </Button>
                <ExcelDownloader
                    generateWorkbook={() => generarDetalleOrigenExcel(
                        detalle,
                        monedaCodigo,
                        origen,
                        'Sucursal',
                        filtros.fecha_inicio && filtros.fecha_fin ? `${filtros.fecha_inicio} a ${filtros.fecha_fin}` : 'Histórico'
                    )}
                    fileName={`Detalle_${origen}.xlsx`}
                    buttonText="Descargar Excel"
                    variant="outlined"
                    color="success"
                />
            </Box>

            <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                    Desglose de Ingresos
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Typography variant="h4" fontWeight={800} color="primary">
                        {origen}
                    </Typography>
                    <Box textAlign={{ xs: 'left', md: 'right' }} mt={{ xs: 2, md: 0 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                            Total Percibido
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                            {formatMoney(detalle.total_ingresos, monedaCodigo)}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Typography variant="h6" fontWeight={700} mb={2}>Distribución por Cajas y Cuentas</Typography>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Destino</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Método de Pago</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Total</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>%</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detalle.agrupaciones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No hay ingresos registrados en esta categoría para los filtros seleccionados.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            detalle.agrupaciones.map((agrupacion, idx) => (
                                <TableRow key={idx} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            {agrupacion.entidad_tipo === 'CAJA' ? (
                                                <AccountBalanceWallet color="secondary" fontSize="small" />
                                            ) : (
                                                <AccountBalance color="primary" fontSize="small" />
                                            )}
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{agrupacion.entidad_nombre}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {agrupacion.entidad_tipo === 'CAJA' ? 'Caja Fija/En Línea' : 'Cuenta Bancaria'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>{agrupacion.metodo_pago}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            {formatMoney(agrupacion.total, monedaCodigo)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" color="text.secondary">
                                            {agrupacion.porcentaje.toFixed(1)}%
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DetalleOrigenPanel;
