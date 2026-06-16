import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';

const schema = z.object({
    nombre_extra: z.string().trim().min(1, 'El nombre es requerido'),
    documento_extra: z.string().trim().min(1, 'El DPI es requerido'),
    numero_extra: z.string().trim().min(1, 'El número extra es requerido')
});

type Form = z.infer<typeof schema>;

type Props = {
    open: boolean;
    onClose: () => void;
    servicio: any;
    onSuccess?: (servicio: any) => void;
};

export default function ExternalClientModal({ open, onClose, servicio, onSuccess }: Props) {
    const { control, handleSubmit, reset } = useForm<Form>({
        resolver: zodResolver(schema),
        defaultValues: {
            nombre_extra: servicio.nombre_extra ?? '',
            documento_extra: servicio.documento_extra ?? '',
            numero_extra: servicio.numero_extra ?? ''
        }
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        reset({
            nombre_extra: servicio.nombre_extra ?? '',
            documento_extra: servicio.documento_extra ?? '',
            numero_extra: servicio.numero_extra ?? ''
        });
    }, [open, servicio.nombre_extra, servicio.documento_extra, servicio.numero_extra, reset]);

    const onSubmit = async (data: Form) => {
        setSaving(true);
        try {
            const updated = await servicioRepository.actualizarClienteExterno(servicio.id, data);
            onSuccess?.(updated);
            toast.success('Cliente externo guardado');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo guardar el cliente externo');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{servicio.nombre_extra ? 'Editar cliente externo' : 'Asociar cliente externo'}</DialogTitle>
            <DialogContent dividers>
                <Box component="form" id="form-cliente-externo" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 2 }}>
                    <Controller
                        name="nombre_extra"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Nombre"
                                fullWidth
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="documento_extra"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="DPI"
                                fullWidth
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="numero_extra"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Número extra"
                                fullWidth
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>Cancelar</Button>
                <Button type="submit" form="form-cliente-externo" variant="contained" disabled={saving}>
                    {saving ? <CircularProgress size={20} /> : 'Guardar cliente externo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
