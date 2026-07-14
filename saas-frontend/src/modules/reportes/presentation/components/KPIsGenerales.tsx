import { Grid, Paper, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TrendingUp, TrendingDown, AccountBalanceWallet, ReceiptLong } from '@mui/icons-material';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { useAuthStore } from '../../../../core/store/authStore';

interface Props {
    kpis: {
        total_ingresos: number;
        total_egresos: number;
        flujo_neto: number;
        cantidad_ingresos: number;
        cantidad_egresos: number;
        total_movimientos: number;
    } | undefined;
}

const KPIsGenerales = ({ kpis }: Props) => {
    const user = useAuthStore(status => status.user);
    const monedaCodigo = user?.negocio?.moneda?.codigo;

    if (!kpis) return null;

    const cards = [
        {
            title: 'Flujo Neto',
            value: formatMoney(kpis.flujo_neto, monedaCodigo),
            icon: <AccountBalanceWallet sx={{ fontSize: 28, color: 'primary.main' }} />,
            paletteColor: 'primary' as const,
            subtitle: 'Balance general'
        },
        {
            title: 'Ingresos Totales',
            value: formatMoney(kpis.total_ingresos, monedaCodigo),
            icon: <TrendingUp sx={{ fontSize: 28, color: 'success.main' }} />,
            paletteColor: 'success' as const,
            subtitle: `${kpis.cantidad_ingresos} transacciones`
        },
        {
            title: 'Egresos Totales',
            value: formatMoney(kpis.total_egresos, monedaCodigo),
            icon: <TrendingDown sx={{ fontSize: 28, color: 'error.main' }} />,
            paletteColor: 'error' as const,
            subtitle: `${kpis.cantidad_egresos} transacciones`
        },
        {
            title: 'Total Movimientos',
            value: kpis.total_movimientos.toLocaleString(),
            icon: <ReceiptLong sx={{ fontSize: 28, color: 'info.main' }} />,
            paletteColor: 'info' as const,
            subtitle: 'Historial procesado'
        }
    ];

    return (
        <Grid container spacing={3} mb={3}>
            {cards.map((card, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: 2 }}>

                        {/* Cabecera de la tarjeta: Título e Icono */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', fontSize: '0.75rem' }}>
                                {card.title}
                            </Typography>

                            {/* Contenedor del Icono estilo iOS (Borde suave y fondo sutil translúcido) */}
                            <Box sx={{
                                p: 1,
                                borderRadius: 2.5, // 10px redondeado discreto para el icono
                                bgcolor: (theme) => alpha(theme.palette[card.paletteColor].main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {card.icon}
                            </Box>
                        </Box>

                        {/* Contenido principal: Datos numéricos */}
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                                {card.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {card.subtitle}
                            </Typography>
                        </Box>

                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

export default KPIsGenerales;