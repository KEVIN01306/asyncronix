import { Card, CardContent, Divider, Stack, Typography, Box } from '@mui/material';
import { useJerarquiaProductoCategoria } from '../../hooks/useJerarquiaProductoCategoria';
import { formatearJerarquiaTexto } from '../../../../categorias/presentation/hooks/useJerarquiaTexto';

interface ProductoCategoriaResumen {
    id: string;
    categoria: string;
}

interface ProductoSummaryCardProps {
    categoria: ProductoCategoriaResumen | null;
    activo: boolean;
}

const ProductoSummaryCard = ({ categoria, activo }: ProductoSummaryCardProps) => {
    const { jerarquia } = useJerarquiaProductoCategoria(categoria?.id);
    const jerarquiaTexto = formatearJerarquiaTexto(jerarquia);

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                    Resumen
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" gap={2}>
                        <Typography variant="body2">Categoría</Typography>
                        <Typography variant="body2" fontWeight={700} textAlign="right">
                            {jerarquiaTexto || categoria?.categoria || 'N/A'}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Activo</Typography>
                        <Typography variant="body2" fontWeight={700}>{activo ? 'Sí' : 'No'}</Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ProductoSummaryCard;
