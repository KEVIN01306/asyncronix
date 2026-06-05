// PdfDownloader.tsx
import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download'; // Opcional, si usas @mui/icons-material

interface PdfDownloaderProps {
    document: React.ReactElement<any>;
    fileName?: string;
    buttonText?: string;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'success';
    fullWidth?: boolean;
}

export const PdfDownloader: React.FC<PdfDownloaderProps> = ({
    document,
    fileName = 'documento.pdf',
    buttonText = 'Descargar PDF',
    variant = 'contained',
    color = 'primary',
    fullWidth = false,
}) => {
    return (
        <PDFDownloadLink document={document} fileName={fileName} style={{ textDecoration: 'none' }}>
            {({ loading }) => (
                <Button
                    variant={variant}
                    color={color}
                    fullWidth={fullWidth}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                >
                    {loading ? 'Generando documento...' : buttonText}
                </Button>
            )}
        </PDFDownloadLink>
    );
};