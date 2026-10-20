import React from 'react';
import { 
    Box, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    TextField, 
    Stack, 
    Button,
    Paper,
    Typography,
    Alert
} from '@mui/material';
import { CalendarToday, FilterAlt } from '@mui/icons-material';

export interface PeriodFilterState {
    periodo: string;
    fecha_inicio?: string;
    fecha_fin?: string;
}

interface Props {
    filterState: PeriodFilterState;
    onChange: (newState: PeriodFilterState) => void;
    disabled?: boolean;
}

export const PERIODOS_OPCIONES = [
    { value: '24_horas', label: 'Últimas 24 horas' },
    { value: '7_dias', label: 'Últimos 7 días' },
    { value: '30_dias', label: 'Últimos 30 días' },
    { value: 'este_mes', label: 'Este mes' },
    { value: 'custom', label: 'Rango personalizado' },
];

export const FacturacionPeriodFilter: React.FC<Props> = ({ filterState, onChange, disabled }) => {
    const [periodo, setPeriodo] = React.useState(filterState.periodo || 'este_mes');
    const [fechaInicio, setFechaInicio] = React.useState(filterState.fecha_inicio || '');
    const [fechaFin, setFechaFin] = React.useState(filterState.fecha_fin || '');
    const [errorFechas, setErrorFechas] = React.useState<string | null>(null);

    React.useEffect(() => {
        setPeriodo(filterState.periodo || 'este_mes');
        setFechaInicio(filterState.fecha_inicio || '');
        setFechaFin(filterState.fecha_fin || '');
    }, [filterState]);

    const handlePeriodoChange = (newPeriodo: string) => {
        setPeriodo(newPeriodo);
        setErrorFechas(null);

        if (newPeriodo !== 'custom') {
            onChange({
                periodo: newPeriodo,
                fecha_inicio: undefined,
                fecha_fin: undefined
            });
        }
    };

    const handleAplicarRango = () => {
        if (!fechaInicio || !fechaFin) {
            setErrorFechas('Debe especificar ambas fechas (inicio y fin)');
            return;
        }

        if (new Date(fechaInicio) > new Date(fechaFin)) {
            setErrorFechas('La fecha inicial no puede ser posterior a la fecha final');
            return;
        }

        setErrorFechas(null);
        onChange({
            periodo: 'custom',
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        });
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 2, 
                mb: 3, 
                border: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: 'background.paper'
            }}
        >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600}>
                        Período fiscal:
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="periodo-select-label">Período</InputLabel>
                    <Select
                        labelId="periodo-select-label"
                        value={periodo}
                        label="Período"
                        disabled={disabled}
                        onChange={(e) => handlePeriodoChange(e.target.value)}
                    >
                        {PERIODOS_OPCIONES.map((opcion) => (
                            <MenuItem key={opcion.value} value={opcion.value}>
                                {opcion.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {periodo === 'custom' && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" flexWrap="wrap">
                        <TextField
                            label="Desde"
                            type="date"
                            size="small"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={disabled}
                            sx={{ minWidth: 160 }}
                        />
                        <TextField
                            label="Hasta"
                            type="date"
                            size="small"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={disabled}
                            sx={{ minWidth: 160 }}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<FilterAlt />}
                            onClick={handleAplicarRango}
                            disabled={disabled}
                            sx={{ height: 40 }}
                        >
                            Filtrar
                        </Button>
                    </Stack>
                )}
            </Stack>

            {errorFechas && (
                <Alert severity="error" sx={{ mt: 2, py: 0.5 }}>
                    {errorFechas}
                </Alert>
            )}
        </Paper>
    );
};
