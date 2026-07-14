import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { useAuthStore } from '../../../../core/store/authStore';
import type { ConciliacionFinanciera, CajaKPI, CuentaBancariaKPI } from '../../domain/reportes.model';

interface Props {
    conciliacion: ConciliacionFinanciera;
    cajas: CajaKPI[];
    cuentas: CuentaBancariaKPI[];
}

const ConciliacionPanel = ({ conciliacion, cajas, cuentas }: Props) => {
    const { user } = useAuthStore();
    const monedaCodigo = user?.negocio?.moneda?.codigo;

    return (
        <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 3 }}>
            {/* Cabecera Principal */}
            <Box mb={4}>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                    Auditoría de Caja
                </Typography>
                <Typography variant="h5" fontWeight={700} color="text.primary" mt={0.5}>
                    Conciliación Financiera
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Comparación entre saldos actuales registrados vs flujo de movimientos del periodo.
                </Typography>
            </Box>

            {/* Bloque de Indicadores (Métricas Clave) */}
            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                gap={3}
                mb={4}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.02 : 0.015),
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                        Saldo por Movimientos
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main" mt={0.5} sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                        {formatMoney(conciliacion.saldo_esperado, monedaCodigo)}
                    </Typography>
                </Box>

                <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: 40, bgcolor: 'divider' }} />

                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                        Saldo Real (Entidades)
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="text.primary" mt={0.5} sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                        {formatMoney(conciliacion.saldo_actual, monedaCodigo)}
                    </Typography>
                </Box>

                <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: 40, bgcolor: 'divider' }} />

                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                        Diferencia
                    </Typography>
                    <Typography variant="h4" fontWeight={700} mt={0.5} sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }} color={conciliacion.diferencia === 0 ? 'success.main' : 'error.main'}>
                        {formatMoney(conciliacion.diferencia, monedaCodigo)}
                    </Typography>
                </Box>
            </Box>

            {/* Mensajes de Advertencia */}
            {conciliacion.diferencia !== 0 && (
                <Alert
                    severity="warning"
                    sx={{
                        mb: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.warning.main, 0.2),
                        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                        color: 'text.primary',
                        '& .MuiAlert-icon': {
                            color: 'warning.main'
                        }
                    }}
                >
                    Existe un descuadre entre el flujo neto del periodo y el saldo real actual. Revise si existen transacciones externas o depósitos manuales no registrados.
                </Alert>
            )}

            {/* Listas Detalladas (Cajas y Bancos) */}
            <Stack spacing={4}>
                {/* Tabla de Cajas */}
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1.5} sx={{ letterSpacing: '0.01em' }}>
                        Desglose de Saldos en Cajas
                    </Typography>
                    <TableContainer sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        <Table size="small" sx={{ minWidth: 400 }}>
                            <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Caja</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Saldo actual</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cajas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                            No hay cajas registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cajas.map(c => (
                                        <TableRow key={c.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 500 }}>{c.nombre}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMoney(c.saldo, monedaCodigo)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Tabla de Cuentas */}
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1.5} sx={{ letterSpacing: '0.01em' }}>
                        Desglose de Saldos Bancarios
                    </Typography>
                    <TableContainer sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        <Table size="small" sx={{ minWidth: 550 }}>
                            <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Banco</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Número de Cuenta</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Saldo actual</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cuentas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                            No hay cuentas bancarias registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cuentas.map(c => (
                                        <TableRow key={c.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 500 }}>{c.banco}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{c.numero_cuenta}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMoney(c.saldo_original, c.moneda_codigo)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Stack>
        </Paper>
    );
};

export default ConciliacionPanel;