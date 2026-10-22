import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Tabs, Tab, CircularProgress, Typography } from '@mui/material';
import { Add, Edit, Info, Search, FilterList, People, CompareArrows, Key, Send } from '@mui/icons-material';
import { toast } from 'sonner';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Cliente } from '../../domain/interfaces/cliente.interface';
import { clienteRepository } from '../../infrastructure/clientes.repository';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { ClienteUnificacionTab } from '../components/ClienteUnificacionTab';

const ClientesListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [tabIndex, setTabIndex] = useState(0);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filtroQ, setFiltroQ] = useState<string | null>(() => searchParams.get('q'));
    const debouncedFiltroQ = useDebounce(filtroQ, 300);
    const abortableFetch = useAbortableFetch();
    const [filtroDocumento, setFiltroDocumento] = useState<string | null>(() => searchParams.get('documento'));
    const [tempFiltroDocumento, setTempFiltroDocumento] = useState(filtroDocumento);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const [clienteParaCredenciales, setClienteParaCredenciales] = useState<Cliente | null>(null);
    const [enviandoCredenciales, setEnviandoCredenciales] = useState(false);

    const columns = [
        { id: 'nombre', name: 'Nombre' },
        { id: 'telefono', name: 'Teléfono' },
        { id: 'nit', name: 'NIT' },
        { id: 'dpi', name: 'DPI' },
        { id: 'email', name: 'Email' },
    ];

    const actions = [
        {
            name: 'Detalle',
            icon: <Info fontSize="small" />,
            color: 'info',
            onClick: (row: any) => navigate(`/clientes/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'blue',
            onClick: (row: any) => navigate(`/clientes/${row.id}/editar`),
        },
        {
            name: 'Reenviar credenciales',
            icon: <Key fontSize="small" />,
            color: 'warning',
            onClick: (row: any) => setClienteParaCredenciales(row),
        },
    ];

    const handleConfirmarReenvioCredenciales = async () => {
        if (!clienteParaCredenciales) return;
        setEnviandoCredenciales(true);
        try {
            const res = await clienteRepository.reenviarCredenciales(clienteParaCredenciales.id);
            toast.success(res.message || 'Nuevas credenciales generadas y enviadas exitosamente al correo');
            setClienteParaCredenciales(null);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al reenviar las credenciales';
            toast.error(msg);
        } finally {
            setEnviandoCredenciales(false);
        }
    };

    const fetchClientes = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const q = debouncedFiltroQ || null;
            const documento = filtroDocumento || null;
            const response = await clienteRepository.listar(limit, offset, q, documento, signal);
            setClientes(response.data);
            setTotal(response.meta.total ?? 0);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, debouncedFiltroQ, filtroDocumento]);

    useEffect(() => {
        abortableFetch(fetchClientes);
    }, [abortableFetch, fetchClientes]);

    const handleClearFilters = () => {
        setTempFiltroDocumento(null);
        setFiltroDocumento(null);
        const params: any = { limit: limit.toString(), offset: '0' };
        if (filtroQ) params.q = filtroQ;
        setSearchParams(params);
    };

    const handleApplyFilters = () => {
        setFiltroDocumento(tempFiltroDocumento);
        const params: any = { limit: limit.toString(), offset: '0' };
        if (filtroQ) params.q = filtroQ;
        if (tempFiltroDocumento) params.documento = tempFiltroDocumento;
        setSearchParams(params);
        setFilterModalOpen(false);
    };

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Clientes</AlertTitle>
                Administra tus clientes, consulta identidades globales y unifica registros duplicados.
            </Alert>

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabIndex}
                    onChange={(_, val) => setTabIndex(val)}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab icon={<People />} iconPosition="start" label="Listado de Clientes" />
                    <Tab icon={<CompareArrows />} iconPosition="start" label="Unificación" />
                </Tabs>
            </Paper>

            {tabIndex === 0 ? (
                <>
                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                        sx={{
                            bgcolor: 'background.paper',
                            p: 2,
                        }}
                        component={Paper}
                    >
                        <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                            <TextField value={filtroQ ?? ''} onChange={(e) => { const v = e.target.value || null; setFiltroQ(v); const params: any = { limit: limit.toString(), offset: '0' }; if (v) params.q = v; if (filtroDocumento) params.documento = filtroDocumento; setSearchParams(params); }} fullWidth label="Buscar cliente" placeholder="Ej: Nombre, email o teléfono" InputProps={{ startAdornment: (<InputAdornment position="start"><Search color="primary" /></InputAdornment>) }} />
                            <Button
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={() => setFilterModalOpen(true)}
                            >
                                Más filtros
                            </Button>
                        </Stack>
                        <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/clientes/nuevo')}>
                            Nuevo cliente
                        </Button>
                    </Box>

                    <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                        <DialogTitle>Filtros</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} mt={1}>
                                <TextField label="DPI o NIT" value={tempFiltroDocumento ?? ''} onChange={(e) => { const v = e.target.value || null; setTempFiltroDocumento(v); }} placeholder="Ingrese DPI o NIT" />
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
                            <Loading />
                        ) : (
                            <ListTable
                                data={clientes}
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
                </>
            ) : (
                <ClienteUnificacionTab onUnificationSuccess={() => abortableFetch(fetchClientes)} />
            )}

            {/* Modal de confirmación para reenviar credenciales */}
            <Dialog
                open={Boolean(clienteParaCredenciales)}
                onClose={() => !enviandoCredenciales && setClienteParaCredenciales(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Key color="warning" />
                    Reenviar Credenciales
                </DialogTitle>
                <DialogContent dividers>
                    {clienteParaCredenciales && (
                        !clienteParaCredenciales.email ? (
                            <Alert severity="error">
                                <AlertTitle>Correo no registrado</AlertTitle>
                                <strong>{clienteParaCredenciales.nombre}</strong> no tiene un correo electrónico configurado. Debes editar su información y añadir un correo válido para enviarle credenciales.
                            </Alert>
                        ) : (
                            <Box>
                                <Typography variant="body2" mb={2}>
                                    Se generará una <strong>nueva contraseña aleatoria y segura</strong> para <strong>{clienteParaCredenciales.nombre} {clienteParaCredenciales.apellido || ''}</strong> y se enviará por correo electrónico a:
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100', borderRadius: 1, mb: 2 }}>
                                    <Typography variant="body2" fontWeight={700} color="primary">
                                        {clienteParaCredenciales.email}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Usuario de acceso: <strong>{clienteParaCredenciales.dpi || clienteParaCredenciales.nit || 'Documento'}</strong>
                                    </Typography>
                                </Box>
                                <Alert severity="warning" sx={{ fontSize: '0.82rem' }}>
                                    Cualquier sesión activa anterior del cliente será cerrada por motivos de seguridad.
                                </Alert>
                            </Box>
                        )
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => setClienteParaCredenciales(null)}
                        disabled={enviandoCredenciales}
                        color="inherit"
                    >
                        Cancelar
                    </Button>
                    {clienteParaCredenciales?.email ? (
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleConfirmarReenvioCredenciales}
                            disabled={enviandoCredenciales}
                            startIcon={enviandoCredenciales ? <CircularProgress size={18} color="inherit" /> : <Send />}
                        >
                            {enviandoCredenciales ? 'Enviando...' : 'Generar y Reenviar'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                const cId = clienteParaCredenciales?.id;
                                setClienteParaCredenciales(null);
                                if (cId) navigate(`/clientes/${cId}/editar`);
                            }}
                        >
                            Editar Cliente
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClientesListPage;
