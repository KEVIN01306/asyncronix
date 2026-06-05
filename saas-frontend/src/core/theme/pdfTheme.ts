import { StyleSheet } from '@react-pdf/renderer';

export const PDF_COLORS = {
    primary: '#1E3A8A',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    background: '#f8faff',
    card: '#ffffff',
    success: '#10b981',
    error: '#d84e47',
    warning: '#f2ba5a',
    border: 'rgba(227, 232, 238, 1)',
};

export const getPdfStyles = () => {
    return StyleSheet.create({
        page: {
            padding: 40,
            fontFamily: 'Helvetica',
            backgroundColor: PDF_COLORS.background,
            color: PDF_COLORS.textPrimary,
        },
        h1: {
            fontSize: 28,
            fontWeight: 'bold',
            color: PDF_COLORS.primary,
            marginBottom: 15,
        },
        textSecondary: {
            fontSize: 12,
            color: PDF_COLORS.textSecondary,
        },
        card: {
            padding: 16,
            backgroundColor: PDF_COLORS.card,
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