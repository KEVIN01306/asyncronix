import { Dialog, DialogTitle, DialogContent, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import TextField from '@mui/material/TextField';
import type { CambiarPasswordForm } from '../../domain/interfaces/perfil.interface';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CambiarPasswordForm) => void;
}

export const ChangePasswordModal = ({ open, onClose, onSubmit }: Props) => {
    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<CambiarPasswordForm>({
        defaultValues: { password: '', confirm_password: '' }
    });

    const onFormSubmit = async (data: CambiarPasswordForm) => {
        await onSubmit({ password: data.password, confirm_password: data.confirm_password });
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogContent dividers>
                <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Nueva Contraseña" type="password" {...register('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} error={!!errors.password} helperText={errors.password?.message} margin="normal" />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Confirmar Contraseña" type="password" {...register('confirm_password', { required: 'Confirma la contraseña', validate: (val) => val === watch('password') || 'Las contraseñas no coinciden' })} error={!!errors.confirm_password} helperText={errors.confirm_password?.message} margin="normal" />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <SubmitButton isSubmitting={isSubmitting} text="Cambiar" loadingText="Cambiando..." />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    );
};
