import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Chip } from '@mui/material';
import { Add, Edit, Visibility, Search, Security } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Rol } from '../../domain/interfaces/rol.interface';
import { RolesRepository } from '../../infrastructure/repositories/rol.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useDebounce } from '../../../../core/hooks/useDebounce';

const RolesListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const qParam = searchParams.get('q') || '';

    const [roles, setRoles] = useState<Rol[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(qParam);
    const debouncedQuery = useDebounce(searchQuery, 300);
    const abortRef = useRef<AbortController | null>(null);

    const columns = [
        { id: 'nombre', name: 'Nombre', format: (value: any) => value?.toUpperCase() },
        { id: 'descripcion', name: 'Descripción', format: (value: any) => value || 'Sin descripción' },
        {
            id: 'permisos',
            name: 'Permisos',
            format: (value: any) => (
                <Chip label={`${value?.length ?? 0} permisos`} color={value?.length ? 'primary' : 'default'} size="small" />
            )
        }
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/roles/${row.id}`),
        },
        {
            name: 'Permisos',
            icon: <Security fontSize="small" />,
            color: 'green',
            onClick: (row: any) => navigate(`/roles/${row.id}/permisos`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'blue',
            onClick: (row: any) => navigate(`/roles/${row.id}/editar`),
        },
    ];

    const fetchRoles = useCallback(async (q?: string) => {
        setLoading(true);
        try {
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            const response = await RolesRepository.listar(limit, offset, q, controller.signal);
            setRoles(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            if ((error as any)?.name === 'CanceledError' || (error as any)?.message === 'canceled') {
                // request aborted
                return;
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchRoles(debouncedQuery || undefined);
        // sync q param into URL
        const params: any = { limit: limit.toString(), offset: offset.toString() };
        if (debouncedQuery) params.q = debouncedQuery;
        setSearchParams(params);
    }, [fetchRoles, debouncedQuery, limit, offset, setSearchParams]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Información</AlertTitle>
                En este módulo puedes administrar los roles del negocio, crear nuevos roles, editar su información y revisar permisos asociados.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{ bgcolor: 'background.paper', p: 2 }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar roles"
                    placeholder="Ej: Administrador, Vendedor"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/roles/nuevo')}>
                    Nuevo rol
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Loading />
                        ) : (
                    <ListTable
                        data={roles}
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
                            },
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default RolesListPage;
