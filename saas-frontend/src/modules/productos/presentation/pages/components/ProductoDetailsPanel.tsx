import { Box, Divider, Stack, Typography, Chip, CircularProgress } from '@mui/material';
import type { ProductoCategoria } from '../../../domain/interfaces/producto.interface';
import { formatMoney } from '../../../../../core/utils/formatMoney';
import { useJerarquiaProductoCategoria } from '../../hooks/useJerarquiaProductoCategoria';
import { ordenarJerarquiaPorRuta } from '../../../../categorias/presentation/hooks/useJerarquiaTexto';

interface ProductoDetailsPanelProps {
    categoria: ProductoCategoria | null;
    sku: string;
    precio_sugerido: number;
    stock_total: number;
    activo: boolean;
}

const ProductoDetailsPanel = ({ categoria, sku, precio_sugerido, stock_total, activo }: ProductoDetailsPanelProps) => {
    const { jerarquia, loading: loadingJerarquia } = useJerarquiaProductoCategoria(categoria?.id);
    const rutaOrdenada = ordenarJerarquiaPorRuta(jerarquia);

    return (
        <Stack spacing={2}>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">
                    Categoría
                </Typography>
                {loadingJerarquia ? (
                    <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Cargando jerarquía...</Typography>
                    </Box>
                ) : rutaOrdenada.length > 0 ? (
                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                        {rutaOrdenada.map((nivel, idx) => (
                            <Box key={nivel.id} display="flex" alignItems="center" gap={0.5}>
                                <Chip
                                    label={nivel.categoria}
                                    size="small"
                                    variant={idx === 0 ? 'filled' : 'outlined'}
                                    color={idx === 0 ? 'primary' : 'default'}
                                    sx={{ fontWeight: idx === 0 ? 600 : 500 }}
                                />
                                {idx < rutaOrdenada.length - 1 && (
                                    <Typography variant="caption" color="text.secondary">›</Typography>
                                )}
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body1">{categoria?.categoria || 'Sin categoría'}</Typography>
                )}
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">
                    SKU
                </Typography>
                <Typography variant="body1">{sku || 'N/A'}</Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">
                    Precio sugerido
                </Typography>
                <Typography variant="body1">{formatMoney(precio_sugerido)}</Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">
                    Stock total
                </Typography>
                <Typography variant="body1">{stock_total}</Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">
                    Estado
                </Typography>
                <Chip variant="outlined" label={activo ? 'Activo' : 'Inactivo'} color={activo ? 'success' : 'default'} size="small" />
            </Box>
            <Divider />
        </Stack>
    );
};

export default ProductoDetailsPanel;
