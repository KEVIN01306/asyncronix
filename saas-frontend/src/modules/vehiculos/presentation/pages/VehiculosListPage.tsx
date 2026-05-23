import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, TableContainer, CircularProgress, useTheme, useMediaQuery, Autocomplete, TextField, Button, Stack, Avatar, Alert } from '@mui/material';
import { Add, Visibility, Edit } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { vehiculoRepository } from '../../infrastructure/vehiculo.repository';
import { vehiculoTipoRepository } from '../../infrastructure/vehiculo-tipo.repository';
import { modelosRepository } from '../../../modelos/infrastructure/modelos.repository';
import type { Vehiculo } from '../../domain/interfaces/vehiculo.interface';
import type { VehiculoTipo } from '../../domain/interfaces/vehiculo-tipo.interface';
import type { Modelo } from '../../../modelos/domain/interface/modelo.interface';

const VehiculosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [tipos, setTipos] = useState<VehiculoTipo[]>([]);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchPlaca, setSearchPlaca] = useState('');
    const [selectedType, setSelectedType] = useState<VehiculoTipo | null>(null);
    const [selectedModel, setSelectedModel] = useState<Modelo | null>(null);

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vehiculosRes, tiposRes, modelosRes] = await Promise.all([
                vehiculoRepository.listar(limit, offset),
                vehiculoTipoRepository.listar(100, 0),
                modelosRepository.listar(100, 0),
            ]);
            setVehiculos(vehiculosRes.data);
            setTotal(vehiculosRes.meta.total);
            setTipos(tiposRes.data);
            setModelos(modelosRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [offset, limit]);

    const filteredVehiculos = useMemo(() => {
        return vehiculos.filter((vehiculo) => {
            const placaMatch = vehiculo.placa.toLowerCase().includes(searchPlaca.toLowerCase());
            const tipoMatch = selectedType ? vehiculo.vehiculo_tipo_id === selectedType.id : true;
            const modelMatch = selectedModel ? vehiculo.modelo_id === selectedModel.id : true;
            return placaMatch && tipoMatch && modelMatch;
        });
    }, [vehiculos, searchPlaca, selectedType, selectedModel]);

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
                Administra los vehículos registrados, filtra por tipo o modelo y revisa rápidamente los registros con su avatar.
            </Alert>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        label="Buscar por placa"
                        fullWidth
                        value={searchPlaca}
                        onChange={(event) => setSearchPlaca(event.target.value)}
                    />
                    <Autocomplete
                        fullWidth
                        options={tipos}
                        getOptionLabel={(option) => option.tipo}
                        value={selectedType}
                        onChange={(_, value) => setSelectedType(value)}
                        renderInput={(params) => <TextField {...params} label="Tipo de vehículo" placeholder="Filtrar tipo" />}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                    <Autocomplete
                        fullWidth
                        options={modelos}
                        getOptionLabel={(option) => option.modelo}
                        value={selectedModel}
                        onChange={(_, value) => setSelectedModel(value)}
                        renderInput={(params) => <TextField {...params} label="Modelo" placeholder="Filtrar modelo" />}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
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
                    <Box display="flex" justifyContent="center" p={5}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <ListTable
                        data={filteredVehiculos}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => {
                                const newOffset = newPage * limit;
                                setSearchParams({ limit: limit.toString(), offset: newOffset.toString() });
                            },
                            onRowsPerPageChange: (newLimit) => {
                                setSearchParams({ limit: newLimit.toString(), offset: '0' });
                            }
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default VehiculosListPage;
