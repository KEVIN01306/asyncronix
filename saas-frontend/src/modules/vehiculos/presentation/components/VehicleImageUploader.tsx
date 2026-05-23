import { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Stack, CircularProgress } from '@mui/material';
import { PhotoCamera, CameraAlt, Refresh } from '@mui/icons-material';
import { bajarCalidadImagen } from '../../../../core/utils/bajarCalidadImagen';

interface VehicleImageUploaderProps {
    currentImageUrl?: string;
    onUpload: (file: File) => Promise<void>;
    uploading?: boolean;
    disabled?: boolean;
}

const VehicleImageUploader = ({ currentImageUrl, onUpload, uploading = false, disabled = false }: VehicleImageUploaderProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(() => {
        return currentImageUrl ? `${import.meta.env.VITE_API_URL}/${currentImageUrl}` : undefined;
    });
    const [error, setError] = useState<string | null>(null);
    const deviceInputRef = useRef<HTMLInputElement | null>(null);
    const cameraInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(currentImageUrl ? `${import.meta.env.VITE_API_URL}/${currentImageUrl}` : undefined);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [selectedFile, currentImageUrl]);

    const uploadFile = async (file: File) => {
        setError(null);
        try {
            const optimized = await bajarCalidadImagen(file);
            await onUpload(optimized);
            setSelectedFile(null);
        } catch (uploadError) {
            console.error(uploadError);
            setError('No se pudo procesar la imagen. Intenta con otra foto.');
        }
    };

    const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten imágenes JPG o PNG.');
            event.target.value = '';
            return;
        }
        setSelectedFile(file);
        uploadFile(file);
        event.target.value = '';
    };

    const handleDeviceClick = () => {
        if (!disabled) deviceInputRef.current?.click();
    };

    const handleCameraClick = () => {
        if (!disabled) cameraInputRef.current?.click();
    };

    const handleReset = () => {
        setSelectedFile(null);
        setError(null);
    };

    return (
        <Box component="section" sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Avatar del vehículo</Typography>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} alignItems="flex-start">
                <Box flex={1}>
                    {previewUrl ? (
                        <Box component="img" src={previewUrl} alt="Avatar del vehículo" sx={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }} />
                    ) : (
                        <Box sx={{ width: '100%', minHeight: 220, bgcolor: 'background.default', borderRadius: 2, border: (theme) => `1px dashed ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PhotoCamera sx={{ fontSize: 48, color: 'text.disabled' }} />
                        </Box>
                    )}
                </Box>
                <Stack spacing={2} flex={1}>
                    <Button variant="contained" onClick={handleDeviceClick} disabled={disabled || uploading} startIcon={<PhotoCamera />}>
                        {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
                    </Button>
                    <Button variant="outlined" onClick={handleCameraClick} disabled={disabled || uploading} startIcon={<CameraAlt />}>
                        {uploading ? 'Cargando cámara...' : 'Tomar foto'}
                    </Button>
                    {selectedFile && (
                        <Button variant="text" onClick={handleReset} startIcon={<Refresh />}>
                            Repetir captura
                        </Button>
                    )}
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                    <Typography variant="body2" color="text.secondary">
                        Puedes capturar una imagen o cargarla desde el dispositivo. Siempre se optimizará antes de enviarla.
                    </Typography>
                    {(uploading || false) && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Procesando imagen</Typography>
                        </Box>
                    )}
                </Stack>
            </Box>
            <input ref={deviceInputRef} type="file" accept="image/*" hidden onChange={handleSelectFile} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleSelectFile} />
        </Box>
    );
};

export default VehicleImageUploader;
