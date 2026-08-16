import { useEffect, useRef } from 'react';

interface UseBarcodeScannerOptions {
    onScan: (code: string) => void;
    threshold?: number; // max time between keystrokes (ms)
}

export function useBarcodeScanner({ onScan, threshold = 50 }: UseBarcodeScannerOptions) {
    const buffer = useRef('');
    const lastKeyTime = useRef<number>(Date.now());
    const onScanRef = useRef(onScan);

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if a modifier key is pressed (unless it's shift for uppercase barcodes)
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            const currentTime = Date.now();
            
            if (currentTime - lastKeyTime.current > threshold) {
                buffer.current = '';
            }

            if (e.key === 'Enter') {
                if (buffer.current.length > 2) {
                    onScanRef.current(buffer.current);
                    buffer.current = '';
                    e.preventDefault();
                    return;
                }
            }

            if (e.key.length === 1) {
                buffer.current += e.key;
            }

            lastKeyTime.current = currentTime;
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [threshold]);
}
