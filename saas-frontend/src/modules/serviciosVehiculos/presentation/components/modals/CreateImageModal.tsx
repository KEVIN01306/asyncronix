import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Box, CardMedia } from '@mui/material';

type Props = {
  open: boolean;
  preview: string | null;
  description: string;
  setDescription: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  uploading: boolean;
};

const CreateImageModal: React.FC<Props> = ({ open, preview, description, setDescription, onCancel, onConfirm, uploading }) => {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Descripción de la imagen</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Ingresa una descripción para la imagen antes de subirla al servicio. Si no se especifica nada, se usará el prefijo por defecto.
        </DialogContentText>
        {preview && (
          <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
            <CardMedia component="img" image={preview} alt="Vista previa de imagen" sx={{ maxHeight: 320, width: 'auto', maxWidth: '100%', borderRadius: 1 }} />
          </Box>
        )}
        <TextField autoFocus margin="dense" label="Descripción" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={uploading}>Cancelar</Button>
        <Button onClick={onConfirm} disabled={uploading}>{uploading ? 'Subiendo...' : 'Subir imagen'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateImageModal;
