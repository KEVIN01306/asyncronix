import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import TextField from '@mui/material/TextField';
import type { ActualizarPerfilForm } from '../../domain/interfaces/perfil.interface';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ActualizarPerfilForm) => void;
    initialData: ActualizarPerfilForm | null;
}

export const EditProfileModal = ({ open, onClose, onSubmit, initialData }: Props) => {
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ActualizarPerfilForm>({
        defaultValues: { nombre: '', apellido: '', email: '', telefono: '' }
    });

    useEffect(() => {
        if (open && initialData) {
            reset(initialData);
        }
    }, [open, initialData, reset]);

    const onFormSubmit = async (data: ActualizarPerfilForm) => {
        await onSubmit({ ...data, apellido: data.apellido === '' ? null : data.apellido, email: data.email === '' ? null : data.email });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogContent dividers>
                <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="nombre"
                                control={control}
                                render={({ field }) => (
                                    <TextField fullWidth label="Nombre" {...field} error={!!errors.nombre} helperText={errors.nombre?.message} margin="normal" />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="apellido"
                                control={control}
                                render={({ field }) => (
                                    <TextField fullWidth label="Apellidos" {...field} error={!!errors.apellido} helperText={errors.apellido?.message} margin="normal" />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField fullWidth label="Email" type="email" {...field} error={!!errors.email} helperText={errors.email?.message} margin="normal" />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="telefono"
                                control={control}
                                render={({ field }) => (
                                    <TextField fullWidth label="Teléfono" {...field} error={!!errors.telefono} helperText={errors.telefono?.message} margin="normal" />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <SubmitButton isSubmitting={isSubmitting} text="Guardar" loadingText="Guardando..." />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    );
};
