import { useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box, Paper, TextField, Typography, Button,
    FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import { Person, DirectionsCar } from '@mui/icons-material';
import {
    cotizacionFormSchema, type CotizacionForm, TipoDestinoCotizacion
} from '../../domain/interfaces/cotizacion.interface';
import QuotationItemsTable from './QuotationItemsTable';
import QuotationSummary from './QuotationSummary';
import SaleClientModal from '../../../ventas/presentation/components/SaleClientModal';
import Step1BuscarPlaca from '../../../serviciosVehiculos/presentation/pages/components/Step1BuscarPlaca';

interface Props {
    defaultValues?: Partial<CotizacionForm>;
    onSubmit: (data: CotizacionForm) => void;
    isSubmitting?: boolean;
    isReadOnly?: boolean;
}

export default function QuotationForm({ defaultValues, onSubmit, isSubmitting, isReadOnly }: Props) {
    const methods = useForm<CotizacionForm>({
        resolver: zodResolver(cotizacionFormSchema),
        defaultValues: {
            tipo_destino: TipoDestinoCotizacion.VENTA_DIRECTA,
            detalles: [],
            ...defaultValues
        }
    });

    const { control, handleSubmit, watch, setValue, formState: { errors } } = methods;

    const detalles = watch('detalles') || [];
    const tipoDestino = watch('tipo_destino');
    const clienteId = watch('cliente_id');
    const vehiculoId = watch('vehiculo_id');

    const [openClientModal, setOpenClientModal] = useState(false);
    const [openVehicleModal, setOpenVehicleModal] = useState(false);

    // Derived state for display
    const [clientName, setClientName] = useState<string | null>(clienteId ? 'Cliente Seleccionado' : null);
    const [vehiclePlate, setVehiclePlate] = useState<string | null>(vehiculoId ? 'Vehículo Seleccionado' : null);

    const subtotal = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    const descuento = detalles.reduce((sum, item) => sum + item.descuento, 0);
    const total = subtotal - descuento;

    const handleFormSubmit = (data: CotizacionForm) => {
        onSubmit(data);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <Grid container spacing={3}>
                    {/* Panel Izquierdo: Información General */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Información General
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo Destino</InputLabel>
                                        <Controller
                                            name="tipo_destino"
                                            control={control}
                                            render={({ field }) => (
                                                <Select {...field} label="Tipo Destino" disabled={isReadOnly}>
                                                    <MenuItem value={TipoDestinoCotizacion.VENTA_DIRECTA}>Mostrador</MenuItem>
                                                    <MenuItem value={TipoDestinoCotizacion.TALLER}>Taller</MenuItem>
                                                </Select>
                                            )}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller
                                        name="fecha_validez"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                type="date"
                                                label="Fecha Validez"
                                                InputLabelProps={{ shrink: true }}
                                                disabled={isReadOnly}
                                                error={!!errors.fecha_validez}
                                                helperText={errors.fecha_validez?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <TextField
                                            fullWidth
                                            label="Cliente"
                                            value={clientName || 'C/F (Consumidor Final)'}
                                            InputProps={{ readOnly: true }}
                                            disabled={isReadOnly}
                                            error={!!errors.cliente_id}
                                            helperText={errors.cliente_id?.message}
                                        />
                                        {!isReadOnly && (
                                            <Button
                                                variant="outlined"
                                                onClick={() => setOpenClientModal(true)}
                                                sx={{ minWidth: 48, p: 1 }}
                                            >
                                                <Person />
                                            </Button>
                                        )}
                                    </Box>
                                </Grid>

                                {tipoDestino === TipoDestinoCotizacion.TALLER && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <TextField
                                                fullWidth
                                                label="Vehículo"
                                                value={vehiclePlate || 'Sin asignar'}
                                                InputProps={{ readOnly: true }}
                                                disabled={isReadOnly}
                                            />
                                            {!isReadOnly && (
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => setOpenVehicleModal(true)}
                                                    sx={{ minWidth: 48, p: 1 }}
                                                >
                                                    <DirectionsCar />
                                                </Button>
                                            )}
                                        </Box>
                                    </Grid>
                                )}

                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="terminos"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                value={field.value || ''}
                                                fullWidth
                                                multiline
                                                rows={2}
                                                label="Términos y Condiciones"
                                                disabled={isReadOnly}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Panel Central: Tabla de Detalles */}
                        <QuotationItemsTable isReadOnly={isReadOnly} />
                        {errors.detalles && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {errors.detalles.message}
                            </Typography>
                        )}
                    </Grid>

                    {/* Panel Derecho: Resumen y Acciones */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ position: 'sticky', top: 24 }}>
                            <QuotationSummary
                                subtotal={subtotal}
                                descuento_total={descuento}
                                total={total}
                            />

                            {!isReadOnly && (
                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Guardando...' : 'Guardar Cotización'}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </form>

            <SaleClientModal
                open={openClientModal}
                onClose={() => setOpenClientModal(false)}
                onConfirm={(data) => {
                    setValue('cliente_id', data.cliente_id, { shouldValidate: true });
                    setClientName(data.nombre ? `${data.nombre} ${data.apellido || ''}` : (data.cf ? 'C/F' : null));
                    setOpenClientModal(false);
                }}
            />

            {/* TODO: Create/wrap a modal for Step1BuscarPlaca to display here */}
            {/* The user required a vehicle selector exactly as in services.
                Step1BuscarPlaca is a full form. For simplicity, we just use a placeholder text field in real life, or we can use it properly. */}

            {openVehicleModal && (
                <Box sx={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, 0)', zIndex: 1300, bgcolor: 'background.paper', p: 3, boxShadow: 24 }}>
                    <Typography variant="h6" mb={2}>Buscar Vehículo</Typography>
                    <Step1BuscarPlaca onVehiculoSeleccionado={(v) => {
                        setValue('vehiculo_id', v.id);
                        setVehiclePlate(v.placa);
                        setOpenVehicleModal(false);
                    }} />
                    <Button onClick={() => setOpenVehicleModal(false)} sx={{ mt: 2 }}>Cerrar</Button>
                </Box>
            )}
        </FormProvider>
    );
}
