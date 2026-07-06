import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

interface DeviceAssociationPayload {
    cajaId: string | null;
    cajaNombre: string | null;
    token: string | null;
    asociacionId: string | null;
}

interface DeviceState {
    cajaId: string | null;
    cajaNombre: string | null;
    token: string | null;
    asociacionId: string | null;
    setDeviceAssociation: (cajaId: string, cajaNombre: string, token: string, asociacionId: string) => void;
    clearDeviceAssociation: () => void;
}

const noopStorage: StateStorage<undefined> = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
};

export const useDeviceStore = create<DeviceState>()(
    persist(
        (set) => ({
            cajaId: null,
            cajaNombre: null,
            token: null,
            asociacionId: null,
            setDeviceAssociation: (cajaId, cajaNombre, token, asociacionId) => set({ cajaId, cajaNombre, token, asociacionId }),
            clearDeviceAssociation: () => set({ cajaId: null, cajaNombre: null, token: null, asociacionId: null }),
        }),
        {
            name: 'device-association-storage',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined' ? window.localStorage : noopStorage
            ),
            partialize: (state) => ({
                cajaId: state.cajaId,
                cajaNombre: state.cajaNombre,
                token: state.token,
                asociacionId: state.asociacionId,
            } as DeviceAssociationPayload),
            merge: (persistedState, currentState) => {
                const state = persistedState as Partial<DeviceAssociationPayload> | undefined;
                return {
                    ...currentState,
                    ...(state ?? {}),
                } as DeviceState;
            },
        }
    )
);
