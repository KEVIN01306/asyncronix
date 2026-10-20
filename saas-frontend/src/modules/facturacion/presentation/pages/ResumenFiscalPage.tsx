import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Alert,
    AlertTitle,
    IconButton,
    Tooltip,
    Divider,
    Stack,
    Chip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    AssessmentOutlined,
    Refresh,
    InfoOutlined,
    AccountBalance,
    CalendarToday,
    Gavel
} from '@mui/icons-material';
import { toast } from 'sonner';

import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import { formatMoney } from '../../../../core/utils/formatMoney';

import { facturacionRepository } from '../../infrastructure/repositories/facturacion.repository';
import type { ResumenFiscalData } from '../../domain/interfaces/factura.interface';
import {
    FacturacionPeriodFilter,
    type PeriodFilterState
} from '../components/FacturacionPeriodFilter';
import { ResumenFiscalCards } from '../components/ResumenFiscalCards';

export const ResumenFiscalPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [periodFilter, setPeriodFilter] = useState<PeriodFilterState>({
        periodo: 'este_mes',
        fecha_inicio: undefined,
        fecha_fin: undefined
    });

    const [resumen, setResumen] = useState<ResumenFiscalData | null>(null);
    const [loading, setLoading] = useState(true);

    const abortableFetch = useAbortableFetch();

    const cargarResumen = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const data = await facturacionRepository.obtenerResumenFiscal({
                periodo: periodFilter.periodo,
                fecha_inicio: periodFilter.fecha_inicio,
                fecha_fin: periodFilter.fecha_fin
            }, signal);

            setResumen(data);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error('Error al cargar resumen fiscal:', error);
            toast.error('No se pudo cargar el resumen fiscal del período');
        } finally {
            setLoading(false);
        }
    }, [periodFilter]);

    useEffect(() => {
        abortableFetch(cargarResumen);
    }, [abortableFetch, cargarResumen]);

    const esPeq = resumen?.regimen_fiscal_actual === 'PEQ';

    return (
        <Box p={isMobile ? 2 : 4}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: (t) => t.palette.info.light + '22',
                            color: 'info.main',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <AssessmentOutlined />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Resumen Fiscal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Métricas contables y estimación de impuestos acumulados sobre facturas emitidas
                        </Typography>
                    </Box>
                </Box>

                <Tooltip title="Actualizar métricas" arrow>
                    <IconButton onClick={() => abortableFetch(cargarResumen)} color="primary">
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Selector de período */}
            <FacturacionPeriodFilter
                filterState={periodFilter}
                onChange={(newFilters) => setPeriodFilter(newFilters)}
                disabled={loading}
            />

            {/* Tarjetas principales de métricas */}
            <ResumenFiscalCards resumen={resumen} loading={loading} />

            {/* Desglose y Detalles Normativos */}
            {resumen && !loading && (
                <Grid container spacing={3}>
                    {/* Tarjeta de Régimen e Impuestos */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 2,
                                height: '100%'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Gavel color="primary" />
                                <Typography variant="h6" fontWeight={700}>
                                    Régimen Tributario Aplicable
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" paragraph>
                                {esPeq ? (
                                    <>
                                        El negocio se encuentra registrado bajo el <strong>Régimen de Pequeño Contribuyente (PEQ)</strong>.
                                        Conforme a la legislación guatemalteca, este régimen aplica una tarifa del <strong>5% flat</strong> sobre los ingresos brutos cobrados en cada factura emitida,
                                        sin derecho a crédito fiscal para los clientes y sin desglose de IVA como impuesto al certificar ante SAT/Digifact.
                                    </>
                                ) : (
                                    <>
                                        El negocio se encuentra registrado bajo el <strong>Régimen General del IVA (GEN)</strong>.
                                        Este régimen aplica una tarifa del <strong>12% de IVA</strong> incluido en los conceptos facturados,
                                        desglosándose la base imponible y el débito fiscal en cada documento tributario electrónico certificado.
                                    </>
                                )}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Stack spacing={1.5}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Período evaluado:
                                    </Typography>
                                    <Chip
                                        icon={<CalendarToday fontSize="small" />}
                                        label={resumen.rango ? `${resumen.rango.fecha_inicio.split('T')[0]} a ${resumen.rango.fecha_fin.split('T')[0]}` : resumen.periodo}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Total Facturado (Activo):
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700}>
                                        {formatMoney(resumen.total_facturado)}
                                    </Typography>
                                </Box>

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Total Facturas Anuladas:
                                    </Typography>
                                    <Typography variant="body2" color="error.main" fontWeight={600}>
                                        - {formatMoney(resumen.total_anulado)} ({resumen.cantidad_anuladas} docs)
                                    </Typography>
                                </Box>

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Impuesto Estimado ({esPeq ? '5% PEQ' : '12% IVA'}):
                                    </Typography>
                                    <Typography variant="body1" color="warning.main" fontWeight={700}>
                                        {formatMoney(resumen.total_impuestos_estimados)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Aviso de responsabilidad / notas técnicas */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 2,
                                height: '100%',
                                backgroundColor: (t) => t.palette.mode === 'dark' ? 'grey.900' : 'grey.50'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <AccountBalance color="action" />
                                <Typography variant="h6" fontWeight={700}>
                                    Nota Contable
                                </Typography>
                            </Box>

                            <Alert severity="info" icon={<InfoOutlined />} sx={{ mb: 2 }}>
                                <AlertTitle>Estimación de Carácter Informativo</AlertTitle>
                                Las métricas presentadas en este resumen se calculan a partir de los campos tributarios históricos
                                (<code>total_impuestos</code> y <code>porcentaje_impuesto</code>) guardados con cada factura al momento de su certificación.
                            </Alert>

                            <Typography variant="caption" color="text.secondary" display="block">
                                • Los importes de facturas históricas emitidas bajo un régimen anterior conservan sus valores originales sin recalcularse con el régimen presente.
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                • Los importes anulados se excluyen del total facturado neto para mantener la precisión de los montos efectivamente percibidos.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default ResumenFiscalPage;
