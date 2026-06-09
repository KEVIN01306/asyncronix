import { useEffect, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import { Download } from '@mui/icons-material';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
    value: string;
    onDownload?: (svgRef: SVGSVGElement) => void;
}

export default function BarcodeRenderer({ value, onDownload }: BarcodeRendererProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current || !value) return;

        try {
            JsBarcode(svgRef.current, value, {
                format: 'CODE128',
                width: 1.5,
                height: 48,
                displayValue: true,
                margin: 0
            });
        } catch (error) {
            console.error('Error al generar el código de barras', error);
        }
    }, [value]);

    const handleDownload = () => {
        if (svgRef.current && onDownload) {
            onDownload(svgRef.current);
        }
    };

    return (
        <Box>
            <Box component="svg" ref={svgRef} sx={{ width: '100%', height: 80 }} />
            {onDownload && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <IconButton size="small" onClick={handleDownload} title="Descargar código de barras">
                        <Download fontSize="small" />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
}
