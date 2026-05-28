import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import SignaturePad from '../../../../../shared/components/firma/firmaElectronica';

type Props = {
    open: boolean;
    onSave: (base64: string | null) => void;
    onCancel: () => void;
    onConfirm: () => void;
    saving: boolean;
};

const SignaturePadModal: React.FC<Props> = ({ open, onSave, onCancel, onConfirm, saving }) => {
    return (
        <Dialog open={open} onClose={() => !saving && onCancel()} fullWidth maxWidth="md">
            <DialogTitle>Firma de Entrada</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>Por favor, dibuja tu firma en el canvas siguiente para finalizar la recepción del servicio.</DialogContentText>
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
