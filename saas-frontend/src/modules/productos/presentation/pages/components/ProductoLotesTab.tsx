import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography, Card, CardActionArea, CardContent, Grid, Chip } from '@mui/material';
import { Add as AddIcon, Inventory as InventoryIcon, CalendarMonth as CalendarIcon, LocalOffer as PriceIcon, Store } from '@mui/icons-material';
import { LoteRepository } from '../../../../lotes/infrastructure/repositories/lote.repository';
import type { Lote } from '../../../../lotes/domain/interfaces/lote.interface';
import { formatMoney } from '../../../../../core/utils/formatMoney';
import Loading from '../../../../../shared/components/ui/Loaders/Loading';

interface Props {
    productoId: string;
}

const ProductoLotesTab = ({ productoId }: Props) => {
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await LoteRepository.listarPorProducto(productoId, 20, 0);
            setLotes(resp.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [productoId]);

    useEffect(() => { fetch(); }, [fetch]);

    if (loading) return <Loading />

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <InventoryIcon color="action" />
                    <Typography variant="h6" fontWeight={700}>Control de Lotes</Typography>
                    <Chip label={`${lotes.length} activos`} size="small" variant="outlined" color="primary" />
                </Stack>
                <Button 
                    variant="contained" 
                    href={`/lotes/crear?producto_id=${productoId}`}
                    startIcon={<AddIcon />}
                >
                    Agregar lote
                </Button>
            </Stack>

            {lotes.length === 0 ? (
                <Card variant="outlined" sx={{ borderStyle: 'dashed', textAlign: 'center', py: 6, bgcolor: 'background.default' }}>
                    <CardContent>
                        <InventoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            No hay lotes activos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Este producto aún no cuenta con stock registrado mediante lotes.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={2}>
                    {lotes.map(l => (
                        <Grid size={{ xs: 12, sm:6}}  key={l.id}>
                            <Card 
                                variant="outlined" 
                                sx={{ 
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                                        borderColor: 'primary.main'
                                    }
                                }}
                            >
                                <CardActionArea href={`/lotes/${l.id}`} sx={{ p: 1 }}>
                                    <CardContent>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                                                    CÓDIGO DE LOTE
                                                </Typography>
                                                <Typography variant="body1" fontWeight={700} color="text.primary">
                                                    #{l.id.slice(0, 8).toUpperCase()}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={`${l.cantidad_actual} unds`} 
                                                color={l.cantidad_actual > 0 ? "secondary" : "primary"} 
                                                size="small"
                                                variant={"outlined"}
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </Stack>

                                        <Stack spacing={1}>
                                            <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                                                <CalendarIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    Ingreso: <Box component="span" fontWeight={500} color="text.primary">{new Date(l.fecha_ingreso).toLocaleDateString()}</Box>
                                                </Typography>
                                            </Stack>
                                            
                                            <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                                                <PriceIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    Precio venta: <Box component="span" fontWeight={600} color="secondary.main">S/ {formatMoney(l.precio_venta)}</Box>
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                                                <Store sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    Sucursal: <Box component="span" fontWeight={600} color="text.primary">{l.sucursal.nombre}</Box>
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default ProductoLotesTab;