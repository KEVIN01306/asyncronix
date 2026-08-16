import { useState } from 'react';
import {
    Box, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Select, FormControl, InputLabel, Autocomplete
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { formatMoney } from '../../../../core/utils/formatMoney';
import type { CotizacionForm } from '../../domain/interfaces/cotizacion.interface';
import { VarianteRepository } from '../../../productos/infrastructure/repositories/variante.repository';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import type { Variante } from '../../../productos/domain/interfaces/producto.interface';
import type { TipoServicio } from '../../../tipos-servicio/domain/interfaces/tipo-servicio.interface';
import { toast } from 'sonner';

interface Props {
    isReadOnly?: boolean;
}

export default function QuotationItemsTable({ isReadOnly = false }: Props) {
    const { control, watch, setValue } = useFormContext<CotizacionForm>();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'detalles'
    });

    const [openModal, setOpenModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    // Local state for the modal form
    const [tipo, setTipo] = useState<'PRODUCTO' | 'SERVICIO' | 'MANO_OBRA_PERSONALIZADA'>('PRODUCTO');
    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [precio, setPrecio] = useState(0);
    const [descuento, setDescuento] = useState(0);
    const [varianteId, setVarianteId] = useState<string | null>(null);
    const [tipoServicioId, setTipoServicioId] = useState<string | null>(null);

    const [variantesDisponibles, setVariantesDisponibles] = useState<any[]>([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState<TipoServicio[]>([]);
    const [loadingVariantes, setLoadingVariantes] = useState(false);
    const [loadingServicios, setLoadingServicios] = useState(false);

    // Fetch options when modal opens or types change
    const fetchVariantes = async () => {
        if (variantesDisponibles.length > 0) return;
        setLoadingVariantes(true);
        try {
            const res = await VarianteRepository.listarPorNegocio();
            const variantes: any[] = res.data.map((v: Variante) => {
                const atributos = (v.valores ?? []).map((valor) => valor.atributo ? `${valor.atributo.nombre}: ${valor.valor}` : valor.valor).join(', ');
                const productoNombre = v.producto?.nombre ?? 'Variante';
                return {
                    ...v,
                    nombre: atributos ? `${productoNombre} (${atributos})` : productoNombre,
                    producto_nombre: productoNombre
                };
            });
            setVariantesDisponibles(variantes);
        } catch {
            toast.error('Error al cargar variantes');
        } finally {
            setLoadingVariantes(false);
        }
    };

    const fetchServicios = async () => {
        if (serviciosDisponibles.length > 0) return;
        setLoadingServicios(true);
        try {
            const res = await TipoServicioRepository.listar(100, 0); // Traer suficientes servicios
            setServiciosDisponibles(res.data);
        } catch {
            toast.error('Error al cargar servicios');
        } finally {
            setLoadingServicios(false);
        }
    };

    const handleOpenModal = (index?: number) => {
        if (index !== undefined) {
            const item = fields[index];
            setEditIndex(index);
            setTipo(item.tipo || 'MANO_OBRA_PERSONALIZADA');
            setDescripcion(item.descripcion);
            setCantidad(item.cantidad);
            setPrecio(item.precio_unitario);
            setDescuento(item.descuento);
            setVarianteId(item.variante_id || null);
            setTipoServicioId(item.tipo_servicio_id || null);
        } else {
            setEditIndex(null);
            setTipo('PRODUCTO');
            setDescripcion('');
            setCantidad(1);
            setPrecio(0);
            setDescuento(0);
            setVarianteId(null);
            setTipoServicioId(null);
        }

        if (index !== undefined) {
            const currentItem = fields[index];
            if (currentItem.tipo === 'PRODUCTO') fetchVariantes();
            if (currentItem.tipo === 'SERVICIO') fetchServicios();
        } else {
            fetchVariantes(); // Default is PRODUCTO
        }

        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleSave = () => {
        const item = {
            tipo,
            descripcion,
            cantidad,
            precio_unitario: precio,
            descuento,
            subtotal: (cantidad * precio) - descuento,
            variante_id: varianteId,
            tipo_servicio_id: tipoServicioId
        };

        if (editIndex !== null) {
            update(editIndex, item as any);
        } else {
            append(item as any);
        }
        handleCloseModal();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Detalles de Cotización</Typography>
                {!isReadOnly && (
                    <Button startIcon={<Add />} variant="contained" onClick={() => handleOpenModal()}>
                        Agregar Línea
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper} variant="outlined" elevation={0}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell align="right">Cant.</TableCell>
                            <TableCell align="right">Precio Unit.</TableCell>
                            <TableCell align="right">Descuento</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                            {!isReadOnly && <TableCell align="center">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isReadOnly ? 6 : 7} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">No hay detalles agregados.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            fields.map((field, index) => {
                                const subtotal = (field.cantidad * field.precio_unitario) - field.descuento;
                                return (
                                    <TableRow key={field.id}>
                                        <TableCell>{field.tipo}</TableCell>
                                        <TableCell>{field.descripcion}</TableCell>
                                        <TableCell align="right">{field.cantidad}</TableCell>
                                        <TableCell align="right">{formatMoney(field.precio_unitario)}</TableCell>
                                        <TableCell align="right">{formatMoney(field.descuento)}</TableCell>
                                        <TableCell align="right">{formatMoney(subtotal)}</TableCell>
                                        {!isReadOnly && (
                                            <TableCell align="center">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenModal(index)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => remove(index)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para agregar/editar detalle */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editIndex !== null ? 'Editar Detalle' : 'Agregar Detalle'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={tipo}
                                label="Tipo"
                                onChange={(e) => {
                                    const val = e.target.value as any;
                                    setTipo(val);
                                    if (val === 'PRODUCTO') fetchVariantes();
                                    if (val === 'SERVICIO') fetchServicios();
                                    // Reset specific fields when changing type
                                    setVarianteId(null);
                                    setTipoServicioId(null);
                                }}
                            >
                                <MenuItem value="PRODUCTO">Repuesto / Producto</MenuItem>
                                <MenuItem value="SERVICIO">Servicio</MenuItem>
                                <MenuItem value="MANO_OBRA_PERSONALIZADA">Mano de Obra Personalizada</MenuItem>
                            </Select>
                        </FormControl>

                        {tipo === 'PRODUCTO' && (
                            <Autocomplete
                                options={variantesDisponibles}
                                getOptionLabel={(option) => option?.nombre ?? ''}
                                value={variantesDisponibles.find(v => v.id === varianteId) || null}
                                onChange={(_e, newValue) => {
                                    setVarianteId(newValue?.id || null);
                                    if (newValue) {
                                        if (!descripcion) setDescripcion(newValue.nombre);
                                        if (precio === 0) setPrecio(newValue.precio_sugerido || 0);
                                    }
                                }}
                                loading={loadingVariantes}
                                renderInput={(params) => (
                                    <TextField {...params} label="Buscar Producto / Variante" variant="outlined" />
                                )}
                            />
                        )}

                        {tipo === 'SERVICIO' && (
                            <Autocomplete
                                options={serviciosDisponibles}
                                getOptionLabel={(option) => option?.nombre ?? ''}
                                value={serviciosDisponibles.find(s => s.id === tipoServicioId) || null}
                                onChange={(_e, newValue) => {
                                    setTipoServicioId(newValue?.id || null);
                                    if (newValue) {
                                        if (!descripcion) setDescripcion(newValue.nombre);
                                        if (precio === 0) setPrecio(newValue.precio_base || 0);
                                    }
                                }}
                                loading={loadingServicios}
                                renderInput={(params) => (
                                    <TextField {...params} label="Buscar Servicio" variant="outlined" />
                                )}
                            />
                        )}

                        <TextField
                            fullWidth
                            label="Descripción"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Cantidad"
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                inputProps={{ min: 1 }}
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label="Precio Unitario"
                                value={precio}
                                onChange={(e) => setPrecio(Number(e.target.value))}
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label="Descuento"
                                value={descuento}
                                onChange={(e) => setDescuento(Number(e.target.value))}
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Subtotal: {formatMoney((cantidad * precio) - descuento)}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!descripcion || cantidad < 1 || precio < 0 || descuento < 0}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
