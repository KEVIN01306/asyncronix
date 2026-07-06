import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Divider,
    Button,
    Card,
    CardContent,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItemButton,
    Radio,
    CircularProgress,
    RadioGroup,
    FormControlLabel,
    TextField,
} from '@mui/material';
import {
    ArrowBack,
    StoreMallDirectoryOutlined,
    CreditCard,
    SwapHoriz,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { useDeviceStore } from '../../../../core/store/deviceStore';

import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { sucursalRepository } from '../../infrastructure/repositories/sucursal.repository';
import { cuentaBancariaRepository } from '../../../cuenta-bancaria/infrastructure/cuenta-bancaria.repository';
import type { SucursalMiDetalle } from '../../domain/interfaces/sucursal.interface';
import type { CuentaBancaria } from '../../../cuenta-bancaria/domain/interfaces/cuenta-bancaria.interface';
import { cajaRepository } from '../../../caja/infrastructure/caja.repository';
import type { Caja } from '../../../caja/domain/interfaces/caja.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

const paymentMethods = [
    { value: 'TARJETA', label: 'Tarjeta', icon: <CreditCard fontSize="small" /> },
    { value: 'TRANSFERENCIA', label: 'Transferencia', icon: <SwapHoriz fontSize="small" /> },
] as const;

const MiSucursalPage = () => {
    const navigate = useNavigate();
    const [sucursal, setSucursal] = useState<SucursalMiDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [accounts, setAccounts] = useState<CuentaBancaria[]>([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [openAssignModal, setOpenAssignModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'TARJETA' | 'TRANSFERENCIA'>('TARJETA');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [openDeviceModal, setOpenDeviceModal] = useState(false);
    const [pinSucursal, setPinSucursal] = useState('');
    const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
    const [deviceActionLoading, setDeviceActionLoading] = useState(false);
    const [deviceMessage, setDeviceMessage] = useState<string | null>(null);
    const [confirmDissociateOpen, setConfirmDissociateOpen] = useState(false);
    const [pendingDissociateCaja, setPendingDissociateCaja] = useState<Caja | null>(null);
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictCaja, setConflictCaja] = useState<Caja | null>(null);
    const user = useAuthStore((state) => state.user);
    const canCreateCaja = user?.permisos.includes('CREAR_CAJAS') ?? false;
    const canAdminSucursal = user?.permisos.includes('ADMIN_SUCURSAL') ?? false;
    const deviceToken = useDeviceStore((state) => state.token);
    const deviceCajaId = useDeviceStore((state) => state.cajaId);
    const deviceCajaNombre = useDeviceStore((state) => state.cajaNombre);
    const deviceAsociacionId = useDeviceStore((state) => state.asociacionId);
    const setDeviceAssociation = useDeviceStore((state) => state.setDeviceAssociation);
    const clearDeviceAssociation = useDeviceStore((state) => state.clearDeviceAssociation);

    const currentDeviceCaja = useMemo(() => {
        if (!sucursal || !deviceAsociacionId) {
            return null;
        }

        return sucursal.cajas.find((caja) => caja.asociacion_id === deviceAsociacionId) ?? null;
    }, [sucursal, deviceAsociacionId]);

    const fetchSucursal = useCallback(async () => {
        try {
            const data = await sucursalRepository.obtenerMiSucursal();
            setSucursal(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar la sucursal actual');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAccounts = useCallback(async () => {
        try {
            const response = await cuentaBancariaRepository.listar(1000, 0);
            setAccounts(response.data ?? []);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar las cuentas bancarias');
        } finally {
            setAccountsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSucursal();
        fetchAccounts();
    }, [fetchSucursal, fetchAccounts]);

    useEffect(() => {
        if (!sucursal || !deviceAsociacionId) {
            return;
        }

        const matchedCaja = sucursal.cajas.find((caja) => caja.asociacion_id === deviceAsociacionId);
        if (!matchedCaja) {
            setConflictCaja(null);
            setConflictModalOpen(true);
        }
    }, [sucursal, deviceAsociacionId]);

    const availableAccounts = useMemo(() => {
        if (!sucursal) return accounts;
        const assignedIds = new Set(sucursal.cuentas_bancarias.map((item) => `${item.cuenta_bancaria.id}-${item.metodo_pago}`));
        return accounts.filter((account) => !assignedIds.has(`${account.id}-${selectedPaymentMethod}`));
    }, [accounts, selectedPaymentMethod, sucursal]);

    const activeTab = useMemo(() => {
        const tabValue = Number(searchParams.get('tab'));
        return [0, 1, 2].includes(tabValue) ? tabValue : 0;
    }, [searchParams]);

    const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('tab', String(newValue));
        setSearchParams(nextParams, { replace: true });
    };

    const handleOpenAssignModal = (paymentMethod: 'TARJETA' | 'TRANSFERENCIA') => {
        setSelectedPaymentMethod(paymentMethod);
        setSelectedAccountId(null);
        setOpenAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        if (!assigning) {
            setOpenAssignModal(false);
        }
    };

    const handleAssignAccount = async () => {
        if (!selectedAccountId || !sucursal) {
            toast.error('Selecciona una cuenta bancaria para asignar');
            return;
        }

        setAssigning(true);

        try {
            const updatedSucursal = await sucursalRepository.asignarCuentaBancaria({
                cuenta_bancaria_id: selectedAccountId,
                metodo_pago: selectedPaymentMethod,
            });
            setSucursal(updatedSucursal);
            toast.success('Cuenta bancaria asignada correctamente');
            setOpenAssignModal(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al asignar la cuenta bancaria');
        } finally {
            setAssigning(false);
        }
    };

    const handleOpenDeviceModal = (caja: Caja) => {
        if (caja.tipo === 'EN_LINEA') {
            toast.error('No se puede asociar un dispositivo a una caja EN_LINEA');
            return;
        }

        const alreadyAssociatedCaja = currentDeviceCaja ?? (deviceCajaId ? sucursal?.cajas.find((item) => item.id === deviceCajaId) ?? null : null);

        if (alreadyAssociatedCaja && alreadyAssociatedCaja.id !== caja.id) {
            toast.error('Ya tienes otra caja asociada en este dispositivo');
            return;
        }

        if (caja.token_autorizado && caja.asociacion_id && deviceAsociacionId && caja.asociacion_id !== deviceAsociacionId) {
            setConflictCaja(caja);
            setConflictModalOpen(true);
            return;
        }

        if (caja.token_autorizado) {
            toast.error('Esta caja ya está asociada a otro dispositivo');
            return;
        }

        setSelectedCaja(caja);
        setPinSucursal('');
        setDeviceMessage(null);
        setOpenDeviceModal(true);
    };

    const handleCloseDeviceModal = () => {
        if (!deviceActionLoading) {
            setOpenDeviceModal(false);
        }
    };

    const handleAssociateDevice = async () => {
        if (!selectedCaja || !pinSucursal) {
            toast.error('Ingresa el PIN de sucursal');
            return;
        }

        if (selectedCaja.tipo === 'EN_LINEA') {
            toast.error('No se puede asociar un dispositivo a una caja EN_LINEA');
            return;
        }

        if (selectedCaja.token_autorizado) {
            toast.error('Esta caja ya está asociada a otro dispositivo');
            return;
        }

        const alreadyAssociatedCaja = currentDeviceCaja ?? (deviceCajaId ? sucursal?.cajas.find((item) => item.id === deviceCajaId) ?? null : null);

        if (alreadyAssociatedCaja && alreadyAssociatedCaja.id !== selectedCaja.id) {
            toast.error('Ya tienes otra caja asociada en este dispositivo');
            return;
        }

        setDeviceActionLoading(true);

        try {
            const response = await cajaRepository.asociarDispositivo(selectedCaja.id, pinSucursal);
            const token = response.data.token_autorizado ?? null;
            const cajaId = response.data.id;
            const cajaNombre = response.data.nombre;
            const asociacionId = response.data.asociacion_id ?? null;

            if (token && asociacionId) {
                setDeviceAssociation(cajaId, cajaNombre, token, asociacionId);
            }

            setSucursal((current) =>
                current
                    ? {
                          ...current,
                          cajas: current.cajas.map((caja) =>
                              caja.id === response.data.id ? response.data : caja
                          ),
                      }
                    : current
            );
            setDeviceMessage('Caja asociada a este dispositivo correctamente');
            toast.success('Caja asociada a este dispositivo');
            setOpenDeviceModal(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al asociar la caja al dispositivo');
        } finally {
            setDeviceActionLoading(false);
        }
    };

    const handleRequestDissociateDevice = (caja: Caja) => {
        if (!caja.token_autorizado && !canAdminSucursal) {
            toast.error('No hay token asociado para desasociar');
            return;
        }

        setPendingDissociateCaja(caja);
        setConfirmDissociateOpen(true);
    };

    const handleConfirmDissociateDevice = async () => {
        if (!pendingDissociateCaja) {
            return;
        }

        setDeviceActionLoading(true);

        try {
            const tokenToUse = pendingDissociateCaja.token_autorizado ?? '';
            await cajaRepository.desasociarDispositivo(pendingDissociateCaja.id, tokenToUse);
            const isCurrentDeviceCaja = Boolean(
                (deviceAsociacionId && pendingDissociateCaja.asociacion_id && pendingDissociateCaja.asociacion_id === deviceAsociacionId) ||
                (!deviceAsociacionId && deviceCajaId === pendingDissociateCaja.id)
            );

            if (isCurrentDeviceCaja) {
                clearDeviceAssociation();
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('device-association-storage');
                }
            }
            setSucursal((current) =>
                current
                    ? {
                            ...current,
                            cajas: current.cajas.map((item) =>
                                item.id === pendingDissociateCaja.id
                                    ? { ...item, token_autorizado: null, ip_autorizada: null }
                                    : item
                            ),
                        }
                    : current
            );
            toast.success('Caja desasociada del dispositivo');
        } catch (error) {
            console.error(error);
            toast.error('Error al desasociar la caja del dispositivo');
        } finally {
            setDeviceActionLoading(false);
            setConfirmDissociateOpen(false);
            setPendingDissociateCaja(null);
        }
    };

    if (loading || accountsLoading) {
        return <Loading />;
    }

    if (!sucursal) {
        return <ErrorPageLoading text="Sucursal no encontrada" navigate={() => navigate('/dashboard')} />;
    }

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} gap={2}>
                <Box>
                    <Typography variant="overline" color="primary" fontWeight={700} display="flex" alignItems="center" gap={1}>
                        <StoreMallDirectoryOutlined fontSize="small" /> Mi Sucursal
                    </Typography>
                    <Typography variant="h4" fontWeight={800} mt={1}>
                        {sucursal.nombre}
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/sucursales')}>
                    Volver a sucursales
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
                    <Tab label="Información" />
                    <Tab label="Cajas" />
                    <Tab label="Cuentas bancarias" />
                </Tabs>
            </Paper>

            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Información de la sucursal
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Dirección
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.primary', mb: 2 }}>
                                {sucursal.direccion ?? 'No especificada'}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                <Chip label={sucursal.es_principal ? 'Sede Principal' : 'Sucursal'} color={sucursal.es_principal ? 'primary' : 'default'} />
                                <Chip label="Acceso basado en tu sucursal" variant="outlined" />
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Cajas
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} mt={1}>
                                        {sucursal.cajas.length}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Cuentas bancarias
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} mt={1}>
                                        {sucursal.cuentas_bancarias.length}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Usuarios en la sucursal
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} mt={1}>
                                        {sucursal.usuarios_count}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {canCreateCaja && (
                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button variant="contained" onClick={() => navigate('/cajas/nuevo')}>
                                    Agregar caja
                                </Button>
                            </Box>
                        </Grid>
                    )}
                    {deviceCajaId && (
                        <Grid size={{ xs: 12 }}>
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Caja actualmente asociada a este dispositivo
                                </Typography>
                                <Typography variant="body1" fontWeight={700}>
                                    {currentDeviceCaja?.nombre ?? deviceCajaNombre ?? 'Caja desconocida'}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                    {sucursal.cajas.map((caja) => (
                        <Grid size={{ xs: 12, md: 6 }} key={caja.id}>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    opacity: conflictModalOpen ? 0.6 : 1,
                                    pointerEvents: conflictModalOpen ? 'none' : 'auto',
                                    transition: 'opacity 200ms ease',
                                }}
                            >
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {caja.tipo}
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        {caja.nombre}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        Saldo: <strong>{formatMoney(caja.saldo)}</strong>
                                    </Typography>
                                    <Chip label={caja.activo ? 'Activo' : 'Inactivo'} size="small" sx={{ mt: 2 }} />
                                    <Box display="flex" flexDirection="column" gap={1} mt={2}>
                                        {caja.token_autorizado ? (
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    Dispositivo autorizado
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    IP autorizada: {caja.ip_autorizada ?? 'No disponible'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {caja.token_autorizado === deviceToken
                                                        ? 'Este dispositivo está actualmente autorizado'
                                                        : 'Esta caja está autorizada en otro dispositivo'}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Esta caja no está asociada a un dispositivo.
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box display="flex" justifyContent="flex-end" mt={2}>
                                        {!conflictModalOpen ? (
                                            ((deviceAsociacionId && caja.asociacion_id && caja.asociacion_id === deviceAsociacionId) || (!deviceAsociacionId && caja.id === deviceCajaId) || (canAdminSucursal && caja.token_autorizado)) ? (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleRequestDissociateDevice(caja)}
                                                    disabled={deviceActionLoading}
                                                >
                                                    Desasociar dispositivo
                                                </Button>
                                            ) : caja.tipo === 'EN_LINEA' ? null : deviceCajaId ? null : caja.token_autorizado ? null : (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleOpenDeviceModal(caja)}
                                                    disabled={deviceActionLoading}
                                                >
                                                    Asociar dispositivo
                                                </Button>
                                            )
                                        ) : null}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {sucursal.cajas.length === 0 && (
                        <Grid size={{ xs: 12 }}>
                            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography>No hay cajas registradas para esta sucursal.</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            <Dialog open={conflictModalOpen} onClose={() => !deviceActionLoading && setConflictModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Conflicto de asociación</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        {conflictCaja
                            ? 'Parece que otro dispositivo está usando esta caja. Para poder asociar otra caja, debes eliminar los datos de asociación guardados en este equipo y en la caja.'
                            : 'No se encontró ninguna caja asociada a este dispositivo en la sucursal actual. Parece que se asoció en otro dispositivo y debes borrar los datos almacenados de la asociación para poder continuar.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {conflictCaja ? `Caja: ${conflictCaja.nombre}` : ''}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConflictModalOpen(false)} disabled={deviceActionLoading}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={() => {
                        clearDeviceAssociation();
                        if (typeof window !== 'undefined') {
                            window.localStorage.removeItem('device-association-storage');
                        }
                        setConflictModalOpen(false);
                        toast.success('Datos de asociación del dispositivo limpiados');
                    }} disabled={deviceActionLoading}>
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmDissociateOpen} onClose={() => !deviceActionLoading && setConfirmDissociateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirmar desasociación</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        {canAdminSucursal
                            ? 'Esta acción eliminará los datos de asociación de la caja en esta sucursal y podría desconfigurar una PC que aún tenga la configuración guardada.'
                            : 'Esta acción puede desconfigurar la PC que tenga esta caja asociada.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {pendingDissociateCaja ? `Caja: ${pendingDissociateCaja.nombre}` : ''}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDissociateOpen(false)} disabled={deviceActionLoading}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDissociateDevice} disabled={deviceActionLoading}>
                        {deviceActionLoading ? 'Procesando...' : 'Aceptar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Grid container spacing={2}>
                            {paymentMethods.map((method) => {
                                const assigned = sucursal.cuentas_bancarias.find((item) => item.metodo_pago === method.value);
                                return (
                                    <Grid size={{ xs: 12, md: 6 }} key={method.value}>
                                        <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                                            <CardContent>
                                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        {method.icon}
                                                        <Typography variant="subtitle1" fontWeight={700}>
                                                            {method.label}
                                                        </Typography>
                                                    </Box>
                                                    <Button size="small" variant="contained" onClick={() => handleOpenAssignModal(method.value)}>
                                                        {assigned ? 'Cambiar' : 'Asignar'}
                                                    </Button>
                                                </Box>

                                                {assigned ? (
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Banco
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {assigned.cuenta_bancaria.banco?.nombre_comercial ?? assigned.cuenta_bancaria.banco_id}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" mt={1}>
                                                            Moneda
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {assigned.cuenta_bancaria.moneda?.codigo ?? 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" mt={1}>
                                                            Cuenta
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {assigned.cuenta_bancaria.numero_cuenta}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" mt={1}>
                                                            Titular
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {assigned.cuenta_bancaria.nombre_titular}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography color="text.secondary">
                                                        Ninguna cuenta asignada aún para este método.
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Todas las cuentas bancarias disponibles
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Grid container spacing={2}>
                                {accounts.map((account) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={account.id}>
                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    {account.banco?.nombre_comercial ?? account.banco_id} • {account.moneda?.codigo ?? 'N/A'}
                                                </Typography>
                                                <Typography variant="h6" fontWeight={700}>
                                                    {account.numero_cuenta}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" mt={1}>
                                                    Titular: {account.nombre_titular}
                                                </Typography>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                                    <Chip label={account.tipo} size="small" />
                                                    <Chip label={account.activo ? 'Activo' : 'Inactivo'} size="small" color={account.activo ? 'success' : 'default'} />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                                {accounts.length === 0 && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography>No hay cuentas bancarias registradas.</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Dialog open={openAssignModal} onClose={handleCloseAssignModal} fullWidth maxWidth="sm">
                <DialogTitle>Asignar cuenta para {selectedPaymentMethod === 'TARJETA' ? 'Tarjeta' : 'Transferencia'}</DialogTitle>
                <DialogContent>
                    {availableAccounts.length === 0 ? (
                        <Typography>No hay cuentas disponibles para asignar a este método.</Typography>
                    ) : (
                        <RadioGroup value={selectedAccountId ?? ''} onChange={(event) => setSelectedAccountId(event.target.value)}>
                            <List>
                                {availableAccounts.map((account) => (
                                    <ListItemButton key={account.id} selected={selectedAccountId === account.id} onClick={() => setSelectedAccountId(account.id)}>
                                        <FormControlLabel
                                            value={account.id}
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={700}>
                                                        {account.banco?.nombre_comercial ?? account.banco_id} • {account.moneda?.codigo ?? 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {account.numero_cuenta} – {account.nombre_titular}
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ width: '100%', m: 0 }}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </RadioGroup>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssignModal} disabled={assigning}>Cancelar</Button>
                    <Button onClick={handleAssignAccount} variant="contained" disabled={!selectedAccountId || assigning}>
                        {assigning ? <CircularProgress size={18} color="inherit" /> : 'Asignar cuenta'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeviceModal} onClose={handleCloseDeviceModal} fullWidth maxWidth="xs">
                <DialogTitle>Asociar dispositivo a caja</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Ingresa el PIN de sucursal para autorizar este dispositivo en la caja{' '}
                        <strong>{selectedCaja?.nombre ?? ''}</strong>.
                    </Typography>
                    <TextField
                        label="PIN de sucursal"
                        value={pinSucursal}
                        onChange={(event) => setPinSucursal(event.target.value)}
                        fullWidth
                        margin="normal"
                        type="password"
                        inputProps={{ maxLength: 6 }}
                        disabled={deviceActionLoading}
                    />
                    {deviceMessage && (
                        <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                            {deviceMessage}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeviceModal} disabled={deviceActionLoading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAssociateDevice}
                        variant="contained"
                        disabled={deviceActionLoading || !pinSucursal}
                    >
                        {deviceActionLoading ? <CircularProgress size={18} color="inherit" /> : 'Asociar dispositivo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MiSucursalPage;
