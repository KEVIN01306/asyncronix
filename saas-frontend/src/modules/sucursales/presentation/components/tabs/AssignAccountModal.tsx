import {
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    RadioGroup,
    List,
    ListItemButton,
    FormControlLabel,
    Radio,
    Box
} from '@mui/material';
import type { CuentaBancaria } from '../../../../cuenta-bancaria/domain/interfaces/cuenta-bancaria.interface';

interface Props {
    open: boolean;
    onClose: () => void;
    onAssign: () => void;
    assigning: boolean;
    selectedPaymentMethod: 'TARJETA' | 'TRANSFERENCIA';
    availableAccounts: CuentaBancaria[];
    selectedAccountId: string | null;
    setSelectedAccountId: (id: string | null) => void;
}

export const AssignAccountModal = ({
    open,
    onClose,
    onAssign,
    assigning,
    selectedPaymentMethod,
    availableAccounts,
    selectedAccountId,
    setSelectedAccountId
}: Props) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
                                                <Typography variant="subtitle2">{account.banco?.nombre_comercial ?? 'Banco'}</Typography>
                                                <Typography variant="body2" color="text.secondary">No. {account.numero_cuenta}</Typography>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </RadioGroup>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={assigning}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={onAssign} disabled={!selectedAccountId || assigning}>
                    {assigning ? <CircularProgress size={18} color="inherit" /> : 'Asignar cuenta'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
