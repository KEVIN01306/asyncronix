import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import type { CambiarPasswordForm } from '../../domain/interfaces/perfil.interface';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CambiarPasswordForm) => void;
}

export const ChangePasswordModal = ({ open, onClose, onSubmit }: Props) => {
    const [formData, setFormData] = useState<CambiarPasswordForm>({ password: '', confirm_password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSubmit(formData);
        setFormData({ password: '', confirm_password: '' });
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogContent dividers>
                <TextField fullWidth label="Nueva Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} margin="normal" />
                <TextField fullWidth label="Confirmar Contraseña" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} margin="normal" />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={handleSave} variant="contained" color="primary">Cambiar</Button>
            </DialogActions>
        </Dialog>
    );
};
