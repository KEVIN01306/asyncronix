import { useEffect, useRef, useCallback } from 'react';

export const isAbortError = (error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') {
        return true;
    }

    if (typeof error === 'object' && error !== null) {
        const maybeError = error as { name?: string; code?: string };
        return maybeError.name === 'CanceledError' || maybeError.code === 'ERR_CANCELED';
    }

    return false;
};

export const useAbortableFetch = () => {
    const controllerRef = useRef<AbortController | null>(null);

    const fetchWithAbort = useCallback(<T>(fetcher: (signal: AbortSignal) => Promise<T>) => {
        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;

        return fetcher(controller.signal)
            .catch((error) => {
                if (isAbortError(error)) {
                    return undefined as unknown as T;
                }
                throw error;
            })
            .finally(() => {
                if (controllerRef.current === controller) {
                    controllerRef.current = null;
                }
            });
    }, []);

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    return fetchWithAbort;
};
