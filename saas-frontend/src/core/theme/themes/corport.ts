import type { PaletteMode } from '@mui/material';
import { adjustColorIntensity } from './colorUtils';

// Tema Enterprise - Estilo Corporativo/Clásico Refinado
export const getCorporateThemePalette = (
    mode: PaletteMode,
    borderIntensity: number = 1,
    borderColorIntensity: number = 0.5
) => {
    const isDark = mode === 'dark';
    const dividerWithIntensity = adjustColorIntensity(borderIntensity, borderColorIntensity, isDark);

    return {
        mode,
        primary: {
            // Azul corporativo: oscuro en light, vibrante en dark para visibilidad
            main: isDark ? '#63B3ED' : '#2C5282',
            contrastText: '#FFFFFF',
        },
        secondary: {
            // Gris plata profesional
            main: isDark ? '#A0AEC0' : '#4A5568',
        },
        success: { main: '#48BB78' },
        warning: { main: '#ECC94B' },
        error: { main: '#F56565' },
        info: { main: '#4299E1' },
        background: {
            // Azul medianoche para dark, gris industrial muy suave para light
            default: isDark ? '#1A202C' : '#F7FAFC',
            paper: isDark ? '#2D3748' : '#FFFFFF',
        },
        text: {
            primary: isDark ? '#EDF2F7' : '#2D3748',
            secondary: isDark ? '#A0AEC0' : '#718096',
        },
        divider: dividerWithIntensity,
        action: {
            hover: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            selected: isDark ? 'rgba(99, 179, 237, 0.2)' : 'rgba(44, 82, 130, 0.1)',
        },
    };
};

export const corporateThemeConfig = {
    shape: { borderRadius: 0 },
    typography: {
        fontFamily: '"Segoe UI", "Tahoma", "Geneva", sans-serif',
        h1: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' },
        h2: { fontSize: '1.4rem', fontWeight: 600 },
        button: { textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 600 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { fontFeatureSettings: '"cv02","cv03","cv04","cv11"' },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 0,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none',
                    backgroundImage: 'none',
                }),
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    padding: '6px 16px',
                    border: '1px solid currentColor',
                },
                contained: { border: 'none' }
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 0,
                    backgroundColor: theme.palette.mode === 'dark' ? '#1A202C' : '#FFFFFF',
                    '& fieldset': { borderColor: theme.palette.divider },
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 0,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
                }),
            },
        },
        MuiChip: {
            styleOverrides: { root: { borderRadius: 0 } },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 0,
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.action.selected,
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                    },
                }),
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }: any) => ({
                    borderRadius: 0,
                    border: `2px solid ${theme.palette.primary.main}`,
                }),
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    padding: '12px',
                }),
                head: { fontWeight: 'bold' }
            },
        },
    },
};

export default corporateThemeConfig;