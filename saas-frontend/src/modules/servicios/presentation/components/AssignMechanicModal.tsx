import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, Box, CircularProgress, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usuarioRepository } from '../../../usuarios/infrastructure/repositories/usuario.repository';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';

const schema = z.object({ mecanico_id: z.string().uuid() });
type Form = z.infer<typeof schema>;

export default function AssignMechanicModal({ open, onClose, servicio, onSuccess }: any) {
    const { control, handleSubmit, reset } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { mecanico_id: '' } });
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await usuarioRepository.listar(100, 0);
                const users = res.data ?? [];
                // filter by servicio.sucursal_id and only users with same sucursal
                const filtered = users.filter((u: any) => u.sucursal && servicio.sucursal_id && u.sucursal.id === servicio.sucursal_id);
                setOptions(filtered);
            } catch (e) {
                console.error(e);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [open, servicio.sucursal_id]);

    useEffect(() => { if (!open) reset({ mecanico_id: '' }); }, [open, reset]);

    const onSubmit = async (data: Form) => {
        setSubmitting(true);
        try {
            let updated;
            if (servicio.mecanico && servicio.mecanico.id) {
                updated = await servicioRepository.cambiarMecanico(servicio.id, servicio.mecanico.id, data.mecanico_id);
            } else {
                updated = await servicioRepository.asociarMecanico(servicio.id, data.mecanico_id);
            }
            onSuccess?.(updated);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Asociar mecánico</DialogTitle>
            <DialogContent dividers>
                <Box component="form" id="form-asociar-mecanico" onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                        name="mecanico_id"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                options={options}
                                getOptionLabel={(opt: any) => `${opt.nombre} ${opt.apellido ?? ''} - ${opt.email}`}
                                onChange={(_e, v) => field.onChange(v?.id ?? '')}
                                value={options.find(o => o.id === field.value) ?? null}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Mecánico"
                                        InputProps={{ ...params.InputProps, endAdornment: (<>{loading ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>) }}
                                    />
                                )}
                            />
                        )}
                    />
                    <Typography variant="caption" color="text.secondary">Se mostrarán solo usuarios pertenecientes a la sucursal del servicio.</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button type="submit" form="form-asociar-mecanico" variant="contained" disabled={submitting}>{submitting ? 'Guardando...' : 'Confirmar'}</Button>
            </DialogActions>
        </Dialog>
    );
}
