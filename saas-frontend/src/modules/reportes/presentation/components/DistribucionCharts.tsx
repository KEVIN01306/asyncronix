import { Grid, Paper, Typography, Box, LinearProgress, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { useAuthStore } from '../../../../core/store/authStore';
import type { MetodoPagoKPI, OrigenDineroKPI } from '../../domain/reportes.model';

interface Props {
    metodos: MetodoPagoKPI[];
    origenes: OrigenDineroKPI[];
}

const DistribucionCharts = ({ metodos, origenes }: Props) => {
    const { user } = useAuthStore();
    const monedaCodigo = user?.negocio?.moneda?.codigo;

    return (
        <Grid container spacing={3} mb={3}>
            {/* Métodos de Pago */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box mb={3}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                            Distribución de Cobros
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="text.primary" mt={0.5}>
                            Ingresos por Método de Pago
                        </Typography>
                    </Box>

                    <Stack spacing={2.5} sx={{ flexGrow: 1, justifyContent: metodos.length === 0 ? 'center' : 'flex-start' }}>
                        {metodos.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" py={4}>
                                No hay datos de métodos de pago registrados.
                            </Typography>
                        ) : (
                            metodos.map((m, idx) => (
                                <Box key={idx}>
                                    <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={0.75}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            {m.metodo}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="text.secondary">
                                            {formatMoney(m.total, monedaCodigo)} <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, ml: 0.5 }}>({m.porcentaje.toFixed(1)}%)</Box>
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={m.porcentaje}
                                        sx={{
                                            height: 6,
                                            borderRadius: 999,
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 999,
                                            }
                                        }}
                                        color="primary"
                                    />
                                </Box>
                            ))
                        )}
                    </Stack>
                </Paper>
            </Grid>

            {/* Orígenes de Dinero */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box mb={3}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                            Fuentes de Capital
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="text.primary" mt={0.5}>
                            Ingresos por Origen
                        </Typography>
                    </Box>

                    <Stack spacing={2.5} sx={{ flexGrow: 1, justifyContent: origenes.length === 0 ? 'center' : 'flex-start' }}>
                        {origenes.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" py={4}>
                                No hay datos de origen de dinero disponibles.
                            </Typography>
                        ) : (
                            origenes.map((o, idx) => (
                                <Box key={idx}>
                                    <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={0.75}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            {o.origen}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="text.secondary">
                                            {formatMoney(o.total, monedaCodigo)} <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, ml: 0.5 }}>({o.porcentaje.toFixed(1)}%)</Box>
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={o.porcentaje}
                                        sx={{
                                            height: 6,
                                            borderRadius: 999,
                                            bgcolor: (theme) => alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 999,
                                                bgcolor: 'secondary.main'
                                            }
                                        }}
                                    />
                                </Box>
                            ))
                        )}
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default DistribucionCharts;