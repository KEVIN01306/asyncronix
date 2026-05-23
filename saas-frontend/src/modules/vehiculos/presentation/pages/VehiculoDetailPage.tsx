import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Button, Stack, Alert } from '@mui/material';
import { ArrowBack, Edit, PictureAsPdf, Download } from '@mui/icons-material';
import { toast } from 'sonner';

import { vehiculoRepository } from '../../infrastructure/vehiculo.repository';
import { vehiculoTipoRepository } from '../../infrastructure/vehiculo-tipo.repository';
import { modelosRepository } from '../../../modelos/infrastructure/modelos.repository';
import type { Vehiculo } from '../../domain/interfaces/vehiculo.interface';
import type { VehiculoTipo } from '../../domain/interfaces/vehiculo-tipo.interface';
import type { Modelo } from '../../../modelos/domain/interface/modelo.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import VehicleImageUploader from '../components/VehicleImageUploader';
import VehiclePdfUploader from '../components/VehiclePdfUploader';

const VehiculoDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
    const [tipo, setTipo] = useState<VehiculoTipo | null>(null);
    const [modelo, setModelo] = useState<Modelo | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);

        try {
            const [vehiculoRes, tiposRes] = await Promise.all([
                vehiculoRepository.obtener(id),
                vehiculoTipoRepository.listar(100, 0),
            ]);
            setVehiculo(vehiculoRes);
            setTipo(tiposRes.data.find((item) => item.id === vehiculoRes.vehiculo_tipo_id) ?? null);

            const modeloRes = await modelosRepository.obtener(vehiculoRes.modelo_id);
            setModelo(modeloRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAvatarUpload = async (file: File) => {
        if (!id) return;
        setUploadingAvatar(true);
        try {
            await vehiculoRepository.subirAvatar(id, file);
            await fetchData();
            toast.success('Avatar actualizado correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al subir el avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handlePdfUpload = async (file: File) => {
        if (!id) return;
        setUploadingPdf(true);
        try {
            await vehiculoRepository.subirCalcomania(id, file);
            await fetchData();
            toast.success('Calcomanía cargada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al subir la calcomanía');
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleOpenPdf = () => {
        if (!vehiculo?.calcomania_url) return;
        window.open(`${import.meta.env.VITE_API_URL}/${vehiculo.calcomania_url}`, '_blank');
    };

    const handleDownloadPdf = async () => {
        if (!vehiculo?.calcomania_url) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/${vehiculo.calcomania_url}`);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = vehiculo.calcomania_url.split('/').pop() ?? 'calcomania.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo descargar el PDF');
        }
    };

    if (loading) return <Loading />;
    if (!vehiculo) return <ErrorPageLoading text="Vehículo no encontrado" navigate={() => navigate('/vehiculos')} />;

    const imageSource = vehiculo.avatar_url ? `${import.meta.env.VITE_API_URL}/${vehiculo.avatar_url}` : undefined;
    const pdfName = vehiculo.calcomania_url?.split('/').pop();

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/vehiculos')} sx={{ textTransform: 'none' }}>
                    Volver a vehículos
                </Button>
                <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/vehiculos/${id}/editar`)}>
                    Editar vehículo
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" mb={2} fontWeight={700}>Información general</Typography>
                        <Stack spacing={2}>
                            <Typography variant="body2"><strong>Placa:</strong> {vehiculo.placa}</Typography>
                            <Typography variant="body2"><strong>Tipo de vehículo:</strong> {tipo?.tipo ?? '-'}</Typography>
                            <Typography variant="body2"><strong>Modelo:</strong> {modelo?.modelo ?? '-'}</Typography>
                            <Typography variant="body2"><strong>Marca:</strong> {modelo?.marca ?? '-'}</Typography>
                            <Typography variant="body2"><strong>Línea:</strong> {modelo?.linea ?? '-'}</Typography>
                            <Typography variant="body2"><strong>Cilindrada:</strong> {modelo?.cilindrada ?? '-'}</Typography>
                        </Stack>
                    </Paper>

                    <Box mt={3}>
                        <VehicleImageUploader
                            currentImageUrl={vehiculo.avatar_url ?? undefined}
                            onUpload={handleAvatarUpload}
                            uploading={uploadingAvatar}
                        />
                    </Box>

                    <Box mt={3}>
                        <VehiclePdfUploader
                            currentFileName={pdfName ?? undefined}
                            onUpload={handlePdfUpload}
                            uploading={uploadingPdf}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" mb={2} fontWeight={700}>Archivos</Typography>
                        {vehiculo.calcomania_url ? (
                            <Stack spacing={2}>
                                <Alert severity="success">La calcomanía está cargada y disponible.</Alert>
                                <Button variant="contained" startIcon={<PictureAsPdf />} onClick={handleOpenPdf}>
                                    Ver calcomanía
                                </Button>
                                <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadPdf}>
                                    Descargar calcomanía
                                </Button>
                            </Stack>
                        ) : (
                            <Alert severity="info">No hay calcomanía cargada para este vehículo.</Alert>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default VehiculoDetailPage;
