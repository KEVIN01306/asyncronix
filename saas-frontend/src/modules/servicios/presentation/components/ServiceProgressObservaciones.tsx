import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';

const schema = z.object({
    observaciones: z
        .string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});

type Form = z.infer<typeof schema>;

type Props = {
    servicio: Servicio;
    canEdit: boolean;
    canView: boolean;
    onUpdate: (servicio: Servicio) => void;
};

const ServiceProgressObservaciones = ({ servicio, canEdit, canView, onUpdate }: Props) => {
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
        resolver: zodResolver(schema),
        defaultValues: { observaciones: servicio.observaciones ?? '' }
    });

    useEffect(() => {
        reset({ observaciones: servicio.observaciones ?? '' });
    }, [servicio.observaciones, reset]);

    const onSubmit = async (data: Form) => {
        if (!canEdit) return;
        setSaving(true);
        try {
            const updatedService = await servicioRepository.actualizarObservaciones(servicio.id, { observaciones: data.observaciones ?? null });
            onUpdate(updatedService);
            toast.success('Observaciones guardadas correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo guardar las observaciones');
        } finally {
            setSaving(false);
        }
    };

    if (!canView) {
        return null;
    }

    return (
        <Paper sx={{ p: 3 }}> 
            <Typography variant="h6" mb={2}>Observaciones</Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Observaciones"
                    placeholder="Agregar observaciones del servicio"
                    {...register('observaciones')}
                    error={Boolean(errors.observaciones)}
                    helperText={errors.observaciones?.message}
                    disabled={!canEdit || saving}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!canEdit || saving}
                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default ServiceProgressObservaciones;
