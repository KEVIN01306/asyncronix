import { useState, useRef } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { PictureAsPdf, Delete, UploadFile } from '@mui/icons-material';

interface VehiclePdfUploaderProps {
    currentFileName?: string;
    onUpload: (file: File) => Promise<void>;
    uploading?: boolean;
    disabled?: boolean;
}

const VehiclePdfUploader = ({ currentFileName, onUpload, uploading = false, disabled = false }: VehiclePdfUploaderProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) return;

        const validExtension = file.name.toLowerCase().endsWith('.pdf');
        const validMime = file.type === 'application/pdf';

        if (!validMime || !validExtension) {
            setError('El archivo debe ser un PDF válido.');
            setSelectedFile(null);
            event.target.value = '';
            return;
        }

        setError(null);
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            await onUpload(selectedFile);
            setSelectedFile(null);
        } catch (uploadError) {
            console.error(uploadError);
            setError('No se pudo cargar el PDF. Intenta nuevamente.');
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleOpenFileDialog = () => {
        if (!disabled) inputRef.current?.click();
    };

    return (
        <Box component="section" sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Calcomanía PDF</Typography>

            <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <PictureAsPdf sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        {selectedFile?.name ?? currentFileName ?? 'Ningún archivo seleccionado'}
                    </Typography>
                </Box>

                <Button variant="contained" onClick={handleOpenFileDialog} disabled={disabled || uploading} startIcon={<UploadFile />}>
                    {uploading ? 'Subiendo...' : selectedFile ? 'Reemplazar archivo' : 'Seleccionar PDF'}
                </Button>

                {selectedFile && (
                    <Box display="flex" gap={2} flexWrap="wrap">
                        <Button variant="outlined" onClick={handleUpload} disabled={uploading}>
                            {uploading ? 'Subiendo...' : 'Cargar PDF'}
                        </Button>
                        <Button variant="text" color="error" startIcon={<Delete />} onClick={clearSelection}>
                            Eliminar selección
                        </Button>
                    </Box>
                )}

                {error && <Typography color="error" variant="body2">{error}</Typography>}

                <Typography variant="body2" color="text.secondary">
                    El archivo debe ser PDF. Puedes reemplazarlo o eliminar la selección antes de cargarlo.
                </Typography>
            </Stack>
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={handleFileChange} />
        </Box>
    );
};

export default VehiclePdfUploader;
