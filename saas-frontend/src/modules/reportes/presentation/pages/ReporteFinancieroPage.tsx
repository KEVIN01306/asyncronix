import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Collapse, Button, useMediaQuery, useTheme } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { toast } from 'sonner';
import { reportesService } from '../../infrastructure/reportes.service';
import type { ReporteFinanciero, FiltrosReporteFinanciero } from '../../domain/reportes.model';
import FiltrosReporte from '../components/FiltrosReporte';
import KPIsGenerales from '../components/KPIsGenerales';
import DistribucionCharts from '../components/DistribucionCharts';
import ConciliacionPanel from '../components/ConciliacionPanel';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAuthStore } from '../../../../core/store/authStore';
import { PdfDownloader } from '../../../../shared/components/download/PdfDownloader';
import { ExcelDownloader } from '../../../../shared/components/download/ExcelDownloader';
import { ReporteFinancieroPdf } from '../../infrastructure/ReporteFinancieroPdf';
import { generarReporteFinancieroExcel } from '../../infrastructure/ReporteFinancieroExcel';
import { sucursalRepository } from '../../../sucursales/infrastructure/repositories/sucursal.repository';
import { useSearchParams } from 'react-router-dom';
import DetalleOrigenPanel from '../components/DetalleOrigenPanel';

const ReporteFinancieroPage = () => {
    const user = useAuthStore(state => state.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const ingresosOrigen = searchParams.get('ingresosOrigen');
    const [mostrarFiltros, setMostrarFiltros] = useState(!isMobile);
    const [filtros, setFiltros] = useState<FiltrosReporteFinanciero>({
        sucursal_ids: user?.sucursal_id ? [user.sucursal_id] : []
    });
    const [reporte, setReporte] = useState<ReporteFinanciero | null>(null);
    const [cargando, setCargando] = useState(false);
    const [sucursales, setSucursales] = useState<any[]>([]);

    useEffect(() => {
        if (!isMobile) {
            setMostrarFiltros(true);
        } else {
            setMostrarFiltros(false);
        }
    }, [isMobile]);

    const cargarReporte = useCallback(async () => {
        setCargando(true);
        try {
            const data = await reportesService.obtenerReporteFinanciero(filtros);
            setReporte(data);
        } catch (error) {
            toast.error('Error al cargar el reporte financiero');
            console.error(error);
        } finally {
            setCargando(false);
        }
    }, [filtros]);

    useEffect(() => {
        cargarReporte();
        sucursalRepository.listar(99, 0).then(res => setSucursales(res.data)).catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Carga inicial

    // Generate filename for PDF
    const getPdfFileName = () => {
        const base = 'Reporte - Financiero';
        const date = new Date().toISOString().split('T')[0];

        if (!filtros.sucursal_ids || filtros.sucursal_ids.length === 0) {
            return `${base} - ${date}.pdf`;
        }
        if (filtros.sucursal_ids.length > 1) {
            return `${base} - multi sucursal - ${date}.pdf`;
        }

        const suc = sucursales.find(s => s.id === filtros.sucursal_ids![0]);
        const sucName = suc ? suc.nombre : 'sucursal';
        return `${base} - ${sucName} - ${date}.pdf`;
    };

    const handleSelectOrigen = (origen: string) => {
        searchParams.set('ingresosOrigen', origen);
        setSearchParams(searchParams);
    };

    const handleClearOrigen = () => {
        searchParams.delete('ingresosOrigen');
        setSearchParams(searchParams);
    };

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'flex-start' }}
                gap={3}
                mb={4}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700} mb={1}>
                        Reporte Financiero
                    </Typography>
                    <Typography color="text.secondary">
                        Visión consolidada del estado financiero y flujo de caja del negocio.
                    </Typography>
                </Box>
                {reporte && user && (
                    <Box
                        display="flex"
                        flexDirection="row"
                        gap={1}
                    >
                        <ExcelDownloader
                            generateWorkbook={() => generarReporteFinancieroExcel(
                                reporte,
                                user?.negocio?.moneda?.codigo || 'USD',
                                filtros.sucursal_ids?.length ? sucursales.find(s => s.id === filtros.sucursal_ids![0])?.nombre || 'Sucursal' : 'Todas las Sucursales',
                                filtros.fecha_inicio && filtros.fecha_fin ? `${filtros.fecha_inicio} a ${filtros.fecha_fin}` : 'Histórico'
                            )}
                            fileName={getPdfFileName().replace('.pdf', '.xlsx')}
                            buttonText="Excel"
                            variant="outlined"
                            color="success"
                            size="small"
                        />
                        <PdfDownloader
                            document={
                                <ReporteFinancieroPdf
                                    reporte={reporte}
                                    user={user}
                                    sucursalesSeleccionadas={filtros.sucursal_ids || []}
                                    todasLasSucursales={sucursales}
                                />
                            }
                            fileName={getPdfFileName()}
                            buttonText="PDF"
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                )}
            </Box>

            {isMobile && (
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<FilterList />}
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    sx={{ mb: 2 }}
                >
                    {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
            )}

            <Collapse in={mostrarFiltros}>
                <FiltrosReporte
                    filtros={filtros}
                    onFiltrosChange={setFiltros}
                    onAplicarFiltros={cargarReporte}
                    cargando={cargando}
                    sucursalesPadre={sucursales}
                />
            </Collapse>

            {cargando && !reporte ? (
                <Loading />
            ) : ingresosOrigen && reporte ? (
                <DetalleOrigenPanel
                    origen={ingresosOrigen}
                    filtros={filtros}
                    onBack={handleClearOrigen}
                />
            ) : reporte ? (
                <>
                    <KPIsGenerales kpis={reporte.kpis} />
                    <DistribucionCharts
                        metodos={reporte.distribucion.por_metodo_pago}
                        origenes={reporte.distribucion.por_origen}
                        onSelectOrigen={handleSelectOrigen}
                    />
                    <ConciliacionPanel
                        conciliacion={reporte.conciliacion}
                        cajas={reporte.distribucion.entidades.cajas}
                        cuentas={reporte.distribucion.entidades.cuentas}
                    />
                </>
            ) : null}
        </Box>
    );
};

export default ReporteFinancieroPage;
