import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import SignaturePad from '../../../../../shared/components/firma/firmaElectronica';

type Props = {
    open: boolean;
    onSave: (base64: string | null) => void;
    onCancel: () => void;
    onConfirm: () => void;
    saving: boolean;
    title?: string;
    description?: string;
};

const SignaturePadModal: React.FC<Props> = ({ open, onSave, onCancel, onConfirm, saving, title = 'Firma de Entrada', description = 'Por favor, dibuja tu firma en el canvas siguiente para finalizar la recepción del servicio.' }) => {
    return (
        <Dialog open={open} onClose={() => !saving && onCancel()} fullWidth maxWidth="md">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
                <SignaturePad onSave={onSave} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={saving}>Cancelar</Button>
                <Button onClick={onConfirm} disabled={saving} variant="contained" color="success">{saving ? 'Guardando...' : 'Confirmar'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SignaturePadModal;
