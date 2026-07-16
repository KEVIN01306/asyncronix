import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import type * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ExcelDownloaderProps {
    generateWorkbook: () => Promise<ExcelJS.Workbook>;
    fileName?: string;
    buttonText?: string;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'success';
    fullWidth?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const ExcelDownloader: React.FC<ExcelDownloaderProps> = ({
    generateWorkbook,
    fileName = 'documento.xlsx',
    buttonText = 'Descargar Excel',
    variant = 'contained',
    color = 'primary',
    fullWidth = false,
    size = 'medium',
}) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const workbook = await generateWorkbook();
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, fileName);
        } catch (error) {
            console.error('Error al generar el Excel:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            color={color}
            fullWidth={fullWidth}
            size={size}
            disabled={loading}
            onClick={handleDownload}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
        >
            {loading ? 'Generando Excel...' : buttonText}
        </Button>
    );
};
