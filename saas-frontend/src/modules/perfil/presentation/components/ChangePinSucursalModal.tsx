import { Dialog, DialogTitle, DialogContent, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import TextField from '@mui/material/TextField';
import { actualizarPinSucursalSchema, type ActualizarPinSucursalFormValues } from '../../domain/schemas/perfil.schema';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ActualizarPinSucursalFormValues) => void;
}

export const ChangePinSucursalModal = ({ open, onClose, onSubmit }: Props) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ActualizarPinSucursalFormValues>({
        resolver: zodResolver(actualizarPinSucursalSchema),
        defaultValues: { pin_sucursal: '' }
    });

    const onFormSubmit = async (data: ActualizarPinSucursalFormValues) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cambiar Pin de Sucursal</DialogTitle>
            <DialogContent dividers>
                <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Pin de Sucursal"
                                type="password"
                                inputProps={{ maxLength: 6 }}
                                {...register('pin_sucursal')}
                                error={!!errors.pin_sucursal}
                                helperText={errors.pin_sucursal?.message}
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
