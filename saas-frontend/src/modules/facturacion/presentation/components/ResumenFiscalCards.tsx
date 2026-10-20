import { Grid, Paper, Typography, Box, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
    PointOfSale, 
    ReceiptLong, 
    AccountBalance, 
    CheckCircle 
} from '@mui/icons-material';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { useAuthStore } from '../../../../core/store/authStore';
import type { ResumenFiscalData } from '../../domain/interfaces/factura.interface';

interface Props {
    resumen: ResumenFiscalData | null;
    loading?: boolean;
}

export const ResumenFiscalCards = ({ resumen, loading }: Props) => {
    const user = useAuthStore(status => status.user);
    const monedaCodigo = user?.negocio?.moneda?.codigo;

    if (loading) {
        return (
            <Grid container spacing={3} mb={3}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Skeleton variant="text" width="50%" height={20} />
                                <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 2.5 }} />
                            </Box>
                            <Box>
                                <Skeleton variant="text" width="70%" height={32} />
                                <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (!resumen) return null;

    const esPeq = resumen.regimen_fiscal_actual === 'PEQ';
    const regimenLabel = esPeq ? 'Pequeño Contribuyente' : 'Régimen General';
    const tasaLabel = esPeq ? '5% Flat' : '12% IVA';

    const cards = [
        {
            title: 'Total Facturado',
            value: formatMoney(resumen.total_facturado, monedaCodigo),
            icon: <PointOfSale sx={{ fontSize: 28, color: 'primary.main' }} />,
            paletteColor: 'primary' as const,
            subtitle: `${resumen.cantidad_facturas} facturas activas`
        },
        {
            title: 'Impuesto Estimado',
            value: formatMoney(resumen.total_impuestos_estimados, monedaCodigo),
            icon: <ReceiptLong sx={{ fontSize: 28, color: 'warning.main' }} />,
            paletteColor: 'warning' as const,
            subtitle: `Estimación (${tasaLabel})`
        },
        {
            title: 'Régimen Fiscal',
            value: regimenLabel,
            icon: <AccountBalance sx={{ fontSize: 28, color: 'info.main' }} />,
            paletteColor: 'info' as const,
            subtitle: `${resumen.regimen_fiscal_actual} (${tasaLabel})`
        },
        {
            title: 'Documentos Emitidos',
            value: `${resumen.cantidad_facturas} emitidos`,
            icon: <CheckCircle sx={{ fontSize: 28, color: 'success.main' }} />,
            paletteColor: 'success' as const,
            subtitle: `${resumen.cantidad_anuladas} anuladas (${formatMoney(resumen.total_anulado, monedaCodigo)})`
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

export default ResumenFiscalCards;
