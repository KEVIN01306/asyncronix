import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, CircularProgress, Paper, Stack, TextField, createFilterOptions, Grid } from '@mui/material';
import { toast } from 'sonner';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import { OpcionServicioRepository } from '../../../opciones-servicio/infrastructure/repositories/opcion-servicio.repository';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import type { OpcionServicio } from '../../../opciones-servicio/domain/interfaces/opcion-servicio.interface';

type Props = {
    servicio: Servicio;
    onUpdate: (servicio: Servicio) => void;
};

type NewTaskOption = {
    inputValue: string;
    nombre: string;
    isNew: true;
};

type TaskOption = OpcionServicio | NewTaskOption | string;

const filterOptions = createFilterOptions<TaskOption>();

const ServiceDetailManualTasks: React.FC<Props> = ({ servicio, onUpdate }) => {
    const [opcionesServicio, setOpcionesServicio] = useState<OpcionServicio[]>([]);
    const [loadingOpciones, setLoadingOpciones] = useState(false);
    const [selectedTaskOption, setSelectedTaskOption] = useState<TaskOption | null>(null);
    const [taskInputValue, setTaskInputValue] = useState('');
    const [creatingTask, setCreatingTask] = useState(false);

    useEffect(() => {
        const fetchOpciones = async () => {
            setLoadingOpciones(true);
            try {
                const response = await OpcionServicioRepository.listar(100, 0);
                setOpcionesServicio(response.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingOpciones(false);
            }
        };

        fetchOpciones();
    }, []);

    const getTaskNameFromOption = (option: TaskOption | null) => {
        if (!option) return taskInputValue.trim();
        if (typeof option === 'string') return option.trim();
        if ('isNew' in option && option.isNew) return option.inputValue.trim();
        return option.nombre.trim();
    };

    const taskLabel = getTaskNameFromOption(selectedTaskOption);
    const isExistingOption = opcionesServicio.some((option) => option.nombre.toLowerCase() === taskLabel.toLowerCase());
    const isNewOption = taskLabel !== '' && !isExistingOption;

    const handleCreateTask = async () => {
        if (!taskLabel) {
            toast.error('El nombre de la tarea es requerido');
            return;
        }

        setCreatingTask(true);
        try {
            await servicioRepository.registrarTarea(servicio.id, { nombre: taskLabel });
            const updated = await servicioRepository.obtener(servicio.id);
            onUpdate(updated);
            setSelectedTaskOption(null);
            setTaskInputValue('');
            toast.success('Tarea manual creada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo crear la tarea manual');
        } finally {
            setCreatingTask(false);
        }
    };

    const handleDeleteTask = async (tareaId: string) => {
        if (!window.confirm('¿Eliminar esta tarea?')) return;

        try {
            await servicioRepository.eliminarTarea(servicio.id, tareaId);
            const updated = await servicioRepository.obtener(servicio.id);
            onUpdate(updated);
            toast.success('Tarea eliminada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar la tarea');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={3}>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, sm: 'grow' }}>
                        <Autocomplete<TaskOption, false, false, true>
                            freeSolo
                            loading={loadingOpciones}
                            options={opcionesServicio}
                            value={selectedTaskOption}
                            inputValue={taskInputValue}
                            onChange={(_event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setSelectedTaskOption(newValue);
                                    setTaskInputValue(newValue);
                                } else if (newValue && 'isNew' in newValue && newValue.isNew) {
                                    setSelectedTaskOption(newValue);
                                    setTaskInputValue(newValue.inputValue);
                                } else {
                                    setSelectedTaskOption(newValue);
                                    setTaskInputValue(newValue ? newValue.nombre : '');
                                }
                            }}
                            onInputChange={(_event, newInputValue, reason) => {
                                if (reason === 'input') {
                                    setTaskInputValue(newInputValue);
                                    setSelectedTaskOption(null);
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = filterOptions(options, params);
                                const { inputValue } = params;
                                const exists = opcionesServicio.some((option) => option.nombre.toLowerCase() === inputValue.toLowerCase());
                                if (inputValue !== '' && !exists) {
                                    filtered.push({
                                        inputValue,
                                        nombre: `Crear y agregar "${inputValue}"`,
                                        isNew: true
                                    });
                                }
                                return filtered;
                            }}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                return option.nombre;
                            }}
                            isOptionEqualToValue={(option, value) => {
                                if (typeof option === 'string' || typeof value === 'string') {
                                    return option === value;
                                }
                                if ('isNew' in option || 'isNew' in value) {
                                    return option.nombre === value.nombre;
                                }
                                return option.id === value.id;
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    label="Buscar opción de servicio"
                                    placeholder="Buscar opción de servicio"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingOpciones ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 'auto' }}>
                        <Button 
                            variant="contained" 
                            onClick={handleCreateTask} 
                            disabled={creatingTask || !taskLabel.trim()}
                            sx={{ height: 56 }}
                        >
                            {creatingTask ? 'Creando...' : isNewOption ? 'Crear y agregar' : 'Agregar'}
                        </Button>
                    </Grid>
                </Grid>

                <ListTableSimple
                    columns={[
                        { id: 'nombre', name: 'Nombre', format: (value) => value || '-' },
                        {
                            id: 'actions',
                            name: 'Acción',
                            format: (_value, row) => (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeleteTask(row.id)}
                                >
                                    Eliminar
                                </Button>
                            )
                        }
                    ]}
                    data={servicio.tareas || []}
                    headerBgColor="#1565c0"
                    headerTextColor="#fff"
                />
            </Stack>
        </Paper>
    );
};

export default ServiceDetailManualTasks;