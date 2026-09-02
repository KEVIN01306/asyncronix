import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, Stack, Grid, TextField, InputAdornment } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { toast } from 'sonner';
import type { ServicioVehiculo, ServicioCustodia } from '../../domain/interfaces/servicio.interface';
import { ESTADO_SERVICIO_VEHICULO } from '../../domain/servicio.constants';
import SignaturePadModal from '../components/modals/SignaturePadModal';

export default function ServicioVehiculoCustodiaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [servicio, setServicio] = useState<ServicioVehiculo | null>(null);
    const [custodiaActiva, setCustodiaActiva] = useState<ServicioCustodia | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalValue, setTotalValue] = useState<number | string>('');
    const [descripcionValue, setDescripcionValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [elapsedTime, setElapsedTime] = useState<string>('');
    const [openSignaturePad, setOpenSignaturePad] = useState(false);
    const [firmaCustodia, setFirmaCustodia] = useState<string | null>(null);
    const [changingState, setChangingState] = useState(false);

    const loadData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await servicioRepository.obtener(id);
            setServicio(res);
            if (res.servicioCustodias) {
                const active = res.servicioCustodias.find(c => !c.fecha_salida);
                if (active) {
                    setCustodiaActiva(active);
                    setTotalValue(active.total);
                    setDescripcionValue(active.descripcion || '');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la custodia');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!custodiaActiva) return;
        const interval = setInterval(() => {
            const start = new Date(custodiaActiva.fecha_entrada).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            setElapsedTime(timeString);
        }, 1000);
        return () => clearInterval(interval);
    }, [custodiaActiva]);

    const handleActualizar = async () => {
        if (!servicio || !custodiaActiva) return;
        try {
            setSaving(true);
            await servicioRepository.actualizarCustodia(servicio.id, custodiaActiva.id, {
                total: Number(totalValue),
                descripcion: descripcionValue
            });
            toast.success('Custodia actualizada');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar custodia');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmSignature = async () => {
        if (!firmaCustodia || !servicio || !custodiaActiva) {
            toast.error('La firma es requerida');
            return;
        }

        try {
            setChangingState(true);
            const blob = await fetch(firmaCustodia).then(res => res.blob());
            const file = new File([blob], "firma_salida_custodia.png", { type: "image/png" });

            await servicioRepository.terminarCustodia(servicio.id, custodiaActiva.id, file);
            setOpenSignaturePad(false);
            setFirmaCustodia(null);
            toast.success('Custodia finalizada exitosamente');
            navigate(`/servicios-vehiculo/${servicio.id}`);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo terminar la custodia');
        } finally {
            setChangingState(false);
        }
    };

    if (loading) return <Loading />;
    if (!servicio || !custodiaActiva) return <Typography p={3}>No se encontró custodia activa para este servicio.</Typography>;

    const isTerminated = servicio.estado === ESTADO_SERVICIO_VEHICULO.FINALIZADO || servicio.estado === ESTADO_SERVICIO_VEHICULO.CANCELADO;

    return (
        <Box p={{ sm: 2, md: 4 }} maxWidth="1000px" margin="0 auto">
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined" size="small">
                    Regresar
                </Button>
                <Typography variant="h5" component="h1">
                    Control de Custodia
                </Typography>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h6" mb={2}>Tiempo en Custodia</Typography>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                            {elapsedTime || '00:00:00'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Desde: {new Date(custodiaActiva.fecha_entrada).toLocaleString()}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" mb={2}>Resumen Económico</Typography>
                        <Stack spacing={3}>
                            <TextField
                                label="Total (Q)"
                                type="number"
                                value={totalValue}
                                onChange={(e) => setTotalValue(e.target.value)}
                                disabled={isTerminated}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">Q</InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Descripción de la Custodia"
                                multiline
                                minRows={3}
                                value={descripcionValue}
                                onChange={(e) => setDescripcionValue(e.target.value)}
                                disabled={isTerminated}
                            />
                            {!isTerminated && (
                                <Button variant="contained" onClick={handleActualizar} disabled={saving}>
                                    {saving ? 'Guardando...' : 'Actualizar'}
                                </Button>
                            )}
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" mb={2}>Acciones</Typography>
                        {!isTerminated && servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_CUSTODIA && (
                            <Stack spacing={2}>
                                <Button color="warning" variant="contained" disabled={changingState} onClick={() => setOpenSignaturePad(true)}>
                                    Terminar Custodia
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    Al terminar la custodia, se verificará si hay reparaciones activas para pasar el servicio a Reparación, o bien, a Servicio.
                                </Typography>
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <SignaturePadModal
                open={openSignaturePad}
                onSave={setFirmaCustodia}
                onCancel={() => setOpenSignaturePad(false)}
                onConfirm={handleConfirmSignature}
                saving={changingState}
                title="Firma de autorización"
                description="Por favor, dibuja tu firma para autorizar la salida de custodia."
            />
        </Box>
    );
}
