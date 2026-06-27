import { Dialog, DialogTitle, DialogContent, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import TextField from '@mui/material/TextField';
import { actualizarPinCajaSchema, type ActualizarPinCajaFormValues } from '../../domain/schemas/perfil.schema';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ActualizarPinCajaFormValues) => void;
}

export const ChangePinCajaModal = ({ open, onClose, onSubmit }: Props) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ActualizarPinCajaFormValues>({
        resolver: zodResolver(actualizarPinCajaSchema),
        defaultValues: { pin_caja: '' }
    });

    const onFormSubmit = async (data: ActualizarPinCajaFormValues) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cambiar Pin de Caja</DialogTitle>
            <DialogContent dividers>
                <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Pin de Caja"
                                type="password"
                                inputProps={{ maxLength: 6 }}
                                {...register('pin_caja')}
                                error={!!errors.pin_caja}
                                helperText={errors.pin_caja?.message}
                                margin="normal"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <SubmitButton isSubmitting={isSubmitting} text="Guardar Pin" loadingText="Guardando..." />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    );
};
