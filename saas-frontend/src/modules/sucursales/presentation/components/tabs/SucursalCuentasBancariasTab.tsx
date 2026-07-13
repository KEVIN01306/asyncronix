import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Alert,
} from '@mui/material';
import { CreditCard, SwapHoriz } from '@mui/icons-material';

import type { SucursalMiDetalle } from '../../../domain/interfaces/sucursal.interface';
import CuentaBancariaCardItem from '../../../../cuenta-bancaria/presentation/components/CuentaBancariaCardItem';
import { AssignAccountModal } from './AssignAccountModal';
import { useAccountAssignment } from '../../hooks/useAccountAssignment';

const paymentMethods = [
    { value: 'TARJETA', label: 'Tarjeta', icon: <CreditCard fontSize="small" /> },
    { value: 'TRANSFERENCIA', label: 'Transferencia', icon: <SwapHoriz fontSize="small" /> },
] as const;

interface Props {
    sucursal: SucursalMiDetalle;
    setSucursal: React.Dispatch<React.SetStateAction<SucursalMiDetalle | null>>;
}

const SucursalCuentasBancariasTab = ({ sucursal, setSucursal }: Props) => {
    const {
        openAssignModal,
        assigning,
        selectedPaymentMethod,
        selectedAccountId,
        setSelectedAccountId,
        availableAccounts,
        handleOpenAssignModal,
        handleCloseAssignModal,
        handleAssignAccount
    } = useAccountAssignment(sucursal, setSucursal);

    return (
        <>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Box mb={3} display="flex" flexDirection="column" gap={1.5}>
                        {paymentMethods.map(method => {
                            const assigned = sucursal.cuentas_bancarias.find((item) => item.metodo_pago === method.value);
                            if (assigned) {
                                return (
                                    <Alert severity="success" key={`alert-${method.value}`}>
                                        El método de pago con {method.label.toLowerCase()} está listo para usarse.
                                    </Alert>
                                );
                            }
                            return null;
                        })}
                    </Box>
                    <Grid container spacing={2}>
                        {paymentMethods.map((method) => {
                            const assigned = sucursal.cuentas_bancarias.find((item) => item.metodo_pago === method.value);
                            const actions = [
                                {
                                    name: 'Cambiar cuenta',
                                    icon: <SwapHoriz fontSize="small" />,
                                    onClick: () => handleOpenAssignModal(method.value),
                                },
                            ];

                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={method.value}>
                                    <Box sx={{ height: '100%' }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                            {method.icon}
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {method.label}
                                            </Typography>
                                        </Box>
                                        {assigned ? (
                                            <CuentaBancariaCardItem cuenta={assigned.cuenta_bancaria} actions={actions} />
                                        ) : (
                                            <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Ninguna cuenta asignada aún para este método.
                                                    </Typography>
                                                </Box>
                                                <Button variant="contained" onClick={() => handleOpenAssignModal(method.value)}>
                                                    Asignar cuenta
                                                </Button>
                                            </Paper>
                                        )}
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Grid>
            </Grid>

            <AssignAccountModal
                open={openAssignModal}
                onClose={handleCloseAssignModal}
                onAssign={handleAssignAccount}
                assigning={assigning}
                selectedPaymentMethod={selectedPaymentMethod}
                availableAccounts={availableAccounts}
                selectedAccountId={selectedAccountId}
                setSelectedAccountId={setSelectedAccountId}
            />
        </>
    );
};

export default SucursalCuentasBancariasTab;
