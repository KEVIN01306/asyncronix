import { Box, Divider, Stack, Typography, Chip } from '@mui/material';
import type { ProductoCategoria } from '../../../domain/interfaces/producto.interface';
import { formatMoney } from '../../../../../core/utils/formatMoney';

interface ProductoDetailsPanelProps {
    categoria: ProductoCategoria | null;
    codigo?: string | null;
    sku: string;
    precio_sugerido: number;
    stock_total: number;
    activo: boolean;
}

const ProductoDetailsPanel = ({ categoria, codigo, sku, precio_sugerido, stock_total, activo }: ProductoDetailsPanelProps) => (
    <Stack spacing={2}>
        <Box>
            <Typography variant="subtitle2" color="text.secondary">
                Categoría
            </Typography>
            <Typography variant="body1">{categoria?.categoria || 'Sin categoría'}</Typography>
        </Box>
        <Box>
            <Typography variant="subtitle2" color="text.secondary">
                Código
            </Typography>
            <Typography variant="body1">{codigo || 'N/A'}</Typography>
        </Box>
        <Box>
            <Typography variant="subtitle2" color="text.secondary">
                Sku
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
            <Chip label={activo ? 'Activo' : 'Inactivo'} color={activo ? 'success' : 'default'} size="small" />
        </Box>
        <Divider />
    </Stack>
);

export default ProductoDetailsPanel;
