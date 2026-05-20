import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Avatar, Typography } from '@mui/material';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (file: File) => void;
    initialUrl: string | null;
}

export const EditAvatarModal = ({ open, onClose, onSubmit, initialUrl }: Props) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setFile(null);
            setPreview(initialUrl ? `${import.meta.env.VITE_API_URL}/${initialUrl}` : null);
        }
    }, [open, initialUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
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
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={() => file && onSubmit(file)} variant="contained" color="primary" disabled={!file}>Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};
