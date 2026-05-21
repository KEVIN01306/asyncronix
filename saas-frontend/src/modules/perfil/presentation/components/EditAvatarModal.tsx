import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Avatar, Typography, CircularProgress } from '@mui/material';
import { bajarCalidadImagen } from '../../../../core/utils/bajarCalidadImagen';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (file: File) => void;
    initialUrl: string | null;
}

export const EditAvatarModal = ({ open, onClose, onSubmit, initialUrl }: Props) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setFile(null);
            setPreview(initialUrl ? `${import.meta.env.VITE_API_URL}/${initialUrl}` : null);
            setIsSubmitting(false);
        }
    }, [open, initialUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSave = async () => {
        if (!file) return;
        setIsSubmitting(true);
        try {
            const comprimido = await bajarCalidadImagen(file);
            await onSubmit(comprimido);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Actualizar Avatar</DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar src={preview || undefined} sx={{ width: 100, height: 100 }} />
                    <Button variant="outlined" component="label">
                        Seleccionar Imagen
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </Button>
                    {file && <Typography variant="body2">{file.name}</Typography>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={isSubmitting}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained" color="primary" disabled={!file || isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}>
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
