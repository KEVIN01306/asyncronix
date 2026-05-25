import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

type Props = {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
};

const ImagePreviewModal: React.FC<Props> = ({ open, imageUrl, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Vista previa</DialogTitle>
      <DialogContent>
        {imageUrl && <Box component="img" src={imageUrl} alt="Imagen ampliada" sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 1 }} />}
        <Typography variant="body2" mt={2} color="text.secondary">{/* description could be added here */}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImagePreviewModal;
