import { Dialog, DialogTitle, DialogContent, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import TextField from '@mui/material/TextField';
import { actualizarPinModeloSchema, type ActualizarPinModeloFormValues } from '../../domain/schemas/perfil.schema';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ActualizarPinModeloFormValues) => void;
}

export const ChangePinModeloModal = ({ open, onClose, onSubmit }: Props) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ActualizarPinModeloFormValues>({
        resolver: zodResolver(actualizarPinModeloSchema),
        defaultValues: { pin_modelo: '' }
    });

    const onFormSubmit = async (data: ActualizarPinModeloFormValues) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cambiar Pin de Modelo</DialogTitle>
            <DialogContent dividers>
                <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Pin de Modelo"
                                type="password"
                                inputProps={{ maxLength: 6 }}
                                {...register('pin_modelo')}
                                error={!!errors.pin_modelo}
                                helperText={errors.pin_modelo?.message}
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
