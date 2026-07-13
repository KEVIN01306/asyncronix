import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

import { useDeviceStore } from '../../../../core/store/deviceStore';
import { cajaRepository } from '../../../caja/infrastructure/caja.repository';
import type { Caja } from '../../../caja/domain/interfaces/caja.interface';
import type { SucursalMiDetalle } from '../../domain/interfaces/sucursal.interface';
import { useAuthStore } from '../../../../core/store/authStore';

export const useDeviceAssociation = (
    sucursal: SucursalMiDetalle,
    setSucursal: React.Dispatch<React.SetStateAction<SucursalMiDetalle | null>>
) => {
    const user = useAuthStore((state) => state.user);
    const canAdminSucursal = user?.permisos.includes('ADMIN_SUCURSAL') ?? false;

    const deviceCajaId = useDeviceStore((state) => state.cajaId);
    const deviceAsociacionId = useDeviceStore((state) => state.asociacionId);
    const setDeviceAssociation = useDeviceStore((state) => state.setDeviceAssociation);
    const clearDeviceAssociation = useDeviceStore((state) => state.clearDeviceAssociation);

    const [openDeviceModal, setOpenDeviceModal] = useState(false);
    const [pinSucursal, setPinSucursal] = useState('');
    const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
    const [deviceActionLoading, setDeviceActionLoading] = useState(false);
    const [deviceMessage, setDeviceMessage] = useState<string | null>(null);
    const [confirmDissociateOpen, setConfirmDissociateOpen] = useState(false);
    const [pendingDissociateCaja, setPendingDissociateCaja] = useState<Caja | null>(null);
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictCaja, setConflictCaja] = useState<Caja | null>(null);

    const currentDeviceCaja = useMemo(() => {
        if (!deviceAsociacionId) return null;
        return sucursal.cajas.find((caja) => caja.asociacion_id === deviceAsociacionId) ?? null;
    }, [sucursal, deviceAsociacionId]);

    useEffect(() => {
        if (!deviceAsociacionId) return;
        const matchedCaja = sucursal.cajas.find((caja) => caja.asociacion_id === deviceAsociacionId);
        if (!matchedCaja) {
            setConflictCaja(null);
            setConflictModalOpen(true);
        }
    }, [sucursal, deviceAsociacionId]);

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

    return {
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
    };
};
