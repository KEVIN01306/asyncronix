import { StyleSheet } from '@react-pdf/renderer';

export const PDF_COLORS = {
    primary: '#1e293b',       // Neutral slate oscuro sobrio (menos colorido)
    primaryLight: '#334155',  // Slate neutro
    textPrimary: '#0f172a',   // Casi negro de alta legibilidad
    textSecondary: '#475569', // Gris oscuro formal
    background: '#ffffff',    // FONDO ESTRICTAMENTE BLANCO
    card: '#ffffff',          // FONDO BLANCO
    success: '#15803d',       // Verde sobrio
    error: '#b91c1c',         // Rojo sobrio
    warning: '#b45309',       // Ámbar sobrio
    border: '#e2e8f0',        // Borde fino claro
    divider: '#cbd5e1',       // Separador sutil
};

export const getPdfStyles = () => {
    return StyleSheet.create({
        page: {
            padding: 36,
            fontFamily: 'Helvetica',
            backgroundColor: '#ffffff', // Fondo 100% blanco puro
            color: PDF_COLORS.textPrimary,
        },
        h1: {
            fontSize: 24,
            fontWeight: 'bold',
            color: PDF_COLORS.textPrimary,
            marginBottom: 12,
        },
        textSecondary: {
            fontSize: 10,
            color: PDF_COLORS.textSecondary,
        },
        card: {
            padding: 12,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: PDF_COLORS.border,
            borderRadius: 2,
            marginBottom: 12,
        },
        
        // Estados de color reutilizables
        statusSuccess: { color: PDF_COLORS.success },
        statusError: { color: PDF_COLORS.error },
        statusWarning: { color: PDF_COLORS.warning },
    });
};