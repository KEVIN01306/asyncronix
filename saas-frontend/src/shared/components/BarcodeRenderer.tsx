import { useEffect, useRef } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
    value: string;
    onDownload?: (svgRef: SVGSVGElement) => void;
    onPrint?: () => void;
}

export default function BarcodeRenderer({ value, onDownload, onPrint }: BarcodeRendererProps) {
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
        <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Box component="svg" ref={svgRef} sx={{ width: '100%', height: 75 }} />
            {(onDownload || onPrint) && (
                <Stack direction="row" spacing={1} justifyContent="center" mt={0.5}>
                    {onPrint && (
                        <Tooltip title="Imprimir sticker">
                            <IconButton size="small" color="primary" onClick={onPrint}>
                                <Print fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onDownload && (
                        <Tooltip title="Descargar código de barras SVG">
                            <IconButton size="small" onClick={handleDownload}>
                                <Download fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            )}
        </Box>
    );
}
