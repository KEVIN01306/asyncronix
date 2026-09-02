import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, Stack, Grid, TextField, InputAdornment, IconButton, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { toast } from 'sonner';
import { formatMoney } from '../../../../core/utils/formatMoney';
import ServicioReparacionRepuestoModal from '../components/modals/ServicioReparacionRepuestoModal';
import type { ServicioReparacion, ServicioReparacionRepuesto } from '../../domain/interfaces/servicio.interface';
import { ESTADO_SERVICIO_VEHICULO } from '../../domain/servicio.constants';
import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import SignaturePadModal from '../components/modals/SignaturePadModal';

export default function ServicioReparacionConfiguracionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reparacion, setReparacion] = useState<ServicioReparacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalValue, setTotalValue] = useState<number | string>('');
    const [descripcionValue, setDescripcionValue] = useState('');
    const [savingTotal, setSavingTotal] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRepuesto, setSelectedRepuesto] = useState<ServicioReparacionRepuesto | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [repuestoToDelete, setRepuestoToDelete] = useState<string | null>(null);
    const [deletingRepuesto, setDeletingRepuesto] = useState(false);
    
    const [openSignaturePad, setOpenSignaturePad] = useState(false);
    const [firmaSalida, setFirmaSalida] = useState<string | null>(null);
    const [finishingReparacion, setFinishingReparacion] = useState(false);

    const loadData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await servicioRepository.obtenerReparacion(id);
            setReparacion(res);
            setTotalValue(res.total);
            setDescripcionValue(res.descripcion || '');
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la configuración de la reparación');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleActualizar = async () => {
        if (!reparacion) return;
        try {
            setSavingTotal(true);
            await servicioRepository.actualizarReparacion(reparacion.id, { total: Number(totalValue), descripcion: descripcionValue });
            toast.success('Configuración de reparación actualizada');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar el total');
        } finally {
            setSavingTotal(false);
        }
    };

    const handleDeleteRepuesto = (repuestoId: string) => {
        if (!reparacion) return;
        setRepuestoToDelete(repuestoId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteRepuesto = async () => {
        if (!reparacion || !repuestoToDelete) return;
        try {
            setDeletingRepuesto(true);
            await servicioRepository.eliminarRepuestoSolicitado(reparacion.id, repuestoToDelete);
            toast.success('Repuesto eliminado exitosamente');
            setDeleteDialogOpen(false);
            setRepuestoToDelete(null);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar repuesto');
        } finally {
            setDeletingRepuesto(false);
        }
    };

    const handleConfirmSignature = async () => {
        if (!firmaSalida || !reparacion?.servicio_id) {
            toast.error('La firma es requerida');
            return;
        }

        try {
            setFinishingReparacion(true);
            const blob = await fetch(firmaSalida).then(res => res.blob());
            const file = new File([blob], "firma_salida_reparacion.png", { type: "image/png" });

            await servicioRepository.terminarReparacion(reparacion.servicio_id, reparacion.id, file);
            setOpenSignaturePad(false);
            setFirmaSalida(null);
            toast.success('Reparación finalizada exitosamente');
            navigate(`/servicios-vehiculo/${reparacion.servicio_id}`);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo terminar la reparación');
        } finally {
            setFinishingReparacion(false);
        }
    };

    if (loading) return <Loading />;
    if (!reparacion) return <Typography>No se encontró la reparación o el servicio no está en reparación activa.</Typography>;

    const isTerminated = reparacion.servicio?.estado === ESTADO_SERVICIO_VEHICULO.FINALIZADO || reparacion.servicio?.estado === ESTADO_SERVICIO_VEHICULO.CANCELADO;

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined" size="small">
                    Regresar
                </Button>
                <Typography variant="h5" component="h1">
                    Configuración de Reparación
                </Typography>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" mb={2}>Resumen Económico</Typography>
                        <Stack spacing={3}>
                            <TextField
                                label="Total Costo Reparación (Q)"
                                type="number"
                                value={totalValue}
                                onChange={(e) => setTotalValue(e.target.value)}
                                disabled={isTerminated}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">Q</InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Descripción de la Reparación"
                                multiline
                                minRows={3}
                                value={descripcionValue}
                                onChange={(e) => setDescripcionValue(e.target.value)}
                                disabled={isTerminated}
                            />
                            {!isTerminated && (
                                <Stack spacing={2}>
                                    <Button variant="contained" onClick={handleActualizar} disabled={savingTotal}>
                                        {savingTotal ? 'Guardando...' : 'Actualizar'}
                                    </Button>
                                    {!reparacion.fecha_salida && (
                                        <Button color="warning" variant="contained" onClick={() => setOpenSignaturePad(true)}>
                                            Terminar Reparación
                                        </Button>
                                    )}
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Repuestos Solicitados</Typography>
                            {!isTerminated && (
                                <Button
                                    startIcon={<AddIcon />}
                                    variant="outlined"
                                    onClick={() => {
                                        setSelectedRepuesto(null);
                                        setModalOpen(true);
                                    }}
                                >
                                    Solicitar Repuesto
                                </Button>
                            )}
                        </Stack>

                        <ListTableSimple
                            headerBgColor={'primary.main'}
                            columns={[
                                {
                                    id: 'descripccion',
                                    name: 'Descripción',
                                    format: (val, r: any) => (
                                        <>
                                            <Typography variant="body2">{val}</Typography>
                                            {r.instrucciones && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Instrucciones: {r.instrucciones}
                                                </Typography>
                                            )}
                                        </>
                                    )
                                },
                                { id: 'cantidad', name: 'Cantidad', format: (val) => val },
                                {
                                    id: 'procedencia',
                                    name: 'Procedencia',
                                    format: (val) => <Chip variant='outlined' size="small" label={val} color={val === 'PROPIO' ? 'primary' : 'secondary'} />
                                },
                                {
                                    id: 'entregado',
                                    name: 'Estado',
                                    format: (val) => val ? (
                                        <Chip variant='outlined' size="small" icon={<CheckCircleIcon />} label="Entregado" color="success" />
                                    ) : (
                                        <Chip variant='outlined' size="small" label="Pendiente" color="warning" />
                                    )
                                },
                                {
                                    id: 'id',
                                    name: 'Acciones',
                                    format: (_, r: any) => !isTerminated ? (
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <IconButton size="small" color="primary" onClick={() => { setSelectedRepuesto(r); setModalOpen(true); }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDeleteRepuesto(r.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    ) : '-'
                                }
                            ]}
                            data={reparacion.servicioReparacionRepuestos || []}
                        />
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Repuestos de Inventario (Servicio)</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>Estos repuestos fueron descontados del inventario y asignados a esta reparación.</Typography>
                        <ListTableSimple
                            headerBgColor={'primary.main'}
                            columns={[
                                {
                                    id: 'id',
                                    name: 'Producto',
                                    format: (_, r: any) => (
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" fontWeight={600}>{r.variante?.producto?.nombre || 'Sin nombre'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{r.variante?.producto?.sku}</Typography>
                                            <Typography variant="caption">
                                                {r.variante?.valores && r.variante.valores.length > 0
                                                    ? r.variante.valores.map((v: any) => `${v.atributo?.nombre}: ${v.valor}`).join(', ')
                                                    : '-'}
                                            </Typography>
                                        </Stack>
                                    )
                                },
                                { id: 'cantidad', name: 'Cantidad', format: (val) => val },
                                { id: 'precio_venta', name: 'Precio de Venta', format: (val) => formatMoney(val) }
                            ]}
                            data={reparacion.servicioRepuestos || []}
                        />
                    </Paper>
                </Grid>
            </Grid>

            <ServicioReparacionRepuestoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                reparacionId={reparacion.id}
                repuesto={selectedRepuesto}
                onSuccess={loadData}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                title="¿Eliminar repuesto solicitado?"
                description="Esta acción no se puede deshacer."
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDeleteRepuesto}
                isLoading={deletingRepuesto}
                confirmText="Eliminar"
                confirmColor="error"
            />

            <SignaturePadModal
                open={openSignaturePad}
                onSave={setFirmaSalida}
                onCancel={() => setOpenSignaturePad(false)}
                onConfirm={handleConfirmSignature}
                saving={finishingReparacion}
                title="Firma de autorización (Salida de Reparación)"
                description="Por favor, dibuja tu firma para autorizar la salida de reparación."
            />
        </Box>
    );
}
