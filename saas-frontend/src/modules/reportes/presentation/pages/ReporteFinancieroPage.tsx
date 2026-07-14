import { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { toast } from 'sonner';
import { reportesService } from '../../infrastructure/reportes.service';
import type { ReporteFinanciero, FiltrosReporteFinanciero } from '../../domain/reportes.model';
import FiltrosReporte from '../components/FiltrosReporte';
import KPIsGenerales from '../components/KPIsGenerales';
import DistribucionCharts from '../components/DistribucionCharts';
import ConciliacionPanel from '../components/ConciliacionPanel';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ReporteFinancieroPage = () => {
    const [filtros, setFiltros] = useState<FiltrosReporteFinanciero>({});
    const [reporte, setReporte] = useState<ReporteFinanciero | null>(null);
    const [cargando, setCargando] = useState(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Carga inicial

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Typography variant="h4" fontWeight={700} mb={1}>
                Reporte Financiero
            </Typography>
            <Typography color="text.secondary" mb={4}>
                Visión consolidada del estado financiero y flujo de caja del negocio.
            </Typography>

            <FiltrosReporte 
                filtros={filtros} 
                onFiltrosChange={setFiltros} 
                onAplicarFiltros={cargarReporte} 
                cargando={cargando}
            />

            {cargando && !reporte ? (
                <Loading />
            ) : reporte ? (
                <>
                    <KPIsGenerales kpis={reporte.kpis} />
                    <DistribucionCharts 
                        metodos={reporte.distribucion.por_metodo_pago}
                        origenes={reporte.distribucion.por_origen}
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
