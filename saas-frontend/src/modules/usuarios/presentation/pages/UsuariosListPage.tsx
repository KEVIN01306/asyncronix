import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Chip, Avatar, Stack, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit, Visibility, Search, FilterList } from '@mui/icons-material';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Usuario } from '../../domain/interfaces/usuario.interface';
import { usuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatImage } from '../../../../core/utils/formatImage';


const UsuariosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filtroQ, setFiltroQ] = useState<string | null>(() => searchParams.get('q'));
    const debouncedFiltroQ = useDebounce(filtroQ, 300);
    const abortableFetch = useAbortableFetch();
    const [filtroEmail, setFiltroEmail] = useState<string | null>(() => searchParams.get('email'));
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [selectedSucursal, setSelectedSucursal] = useState<string | null>(() => searchParams.get('sucursal_id'));
    const [rolesList, setRolesList] = useState<any[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[] | null>(() => {
        const v = searchParams.get('roles');
        return v ? v.split(',').map(s => s.trim()).filter(Boolean) : null;
    });
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [tempFiltroEmail, setTempFiltroEmail] = useState<string | null>(filtroEmail);
    const [tempSelectedSucursal, setTempSelectedSucursal] = useState<string | null>(selectedSucursal);
    const [tempSelectedRoles, setTempSelectedRoles] = useState<string[] | null>(selectedRoles);

    const columns = [
        {
            id: 'nombre',
            name: 'Nombre',
            format: (value: any, row: any) => (
                <Box display={'flex'} alignItems={'center'} gap={2}>
                    <Avatar
                        src={formatImage(row.avatar_url)}
                        sx={{
                            width: 38,
                            height: 38,
                            border: row.avatar_url ? '2px solid' : "",
                            borderColor: 'secondary.main',
                            background: row.avatar_url ? "#ffffff" : "#876543cc",
                        }}
                    >
                        {value[0]}
                    </Avatar>
                    {value.toUpperCase()}
                </Box>


            )
        },
        { id: 'telefono', name: 'Teléfono' },
        { id: 'roles', name: 'Roles', format: (value: any) => <Chip color={value?.[0]?.nombre === 'ADMIN' ? 'primary' : 'default'} label={value?.[0]?.nombre} /> },
        { id: 'sucursal', name: 'Sucursal', format: (value: any) => <Chip color={value ? "primary" : "default"} label={value ? value.nombre : 'Sin sucursal'} /> },
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/usuarios/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'blue',
            onClick: (row: any) => navigate(`/usuarios/${row.id}/editar`),
        },
    ];

    const fetchUsuarios = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const q = debouncedFiltroQ || null;
            const email = filtroEmail || null;
            const sucursal_id = selectedSucursal || null;
            const roles = selectedRoles || null;
            const response = await usuarioRepository.listar(limit, offset, q, email, sucursal_id, roles, signal);
            setUsuarios(response.data);
            setTotal(response.meta.total ?? 0);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, debouncedFiltroQ, filtroEmail, selectedSucursal, selectedRoles]);

    useEffect(() => {
        abortableFetch(fetchUsuarios);
    }, [abortableFetch, fetchUsuarios]);

    useEffect(() => {
        const loadAux = async () => {
            try {
                const [sucResp, rolesResp] = await Promise.all([
                    (await import('../../../../modules/sucursales/infrastructure/repositories/sucursal.repository')).sucursalRepository.listar(100, 0),
                    usuarioRepository.listarRoles(),
                ]);
                setSucursales(sucResp.data ?? []);
                setRolesList(rolesResp.data ?? []);
            } catch (error) {
                console.error(error);
            }
        }
        loadAux();
    }, []);

    const handleClearFilters = () => {
        setTempFiltroEmail(null);
        setTempSelectedSucursal(null);
        setTempSelectedRoles(null);
    }

    const handleApplyFilters = () => {
        setFiltroEmail(tempFiltroEmail);
        setSelectedSucursal(tempSelectedSucursal);
        setSelectedRoles(tempSelectedRoles);
        const params: any = { limit: limit.toString(), offset: '0' };
        if (filtroQ) params.q = filtroQ;
        if (tempFiltroEmail) params.email = tempFiltroEmail;
        if (tempSelectedSucursal) params.sucursal_id = tempSelectedSucursal;
        if (tempSelectedRoles && tempSelectedRoles.length) params.roles = tempSelectedRoles.join(',');
        setSearchParams(params);
        setFilterModalOpen(false);
    }

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Informacion</AlertTitle>
                En este modulo puedes administrar tus Usuarios, registrar nuevos, editar su información o eliminarlos. Mantén tu lista de usuarios actualizada para una mejor gestión de tu negocio.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                }}
                component={Paper}
            >
                <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <TextField value={filtroQ ?? ''} onChange={(e) => { const v = e.target.value || null; setFiltroQ(v); const params: any = { limit: limit.toString(), offset: '0' }; if (v) params.q = v; if (filtroEmail) params.email = filtroEmail; if (selectedSucursal) params.sucursal_id = selectedSucursal; if (selectedRoles) params.roles = selectedRoles?.join(','); setSearchParams(params); }} fullWidth label="Buscar Usuario" placeholder="Ej: Nombre, email o teléfono" InputProps={{ startAdornment: (<InputAdornment position="start"><Search color="primary" /></InputAdornment>) }} />
                    <Button variant="outlined" startIcon={<FilterList />} onClick={() => setFilterModalOpen(true)}>Más filtros</Button>
                </Stack>
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/usuarios/nuevo')}>
                    Nuevo usuario
                </Button>
            </Box>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Filtros</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Email" value={tempFiltroEmail ?? ''} onChange={(e) => { const v = e.target.value || null; setTempFiltroEmail(v); }} placeholder="Buscar por email" />

                        <TextField select label="Sucursal" value={tempSelectedSucursal ?? ''} onChange={(e) => { const v = e.target.value || null; setTempSelectedSucursal(v); }} sx={{ minWidth: 180 }}>
                            <MenuItem value="">Todas</MenuItem>
                            {sucursales.map((s: any) => (<MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>))}
                        </TextField>

                        <TextField select label="Roles" value={tempSelectedRoles ?? []} SelectProps={{ multiple: true }} onChange={(e) => { const v = Array.isArray(e.target.value) ? e.target.value.map(String) : (e.target.value ? [String(e.target.value)] : []); setTempSelectedRoles(v.length ? v : null); }} sx={{ minWidth: 200 }}>
                            {rolesList.map((r: any) => (<MenuItem key={r.id} value={r.id}>{r.nombre}</MenuItem>))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleClearFilters} variant="outlined">Limpiar</Button>
                    <Button onClick={handleApplyFilters} variant="contained">Aplicar</Button>
                </DialogActions>
            </Dialog>

            <TableContainer >
                {loading ? (
                    <Loading />
                ) : (
                    <>
                        <ListTable
                            data={usuarios}
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
                    </>
                )}
            </TableContainer>
        </Box>
    );
};

export default UsuariosListPage;