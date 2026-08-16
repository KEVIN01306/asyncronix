import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface Props {
    open: boolean;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function StockWarningModal({ open, message, onClose, onConfirm }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Advertencia de Stock</DialogTitle>
            <DialogContent dividers>
                <Typography color="error" fontWeight="bold" mb={2}>
                    {message}
                </Typography>
                <Typography>
                    Aún así, puedes continuar y crear la preventa para asegurar los artículos o agregarlos luego al inventario.
                    <br /><br />
                    ¿Quieres continuar y crear la preventa de todos modos?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={onConfirm} variant="contained" color="primary">
                    Continuar y Crear Preventa
                </Button>
            </DialogActions>
        </Dialog>
    );
}
