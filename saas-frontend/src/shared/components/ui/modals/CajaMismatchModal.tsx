import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface CajaMismatchModalProps {
    open: boolean;
    onClose: () => void;
    onForce: () => void;
    loading?: boolean;
}

const CajaMismatchModal = ({ open, onClose, onForce, loading }: CajaMismatchModalProps) => {
    return (
        <Dialog open={open} onClose={() => !loading && onClose()}>
            <DialogTitle>Token de Caja No Coincide</DialogTitle>
            <DialogContent>
                <Typography>
                    El token no coincide con la caja física asignada a este dispositivo. ¿Deseas completar la transacción enviando el efectivo a la caja en línea?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button disabled={loading} onClick={onClose}>Cancelar</Button>
                <Button disabled={loading} onClick={onForce} variant="contained" color="primary">
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Sí, usar caja en línea'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CajaMismatchModal;
