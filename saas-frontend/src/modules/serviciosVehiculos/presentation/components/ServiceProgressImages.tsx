import React, { useEffect, useState, type ChangeEvent } from 'react';
import { Box, Button, Card, CardMedia, Typography, CardActionArea } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import CreateImageModal from './modals/CreateImageModal';
import ImagePreviewModal from './modals/ImagePreviewModal';
import { bajarCalidadImagen } from '../../../../core/utils/bajarCalidadImagen';
import { ESTADO_SERVICIO_VEHICULO, type EstadoVehiculoServicio,  } from '../../domain/servicio.constants';

type Props = {
    servicio: ServicioVehiculo;
    onUpdate: (s: ServicioVehiculo) => void;
    isMobile?: boolean;
};

const ServiceProgressImages: React.FC<Props> = ({ servicio, onUpdate, isMobile }) => {
    const [uploading, setUploading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreview, setPendingPreview] = useState<string | null>(null);
    const [openUpload, setOpenUpload] = useState(false);
    const [uploadDescription, setUploadDescription] = useState('EN_PROGRESO: ');
    const [openPreview, setOpenPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const estadosPermitidos: EstadoVehiculoServicio[] = [
        ESTADO_SERVICIO_VEHICULO.EN_SERVICIO,
        ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS
    ];
    const canUpload = estadosPermitidos.includes(servicio.estado);

    useEffect(() => {
        const count = servicio.imagenes?.length ?? 0;
        setSelectedIndex((prev) => Math.min(prev, Math.max(0, count - 1)));
    }, [servicio.imagenes]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        setPendingPreview(URL.createObjectURL(file));
        setUploadDescription('EN_PROGRESO: ');
        setOpenUpload(true);
        e.currentTarget.value = '';
    };

    const closeUpload = () => {
        setOpenUpload(false);
        if (pendingPreview) URL.revokeObjectURL(pendingPreview);
        setPendingFile(null);
        setPendingPreview(null);
        setUploadDescription('EN_PROGRESO: ');
    };

    const handleUploadConfirm = async () => {
        if (!pendingFile) return;
        setUploading(true);
        try {
            const preparado = await bajarCalidadImagen(pendingFile);
            const updated = await servicioRepository.subirImagenProgreso(
                servicio.id,
                preparado,
                uploadDescription.trim() || 'EN_PROGRESO:'
            );
            onUpdate(updated);
            toast.success('Imagen de progreso subida correctamente');
            closeUpload();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo subir la imagen de progreso');
        } finally {
            setUploading(false);
        }
    };

    const handleOpenPreview = (imagen: { url: string; descripcion?: string | null }) => {
        setPreviewUrl(`${import.meta.env.VITE_API_URL}/${imagen.url}`);
        setOpenPreview(true);
    };

    return (
        <Box>
            <Button variant="contained" component="label" disabled={!canUpload || uploading}>
                {uploading ? 'Subiendo...' : 'Subir imagen de progreso'}
                <input hidden accept="image/*" type="file" onChange={handleFileSelect} capture={isMobile ? 'environment' : undefined} />
            </Button>

            {!canUpload && (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Las imágenes de progreso solo pueden agregarse mientras el servicio está en EN_SERVICIO o ESPERA_REPUESTOS.
                </Typography>
            )}

            {servicio.imagenes?.length ? (
                <>
                    <Card sx={{ mt: 2, cursor: 'pointer' }} onClick={() => servicio.imagenes && servicio.imagenes[selectedIndex] && handleOpenPreview(servicio.imagenes[selectedIndex])}>
                        <CardMedia
                            component="img"
                            height="280"
                            image={`${import.meta.env.VITE_API_URL}/${servicio.imagenes[selectedIndex]?.url}`}
                            alt={servicio.imagenes[selectedIndex]?.descripcion ?? 'Servicio'}
                        />
                        <Box sx={{ p: 2 }}>
                            <Typography variant="body1" fontWeight={600} noWrap>
                                {servicio.imagenes[selectedIndex]?.descripcion ?? 'Sin descripción'}
                            </Typography>
                        </Box>
                    </Card>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                        {servicio.imagenes.map((imagen, index) => (
                            <Card key={imagen.id} onClick={() => setSelectedIndex(index)} sx={{ minWidth: 100, maxWidth: 120, flex: '0 0 auto', cursor: 'pointer' }}>
                                <CardActionArea>
                                    <CardMedia component="img" height="84" image={`${import.meta.env.VITE_API_URL}/${imagen.url}`} alt={imagen.descripcion ?? 'Miniatura'} />
                                </CardActionArea>
                            </Card>
                        ))}
                    </Box>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        No está permitida la eliminación de imágenes desde progreso.
                    </Typography>
                </>
            ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    No hay imágenes de progreso cargadas.
                </Typography>
            )}

            <CreateImageModal
                open={openUpload}
                preview={pendingPreview}
                description={uploadDescription}
                setDescription={setUploadDescription}
                onCancel={closeUpload}
                onConfirm={handleUploadConfirm}
                uploading={uploading}
            />

            <ImagePreviewModal open={openPreview} imageUrl={previewUrl} onClose={() => setOpenPreview(false)} />
        </Box>
    );
};

export default ServiceProgressImages;
