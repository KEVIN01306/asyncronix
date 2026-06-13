import useMediaQuery from '@mui/material/useMediaQuery';
import { Add, Article, Edit, Visibility } from '@mui/icons-material';
import { Autocomplete, Box, Button, Chip, Paper, TextField, TableContainer, useTheme, AlertTitle, Alert } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { servicioRepository, type ServicioListParams } from '../../infrastructure/repositories/servicio.repository';
import { usuarioRepository } from '../../../usuarios/infrastructure/repositories/usuario.repository';
import { ESTADO_SERVICIO } from '../../domain/servicio.constants';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ServiciosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [codigo, setCodigo] = useState('');
    const [placa, setPlaca] = useState('');
    const [estado, setEstado] = useState('');
    const [mechanicOptions, setMechanicOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [selectedMechanic, setSelectedMechanic] = useState<{ id: string; label: string } | null>(null);

    const isAdmin = useAuthStore((state) => state.user?.permisos.includes('ADMIN_SERVICIOS')) ?? false;
    const hasSalidaPermission = useAuthStore((state) => state.user?.permisos.includes('SALIDA_SERVICIOS')) ?? false;

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const getEstadoColor = (estadoValue: string) => {
        switch (estadoValue) {
            case ESTADO_SERVICIO.RECEPCION:
                return 'warning';
            case ESTADO_SERVICIO.FINALIZADO:
            case ESTADO_SERVICIO.LISTO_ENTREGA:
                return 'success';
            case ESTADO_SERVICIO.CANCELADO:
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

    const queryParams = useMemo<ServicioListParams>(() => ({
        limit,
        offset,
        estado: searchParams.get('estado') || undefined,
        placa: searchParams.get('placa') || undefined,
        codigo: searchParams.get('codigo') || undefined,
        q: searchParams.get('q') || undefined,
        mecanico_id: isAdmin ? (searchParams.get('mecanico_id') || undefined) : undefined
    }), [limit, offset, searchParams, isAdmin]);

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
        if (!isAdmin) return;
        try {
            const response = await usuarioRepository.listar(100, 0);
            setMechanicOptions((response.data ?? []).map((user) => ({ id: user.id, label: `${user.nombre} ${user.apellido ?? ''}`.trim() })));
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar la lista de mecánicos');
        }
    }, [isAdmin]);

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
        const timeout = window.setTimeout(() => {
            const params = new URLSearchParams();
            params.set('limit', String(limit));
            params.set('offset', String(offset));
            if (searchText) params.set('q', searchText);
            if (codigo) params.set('codigo', codigo);
            if (placa) params.set('placa', placa);
            if (estado) params.set('estado', estado);
            if (isAdmin && currentMechanicId) params.set('mecanico_id', currentMechanicId);
            setSearchParams(params, { replace: true });
        }, 450);

        return () => window.clearTimeout(timeout);
    }, [limit, offset, searchText, codigo, placa, estado, currentMechanicId, isAdmin, setSearchParams]);

    useEffect(() => {
        fetchServicios();
    }, [fetchServicios]);

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />, 
            color: 'gray',
            onClick: (row: any) => navigate(`/servicios/${row.id}`)
        },
        {
            name: 'Hoja de servicio',
            icon: <Article fontSize="small" />, 
            color: 'gray',
            onClick: (row: any) => navigate(`/servicios/${row.id}/hoja`),
            visible: (row: any) => row.estado === ESTADO_SERVICIO.FINALIZADO
        },
        {
            name: 'Ver configuración',
            icon: <Visibility fontSize="small" />, 
            color: 'primary.main',
            visible: (row: any) => row.estado !== ESTADO_SERVICIO.FINALIZADO && [ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.EN_PRUEBAS, ESTADO_SERVICIO.RECEPCION].includes(row.estado),
            onClick: (row: any) => navigate(`/servicios/${row.id}/configuracion`)
        },
        {
            name: 'Ver progreso',
            icon: <Visibility fontSize="small" />,
            color: 'info.main',
            visible: (row: any) => [ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.EN_PRUEBAS].includes(row.estado),
            onClick: (row: any) => navigate(`/servicios/${row.id}/progreso`)
        },
        {
            name: 'Dar salida',
            icon: <Visibility fontSize="small" />,
            color: 'success.main',
            visible: (row: any) => hasSalidaPermission && row.estado === ESTADO_SERVICIO.LISTO_ENTREGA,
            onClick: (row: any) => navigate(`/servicios/${row.id}/salida`)
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />, 
            color: 'primary.main',
            visible: (row: any) => row.estado !== ESTADO_SERVICIO.FINALIZADO,
            onClick: (row: any) => navigate(`/servicios/${row.id}/editar`)
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

    return (
        <Box p={isMobile ? 2 : 4}>

            <Alert
            severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Servicios</AlertTitle>
                Administra tus servicios, crea nuevos registros y actualiza la información de contacto en cualquier momento.
            </Alert>
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" gap={2} mb={2} component={Paper} p={2}>
                <TextField
                        fullWidth
                        label="Buscar servicio"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                    />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/servicios/nuevo')}>
                    Nuevo servicio
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: isAdmin ? 'repeat(4, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))' }} gap={2}>

                    <TextField
                        fullWidth
                        size="small"
                        label="Código / ID"
                        value={codigo}
                        onChange={(event) => setCodigo(event.target.value)}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        label="Placa"
                        value={placa}
                        onChange={(event) => setPlaca(event.target.value)}
                    />
                    <TextField
                        fullWidth
                        select
                        focused
                        size="small"
                        label="Estado"
                        value={estado}
                        onChange={(event) => setEstado(event.target.value)}
                        SelectProps={{ native: true }}
                    >
                        <option value="">Todos</option>
                        {Object.values(ESTADO_SERVICIO).map((estadoOption) => (
                            <option key={estadoOption} value={estadoOption}>{estadoOption}</option>
                        ))}
                    </TextField>
                    {isAdmin && (
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={mechanicOptions}
                            value={selectedMechanic}
                            getOptionLabel={(option) => option.label}
                            onChange={(_, newValue) => setSelectedMechanic(newValue)}
                            renderInput={(params) => <TextField {...params} label="Mecánico" />}
                        />
                    )}
                </Box>
            </Paper>

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
