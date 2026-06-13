import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { trasladoRepository } from '../../infrastructure/traslado.repository';
import type { TrasladoDetalle, EstadoTraslado } from '../../domain/interfaces/traslado.interface';
import { ArrowBack } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';

const ESTADO_COLORS: Record<EstadoTraslado, 'default' | 'warning' | 'success' | 'error'> = {
    PENDIENTE: 'warning',
    COMPLETADO: 'success',
    CANCELADO: 'error',
};

export const TrasladoDetallePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [traslado, setTraslado] = useState<TrasladoDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

        const cargarTraslado = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const response = await trasladoRepository.obtener(id);
            setTraslado(response.data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar traslado');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            cargarTraslado();
        }
    }, [id, cargarTraslado]);



    if (loading) {
        return (
            <Loading />
        );
    }

    if (error || !traslado) {
        return (
            <ErrorPageLoading
                text={error || 'No se pudo cargar el traslado'}
                navigate={() => navigate(-1)}
            />
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4">
                        Traslado #{traslado.consecutivo}
                    </Typography>
                    <Typography color="textSecondary">
                        {new Date(traslado.created_at).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{ mb: 2, textTransform: 'none' }}
                    >
                        Volver
                    </Button>
                    </Box>
                </Box>
                <Chip
                    variant='outlined'
                    label={traslado.estado}
                    color={ESTADO_COLORS[traslado.estado]}
                    size="medium"
                />
            </Box>

            <Stack spacing={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Información General</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography color="textSecondary" variant="caption">Sucursal Origen</Typography>
                                    <Typography variant="body1">{traslado.origen.nombre}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="textSecondary" variant="caption">Sucursal Destino</Typography>
                                    <Typography variant="body1">{traslado.destino.nombre}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="textSecondary" variant="caption">Creador</Typography>
                                    <Typography variant="body1">
                                        {traslado.creador.nombre} {traslado.creador.apellido}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography color="textSecondary" variant="caption">Estado</Typography>
                                    <Chip
                                        variant='outlined'
                                        label={traslado.estado}
                                        color={ESTADO_COLORS[traslado.estado]}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Detalles del Traslado</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'background.paper' }}>
                                        <TableCell><strong>SKU</strong></TableCell>
                                        <TableCell><strong>Producto</strong></TableCell>
                                        <TableCell><strong>Lote</strong></TableCell>
                                        <TableCell align="right"><strong>Cantidad</strong></TableCell>
                                        <TableCell align="right"><strong>Costo Unit.</strong></TableCell>
                                        <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {traslado.detalles.map(detalle => (
                                        <TableRow key={detalle.id}>
                                            <TableCell>{detalle.lote?.variante?.sku || '-'}</TableCell>
                                            <TableCell>{detalle.lote?.variante?.producto?.nombre || '-'}</TableCell>
                                            <TableCell>{detalle.lote?.codigo_lote || '-'}</TableCell>
                                            <TableCell align="right">{detalle.cantidad}</TableCell>
                                            <TableCell align="right">
                                                {detalle.lote?.costo_compra != null ? `Q${detalle.lote.costo_compra.toFixed(2)}` : '-'}
                                            </TableCell>
                                            <TableCell align="right">
                                                {detalle.lote?.precio_venta != null ? `Q${detalle.lote.precio_venta.toFixed(2)}` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
};
