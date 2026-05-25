import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
//import { useForm, Controller} from 'react-hook-form';
import { ArrowBack, Edit } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Card, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme,Link } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { vehiculoRepository } from '../../../vehiculos/infrastructure/vehiculo.repository';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import { ChecklistItemRepository } from '../../../checklist-items/infrastructure/repositories/checklist-item.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import type { ChecklistItem } from '../../../checklist-items/domain/interfaces/checklist-item.interface';
import type { TipoServicio } from '../../../tipos-servicio/domain/interfaces/tipo-servicio.interface';
import type { Vehiculo } from '../../../vehiculos/domain/interfaces/vehiculo.interface';

/*
interface ChecklistFormValues {
    checklist_item_id: string;
    estado: string;
    observaciones: string;
}
*/
const estadosServicio = ['RECEPCION', 'EN_SERVICIO', 'EN_DIAGNOSTICO', 'ESPERA_REPUESTOS', 'EN_REPARACION', 'LISTO_ENTREGA', 'FINALIZADO', 'CANCELADO'];
const checklistEstados = ['OPTIMO', 'REGULAR', 'REQUIERE_CAMBIO', 'NO_APLICA'];

const ServicioDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [servicio, setServicio] = useState<Servicio | null>(null);
    const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
    const [tipoServicio, setTipoServicio] = useState<TipoServicio | null>(null);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [editingRespuestaId, setEditingRespuestaId] = useState<string | null>(null);
    const [editingEstado, setEditingEstado] = useState<string>('OPTIMO');
    const [editingObservaciones, setEditingObservaciones] = useState<string>('');
    const [editingAll, setEditingAll] = useState(false);
    const [editingMap, setEditingMap] = useState<Record<string, { estado: string; observaciones: string }>>({});
    const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
    const [pendingUploadPreview, setPendingUploadPreview] = useState<string | null>(null);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [uploadDescription, setUploadDescription] = useState('RECEPCION: ');
    const [openImagePreview, setOpenImagePreview] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [previewImageDescription, setPreviewImageDescription] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    /*
    const { control, register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ChecklistFormValues>({
        defaultValues: {
            checklist_item_id: '',
            estado: 'OPTIMO',
            observaciones: ''
        }
    });
*/
    const fetchService = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await servicioRepository.obtener(id);
            setServicio(response);
            if (response.vehiculo_id) {
                const vehiculoResponse = await vehiculoRepository.obtener(response.vehiculo_id);
                setVehiculo(vehiculoResponse);
            }
            if (response.tipo_servicio_id) {
                const tipoResponse = await TipoServicioRepository.Obtener(response.tipo_servicio_id);
                setTipoServicio(tipoResponse);
            }
            //reset({ checklist_item_id: '', estado: 'OPTIMO', observaciones: '' });
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el servicio');
        } finally {
            setLoading(false);
        }
    }, [id, /*reset*/]);

    useEffect(() => {
        const imageCount = servicio?.imagenes?.length ?? 0;
        if (!imageCount) {
            setSelectedImageIndex(0);
            return;
        }

        setSelectedImageIndex((prevIndex) => Math.min(prevIndex, imageCount - 1));
    }, [servicio?.imagenes]);

    const fetchChecklist = useCallback(async () => {
        try {
            const response = await ChecklistItemRepository.listar(100, 0);
            setChecklistItems(response.data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar los items de checklist');
        }
    }, []);

    useEffect(() => {
        fetchService();
        fetchChecklist();
    }, [fetchService, fetchChecklist]);

    const handleChangeEstado = async (nuevoEstado: string) => {
        if (!id) return;
        setStatusUpdating(true);
        try {
            const updated = await servicioRepository.cambiarEstado(id, nuevoEstado);
            setServicio(updated);
            toast.success('Estado actualizado correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo actualizar el estado');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setPendingUploadFile(file);
        setPendingUploadPreview(previewUrl);
        setUploadDescription('RECEPCION: ');
        setOpenUploadModal(true);
        event.target.value = '';
    };

    const closeUploadModal = () => {
        setOpenUploadModal(false);
        if (pendingUploadPreview) {
            URL.revokeObjectURL(pendingUploadPreview);
        }
        setPendingUploadFile(null);
        setPendingUploadPreview(null);
        setUploadDescription('RECEPCION: ');
    };

    const handleUploadConfirm = async () => {
        if (!id || !pendingUploadFile) return;
        setUploading(true);
        try {
            const updated = await servicioRepository.subirImagen(id, pendingUploadFile, uploadDescription.trim() || 'RECEPCION: ');
            setServicio(updated);
            toast.success('Imagen subida correctamente');
            closeUploadModal();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleOpenImagePreview = (imagen: { url: string; descripcion?: string | null }) => {
        setPreviewImageUrl(`${import.meta.env.VITE_API_URL}/${imagen.url}`);
        setPreviewImageDescription(imagen.descripcion ?? 'Sin descripción');
        setOpenImagePreview(true);
    };

    const selectedImage = servicio?.imagenes?.[selectedImageIndex] ?? null;

    const handleCloseImagePreview = () => {
        setOpenImagePreview(false);
        setPreviewImageUrl(null);
        setPreviewImageDescription(null);
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!id) return;
        try {
            await servicioRepository.eliminarImagen(id, imageId);
            toast.success('Imagen eliminada correctamente');
            fetchService();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar la imagen');
        }
    };

    const startEditRespuesta = (respuesta: any) => {
        setEditingRespuestaId(respuesta.id);
        setEditingEstado(respuesta.estado);
        setEditingObservaciones(respuesta.observaciones ?? '');
    };

    const cancelEditRespuesta = () => {
        setEditingRespuestaId(null);
        setEditingEstado('OPTIMO');
        setEditingObservaciones('');
    };

    const saveEditRespuesta = async (respuestaId: string) => {
        if (!id) return;
        setSavingRespuesta(true);
        try {
            await servicioRepository.actualizarChecklistRespuesta(id, respuestaId, {
                checklist_item_id: undefined,
                estado: editingEstado,
                observaciones: editingObservaciones || null
            });
            toast.success('Respuesta actualizada');
            cancelEditRespuesta();
            fetchService();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo actualizar la respuesta');
        } finally {
            setSavingRespuesta(false);
        }
    };

    const [savingRespuesta, setSavingRespuesta] = useState(false);
    const [savingAll, setSavingAll] = useState(false);

    const startEditAll = () => {
        const map: Record<string, { estado: string; observaciones: string }> = {};
        servicio?.checklist?.forEach((r) => {
            map[r.id] = { estado: r.estado, observaciones: r.observaciones ?? '' };
        });
        setEditingMap(map);
        setEditingAll(true);
    };

    const cancelEditAll = () => {
        setEditingMap({});
        setEditingAll(false);
    };

    const saveAllEdits = async () => {
        if (!id) return;
        setSavingAll(true);
        try {
            for (const [respuestaId, payload] of Object.entries(editingMap)) {
                await servicioRepository.actualizarChecklistRespuesta(id, respuestaId, {
                    estado: payload.estado,
                    observaciones: payload.observaciones || null
                });
            }
            toast.success('Checklist actualizado correctamente');
            setEditingAll(false);
            setEditingMap({});
            fetchService();
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron guardar los cambios del checklist');
        } finally {
            setSavingAll(false);
        }
    };
    /*
    const onSubmitChecklist = async (data: ChecklistFormValues) => {
        if (!id) return;
        try {
            const selectedItem = checklistItems.find(item => item.id === data.checklist_item_id);
            if (!selectedItem) {
                toast.error('Item de checklist no válido');
                return;
            }
            await servicioRepository.registrarChecklistRespuesta(id, {
                checklist_item_id: data.checklist_item_id,
                estado: data.estado,
                observaciones: data.observaciones || null
            });
            toast.success('Respuesta agregada al checklist');
            if (servicio) fetchService();
            reset({ checklist_item_id: '', estado: 'OPTIMO', observaciones: '' });
        } catch (error) {
            console.error(error);
            toast.error('No se pudo agregar la respuesta');
        }
    };
    */
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (!servicio) {
        return (
            <Box p={4}>
                <Typography variant="h6">Servicio no encontrado</Typography>
                <Button variant="contained" onClick={() => navigate('/servicios')} sx={{ mt: 2 }}>Volver a servicios</Button>
            </Box>
        );
    }

    return (
        <Box p={isMobile ? 2 : 4}>
            <Stack spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link
                            underline="hover" 
                            color="inherit" 
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} 
                            onClick={() => navigate('/servicios')}
                        >
                            <ArrowBack sx={{ fontSize: 16 }} /> Servicios
                        </Link>
                        <Typography color="text.primary">Vista Detallada</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        {vehiculo?.modelo_nombre}
                    </Typography>
                </Box>
                <Paper sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Box>
                            <Typography variant="h5" fontWeight={700}>Servicio #{servicio.id}</Typography>
                            <Typography color="text.secondary">Estado actual: {servicio.estado}</Typography>
                        </Box>
                        <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/servicios/${servicio.id}/editar`)}>
                            Editar servicio
                        </Button>
                    </Box>
                    <Box mt={3} display="grid" gap={2} gridTemplateColumns={isMobile ? '1fr' : '1fr 1fr'}>
                        <Typography><strong>Vehículo:</strong> {vehiculo?.placa ?? servicio.vehiculo_id}</Typography>
                        <Typography><strong>Cliente:</strong> {servicio.cliente_id ?? 'No asignado'}</Typography>
                        <Typography><strong>Tipo de servicio:</strong> {tipoServicio?.nombre ?? servicio.tipo_servicio_id ?? 'Sin tipo'}</Typography>
                        <Typography><strong>Total estimado:</strong> ${servicio.total?.toFixed(2) ?? '0.00'}</Typography>
                        <Typography><strong>Kilometraje:</strong> {servicio.kilometraje ?? 'N/A'}</Typography>
                        <Typography><strong>Método de pago:</strong> {servicio.MetodoPago}</Typography>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" mb={2}>Actualizar estado</Typography>
                    <FormControl fullWidth>
                        <InputLabel id="estado-servicio-label">Estado</InputLabel>
                        <Select
                            labelId="estado-servicio-label"
                            value={servicio.estado}
                            label="Estado"
                            onChange={(event) => handleChangeEstado(event.target.value)}
                            disabled={statusUpdating}
                        >
                            {estadosServicio.map((estado) => (
                                <MenuItem key={estado} value={estado}>{estado.replace('_', ' ')}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Paper>


                <Paper sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Checklist</Typography>
                                <Box>
                                    {!editingAll ? (
                                        <Button variant="outlined" size="small" onClick={startEditAll} sx={{ mr: 1 }} disabled={savingAll}>Editar checklist</Button>
                                    ) : (
                                        <>
                                            <Button variant="contained" size="small" onClick={saveAllEdits} sx={{ mr: 1 }} disabled={savingAll}>{savingAll ? 'Guardando...' : 'Guardar cambios'}</Button>
                                            <Button variant="outlined" size="small" onClick={cancelEditAll} disabled={savingAll}>Cancelar</Button>
                                        </>
                                    )}
                                </Box>
                            </Box>
                    {servicio.checklist?.length ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Observaciones</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {servicio.checklist.map((respuesta) => {
                                        const itemNombre = checklistItems.find(i => i.id === respuesta.checklist_item_id)?.nombre ?? respuesta.checklist_item_id;
                                        const isBulkEditing = editingAll;
                                        const bulkState = editingMap[respuesta.id];
                                        if (isBulkEditing) {
                                            return (
                                                <TableRow key={respuesta.id}>
                                                    <TableCell>{itemNombre}</TableCell>
                                                    <TableCell>
                                                        <FormControl fullWidth>
                                                            <InputLabel id={`bulk-estado-${respuesta.id}`}>Estado</InputLabel>
                                                            <Select
                                                                labelId={`bulk-estado-${respuesta.id}`}
                                                                value={bulkState?.estado ?? respuesta.estado}
                                                                label="Estado"
                                                                onChange={(e) => setEditingMap(prev => ({ ...prev, [respuesta.id]: { ...(prev[respuesta.id] ?? { estado: respuesta.estado, observaciones: respuesta.observaciones ?? '' }), estado: e.target.value } }))}
                                                            >
                                                                {checklistEstados.map((estado) => (
                                                                    <MenuItem key={estado} value={estado}>{estado.replace('_', ' ')}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField fullWidth multiline minRows={2} value={bulkState?.observaciones ?? respuesta.observaciones ?? ''} onChange={(e) => setEditingMap(prev => ({ ...prev, [respuesta.id]: { ...(prev[respuesta.id] ?? { estado: respuesta.estado, observaciones: respuesta.observaciones ?? '' }), observaciones: e.target.value } }))} />
                                                    </TableCell>
                                                    <TableCell />
                                                </TableRow>
                                            );
                                        }
                                        // single-row edit UI handled elsewhere
                                        if (editingRespuestaId === respuesta.id) {
                                            return (
                                                <TableRow key={respuesta.id}>
                                                    <TableCell>{itemNombre}</TableCell>
                                                    <TableCell>
                                                        <FormControl fullWidth>
                                                            <InputLabel id={`estado-edit-${respuesta.id}`}>Estado</InputLabel>
                                                            <Select
                                                                labelId={`estado-edit-${respuesta.id}`}
                                                                value={editingEstado}
                                                                label="Estado"
                                                                onChange={(e) => setEditingEstado(e.target.value)}
                                                            >
                                                                {checklistEstados.map((estado) => (
                                                                    <MenuItem key={estado} value={estado}>{estado.replace('_', ' ')}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField fullWidth multiline minRows={2} value={editingObservaciones} onChange={(e) => setEditingObservaciones(e.target.value)} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1}>
                                                            <Button variant="contained" onClick={() => saveEditRespuesta(respuesta.id)} disabled={savingRespuesta}>{savingRespuesta ? 'Guardando...' : 'Guardar'}</Button>
                                                            <Button variant="outlined" onClick={cancelEditRespuesta} disabled={savingRespuesta}>Cancelar</Button>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }
                                        return (
                                            <TableRow key={respuesta.id}>
                                                <TableCell>{itemNombre}</TableCell>
                                                <TableCell>{respuesta.estado}</TableCell>
                                                <TableCell>{respuesta.observaciones ?? 'Sin observaciones'}</TableCell>
                                                <TableCell>
                                                    <Button size="small" onClick={() => startEditRespuesta(respuesta)} disabled={savingAll || savingRespuesta}>Editar</Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="text.secondary">No se han registrado respuestas de checklist aún.</Typography>
                    )}
                </Paper>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" mb={2}>Imágenes del servicio</Typography>
                            <Button variant="contained" component="label" disabled={uploading}>
                                {uploading ? 'Subiendo...' : 'Subir imagen'}
                                <input hidden accept="image/*" type="file" onChange={handleImageSelect} capture={isMobile ? 'environment' : undefined} />
                            </Button>
                            {servicio.imagenes?.length ? (
                                <>
                                    <Card sx={{ mt: 2, cursor: 'pointer' }} onClick={() => selectedImage && handleOpenImagePreview(selectedImage)}>
                                        <CardMedia
                                            component="img"
                                            height="280"
                                            image={`${import.meta.env.VITE_API_URL}/${servicio.imagenes[selectedImageIndex]?.url}`}
                                            alt={servicio.imagenes[selectedImageIndex]?.descripcion ?? 'Servicio'}
                                        />
                                        <Box sx={{ p: 2 }}>
                                            <Typography variant="body1" fontWeight={600} noWrap>
                                                {servicio.imagenes[selectedImageIndex]?.descripcion ?? 'Sin descripción'}
                                            </Typography>
                                        </Box>
                                    </Card>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                                        {servicio.imagenes.map((imagen, index) => {
                                            const isSelected = index === selectedImageIndex;
                                            return (
                                                <Card
                                                    key={imagen.id}
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    sx={{
                                                        minWidth: 100,
                                                        maxWidth: 120,
                                                        flex: '0 0 auto',
                                                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.12)',
                                                        boxShadow: isSelected ? theme.shadows[4] : theme.shadows[1],
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <CardMedia
                                                        component="img"
                                                        height="84"
                                                        image={`${import.meta.env.VITE_API_URL}/${imagen.url}`}
                                                        alt={imagen.descripcion ?? 'Miniatura'}
                                                    />
                                                </Card>
                                            );
                                        })}
                                    </Box>
                                    <Button sx={{ mt: 1 }} color="error" onClick={() => selectedImage && handleDeleteImage(selectedImage.id)}>
                                        Eliminar imagen seleccionada
                                    </Button>
                                </>
                            ) : (
                                <Typography color="text.secondary" sx={{ mt: 2 }}>No hay imágenes cargadas.</Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/*
                    <Grid  size={{ xs: 12, md: 6 }} >
                        <Paper sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Checklist</Typography>
                                <Box>
                                    {!editingAll ? (
                                        <Button variant="outlined" size="small" onClick={startEditAll} sx={{ mr: 1 }} disabled={savingAll}>Editar checklist</Button>
                                    ) : (
                                        <>
                                            <Button variant="contained" size="small" onClick={saveAllEdits} sx={{ mr: 1 }} disabled={savingAll}>{savingAll ? 'Guardando...' : 'Guardar cambios'}</Button>
                                            <Button variant="outlined" size="small" onClick={cancelEditAll} disabled={savingAll}>Cancelar</Button>
                                        </>
                                    )}
                                </Box>
                            </Box>
                            <Box component="form" onSubmit={handleSubmit(onSubmitChecklist)} noValidate>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel id="checklist-item-label">Item de checklist</InputLabel>
                                    <Controller
                                        name="checklist_item_id"
                                        control={control}
                                        render={({ field }) => (
                                            <Select {...field} labelId="checklist-item-label" label="Item de checklist">
                                                <MenuItem value="">Selecciona un item</MenuItem>
                                                                {checklistItems.map((item) => (
                                                                    <MenuItem key={item.id} value={item.id}>{item.nombre}</MenuItem>
                                                                ))}
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel id="estado-checklist-label">Estado</InputLabel>
                                    <Controller
                                        name="estado"
                                        control={control}
                                        render={({ field }) => (
                                            <Select {...field} labelId="estado-checklist-label" label="Estado">
                                                {checklistEstados.map((estado) => (
                                                    <MenuItem key={estado} value={estado}>{estado.replace('_', ' ')}</MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                                <TextField
                                    label="Observaciones"
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    {...register('observaciones')}
                                />
                                <Button variant="contained" type="submit" sx={{ mt: 2 }} disabled={isSubmitting}>Agregar respuesta</Button>
                            </Box>
                        </Paper>
                    </Grid>
                    */}
                </Grid>

                <Dialog open={openUploadModal} onClose={closeUploadModal} fullWidth maxWidth="sm">
                    <DialogTitle>Descripción de la imagen</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Ingresa una descripción para la imagen antes de subirla al servicio. Si no se especifica nada, se usará el prefijo por defecto.
                        </DialogContentText>
                        {pendingUploadPreview && (
                            <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <CardMedia
                                    component="img"
                                    image={pendingUploadPreview}
                                    alt="Vista previa de imagen"
                                    sx={{ maxHeight: 320, width: 'auto', maxWidth: '100%', borderRadius: 1 }}
                                />
                            </Box>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Descripción"
                            fullWidth
                            value={uploadDescription}
                            onChange={(event) => setUploadDescription(event.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeUploadModal} disabled={uploading}>Cancelar</Button>
                        <Button onClick={handleUploadConfirm} disabled={uploading}>
                            {uploading ? 'Subiendo...' : 'Subir imagen'}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openImagePreview} onClose={handleCloseImagePreview} fullWidth maxWidth="md">
                    <DialogTitle>Vista previa</DialogTitle>
                    <DialogContent>
                        {previewImageUrl && (
                            <Box component="img" src={previewImageUrl} alt="Imagen ampliada" sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 1 }} />
                        )}
                        <Typography variant="body2" mt={2} color="text.secondary">
                            {previewImageDescription}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseImagePreview}>Cerrar</Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </Box>
    );
};

export default ServicioDetailPage;
