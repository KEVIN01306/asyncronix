import { Box, Button, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, Stack, TextField, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioRepuestoCliente, Servicio } from '../../domain/interfaces/servicio.interface';
import { toast } from 'sonner';
import { ESTADO_SERVICIO } from '../../domain/servicio.constants';

const schema = z.object({ nombre: z.string().min(1), cantidad: z.coerce.number().int().min(1) });
type Form = z.infer<typeof schema>;

type Props = {
    servicio: Servicio;
    onUpdate?: (s: Servicio) => void;
};

const ServiceClientParts = ({ servicio, onUpdate }: Props) => {
    const [items, setItems] = useState<ServicioRepuestoCliente[]>(servicio.repuestos ?? []);
    const { register, handleSubmit, reset } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { nombre: '', cantidad: 1 } });

    const load = useCallback(async () => {
        try {
            const s = await servicioRepository.obtener(servicio.id);
            setItems(s.repuestos ?? []);
            if (onUpdate) onUpdate(s);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar los repuestos');
        }
    }, [servicio.id, onUpdate]);

    useEffect(() => { load(); }, [load]);

    const canEdit = servicio.estado === ESTADO_SERVICIO.EN_REPARACION;

    const onSubmit = async (data: Form) => {
        try {
            await servicioRepository.crearRepuestoCliente(servicio.id, { nombre: data.nombre, cantidad: data.cantidad });
            reset();
            await load();
            toast.success('Repuesto agregado');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo agregar el repuesto');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await servicioRepository.eliminarRepuestoCliente(servicio.id, id);
            await load();
            toast.success('Repuesto eliminado');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar el repuesto');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Repuestos del cliente</Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" gap={2} mb={2}>
                <TextField fullWidth size="small" label="Nombre repuesto" {...register('nombre')} disabled={!canEdit} />
                <TextField type="number" size="small" label="Cantidad" sx={{ width: 120 }} {...register('cantidad')} disabled={!canEdit} />
                <Button type="submit" variant="contained" disabled={!canEdit}>Agregar</Button>
            </Box>

            <List>
                {items.map((it) => (
                    <ListItem key={it.id} divider>
                        <ListItemText primary={it.repuesto} secondary={`Cantidad: ${it.cantidad}`} />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleDelete(it.id)} disabled={!canEdit}>
                                <Delete />
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
