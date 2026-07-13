import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Button,
    Paper,
} from '@mui/material';
import { Link as LinkIcon, LinkOff as LinkOffIcon } from '@mui/icons-material';

import { useAuthStore } from '../../../../../core/store/authStore';
import { useDeviceStore } from '../../../../../core/store/deviceStore';
import type { SucursalMiDetalle } from '../../../domain/interfaces/sucursal.interface';
import type { Caja } from '../../../../caja/domain/interfaces/caja.interface';
import CajaCardItem from '../../../../caja/presentation/components/CajaCardItem';
import CajaStatusWidget from '../../../../../shared/components/ui/widgets/CajaStatusWidget';
import { DeviceAssociationModals } from './DeviceAssociationModals';
import { useDeviceAssociation } from '../../hooks/useDeviceAssociation';

interface Props {
    sucursal: SucursalMiDetalle;
    setSucursal: React.Dispatch<React.SetStateAction<SucursalMiDetalle | null>>;
}

const SucursalCajasTab = ({ sucursal, setSucursal }: Props) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const canCreateCaja = user?.permisos.includes('CREAR_CAJAS') ?? false;
    const deviceCajaNombre = useDeviceStore((state) => state.cajaNombre);

    const {
        openDeviceModal,
        pinSucursal,
        setPinSucursal,
        selectedCaja,
        deviceActionLoading,
        deviceMessage,
        confirmDissociateOpen,
        setConfirmDissociateOpen,
        pendingDissociateCaja,
        conflictModalOpen,
        setConflictModalOpen,
        conflictCaja,
        handleOpenDeviceModal,
        handleCloseDeviceModal,
        handleAssociateDevice,
        handleRequestDissociateDevice,
        handleConfirmDissociateDevice,
        canAdminSucursal,
        currentDeviceCaja,
        deviceCajaId,
        deviceAsociacionId,
        clearDeviceAssociation
    } = useDeviceAssociation(sucursal, setSucursal);

    return (
        <>
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
                {sucursal.cajas.map((caja) => {
                    const actions = [
                        {
                            name: 'Vincular dispositivo',
                            icon: <LinkIcon fontSize="small" />,
                            onClick: (row: Caja) => handleOpenDeviceModal(row),
                            visible: (row: Caja) => !conflictModalOpen && row.tipo !== 'EN_LINEA' && !deviceCajaId && !row.token_autorizado && !((deviceAsociacionId && row.asociacion_id && row.asociacion_id === deviceAsociacionId) || (!deviceAsociacionId && row.id === deviceCajaId)),
                        },
                        {
                            name: 'Desvincular dispositivo',
                            icon: <LinkOffIcon fontSize="small" />,
                            color: 'error',
                            onClick: (row: Caja) => handleRequestDissociateDevice(row),
                            visible: (row: Caja) => !conflictModalOpen && ((deviceAsociacionId && row.asociacion_id && row.asociacion_id === deviceAsociacionId) || (!deviceAsociacionId && row.id === deviceCajaId) || (canAdminSucursal && Boolean(row.token_autorizado))),
                        },
                    ];

                    return (
                        <Grid size={{ xs: 12, md: 6 }} key={caja.id}>
                            <Box sx={{ opacity: conflictModalOpen ? 0.6 : 1, pointerEvents: conflictModalOpen ? 'none' : 'auto', transition: 'opacity 200ms ease' }}>
                                <CajaCardItem caja={caja} actions={actions} />
                            </Box>
                        </Grid>
                    );
                })}
                {sucursal.cajas.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography>No hay cajas registradas para esta sucursal.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
            <CajaStatusWidget />

            <DeviceAssociationModals
                conflictModalOpen={conflictModalOpen}
                setConflictModalOpen={setConflictModalOpen}
                conflictCaja={conflictCaja}
                clearDeviceAssociation={clearDeviceAssociation}
                confirmDissociateOpen={confirmDissociateOpen}
                setConfirmDissociateOpen={setConfirmDissociateOpen}
                pendingDissociateCaja={pendingDissociateCaja}
                canAdminSucursal={canAdminSucursal}
                handleConfirmDissociateDevice={handleConfirmDissociateDevice}
                openDeviceModal={openDeviceModal}
                handleCloseDeviceModal={handleCloseDeviceModal}
                selectedCaja={selectedCaja}
                deviceMessage={deviceMessage}
                pinSucursal={pinSucursal}
                setPinSucursal={setPinSucursal}
                handleAssociateDevice={handleAssociateDevice}
                deviceActionLoading={deviceActionLoading}
            />
        </>
    );
};

export default SucursalCajasTab;
