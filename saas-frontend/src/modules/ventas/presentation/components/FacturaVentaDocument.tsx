import React from 'react';
import { Box, Paper, Typography, Stack, Chip, Button, Divider, Link as MuiLink } from '@mui/material';
import { Description as FileIcon, ErrorOutline as ErrorIcon, CheckCircleOutline as SuccessIcon, Download as DownloadIcon, Launch as LaunchIcon } from '@mui/icons-material';
import type { Venta } from '../../domain/interfaces/venta.interface';

interface FacturaVentaDocumentProps {
    factura: Venta['factura'];
}

export const FacturaVentaDocument: React.FC<FacturaVentaDocumentProps> = ({ factura }) => {
    if (!factura) return null;

    const isSuccess = factura.estado === 'CERTIFICADA';
    const isError = factura.estado === 'ERROR';

    return (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, borderColor: isError ? 'error.main' : (isSuccess ? 'success.main' : 'divider'), bgcolor: isError ? 'error.50' : (isSuccess ? 'success.50' : 'background.paper') }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    {isSuccess ? <SuccessIcon color="success" /> : (isError ? <ErrorIcon color="error" /> : <FileIcon color="action" />)}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Documento Fiscal Electrónico (FEL)
                        </Typography>
                        {factura.numero_factura && (
                            <Typography variant="body2" color="text.secondary">
                                Documento: {factura.serie ? `${factura.serie}-` : ''}{factura.numero_factura}
                            </Typography>
                        )}
                    </Box>
                </Stack>
                <Chip
                    label={factura.estado}
                    color={isSuccess ? 'success' : (isError ? 'error' : 'default')}
                    size="small"
                    sx={{ fontWeight: 600 }}
                />
            </Box>

            {isError && (
                <Typography variant="body2" color="error.dark" mb={2}>
                    Ocurrió un error durante el proceso de certificación con Digifact. Por favor, reintente la facturación manualmente o contacte a soporte.
                </Typography>
            )}

            {isSuccess && (
                <Stack spacing={2}>
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Autorización (UUID)</Typography>
                            <Typography variant="body2" fontFamily="monospace" fontWeight={500} noWrap title={factura.dte_uuid || ''}>
                                {factura.dte_uuid || 'N/A'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Fecha Certificación</Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {factura.fecha_certificacion ? new Date(factura.fecha_certificacion).toLocaleString('es-ES') : 'N/A'}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    <Box display="flex" gap={2} flexWrap="wrap">
                        {factura.dle_sat_pdf && (
                            <Button
                                component={MuiLink}
                                href={factura.dle_sat_pdf}
                                target="_blank"
                                rel="noopener"
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<LaunchIcon />}
                                sx={{ textTransform: 'none', boxShadow: 'none' }}
                            >
                                Ver PDF Original
                            </Button>
                        )}
                        {factura.dte_sat_xml && (
                            <Button
                                component={MuiLink}
                                href={factura.dte_sat_xml}
                                target="_blank"
                                rel="noopener"
                                variant="outlined"
                                color="inherit"
                                size="small"
                                startIcon={<DownloadIcon />}
                                sx={{ textTransform: 'none' }}
                            >
                                Descargar XML
                            </Button>
                        )}
                    </Box>
                </Stack>
            )}
        </Paper>
    );
};
