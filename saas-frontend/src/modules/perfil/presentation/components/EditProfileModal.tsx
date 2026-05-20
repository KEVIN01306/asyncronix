import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid } from '@mui/material';
import type { ActualizarPerfilForm } from '../../domain/interfaces/perfil.interface';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ActualizarPerfilForm) => void;
    initialData: ActualizarPerfilForm | null;
}

export const EditProfileModal = ({ open, onClose, onSubmit, initialData }: Props) => {
    const [formData, setFormData] = useState<ActualizarPerfilForm>({ nombre: '', apellido: '', email: '', telefono: '' });

    useEffect(() => {
        if (initialData && open) setFormData(initialData);
    }, [initialData, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Apellidos" name="apellido" value={formData.apellido || ''} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Email" name="email" value={formData.email || ''} onChange={handleChange} margin="normal" type="email" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} margin="normal" />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={() => onSubmit(formData)} variant="contained" color="primary">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};
