import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import type { SucursalMiDetalle } from '../../domain/interfaces/sucursal.interface';
import { cuentaBancariaRepository } from '../../../cuenta-bancaria/infrastructure/cuenta-bancaria.repository';
import { sucursalRepository } from '../../infrastructure/repositories/sucursal.repository';
import type { CuentaBancaria } from '../../../cuenta-bancaria/domain/interfaces/cuenta-bancaria.interface';

export const useAccountAssignment = (
    sucursal: SucursalMiDetalle,
    setSucursal: React.Dispatch<React.SetStateAction<SucursalMiDetalle | null>>
) => {
    const [accounts, setAccounts] = useState<CuentaBancaria[]>([]);
    const [assigning, setAssigning] = useState(false);
    const [openAssignModal, setOpenAssignModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'TARJETA' | 'TRANSFERENCIA'>('TARJETA');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    const availableAccounts = useMemo(() => {
        if (!sucursal) return accounts;
        const assignedIds = new Set(sucursal.cuentas_bancarias.map((item) => `${item.cuenta_bancaria.id}-${item.metodo_pago}`));
        return accounts.filter((account) => !assignedIds.has(`${account.id}-${selectedPaymentMethod}`));
    }, [accounts, selectedPaymentMethod, sucursal]);

    const handleOpenAssignModal = async (paymentMethod: 'TARJETA' | 'TRANSFERENCIA') => {
        setSelectedPaymentMethod(paymentMethod);
        setSelectedAccountId(null);
        setOpenAssignModal(true);

        if (accounts.length > 0) {
            return;
        }

        try {
            const response = await cuentaBancariaRepository.listar(1000, 0);
            setAccounts(response.data ?? []);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar las cuentas bancarias');
        }
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

    return {
        openAssignModal,
        assigning,
        selectedPaymentMethod,
        selectedAccountId,
        setSelectedAccountId,
        availableAccounts,
        handleOpenAssignModal,
        handleCloseAssignModal,
        handleAssignAccount
    };
};
