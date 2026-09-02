import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { servicioRepository } from '../../../infrastructure/repositories/servicio.repository';
import type { ServicioReparacionRepuesto } from '../../../domain/interfaces/servicio.interface';

const schema = z.object({
    descripccion: z.string().min(1, 'La descripción es obligatoria'),
    cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
    instrucciones: z.string().optional().default(''),
    procedencia: z.enum(['PROPIO', 'CLIENTE']),
    entregado: z.boolean().optional().default(false)
});

type Form = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onClose: () => void;
    reparacionId: string;
    repuesto?: ServicioReparacionRepuesto | null;
    onSuccess?: () => void;
}

export default function ServicioReparacionRepuestoModal({ open, onClose, reparacionId, repuesto, onSuccess }: Props) {
    const { control, handleSubmit, reset } = useForm<Form>({
        resolver: zodResolver(schema) as any,
        defaultValues: { descripccion: '', cantidad: 1, instrucciones: '', procedencia: 'PROPIO', entregado: false }
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (repuesto) {
                reset({
                    descripccion: repuesto.descripccion,
                    cantidad: repuesto.cantidad,
                    instrucciones: repuesto.instrucciones || '',
                    procedencia: repuesto.procedencia,
                    entregado: repuesto.entregado
                });
            } else {
                reset({ descripccion: '', cantidad: 1, instrucciones: '', procedencia: 'PROPIO', entregado: false });
            }
        }
    }, [open, repuesto, reset]);

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            if (repuesto) {
                await servicioRepository.actualizarRepuestoSolicitado(reparacionId, repuesto.id, data);
            } else {
                await servicioRepository.crearRepuestoSolicitado(reparacionId, data);
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{repuesto ? 'Editar repuesto solicitado' : 'Solicitar repuesto'}</DialogTitle>
            <DialogContent dividers>
                <Box component="form" id="form-reparacion-repuesto" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <Controller
                        name="descripccion"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Descripción del repuesto"
                                fullWidth
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="cantidad"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Cantidad"
                                type="number"
                                fullWidth
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        )}
                    />
                    <Controller
                        name="procedencia"
                        control={control}
                        render={({ field, fieldState }) => (
                            <FormControl fullWidth error={!!fieldState.error}>
                                <InputLabel>Procedencia</InputLabel>
                                <Select {...field} label="Procedencia">
                                    <MenuItem value="PROPIO">Inventario (Propio)</MenuItem>
                                    <MenuItem value="CLIENTE">Traído por el cliente</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />
                    <Controller
                        name="instrucciones"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Instrucciones adicionales"
                                fullWidth
                                multiline
                                rows={2}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="entregado"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                label="¿Ha sido entregado al mecánico?"
                            />
                        )}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button type="submit" form="form-reparacion-repuesto" variant="contained" disabled={submitting}>
                    {submitting ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
