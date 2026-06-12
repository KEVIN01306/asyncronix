import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
    Stack,
    Typography
} from '@mui/material';
import { ArrowDownward, ArrowUpward, Delete } from '@mui/icons-material';
import { toast } from 'sonner';
import { AtributoRepository } from '../../../../atributos/infrastructure/atributo.repository';
import { ProductoRepository } from '../../../infrastructure/repositories/producto.repository';
import Loading from '../../../../../shared/components/ui/Loaders/Loading';
import type { ProductoAtributo } from '../../../domain/interfaces/producto.interface';

interface ProductoAtributosTabProps {
    productoId: string;
    onRefresh?: () => Promise<void>;
}

export default function ProductoAtributosTab({ productoId, onRefresh }: ProductoAtributosTabProps) {
    const [atributosProducto, setAtributosProducto] = useState<ProductoAtributo[]>([]);
    const [atributosDisponibles, setAtributosDisponibles] = useState<ProductoAtributo[]>([]);
    const [selectedAtributo, setSelectedAtributo] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const unusedAtributos = useMemo(() => {
        return atributosDisponibles.filter((atributo) => !atributosProducto.some((item) => item.id === atributo.id));
    }, [atributosDisponibles, atributosProducto]);

    const fetchAtributos = useCallback(async () => {
        setLoading(true);
        try {
            const [productoAtributos, atributosGlobales] = await Promise.all([
                ProductoRepository.obtenerAtributos(productoId),
                AtributoRepository.listar()
            ]);

            const atributosResponse = (atributosGlobales as any)?.data;
            let allAtributos: ProductoAtributo[] = [];
            if (Array.isArray(atributosGlobales)) {
                allAtributos = atributosGlobales;
            } else if (Array.isArray(atributosResponse?.data)) {
                allAtributos = atributosResponse.data;
            } else if (Array.isArray(atributosResponse)) {
                allAtributos = atributosResponse;
            }

            setAtributosProducto(productoAtributos ?? []);
            setAtributosDisponibles(allAtributos);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar atributos del producto');
        } finally {
            setLoading(false);
        }
    }, [productoId]);

    useEffect(() => {
        fetchAtributos();
    }, [fetchAtributos]);

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        setSelectedAtributo(event.target.value);
    };

    const handleAddAtributo = () => {
        if (!selectedAtributo) {
            toast.error('Selecciona un atributo para asociar');
            return;
        }

        const atributo = atributosDisponibles.find((item) => item.id === selectedAtributo);
        if (!atributo) return;

        if (atributosProducto.some((item) => item.id === atributo.id)) {
            toast.error('El atributo ya está asociado al producto');
            return;
        }

        setAtributosProducto((prev) => [...prev, atributo]);
        setSelectedAtributo('');
    };

    const handleRemoveAtributo = (id: string) => {
        setAtributosProducto((prev) => prev.filter((item) => item.id !== id));
    };

    const handleMoveAtributo = (id: string, direction: number) => {
        setAtributosProducto((prev) => {
            const index = prev.findIndex((item) => item.id === id);
            if (index === -1) return prev;

            const nextIndex = index + direction;
            if (nextIndex < 0 || nextIndex >= prev.length) return prev;

            const next = [...prev];
            [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const atributoIds = atributosProducto.map((atributo) => atributo.id);
            const updatedAtributos = await ProductoRepository.actualizarAtributos(productoId, atributoIds);
            toast.success('Atributos del producto actualizados');
            setAtributosProducto(updatedAtributos ?? atributosProducto);
            if (onRefresh) await onRefresh();
        } catch (error: any) {
            console.error(error);
            const message = error?.response?.data?.message || error?.message || 'Error al guardar atributos';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <Box p={2}>
            <Alert severity="info" sx={{ mb: 3 }}>
                Puedes asociar o quitar atributos al producto. Si un atributo está siendo usado por una variante, no se podrá quitar.
            </Alert>

            <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                    Atributos asociados al producto
                </Typography>
                {atributosProducto.length > 0 ? (
                    <Stack spacing={1}>
                        {atributosProducto.map((atributo, index) => (
                            <Stack
                                key={atributo.id}
                                direction="row"
                                flexWrap="wrap"
                                alignItems="center"
                                spacing={1}
                                sx={{ py: 0.5 }}
                            >
                                <Chip
                                    label={`${index + 1}. ${atributo.nombre}`}
                                    color="primary"
                                    sx={{ minWidth: 0, flexGrow: 1 }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => handleMoveAtributo(atributo.id, -1)}
                                    disabled={index === 0}
                                >
                                    <ArrowUpward fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMoveAtributo(atributo.id, 1)}
                                    disabled={index === atributosProducto.length - 1}
                                >
                                    <ArrowDownward fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveAtributo(atributo.id)}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Este producto no tiene atributos asociados.
                    </Typography>
                )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="flex-end">
                <FormControl fullWidth>
                    <InputLabel id="atributo-select-label">Atributo</InputLabel>
                    <Select
                        labelId="atributo-select-label"
                        value={selectedAtributo}
                        label="Atributo"
                        onChange={handleSelectChange}
                        disabled={unusedAtributos.length === 0}
                    >
                        {unusedAtributos.length === 0 ? (
                            <MenuItem value="">No hay atributos disponibles</MenuItem>
                        ) : (
                            unusedAtributos.map((atributo) => (
                                <MenuItem key={atributo.id} value={atributo.id}>
                                    {atributo.nombre}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    onClick={handleAddAtributo}
                    disabled={!selectedAtributo}
                >
                    Asociar atributo
                </Button>
            </Stack>

            <Box mt={4}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} /> : null}
                >
                    Guardar cambios
                </Button>
            </Box>
        </Box>
    );
}
