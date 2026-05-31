import React, { useEffect, useState } from 'react';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Checkbox, Typography, Stack } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio, ServicioTarea } from '../../domain/interfaces/servicio.interface';
import { ESTADO_SERVICIO, type EstadoServicio } from '../../domain/servicio.constants';

type Props = {
    servicio: Servicio;
    onUpdate: (s: Servicio) => void;
    canAddManual?: boolean;
};

const ServiceProgressTasks: React.FC<Props> = ({ servicio, onUpdate, canAddManual = false }) => {
    const [taskUpdates, setTaskUpdates] = useState<Record<string, { completado: boolean; observacion: string }>>({});
    const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
    const [newTaskName, setNewTaskName] = useState('');
    const [creatingTask, setCreatingTask] = useState(false);

    const estadosPermitidos: EstadoServicio[] = [
        ESTADO_SERVICIO.EN_SERVICIO,
        ESTADO_SERVICIO.ESPERA_REPUESTOS
    ];
    const canEdit = estadosPermitidos.includes(servicio.estado);

    useEffect(() => {
        const map: Record<string, { completado: boolean; observacion: string }> = {};
        servicio.tareas?.forEach((tarea) => {
            map[tarea.id] = { completado: tarea.completado, observacion: tarea.observacion ?? '' };
        });
        setTaskUpdates(map);
    }, [servicio.tareas]);

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

    const handleCreateTarea = async () => {
        if (!newTaskName.trim()) {
            toast.error('El nombre de la tarea es requerido');
            return;
        }
        setCreatingTask(true);
        try {
            await servicioRepository.registrarTarea(servicio.id, { nombre: newTaskName.trim() });
            const updated = await servicioRepository.obtener(servicio.id);
            onUpdate(updated);
            setNewTaskName('');
            toast.success('Tarea manual creada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo crear la tarea manual');
        } finally {
            setCreatingTask(false);
        }
    };

    if (!servicio.tareas?.length) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary" mb={2}>
                    No hay tareas de progreso disponibles para este servicio.
                </Typography>
                {canAddManual && canEdit && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                        <TextField
                            fullWidth
                            label="Nueva tarea manual"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleCreateTarea} disabled={creatingTask}>
                            {creatingTask ? 'Creando...' : 'Crear tarea'}
                        </Button>
                    </Stack>
                )}
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
                        {servicio.tareas.map((tarea) => {
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
