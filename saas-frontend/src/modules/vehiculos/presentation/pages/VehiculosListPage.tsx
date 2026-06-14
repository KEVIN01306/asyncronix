import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, Autocomplete, TextField, Stack, Avatar, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Visibility, Edit, Search, FilterList } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { vehiculoRepository } from '../../infrastructure/vehiculo.repository';
import { vehiculoTipoRepository } from '../../infrastructure/vehiculo-tipo.repository';
import { modelosRepository } from '../../../modelos/infrastructure/modelos.repository';
import { marcasRepository } from '../../../marcas/infrastructure/marcas.repository';
import { lineasRepository } from '../../../lineas/infrastructure/lineas.repository';
import type { Vehiculo } from '../../domain/interfaces/vehiculo.interface';
import type { VehiculoTipo } from '../../domain/interfaces/vehiculo-tipo.interface';
import type { Modelo } from '../../../modelos/domain/interface/modelo.interface';
import type { Marca } from '../../../marcas/domain/interface/marca.interface';
import type { Linea } from '../../../lineas/domain/interface/linea.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const VehiculosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [tipos, setTipos] = useState<VehiculoTipo[]>([]);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [lineas, setLineas] = useState<Linea[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [tempPlaca, setTempPlaca] = useState('');
    const [tempVehiculoTipo, setTempVehiculoTipo] = useState<VehiculoTipo | null>(null);
    const [tempModelo, setTempModelo] = useState<Modelo | null>(null);
    const [tempMarca, setTempMarca] = useState<Marca | null>(null);
    const [tempLinea, setTempLinea] = useState<Linea | null>(null);
    const [tempClienteDpi, setTempClienteDpi] = useState('');

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const q = searchParams.get('q') || '';
    const placa = searchParams.get('placa') || '';
    const vehiculo_tipo_id = searchParams.get('vehiculo_tipo_id') || '';
    const modelo_id = searchParams.get('modelo_id') || '';
    const marca_id = searchParams.get('marca_id') || '';
    const linea_id = searchParams.get('linea_id') || '';
    const cliente_dpi = searchParams.get('cliente_dpi') || '';

    const fetchVehiculos = useCallback(async () => {
        setLoading(true);
        try {
            const filters: Record<string, any> = {};
            if (q) filters.q = q;
            if (placa) filters.placa = placa;
            if (vehiculo_tipo_id) filters.vehiculo_tipo_id = vehiculo_tipo_id;
            if (modelo_id) filters.modelo_id = modelo_id;
            if (marca_id) filters.marca_id = marca_id;
            if (linea_id) filters.linea_id = linea_id;
            if (cliente_dpi) filters.cliente_dpi = cliente_dpi;

            const response = await vehiculoRepository.listar(limit, offset, filters);
            setVehiculos(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, q, placa, vehiculo_tipo_id, modelo_id, marca_id, linea_id, cliente_dpi]);

    const fetchOptions = useCallback(async () => {
        try {
            const [tiposRes, modelosRes, marcasRes, lineasRes] = await Promise.all([
                vehiculoTipoRepository.listar(100, 0),
                modelosRepository.listar(100, 0),
                marcasRepository.listar(100, 0),
                lineasRepository.listar(100, 0),
            ]);
            setTipos(tiposRes.data);
            setModelos(modelosRes.data);
            setMarcas(marcasRes.data);
            setLineas(lineasRes.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    useEffect(() => {
        setSearchQuery(q);
    }, [q]);

    useEffect(() => {
        fetchVehiculos();
    }, [fetchVehiculos]);

    const columns = [
        {
            id: 'avatar_url',
            name: 'Avatar',
            format: (_value: string | undefined, row: Vehiculo) => (
                <Avatar
                    src={row.avatar_url ? `${import.meta.env.VITE_API_URL}/${row.avatar_url}` : undefined}
                    sx={{ width: 48, height: 48, bgcolor: 'background.default' }}
                    alt={row.placa}
                >
                    {row.placa?.charAt(0) ?? '-'}
                </Avatar>
            )
        },
        { id: 'placa', name: 'Placa' },
        {
            id: 'vehiculo_tipo_id',
            name: 'Tipo de vehículo',
            format: (_value: string, row: Vehiculo) => tipos.find((tipo) => tipo.id === row.vehiculo_tipo_id)?.tipo ?? '-'
        },
        {
            id: 'modelo_id',
            name: 'Modelo',
            format: (_value: string, row: Vehiculo) => modelos.find((modelo) => modelo.id === row.modelo_id)?.modelo ?? '-'
        },
        {
            id: 'marca',
            name: 'Marca',
            format: (_value: string, row: Vehiculo) => modelos.find((modelo) => modelo.id === row.modelo_id)?.marca ?? '-'
        },
        {
            id: 'linea',
            name: 'Línea',
            format: (_value: string, row: Vehiculo) => modelos.find((modelo) => modelo.id === row.modelo_id)?.linea ?? '-'
        },
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: Vehiculo) => navigate(`/vehiculos/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'primary',
            onClick: (row: Vehiculo) => navigate(`/vehiculos/${row.id}/editar`),
        }
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                Administra los vehículos registrados, usa la búsqueda general para placa, tipo, modelo, marca, línea o cliente y aplica filtros adicionales desde el modal.
            </Alert>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        label="Buscar vehículos"
                        fullWidth
                        value={searchQuery}
                        onChange={(event) => {
                            const value = event.target.value;
                            setSearchQuery(value);
                            const params: Record<string, string> = { limit: limit.toString(), offset: '0' };
                            if (value) params.q = value;
                            if (placa) params.placa = placa;
                            if (vehiculo_tipo_id) params.vehiculo_tipo_id = vehiculo_tipo_id;
                            if (modelo_id) params.modelo_id = modelo_id;
                            if (marca_id) params.marca_id = marca_id;
                            if (linea_id) params.linea_id = linea_id;
                            if (cliente_dpi) params.cliente_dpi = cliente_dpi;
                            setSearchParams(params);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button variant="outlined" startIcon={<FilterList />} onClick={() => {
                        setTempPlaca(placa);
                        setTempVehiculoTipo(tipos.find((item) => item.id === vehiculo_tipo_id) ?? null);
                        setTempModelo(modelos.find((item) => item.id === modelo_id) ?? null);
                        setTempMarca(marcas.find((item) => item.id === marca_id) ?? null);
                        setTempLinea(lineas.find((item) => item.id === linea_id) ?? null);
                        setTempClienteDpi(cliente_dpi);
                        setFilterModalOpen(true);
                    }}>
                        Más filtros
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/vehiculos/nuevo')}
                        sx={{ minWidth: { xs: '100%', sm: 180 } }}
                    >
                        Nuevo vehículo
                    </Button>
                </Stack>
            </Paper>

            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={vehiculos}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => {
                                const newOffset = newPage * limit;
                                const params: Record<string, string> = { limit: limit.toString(), offset: newOffset.toString() };
                                if (q) params.q = q;
                                if (placa) params.placa = placa;
                                if (vehiculo_tipo_id) params.vehiculo_tipo_id = vehiculo_tipo_id;
                                if (modelo_id) params.modelo_id = modelo_id;
                                if (marca_id) params.marca_id = marca_id;
                                if (linea_id) params.linea_id = linea_id;
                                if (cliente_dpi) params.cliente_dpi = cliente_dpi;
                                setSearchParams(params);
                            },
                            onRowsPerPageChange: (newLimit) => {
                                const params: Record<string, string> = { limit: newLimit.toString(), offset: '0' };
                                if (q) params.q = q;
                                if (placa) params.placa = placa;
                                if (vehiculo_tipo_id) params.vehiculo_tipo_id = vehiculo_tipo_id;
                                if (modelo_id) params.modelo_id = modelo_id;
                                if (marca_id) params.marca_id = marca_id;
                                if (linea_id) params.linea_id = linea_id;
                                if (cliente_dpi) params.cliente_dpi = cliente_dpi;
                                setSearchParams(params);
                            }
                        }}
                    />
                )}
            </TableContainer>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Filtros</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Placa"
                            value={tempPlaca}
                            onChange={(event) => setTempPlaca(event.target.value)}
                            fullWidth
                        />
                        <Autocomplete
                            fullWidth
                            options={tipos}
                            getOptionLabel={(option) => option.tipo}
                            value={tempVehiculoTipo}
                            onChange={(_, value) => setTempVehiculoTipo(value)}
                            renderInput={(params) => <TextField {...params} label="Tipo de vehículo" />}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                        />
                        <Autocomplete
                            fullWidth
                            options={marcas}
                            getOptionLabel={(option) => option.marca}
                            value={tempMarca}
                            onChange={(_, value) => setTempMarca(value)}
                            renderInput={(params) => <TextField {...params} label="Marca" />}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                        />
                        <Autocomplete
                            fullWidth
                            options={modelos}
                            getOptionLabel={(option) => option.modelo}
                            value={tempModelo}
                            onChange={(_, value) => setTempModelo(value)}
                            renderInput={(params) => <TextField {...params} label="Modelo" />}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                        />
                        <Autocomplete
                            fullWidth
                            options={lineas}
                            getOptionLabel={(option) => option.linea}
                            value={tempLinea}
                            onChange={(_, value) => setTempLinea(value)}
                            renderInput={(params) => <TextField {...params} label="Línea" />}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                        />
                        <TextField
                            label="DPI del cliente"
                            value={tempClienteDpi}
                            onChange={(event) => setTempClienteDpi(event.target.value)}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button onClick={() => {
                        const preserved: Record<string, string> = { limit: limit.toString(), offset: '0' };
                        if (q) preserved.q = q;
                        setTempPlaca('');
                        setTempVehiculoTipo(null);
                        setTempModelo(null);
                        setTempMarca(null);
                        setTempLinea(null);
                        setTempClienteDpi('');
                        setSearchParams(preserved);
                        setFilterModalOpen(false);
                    }}>Limpiar</Button>
                    <Button variant="contained" onClick={() => {
                        const params: Record<string, string> = { limit: limit.toString(), offset: '0' };
                        if (q) params.q = q;
                        if (tempPlaca) params.placa = tempPlaca;
                        if (tempVehiculoTipo) params.vehiculo_tipo_id = tempVehiculoTipo.id;
                        if (tempModelo) params.modelo_id = tempModelo.id;
                        if (tempMarca) params.marca_id = tempMarca.id;
                        if (tempLinea) params.linea_id = tempLinea.id;
                        if (tempClienteDpi) params.cliente_dpi = tempClienteDpi;
                        setSearchParams(params);
                        setFilterModalOpen(false);
                    }}>Aplicar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VehiculosListPage;
