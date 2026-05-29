import { Box, Button, CircularProgress, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, TextField, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioRepuestoCliente, Servicio } from '../../domain/interfaces/servicio.interface';
import { toast } from 'sonner';
import { ESTADO_SERVICIO } from '../../domain/servicio.constants';

const schema = z.object({ nombre: z.string().min(1), cantidad: z.number().int().min(1) });
type Form = z.infer<typeof schema>;

type Props = {
    servicio: Servicio;
    onUpdate?: (s: Servicio) => void;
};

const ServiceClientParts = ({ servicio, onUpdate }: Props) => {
    const [items, setItems] = useState<ServicioRepuestoCliente[]>(servicio.repuestos ?? []);
    const [actionLoading, setActionLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { register, handleSubmit, reset } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { nombre: '', cantidad: 1 } });

    const load = useCallback(async () => {
        try {
            const s = await servicioRepository.obtener(servicio.id);
            if (onUpdate) onUpdate(s);
            setItems(s.repuestos ?? []);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar los repuestos');
        }
    }, [servicio.id, onUpdate]);

    useEffect(() => {
        const fetchRepuestos = async () => {
            await load();
        };
        fetchRepuestos();
    }, [load]);

    const canEdit = servicio.estado === ESTADO_SERVICIO.RECEPCION;

    const onSubmit = async (data: Form) => {
        let created = false;
        try {
            setActionLoading(true);
            await servicioRepository.crearRepuestoCliente(servicio.id, { nombre: data.nombre, cantidad: data.cantidad });
            reset();
            toast.success('Repuesto agregado');
            created = true;
        } catch (error) {
            console.error(error);
            toast.error('No se pudo agregar el repuesto');
        } finally {
            setActionLoading(false);
        }

        if (created) {
            await load();
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await servicioRepository.eliminarRepuestoCliente(servicio.id, id);
            await load();
            toast.success('Repuesto eliminado');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar el repuesto');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Repuestos del cliente</Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" gap={2} mb={2}>
                <Grid container spacing={2} alignItems="center" size={12}>
                    <Grid size={{xs: 7, sm: 6}}>
                        <TextField fullWidth size="small" label="Nombre repuesto" {...register('nombre')} disabled={!canEdit} />
                    </Grid>
                    <Grid size={{ xs: 3, sm: 4 }}>
                        <TextField type="number" size="small" label="Cantidad" sx={{ width: 120 }} {...register('cantidad', { valueAsNumber: true })} disabled={!canEdit} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2}}>
                        <Button type="submit" variant="contained" disabled={!canEdit || actionLoading} startIcon={actionLoading ? <CircularProgress size={18} color="inherit" /> : undefined}>
                            {actionLoading ? 'Guardando...' : 'Agregar'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <List>
                {items.map((it) => (
                    <ListItem key={it.id} divider>
                        <ListItemText primary={it.repuesto} secondary={`Cantidad: ${it.cantidad}`} />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleDelete(it.id)} disabled={!canEdit || deletingId === it.id}>
                                {deletingId === it.id ? <CircularProgress size={20} /> : <Delete />}
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
                {items.length === 0 && <Box p={2}><Typography color="text.secondary">No hay repuestos registrados</Typography></Box>}
            </List>
        </Paper>
    );
};

export default ServiceClientParts;
