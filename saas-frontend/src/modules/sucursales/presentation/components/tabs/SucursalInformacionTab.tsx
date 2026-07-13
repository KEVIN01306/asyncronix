import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import type { SucursalMiDetalle } from '../../../domain/interfaces/sucursal.interface';

interface Props {
    sucursal: SucursalMiDetalle;
}

const SucursalInformacionTab = ({ sucursal }: Props) => {
    return (
        <Grid container spacing={3}>
            {/* Fila Principal: Información y Estado */}
            <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        gap={2}
                    >
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Información General
                            </Typography>
                            <Typography variant="h6" fontWeight={600} mt={0.5} color="text.primary">
                                {sucursal.direccion ?? 'Dirección no especificada'}
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                            <Chip
                                label={sucursal.es_principal ? 'Sede Principal' : 'Sucursal'}
                                color={sucursal.es_principal ? 'primary' : 'default'}
                                size="small"
                            />
                            <Chip
                                label="Acceso basado en tu sucursal"
                                variant="outlined"
                                size="small"
                                sx={{ color: 'text.secondary' }}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Fila de Métricas / Contadores */}
            <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                Cajas activas
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                {sucursal.cajas.length}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                Cuentas bancarias
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                {sucursal.cuentas_bancarias.length}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                Usuarios asignados
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                {sucursal.usuarios_count}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default SucursalInformacionTab;