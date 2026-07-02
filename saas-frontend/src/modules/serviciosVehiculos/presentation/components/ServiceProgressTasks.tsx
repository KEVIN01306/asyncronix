import React, { useEffect, useState } from 'react';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Checkbox, Typography, Stack } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioVehiculo, ServicioTarea } from '../../domain/interfaces/servicio.interface';
import { ESTADO_SERVICIO_VEHICULO, type EstadoVehiculoServicio } from '../../domain/servicio.constants';

type Props = {
    servicio: ServicioVehiculo;
    tareas: ServicioTarea[];
    onUpdate: (s: ServicioVehiculo) => void;
    emptyMessage?: string;
};

const ServiceProgressTasks: React.FC<Props> = ({ servicio, tareas, onUpdate, emptyMessage = 'No hay tareas de progreso disponibles para este servicio.' }) => {
    const [taskUpdates, setTaskUpdates] = useState<Record<string, { completado: boolean; observacion: string }>>({});
    const [savingTaskId, setSavingTaskId] = useState<string | null>(null);

    const estadosPermitidos: EstadoVehiculoServicio[] = [
        ESTADO_SERVICIO_VEHICULO.EN_SERVICIO,
        ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS
    ];
    const canEdit = estadosPermitidos.includes(servicio.estado);

    useEffect(() => {
        const map: Record<string, { completado: boolean; observacion: string }> = {};
        tareas.forEach((tarea) => {
            map[tarea.id] = { completado: tarea.completado, observacion: tarea.observacion ?? '' };
        });
        setTaskUpdates(map);
    }, [tareas]);

    const handleToggleCompletion = (tarea: ServicioTarea) => {
        if (!canEdit) return;
        setTaskUpdates((prev) => ({
            ...prev,
            [tarea.id]: {
                ...(prev[tarea.id] ?? { completado: tarea.completado, observacion: tarea.observacion ?? '' }),
                completado: !(prev[tarea.id]?.completado ?? tarea.completado)
            }
        }));
    };

    const handleObservacionChange = (tarea: ServicioTarea, value: string) => {
        if (!canEdit) return;
        setTaskUpdates((prev) => ({
            ...prev,
            [tarea.id]: {
                ...(prev[tarea.id] ?? { completado: tarea.completado, observacion: tarea.observacion ?? '' }),
                observacion: value
            }
        }));
    };

    const handleSaveTarea = async (tarea: ServicioTarea) => {
        const update = taskUpdates[tarea.id];
        if (!update) return;
        setSavingTaskId(tarea.id);
        try {
            await servicioRepository.actualizarTarea(servicio.id, tarea.id, {
                completado: update.completado,
                observacion: update.observacion || null
            });
            const updated = await servicioRepository.obtener(servicio.id);
            onUpdate(updated);
            toast.success('Tarea actualizada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo actualizar la tarea');
        } finally {
            setSavingTaskId(null);
        }
    };

    if (!tareas.length) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary" mb={2}>
                    {emptyMessage}
                </Typography>
            </Paper>
        );
    }

    return (
        <Stack spacing={2}>
            <TableContainer component={Paper} sx={{ p: 0 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tarea</TableCell>
                            <TableCell>Completado</TableCell>
                            <TableCell>Observación</TableCell>
                            <TableCell align="right">Acción</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tareas.map((tarea) => {
                            const update = taskUpdates[tarea.id] ?? { completado: tarea.completado, observacion: tarea.observacion ?? '' };
                            return (
                                <TableRow key={tarea.id}>
                                    <TableCell>{tarea.nombre}</TableCell>
                                    <TableCell>
                                        <Checkbox checked={update.completado} disabled={!canEdit} onChange={() => handleToggleCompletion(tarea)} />
                                    </TableCell>
                                    <TableCell>
                                        {canEdit ? (
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={2}
                                                value={update.observacion}
                                                onChange={(e) => handleObservacionChange(tarea, e.target.value)}
                                            />
                                        ) : (
                                            <Typography>{tarea.observacion ?? 'Sin observación'}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                                    <Button variant="contained" size="small" disabled={!canEdit || savingTaskId === tarea.id} onClick={() => handleSaveTarea(tarea)}>
                                                {savingTaskId === tarea.id ? 'Guardando...' : 'Guardar'}
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
};

export default ServiceProgressTasks;
