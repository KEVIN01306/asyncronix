import {
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    TextField,
    Box
} from '@mui/material';
import type { Caja } from '../../../../caja/domain/interfaces/caja.interface';

interface Props {
    conflictModalOpen: boolean;
    setConflictModalOpen: (open: boolean) => void;
    conflictCaja: Caja | null;
    clearDeviceAssociation: () => void;
    
    confirmDissociateOpen: boolean;
    setConfirmDissociateOpen: (open: boolean) => void;
    pendingDissociateCaja: Caja | null;
    canAdminSucursal: boolean;
    handleConfirmDissociateDevice: () => void;
    
    openDeviceModal: boolean;
    handleCloseDeviceModal: () => void;
    selectedCaja: Caja | null;
    deviceMessage: string | null;
    pinSucursal: string;
    setPinSucursal: (pin: string) => void;
    handleAssociateDevice: () => void;
    deviceActionLoading: boolean;
}

export const DeviceAssociationModals = ({
    conflictModalOpen, setConflictModalOpen, conflictCaja, clearDeviceAssociation,
    confirmDissociateOpen, setConfirmDissociateOpen, pendingDissociateCaja, canAdminSucursal, handleConfirmDissociateDevice,
    openDeviceModal, handleCloseDeviceModal, selectedCaja, deviceMessage, pinSucursal, setPinSucursal, handleAssociateDevice, deviceActionLoading
}: Props) => {
    return (
        <>
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

            <Dialog open={openDeviceModal} onClose={handleCloseDeviceModal} maxWidth="sm" fullWidth>
                <DialogTitle>Asociar Caja al Dispositivo</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        Estás a punto de asociar la caja <strong>{selectedCaja?.nombre}</strong> a este dispositivo para poder utilizarla como punto de venta.
                    </Typography>
                    {deviceMessage && (
                        <Typography color="success.main" variant="body2" sx={{ mt: 2 }}>{deviceMessage}</Typography>
                    )}
                    <Box mt={3}>
                        <TextField
                            label="PIN de sucursal"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={pinSucursal}
                            onChange={(e) => setPinSucursal(e.target.value)}
                            disabled={deviceActionLoading}
                            helperText="Ingresa el PIN numérico para autorizar la asociación"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeviceModal} disabled={deviceActionLoading}>
                        {deviceMessage ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAssociateDevice}
                        disabled={deviceActionLoading || Boolean(deviceMessage)}
                    >
                        {deviceActionLoading ? <CircularProgress size={18} color="inherit" /> : 'Asociar dispositivo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
