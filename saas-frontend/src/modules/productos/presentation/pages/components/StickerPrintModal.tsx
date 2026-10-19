import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Button,
    Typography,
    Stack,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    TextField,
    Chip,
    Divider,
    IconButton,
    Paper
} from '@mui/material';
import {
    Print,
    Close,
    QrCode2,
    ViewWeek,
    AspectRatio
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { formatMoney } from '../../../../../core/utils/formatMoney';
import { useAuthStore } from '../../../../../core/store/authStore';
import type { Variante } from '../../../domain/interfaces/producto.interface';

export type StickerCodeType = 'BARCODE' | 'QR' | 'BOTH';
export type StickerLabelSize = '50x30' | '58x40' | '40x30' | '70x40';

interface LabelDimension {
    width: number; // in mm
    height: number; // in mm
    name: string;
    description: string;
}

const LABEL_SIZES: Record<StickerLabelSize, LabelDimension> = {
    '50x30': { width: 50, height: 30, name: '50 x 30 mm', description: 'Estándar térmico (Góndolas / Productos)' },
    '58x40': { width: 58, height: 40, name: '58 x 40 mm', description: 'Mediano (Retail / Etiquetas completas)' },
    '40x30': { width: 40, height: 30, name: '40 x 30 mm', description: 'Compacto (Joyería / Accesorios)' },
    '70x40': { width: 70, height: 40, name: '70 x 40 mm', description: 'Ancho (Cajas / Doble código)' }
};

interface Props {
    open: boolean;
    onClose: () => void;
    productoNombre: string;
    variante: Variante | null;
    initialCodeType?: StickerCodeType;
}

export const StickerPrintModal: React.FC<Props> = ({
    open,
    onClose,
    productoNombre,
    variante,
    initialCodeType = 'BARCODE'
}) => {
    const authState = useAuthStore();
    const nombreNegocio = authState?.user?.negocio?.nombre_comercial || '';

    const hasBarcode = Boolean(variante?.codigo_barras);
    const hasQr = Boolean(variante?.qr_codigo);

    // Initial code type decision based on available data
    const getValidInitialType = (): StickerCodeType => {
        if (initialCodeType === 'BOTH' && hasBarcode && hasQr) return 'BOTH';
        if (initialCodeType === 'BARCODE' && hasBarcode) return 'BARCODE';
        if (initialCodeType === 'QR' && hasQr) return 'QR';
        if (hasBarcode) return 'BARCODE';
        if (hasQr) return 'QR';
        return 'BARCODE';
    };

    const [codeType, setCodeType] = useState<StickerCodeType>(getValidInitialType());
    const [labelSize, setLabelSize] = useState<StickerLabelSize>('50x30');
    const [cantidad, setCantidad] = useState<number>(1);

    // Toggleable fields
    const [mostrarNegocio, setMostrarNegocio] = useState(false);
    const [mostrarNombre, setMostrarNombre] = useState(true);
    const [mostrarAtributos, setMostrarAtributos] = useState(true);
    const [mostrarPrecio, setMostrarPrecio] = useState(true);
    const [mostrarSku, setMostrarSku] = useState(true);

    const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    // Update codeType when modal opens or initialCodeType/variante changes
    useEffect(() => {
        if (open && variante) {
            setCodeType(getValidInitialType());
            setCantidad(1);
        }
    }, [open, variante, initialCodeType]);

    // Render JsBarcode whenever relevant values change
    useEffect(() => {
        if (!variante?.codigo_barras || !barcodeSvgRef.current) return;
        if (codeType !== 'BARCODE' && codeType !== 'BOTH') return;

        try {
            const sizeCfg = LABEL_SIZES[labelSize];
            const isBoth = codeType === 'BOTH';
            // Adjust barcode bar height according to label height
            const barHeight = isBoth ? 24 : sizeCfg.height <= 30 ? 32 : 46;
            const barWidth = isBoth ? 1.0 : sizeCfg.width <= 40 ? 1.1 : 1.35;

            JsBarcode(barcodeSvgRef.current, variante.codigo_barras, {
                format: 'CODE128',
                width: barWidth,
                height: barHeight,
                displayValue: true,
                fontSize: 10,
                font: 'monospace',
                textMargin: 1,
                margin: 0
            });
        } catch (error) {
            console.error('Error al generar código de barras para sticker:', error);
        }
    }, [variante?.codigo_barras, codeType, labelSize, open]);

    if (!variante) return null;

    // Attributes string
    const atributosTexto = variante.valores && variante.valores.length > 0
        ? variante.valores.map((v) => `${v.atributo?.nombre ?? ''}: ${v.valor}`).join(' | ')
        : '';

    const currentDimension = LABEL_SIZES[labelSize];

    // Helper to generate SVG string from JsBarcode
    const getBarcodeSvgString = (barcodeValue: string, widthMm: number, heightMm: number, isBoth: boolean) => {
        try {
            const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const barHeight = isBoth ? 24 : heightMm <= 30 ? 34 : 48;
            const barWidth = isBoth ? 1.0 : widthMm <= 40 ? 1.1 : 1.35;

            JsBarcode(tempSvg, barcodeValue, {
                format: 'CODE128',
                width: barWidth,
                height: barHeight,
                displayValue: true,
                fontSize: 10,
                font: 'monospace',
                textMargin: 1,
                margin: 0
            });
            const serializer = new XMLSerializer();
            return serializer.serializeToString(tempSvg);
        } catch (err) {
            console.error('Error generating barcode SVG string:', err);
            return '';
        }
    };

    // Helper to extract or generate QR SVG
    const getQrSvgString = () => {
        // Query the rendered QR from the preview DOM
        const previewQrEl = previewContainerRef.current?.querySelector('[data-sticker-qr] svg');
        if (previewQrEl) {
            const serializer = new XMLSerializer();
            return serializer.serializeToString(previewQrEl);
        }
        return '';
    };

    const handlePrint = () => {
        const sizeCfg = LABEL_SIZES[labelSize];
        const widthMm = sizeCfg.width;
        const heightMm = sizeCfg.height;
        const copies = Math.max(1, Math.min(500, Number(cantidad) || 1));
        const isBoth = codeType === 'BOTH';

        // Prepare code SVGs
        let barcodeHtml = '';
        if ((codeType === 'BARCODE' || isBoth) && variante.codigo_barras) {
            barcodeHtml = getBarcodeSvgString(variante.codigo_barras, widthMm, heightMm, isBoth);
        }

        let qrHtml = '';
        if ((codeType === 'QR' || isBoth) && variante.qr_codigo) {
            qrHtml = getQrSvgString();
        }

        const priceText = formatMoney(variante.precio_sugerido ?? 0);
        const skuText = variante.sku || 'N/A';

        // Generate one sticker label inner HTML for print
        const labelContentHtml = `
            ${mostrarNegocio && nombreNegocio ? `<div class="st-business">${nombreNegocio}</div>` : ''}
            ${mostrarNombre ? `<div class="st-name">${productoNombre}</div>` : ''}
            ${mostrarAtributos && atributosTexto ? `<div class="st-attrs">${atributosTexto}</div>` : ''}
            
            <div class="st-code-container ${isBoth ? 'st-code-both' : ''}">
                ${(codeType === 'QR' || isBoth) && qrHtml ? `
                    <div class="st-qr-wrap">
                        ${qrHtml}
                        ${codeType === 'QR' ? `<div class="st-code-sub">${variante.qr_codigo}</div>` : ''}
                    </div>
                ` : ''}
                ${(codeType === 'BARCODE' || isBoth) && barcodeHtml ? `
                    <div class="st-barcode-wrap">
                        ${barcodeHtml}
                    </div>
                ` : ''}
            </div>

            <div class="st-footer">
                ${mostrarSku ? `<span class="st-sku">SKU: ${skuText}</span>` : '<span></span>'}
                ${mostrarPrecio ? `<span class="st-price">${priceText}</span>` : '<span></span>'}
            </div>
        `;

        // Repeat for N copies
        let allPagesHtml = '';
        for (let i = 0; i < copies; i++) {
            allPagesHtml += `<div class="sticker-page">${labelContentHtml}</div>`;
        }

        // Invisible iframe technique for clean thermal roll printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-10000px';
        iframe.style.left = '-10000px';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (!doc) {
            return;
        }

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Etiquetas - ${variante.sku || productoNombre}</title>
                <style>
                    @page {
                        size: ${widthMm}mm ${heightMm}mm;
                        margin: 0mm;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .sticker-page {
                        width: ${widthMm}mm;
                        height: ${heightMm}mm;
                        max-width: ${widthMm}mm;
                        max-height: ${heightMm}mm;
                        box-sizing: border-box;
                        page-break-after: always;
                        break-after: page;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1.5mm 2mm;
                        text-align: center;
                        background: #ffffff;
                    }
                    .sticker-page:last-child {
                        page-break-after: avoid;
                        break-after: avoid;
                    }
                    .st-business {
                        font-size: 7pt;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        line-height: 1.1;
                        max-width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .st-name {
                        font-size: 8.5pt;
                        font-weight: 800;
                        line-height: 1.15;
                        max-width: 100%;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .st-attrs {
                        font-size: 7pt;
                        font-weight: 600;
                        line-height: 1.1;
                        max-width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .st-code-container {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0.5mm 0;
                        flex-grow: 1;
                    }
                    .st-code-both {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-around;
                        gap: 2mm;
                    }
                    .st-qr-wrap {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                    .st-code-sub {
                        font-size: 6.5pt;
                        font-family: monospace;
                        font-weight: 700;
                        margin-top: 0.5mm;
                        letter-spacing: 0.3px;
                    }
                    .st-barcode-wrap {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                    }
                    .st-footer {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        line-height: 1;
                        padding-top: 0.5mm;
                    }
                    .st-sku {
                        font-size: 7.5pt;
                        font-weight: 700;
                        font-family: monospace;
                    }
                    .st-price {
                        font-size: 9.5pt;
                        font-weight: 900;
                    }
                    svg {
                        display: block;
                        margin: 0 auto;
                        shape-rendering: crispEdges;
                    }
                </style>
            </head>
            <body>
                ${allPagesHtml}
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch (e) {
                console.error('Error al imprimir etiquetas:', e);
            } finally {
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 2000);
            }
        }, 300);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Print />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            Imprimir Etiqueta / Sticker
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Optimizado para impresoras térmicas de etiquetas adhesivas
                        </Typography>
                    </Box>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={3}>
                    {/* Controls Column */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2.5}>
                            {/* Product Info Summary */}
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Variante a imprimir
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    {productoNombre}
                                </Typography>
                                {atributosTexto && (
                                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                                        {atributosTexto}
                                    </Typography>
                                )}
                                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                                    <Chip label={`SKU: ${variante.sku || 'N/A'}`} size="small" variant="outlined" />
                                    <Chip label={`Precio: ${formatMoney(variante.precio_sugerido ?? 0)}`} size="small" color="primary" />
                                    <Chip label={`Stock: ${variante.stock_total ?? 0}`} size="small" variant="outlined" />
                                </Stack>
                            </Paper>

                            {/* Code to Print Selector */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    1. Código a incluir en el sticker
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="code-type-label">Tipo de código</InputLabel>
                                    <Select
                                        labelId="code-type-label"
                                        value={codeType}
                                        label="Tipo de código"
                                        onChange={(e) => setCodeType(e.target.value as StickerCodeType)}
                                    >
                                        <MenuItem value="BARCODE" disabled={!hasBarcode}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <ViewWeek fontSize="small" />
                                                <Typography variant="body2">Código de Barras {!hasBarcode ? '(No configurado)' : ''}</Typography>
                                            </Stack>
                                        </MenuItem>
                                        <MenuItem value="QR" disabled={!hasQr}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <QrCode2 fontSize="small" />
                                                <Typography variant="body2">Código QR {!hasQr ? '(No generado)' : ''}</Typography>
                                            </Stack>
                                        </MenuItem>
                                        <MenuItem value="BOTH" disabled={!hasBarcode || !hasQr}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <AspectRatio fontSize="small" />
                                                <Typography variant="body2">Ambos (QR + Barras) {(!hasBarcode || !hasQr) ? '(Requiere ambos)' : ''}</Typography>
                                            </Stack>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Label Size Selector */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    2. Tamaño del rollo / etiqueta
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="label-size-label">Tamaño de etiqueta</InputLabel>
                                    <Select
                                        labelId="label-size-label"
                                        value={labelSize}
                                        label="Tamaño de etiqueta"
                                        onChange={(e) => setLabelSize(e.target.value as StickerLabelSize)}
                                    >
                                        {Object.entries(LABEL_SIZES).map(([key, val]) => (
                                            <MenuItem key={key} value={key}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{val.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{val.description}</Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Quantity Selector */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    3. Cantidad de etiquetas (Copias)
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                                        inputProps={{ min: 1, max: 500 }}
                                        sx={{ width: 110 }}
                                    />
                                    <Stack direction="row" spacing={0.5}>
                                        {[1, 2, 5, 10, 20].map((num) => (
                                            <Button
                                                key={num}
                                                size="small"
                                                variant={cantidad === num ? 'contained' : 'outlined'}
                                                onClick={() => setCantidad(num)}
                                                sx={{ minWidth: 38, px: 1 }}
                                            >
                                                {num}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Box>

                            {/* Toggles */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    4. Datos visibles en el sticker
                                </Typography>
                                <Grid container spacing={0.5}>
                                    {nombreNegocio && (
                                        <Grid size={{ xs: 6 }}>
                                            <FormControlLabel
                                                control={<Switch size="small" checked={mostrarNegocio} onChange={(e) => setMostrarNegocio(e.target.checked)} />}
                                                label={<Typography variant="caption">Nombre del negocio</Typography>}
                                            />
                                        </Grid>
                                    )}
                                    <Grid size={{ xs: 6 }}>
                                        <FormControlLabel
                                            control={<Switch size="small" checked={mostrarNombre} onChange={(e) => setMostrarNombre(e.target.checked)} />}
                                            label={<Typography variant="caption">Nombre del producto</Typography>}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <FormControlLabel
                                            control={<Switch size="small" checked={mostrarAtributos} onChange={(e) => setMostrarAtributos(e.target.checked)} />}
                                            label={<Typography variant="caption">Atributos / Variante</Typography>}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <FormControlLabel
                                            control={<Switch size="small" checked={mostrarPrecio} onChange={(e) => setMostrarPrecio(e.target.checked)} />}
                                            label={<Typography variant="caption">Precio sugerido</Typography>}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <FormControlLabel
                                            control={<Switch size="small" checked={mostrarSku} onChange={(e) => setMostrarSku(e.target.checked)} />}
                                            label={<Typography variant="caption">SKU</Typography>}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Live Preview Column */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                Vista Previa Real ({currentDimension.name})
                            </Typography>
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    bgcolor: '#e2e8f0',
                                    borderRadius: 3,
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px dashed #cbd5e1',
                                    minHeight: 280
                                }}
                            >
                                {/* Simulated Sticker */}
                                <Paper
                                    elevation={4}
                                    ref={previewContainerRef}
                                    sx={{
                                        width: `${currentDimension.width * 5.2}px`,
                                        height: `${currentDimension.height * 5.2}px`,
                                        maxWidth: '100%',
                                        bgcolor: '#ffffff',
                                        color: '#000000',
                                        borderRadius: '3px',
                                        p: '8px 10px',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        border: '1px solid #e0e0e0',
                                        userSelect: 'none'
                                    }}
                                >
                                    {/* Business Name */}
                                    {mostrarNegocio && nombreNegocio && (
                                        <Typography
                                            sx={{
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                lineHeight: 1.1,
                                                color: '#000',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%'
                                            }}
                                        >
                                            {nombreNegocio}
                                        </Typography>
                                    )}

                                    {/* Product Name */}
                                    {mostrarNombre && (
                                        <Typography
                                            sx={{
                                                fontSize: '11.5px',
                                                fontWeight: 800,
                                                lineHeight: 1.15,
                                                color: '#000',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                width: '100%'
                                            }}
                                        >
                                            {productoNombre}
                                        </Typography>
                                    )}

                                    {/* Attributes */}
                                    {mostrarAtributos && atributosTexto && (
                                        <Typography
                                            sx={{
                                                fontSize: '9.5px',
                                                fontWeight: 600,
                                                lineHeight: 1.1,
                                                color: '#111',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%'
                                            }}
                                        >
                                            {atributosTexto}
                                        </Typography>
                                    )}

                                    {/* Center Codes */}
                                    <Box
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            my: '2px',
                                            flexGrow: 1,
                                            gap: 1
                                        }}
                                    >
                                        {/* QR SVG */}
                                        {(codeType === 'QR' || codeType === 'BOTH') && variante.qr_codigo && (
                                            <Box
                                                data-sticker-qr
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <QRCodeSVG
                                                    value={variante.qr_codigo}
                                                    size={codeType === 'BOTH' ? 50 : labelSize === '40x30' ? 52 : 64}
                                                    bgColor="#ffffff"
                                                    fgColor="#000000"
                                                    level="M"
                                                    includeMargin={false}
                                                />
                                                {codeType === 'QR' && (
                                                    <Typography
                                                        sx={{
                                                            fontSize: '8.5px',
                                                            fontFamily: 'monospace',
                                                            fontWeight: 700,
                                                            color: '#000',
                                                            mt: '2px',
                                                            lineHeight: 1
                                                        }}
                                                    >
                                                        {variante.qr_codigo}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {/* Barcode SVG */}
                                        {(codeType === 'BARCODE' || codeType === 'BOTH') && (
                                            <Box sx={{ width: codeType === 'BOTH' ? '60%' : '100%', display: 'flex', justifyContent: 'center' }}>
                                                {variante.codigo_barras ? (
                                                    <Box component="svg" ref={barcodeSvgRef} sx={{ width: '100%', maxWidth: '100%' }} />
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">Sin código de barras</Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Footer: SKU and Price */}
                                    <Box
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-end',
                                            lineHeight: 1,
                                            pt: '2px'
                                        }}
                                    >
                                        {mostrarSku ? (
                                            <Typography sx={{ fontSize: '9.5px', fontWeight: 700, fontFamily: 'monospace', color: '#000' }}>
                                                SKU: {variante.sku || 'N/A'}
                                            </Typography>
                                        ) : <Box />}

                                        {mostrarPrecio ? (
                                            <Typography sx={{ fontSize: '13px', fontWeight: 900, color: '#000' }}>
                                                {formatMoney(variante.precio_sugerido ?? 0)}
                                            </Typography>
                                        ) : <Box />}
                                    </Box>
                                </Paper>

                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
                                    Imprime en blanco y negro puro para máxima legibilidad de lectores
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<Print />}
                    onClick={handlePrint}
                    sx={{ px: 4, fontWeight: 700 }}
                >
                    Imprimir {cantidad > 1 ? `${cantidad} Etiquetas` : 'Etiqueta'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StickerPrintModal;
