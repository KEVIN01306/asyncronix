import { useEffect, useState } from 'react';
import { Box, Paper, TextField, MenuItem, Button, Typography, Grid, Chip } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import type { FiltrosReporteFinanciero } from '../../domain/reportes.model';
import { sucursalRepository } from '../../../sucursales/infrastructure/repositories/sucursal.repository';

interface Props {
    filtros: FiltrosReporteFinanciero;
    onFiltrosChange: (nuevosFiltros: FiltrosReporteFinanciero) => void;
    onAplicarFiltros: () => void;
    cargando?: boolean;
    sucursalesPadre?: any[];
}

const FiltrosReporte = ({ filtros, onFiltrosChange, onAplicarFiltros, cargando, sucursalesPadre }: Props) => {
    const permisos = useAuthStore(status => status.user?.permisos || []);
    const [sucursalesLocales, setSucursalesLocales] = useState<any[]>([]);

    useEffect(() => {
        if (!sucursalesPadre) {
            sucursalRepository.listar(99, 0).then(res => setSucursalesLocales(res.data)).catch(console.error);
        }
    }, [sucursalesPadre]);

    const sucursales = sucursalesPadre || sucursalesLocales;

    const isAdminReportes = permisos.includes('ADMIN_REPORTES');

    const handleChange = (field: keyof FiltrosReporteFinanciero, value: any) => {
        onFiltrosChange({ ...filtros, [field]: value });
    };

    // Helper para mapear etiquetas visuales limpias en los Chips del selector múltiple
    const getLabel = (value: string, type: 'metodo' | 'entidad') => {
        if (type === 'metodo') {
            if (value === 'EFECTIVO') return 'Efectivo';
            if (value === 'TARJETA') return 'Tarjeta';
            if (value === 'TRANSFERENCIA') return 'Transferencia';
        }
        if (type === 'entidad') {
            if (value === 'CAJA') return 'Caja';
            if (value === 'CUENTA') return 'Cuenta Bancaria';
        }
        return value;
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box mb={2.5}>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                    Parámetros de Consulta
                </Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary" mt={0.5}>
                    Filtros del Reporte
                </Typography>
            </Box>

            <Grid container spacing={2} alignItems="flex-end">
                {/* Fechas */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <TextField
                        type="date"
                        label="Fecha Inicio"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={filtros.fecha_inicio || ''}
                        onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <TextField
                        type="date"
                        label="Fecha Fin"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={filtros.fecha_fin || ''}
                        onChange={(e) => handleChange('fecha_fin', e.target.value)}
                    />
                </Grid>

                {/* Sucursales (Solo admin) */}
                {isAdminReportes && (
                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                        <TextField
                            select
                            SelectProps={{
                                multiple: true,
                                renderValue: (selected: any) => (
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                        {selected.map((val: any) => {
                                            const name = sucursales.find(s => s.id === val)?.nombre || val;
                                            return <Chip key={val} label={name} size="small" variant="outlined" sx={{ borderRadius: 1 }} />;
                                        })}
                                    </Box>
                                )
                            }}
                            label="Sucursales"
                            fullWidth
                            value={filtros.sucursal_ids || []}
                            onChange={(e) => handleChange('sucursal_ids', e.target.value)}
                        >
                            {sucursales.length > 0 ? sucursales.map((suc) => (
                                <MenuItem key={suc.id} value={suc.id}>
                                    {suc.nombre}
                                </MenuItem>
                            )) : (
                                <MenuItem disabled value="">Cargando sucursales...</MenuItem>
                            )}
                        </TextField>
                    </Grid>
                )}

                {/* Método de Pago */}
                <Grid size={{ xs: 12, sm: 6, md: isAdminReportes ? 2.25 : 3.5 }}>
                    <TextField
                        select
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected: any) => (
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {selected.map((val: string) => (
                                        <Chip key={val} label={getLabel(val, 'metodo')} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                    ))}
                                </Box>
                            )
                        }}
                        label="Métodos de Pago"
                        fullWidth
                        value={filtros.metodos_pago || []}
                        onChange={(e) => handleChange('metodos_pago', e.target.value)}
                    >
                        <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                        <MenuItem value="TARJETA">Tarjeta</MenuItem>
                        <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                    </TextField>
                </Grid>

                {/* Entidades */}
                <Grid size={{ xs: 12, sm: 6, md: isAdminReportes ? 2.25 : 3.5 }}>
                    <TextField
                        select
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected: any) => (
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {selected.map((val: string) => (
                                        <Chip key={val} label={getLabel(val, 'entidad')} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                    ))}
                                </Box>
                            )
                        }}
                        label="Tipos de Entidad"
                        fullWidth
                        value={filtros.entidad_tipos || []}
                        onChange={(e) => handleChange('entidad_tipos', e.target.value)}
                    >
                        <MenuItem value="CAJA">Caja Física / En Línea</MenuItem>
                        <MenuItem value="CUENTA">Cuenta Bancaria</MenuItem>
                    </TextField>
                </Grid>

                {/* Botón de acción */}
                <Grid size={{ xs: 12, md: 1 }} sx={{ ml: 'auto' }}>
                    <Button
                        variant="contained"
                        startIcon={<FilterList />}
                        onClick={onAplicarFiltros}
                        disabled={cargando}
                        fullWidth
                        sx={{
                            py: 1.75, // Ajuste preciso para igualar la altura visual de los inputs estilo Apple
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Filtrar
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default FiltrosReporte;