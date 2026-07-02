import useMediaQuery from '@mui/material/useMediaQuery';
import { Add, Article, Edit, FilterList, Search, Visibility } from '@mui/icons-material';
import { Autocomplete, Box, Button, Chip, Paper, TextField, TableContainer, useTheme, AlertTitle, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Stack, InputAdornment } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { servicioRepository, type ServicioVehiculoListParams } from '../../infrastructure/repositories/servicio.repository';
import { usuarioRepository } from '../../../usuarios/infrastructure/repositories/usuario.repository';
import { ESTADO_SERVICIO_VEHICULO } from '../../domain/servicio.constants';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ServiciosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [servicios, setServicios] = useState<ServicioVehiculo[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [codigo, setCodigo] = useState('');
    const [placa, setPlaca] = useState('');
    const [estado, setEstado] = useState('');
    const [tempCodigo, setTempCodigo] = useState('');
    const [tempPlaca, setTempPlaca] = useState('');
    const [tempEstado, setTempEstado] = useState('');
    const [mechanicOptions, setMechanicOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [selectedMechanic, setSelectedMechanic] = useState<{ id: string; label: string } | null>(null);
    const [tempSelectedMechanic, setTempSelectedMechanic] = useState<{ id: string; label: string } | null>(null);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const user = useAuthStore((state) => state.user);
    const hasSalidaPermission = useAuthStore((state) => state.user?.permisos.includes('SALIDA_SERVICIOS')) ?? false;
    const sucursalId = user?.sucursal_id ?? null;

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const getEstadoColor = (estadoValue: string) => {
        switch (estadoValue) {
            case ESTADO_SERVICIO_VEHICULO.RECEPCION:
                return 'warning';
            case ESTADO_SERVICIO_VEHICULO.FINALIZADO:
            case ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA:
                return 'success';
            case ESTADO_SERVICIO_VEHICULO.CANCELADO:
                return 'error';
            default:
                return 'info';
        }
    };

    const columns = [
        { id: 'vehiculo_id', name: 'Placa', format: (_value: any, row: any) => row.vehiculo?.placa || 'N/A' },
        { id: 'modelo', name: 'Modelo', format: (_value: any, row: any) => row.vehiculo?.modelo_nombre || 'N/A' },
        { id: 'tipo_servicio_id', name: 'Tipo de servicio', format: (_value: any, row: any) => row.tipo_servicio?.nombre || 'N/A' },
        { id: 'mecanico', name: 'Mecánico', format: (_value: any, row: any) => row.mecanico ? `${row.mecanico.nombre} ${row.mecanico.apellido || ''}`.trim() : 'N/A' },
        {
            id: 'estado',
            name: 'Estado',
            format: (value: any) => <Chip variant='outlined' label={value} color={getEstadoColor(value)} size='small' />
        },
        { id: 'total', name: 'Total', format: (value: any) => formatMoney(Number(value ?? 0)) },
        { id: 'created_at', name: 'Fecha', format: (value: any) => value ? new Date(value).toLocaleString() : 'N/A' }
    ];

    const currentMechanicId = useMemo(() => selectedMechanic?.id || '', [selectedMechanic]);

    const queryParams = useMemo<ServicioVehiculoListParams>(() => ({
        limit,
        offset,
        estado: searchParams.get('estado') || undefined,
        placa: searchParams.get('placa') || undefined,
        codigo: searchParams.get('codigo') || undefined,
        q: searchParams.get('q') || undefined,
        mecanico_id: searchParams.get('mecanico_id') || undefined
    }), [limit, offset, searchParams]);

    const fetchServicios = useCallback(async () => {
        setLoading(true);
        try {
            const response = await servicioRepository.listar(queryParams);
            setServicios(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar los servicios');
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    const loadMechanics = useCallback(async () => {
        if (!sucursalId) return;
        try {
            const response = await usuarioRepository.listar(100, 0, null, null, sucursalId);
            setMechanicOptions((response.data ?? []).map((userData) => ({ id: userData.id, label: `${userData.nombre} ${userData.apellido ?? ''}`.trim() })));
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar la lista de mecánicos');
        }
    }, [sucursalId]);

    useEffect(() => {
        loadMechanics();
    }, [loadMechanics]);

    useEffect(() => {
        setSearchText(searchParams.get('q') || '');
        setCodigo(searchParams.get('codigo') || '');
        setPlaca(searchParams.get('placa') || '');
        setEstado(searchParams.get('estado') || '');
        const mechanicId = searchParams.get('mecanico_id') || '';
        if (mechanicId) {
            const option = mechanicOptions.find((mechanic) => mechanic.id === mechanicId);
            setSelectedMechanic(option ?? { id: mechanicId, label: 'Mecánico seleccionado' });
        } else {
            setSelectedMechanic(null);
        }
    }, [searchParams, mechanicOptions]);

    useEffect(() => {
        if (filterModalOpen) {
            setTempCodigo(codigo);
            setTempPlaca(placa);
            setTempEstado(estado);
            setTempSelectedMechanic(selectedMechanic);
        }
    }, [filterModalOpen, codigo, placa, estado, selectedMechanic]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            const params = new URLSearchParams();
            params.set('limit', String(limit));
            params.set('offset', String(offset));
            if (searchText) params.set('q', searchText);
            if (codigo) params.set('codigo', codigo);
            if (placa) params.set('placa', placa);
            if (estado) params.set('estado', estado);
            if (currentMechanicId) params.set('mecanico_id', currentMechanicId);
            setSearchParams(params, { replace: true });
        }, 450);

        return () => window.clearTimeout(timeout);
    }, [limit, offset, searchText, codigo, placa, estado, currentMechanicId, setSearchParams]);

    useEffect(() => {
        fetchServicios();
    }, [fetchServicios]);

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />, 
            color: 'gray',
            onClick: (row: any) => navigate(`/servicios-vehiculo/${row.id}`)
        },
        {
            name: 'Hoja de servicio',
            icon: <Article fontSize="small" />, 
            color: 'gray',
            onClick: (row: any) => navigate(`/servicios-vehiculo/${row.id}/hoja`),
            visible: (row: any) => row.estado === ESTADO_SERVICIO_VEHICULO.FINALIZADO
        },
        {
            name: 'Ver configuración',
            icon: <Visibility fontSize="small" />, 
            color: 'primary.main',
            visible: (row: any) => row.estado !== ESTADO_SERVICIO_VEHICULO.FINALIZADO && [ESTADO_SERVICIO_VEHICULO.EN_SERVICIO, ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS, ESTADO_SERVICIO_VEHICULO.RECEPCION].includes(row.estado),
            onClick: (row: any) => navigate(`/servicios-vehiculo/${row.id}/configuracion`)
        },
        {
            name: 'Ver progreso',
            icon: <Visibility fontSize="small" />,
            color: 'info.main',
            visible: (row: any) => [ESTADO_SERVICIO_VEHICULO.EN_SERVICIO, ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS].includes(row.estado),
            onClick: (row: any) => navigate(`/servicios-vehiculo/${row.id}/progreso`)
        },
        {
            name: 'Dar salida',
            icon: <Visibility fontSize="small" />,
            color: 'success.main',
            visible: (row: any) => hasSalidaPermission && row.estado === ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA,
            onClick: (row: any) => navigate(`/servicios-vehiculo/${row.id}/salida`)
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />, 
            color: 'primary.main',
            visible: (row: any) => row.estado !== ESTADO_SERVICIO_VEHICULO.FINALIZADO,
            onClick: (row: any) => navigate(`/servicios-vehiculo/${row.id}/editar`)
        }
    ];

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('limit', String(limit));
        params.set('offset', String(page * limit));
        setSearchParams(params, { replace: true });
    };

    const handleRowsPerPageChange = (newLimit: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('limit', String(newLimit));
        params.set('offset', '0');
        setSearchParams(params, { replace: true });
    };

    const handleClearFilters = () => {
        setTempCodigo('');
        setTempPlaca('');
        setTempEstado('');
        setTempSelectedMechanic(null);
        setCodigo('');
        setPlaca('');
        setEstado('');
        setSelectedMechanic(null);

        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('offset', '0');
        if (searchText) params.set('q', searchText);
        setSearchParams(params, { replace: true });
        setFilterModalOpen(false);
    };

    const handleApplyFilters = () => {
        setCodigo(tempCodigo);
        setPlaca(tempPlaca);
        setEstado(tempEstado);
        setSelectedMechanic(tempSelectedMechanic);

        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('offset', '0');
        if (searchText) params.set('q', searchText);
        if (tempCodigo) params.set('codigo', tempCodigo);
        if (tempPlaca) params.set('placa', tempPlaca);
        if (tempEstado) params.set('estado', tempEstado);
        if (tempSelectedMechanic?.id) params.set('mecanico_id', tempSelectedMechanic.id);
        setSearchParams(params, { replace: true });
        setFilterModalOpen(false);
    };

    return (
        <Box p={isMobile ? 2 : 4}>

            <Alert
            severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Servicios</AlertTitle>
                Administra tus servicios, crea nuevos registros y actualiza la información de contacto en cualquier momento.
            </Alert>
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2} mb={2} component={Paper} p={2}>
                <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={1} width="100%">
                    <TextField
                        fullWidth
                        label="Búsqueda general"
                        placeholder="Código, ID, placa, tipo de servicio o mecánico"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="primary" />
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button variant="outlined" fullWidth={isMobile} startIcon={<FilterList />} onClick={() => setFilterModalOpen(true)}>
                        Más filtros
                    </Button>
                </Box>
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/servicios-vehiculo/nuevo')}>
                    Nuevo servicio
                </Button>
            </Box>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Filtros</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Código / ID"
                            value={tempCodigo}
                            onChange={(event) => setTempCodigo(event.target.value)}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Placa"
                            value={tempPlaca}
                            onChange={(event) => setTempPlaca(event.target.value)}
                        />
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Estado"
                            value={tempEstado}
                            focused
                            onChange={(event) => setTempEstado(event.target.value)}
                            SelectProps={{ native: true }}
                        >
                            <option value="">Todos</option>
                            {Object.values(ESTADO_SERVICIO_VEHICULO).map((estadoOption) => (
                                <option key={estadoOption} value={estadoOption}>{estadoOption}</option>
                            ))}
                        </TextField>
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={mechanicOptions}
                            value={tempSelectedMechanic}
                            getOptionLabel={(option) => option.label}
                            onChange={(_, newValue) => setTempSelectedMechanic(newValue)}
                            renderInput={(params) => <TextField {...params} label={sucursalId ? 'Mecánico de la sucursal' : 'Mecánico'} />}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleClearFilters} variant="outlined">Limpiar</Button>
                    <Button onClick={handleApplyFilters} variant="contained">Aplicar</Button>
                </DialogActions>
            </Dialog>

            <TableContainer>
                {loading ? (
                    <Loading/>
                ) : (
                    <ListTable
                        data={servicios}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: handlePageChange,
                            onRowsPerPageChange: handleRowsPerPageChange
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default ServiciosListPage;
