import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, Button, Paper, Stack, TextField, Switch, FormControlLabel, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { cajaRepository } from '../../infrastructure/caja.repository';
import type { CajaCreateFormValues, CajaUpdateFormValues } from '../../domain/interfaces/caja.interface';
import { toast } from 'sonner';

export default function CajaFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CajaCreateFormValues>({
        defaultValues: {
            nombre: '',
            tipo: 'FISICA',
            activo: true,
        }
    });

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            setLoading(true);
            cajaRepository.obtener(id)
                .then((res) => {
                    const caja = res.data;
                    reset({
                        nombre: caja.nombre,
                        tipo: caja.tipo,
                        activo: caja.activo,
                    });
                })
                .catch(() => navigate('/cajas'))
                .finally(() => setLoading(false));
        }
    }, [id, navigate, reset]);

    const onSubmit = async (data: CajaUpdateFormValues) => {
        setLoading(true);
        try {
            if (isEditMode && id) {
                await cajaRepository.actualizar(id, data);
                toast.success('Caja actualizada con éxito');
            } else {
                await cajaRepository.registrar(data);
                toast.success('Caja registrada con éxito');
            }
            navigate('/cajas');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar la caja');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={4}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/cajas')} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={2}>
                    {isEditMode ? 'Editar Caja' : 'Nueva Caja'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Stack spacing={3}>
                        <TextField
                            label="Nombre"
                            fullWidth
                            {...register('nombre', { required: 'Nombre es requerido' })}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />
                        <TextField
                            select
                            label="Tipo"
                            fullWidth
                            defaultValue="FISICA"
                            {...register('tipo')}
                            SelectProps={{ native: true }}
                        >
                            <option value="FISICA">FISICA</option>
                            <option value="EN_LINEA">EN LÍNEA</option>
                        </TextField>
                        <FormControlLabel
                            control={<Switch defaultChecked {...register('activo')} />}
                            label="Activo"
                        />
                        <Button type="submit" variant="contained" disabled={loading}>
                            Guardar
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}
