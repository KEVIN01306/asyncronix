import React, { useState } from 'react';
import { Button, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import { toast } from 'sonner';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import { cambioSiguienteServicioCrearSchema } from '../../domain/schemas/servicio.schema';

type Props = {
    servicio: ServicioVehiculo;
    onUpdate: (servicio: ServicioVehiculo) => void;
    canEdit?: boolean;
};

const ServiceNextServiceChanges: React.FC<Props> = ({ servicio, onUpdate, canEdit = true }) => {
    const [item, setItem] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleCreate = async () => {
        if (!canEdit) {
            toast.error('No tienes permisos para editar cambios en este estado');
            return;
        }

        const validated = cambioSiguienteServicioCrearSchema.safeParse({ item: item.trim() });
        if (!validated.success) {
            toast.error(validated.error.issues[0]?.message || 'Datos inválidos');
            return;
        }

        setLoading(true);
        try {
            await servicioRepository.crearCambioSiguienteServicio(servicio.id, validated.data);
            const updated = await servicioRepository.obtener(servicio.id);
            onUpdate(updated);
            setItem('');
            toast.success('Cambio agregado correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo agregar el cambio');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cambioId: string) => {
        if (!canEdit) {
            toast.error('No tienes permisos para eliminar cambios en este estado');
            return;
        }

        if (!window.confirm('¿Eliminar este cambio?')) return;

        try {
            await servicioRepository.eliminarCambioSiguienteServicio(servicio.id, cambioId);
            const updated = await servicioRepository.obtener(servicio.id);
            onUpdate(updated);
            toast.success('Cambio eliminado correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar el cambio');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        label="Item"
                        placeholder="Ej. Cambio de pastillas de freno"
                        value={item}
                        disabled={!canEdit || loading}
                        onChange={(event) => setItem(event.target.value)}
                    />
                    <Button variant="contained" onClick={handleCreate} disabled={!canEdit || loading || !item.trim()}>
                        {loading ? 'Agregando...' : 'Agregar'}
                    </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    {canEdit
                        ? 'Listado de recomendaciones para la próxima visita del vehículo.'
                        : 'Solo lectura: no puedes editar cambios para el siguiente servicio en este estado.'}
                </Typography>

                <ListTableSimple
                    columns={[
                        { id: 'item', name: 'Item', format: (value) => value || '-' },
                        ...(canEdit
                            ? [{
                                id: 'actions',
                                name: 'Acción',
                                format: (_value: unknown, row: { id: string }) => (
                                    <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(row.id)}>
                                        Eliminar
                                    </Button>
                                )
                            }]
                            : [])
                    ]}
                    data={servicio.cambios_siguiente_servicio || []}
                    headerBgColor={theme.palette.primary.main}
                    headerTextColor="#fff"
                />
            </Stack>
        </Paper>
    );
};

export default ServiceNextServiceChanges;
