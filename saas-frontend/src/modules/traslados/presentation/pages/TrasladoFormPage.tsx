import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Stack,
    Alert,
    FormHelperText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../../core/store/authStore';
import { trasladoRepository } from '../../infrastructure/traslado.repository';
import { LoteRepository } from '../../../../modules/lotes/infrastructure/repositories/lote.repository';
import { sucursalRepository } from '../../../../modules/sucursales/infrastructure/repositories/sucursal.repository';
import { LoteSelectionModal } from '../components/LoteSelectionModal';
import type { TrasladoCrearForm } from '../../domain/interfaces/traslado.interface';
import type { Lote } from '../../../../modules/lotes/domain/interfaces/lote.interface';
import type { Sucursal } from '../../../../modules/sucursales/domain/interfaces/sucursal.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const trasladoSchema = z.object({
    sucursal_destino_id: z.string().uuid('Debe seleccionar una sucursal destino'),
});

type TrasladoFormData = z.infer<typeof trasladoSchema>;

export const TrasladoFormPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [selectedLotes, setSelectedLotes] = useState<Map<string, { lote: Lote; cantidad: number }>>(new Map());
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingLotes, ] = useState(false);
    const [openLoteModal, setOpenLoteModal] = useState(false);

    // ✅ SOLUCIÓN: Una sola instancia de useForm controlando todo
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<TrasladoFormData>({
        resolver: zodResolver(trasladoSchema),
        defaultValues: {
            sucursal_destino_id: '',
        },
    });

    // Escuchamos los cambios del sucursal_destino_id desde la misma instancia
    const sucursalDestino = watch('sucursal_destino_id');

     const cargarDatos = useCallback(async () => {
        if (!user?.sucursal_id || !user?.negocio_id) return;

        setLoading(true);
        try {
            const lotesResponse = await LoteRepository.listar(100, 0);
            const lotesFiltrados = lotesResponse.data.filter(
                lote => lote.sucursal_id === user.sucursal_id && lote.cantidad_actual > 0
            );
            setLotes(lotesFiltrados);

            const sucursalesResponse = await sucursalRepository.listar(100, 0);
            const sucursalesFiltradas = sucursalesResponse.data.filter(
                s => s.id !== user.sucursal_id
            );
            setSucursales(sucursalesFiltradas);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar sucursales y lotes');
        } finally {
            setLoading(false);
        }
    }, [user?.sucursal_id, user?.negocio_id]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const onSubmit = async (data: TrasladoFormData) => {
        setLoading(true);
        setError('');
        try {
            if (selectedLotes.size === 0) {
                setError('Debe seleccionar al menos un lote');
                setLoading(false);
                return;
            }

            const detalles = Array.from(selectedLotes.values()).map(({ lote, cantidad }) => ({
                lote_id: lote.id,
                cantidad,
            }));

            const payload: TrasladoCrearForm = {
                sucursal_destino_id: data.sucursal_destino_id,
                detalles,
            };

            await trasladoRepository.crear(payload);
            navigate('/traslados/salidas');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al crear traslado');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLote = (lote: Lote, cantidad: number) => {
        setSelectedLotes(prev => {
            const map = new Map(prev);
            map.set(lote.id, { lote, cantidad });
            return map;
        });
    };

    const handleRemoveLote = (loteId: string) => {
        setSelectedLotes(prev => {
            const map = new Map(prev);
            map.delete(loteId);
            return map;
        });
    };

    const handleUpdateCantidad = (loteId: string, cantidad: number) => {
        setSelectedLotes(prev => {
            const map = new Map(prev);
            const item = map.get(loteId);
            if (item) {
                if (cantidad < 1) {
                    map.delete(loteId);
                } else if (cantidad <= item.lote.cantidad_actual) {
                    map.set(loteId, { ...item, cantidad });
                }
            }
            return map;
        });
    };

    if (loading && lotes.length === 0) {
        return (
            <Loading/>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Crear Traslado
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Card>
                <CardContent>
                    <Stack spacing={3}>
                        {/* ✅ CORRECCIÓN: Manejo correcto de errores con FormHelperText */}
                        <FormControl fullWidth error={!!errors.sucursal_destino_id}>
                            <InputLabel id="sucursal-destino-label">Sucursal Destino</InputLabel>
                            <Controller
                                name="sucursal_destino_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        labelId="sucursal-destino-label"
                                        label="Sucursal Destino"
                                    >
                                        {sucursales.map(sucursal => (
                                            <MenuItem key={sucursal.id} value={sucursal.id}>
                                                {sucursal.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.sucursal_destino_id && (
                                <FormHelperText>{errors.sucursal_destino_id.message}</FormHelperText>
                            )}
                        </FormControl>

                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Lotes a Trasladar ({selectedLotes.size})
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setOpenLoteModal(true)}
                                    disabled={!sucursalDestino}
                                >
                                    + Agregar Lote
                                </Button>
                            </Box>

                            <TableContainer component={Card} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'background.paper' }}>
                                            <TableCell><strong>SKU</strong></TableCell>
                                            <TableCell><strong>Producto</strong></TableCell>
                                            <TableCell><strong>Lote</strong></TableCell>
                                            <TableCell align="right"><strong>Disponible</strong></TableCell>
                                            <TableCell align="right"><strong>Trasladar</strong></TableCell>
                                            <TableCell align="center"><strong>Acción</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedLotes.size === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                    <Typography color="textSecondary">
                                                        {sucursalDestino 
                                                            ? 'Selecciona lotes para trasladar'
                                                            : 'Primero selecciona una sucursal destino'
                                                        }
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            Array.from(selectedLotes.values()).map(({ lote, cantidad }) => (
                                                <TableRow key={lote.id}>
                                                    <TableCell>{lote.variante?.sku || '-'}</TableCell>
                                                    <TableCell>{lote.variante?.producto_nombre || '-'}</TableCell>
                                                    <TableCell>{lote.codigo_lote}</TableCell>
                                                    <TableCell align="right">{lote.cantidad_actual}</TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            value={cantidad}
                                                            onChange={(e) => handleUpdateCantidad(lote.id, parseInt(e.target.value) || 0)}
                                                            size="small"
                                                            inputProps={{ 
                                                                min: 1, 
                                                                max: lote.cantidad_actual,
                                                                style: { textAlign: 'center', width: '70px' }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleRemoveLote(lote.id)}
                                                        >
                                                            Remover
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                            <Button onClick={() => navigate('/traslados')}>
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting || loading || selectedLotes.size === 0}
                            >
                                {isSubmitting || loading ? <CircularProgress size={24} /> : 'Crear Traslado'}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <LoteSelectionModal
                open={openLoteModal}
                lotes={lotes}
                loading={loadingLotes}
                onSelect={handleSelectLote}
                onClose={() => setOpenLoteModal(false)}
            />
        </Box>
    );
};