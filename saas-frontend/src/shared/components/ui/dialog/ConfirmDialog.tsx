import { 
    Dialog, DialogTitle, DialogContent, DialogContentText, 
    DialogActions, Button, CircularProgress 
} from '@mui/material';
import { Delete } from '@mui/icons-material';

interface Props {
    open: boolean;
    title: string;
    description: string | React.ReactNode;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    confirmText?: string;
    confirmColor?: 'error' | 'primary' | 'secondary' | 'warning';
}

const ConfirmDialog = ({
    open,
    title,
    description,
    onClose,
    onConfirm,
    isLoading = false,
    confirmText = 'Confirmar',
    confirmColor = 'error'
}: Props) => {
    return (
        <Dialog 
            open={open} 
            onClose={() => !isLoading && onClose()}
            PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
        >
            <DialogTitle fontWeight={700}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText color="text.primary">
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button 
                    onClick={onClose} 
                    disabled={isLoading}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={onConfirm} 
                    color={confirmColor} 
                    variant="contained" 
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Delete />}
                    sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontWeight: 600,
                        px: 3 
                    }}
                >
                    {isLoading ? 'Procesando...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;