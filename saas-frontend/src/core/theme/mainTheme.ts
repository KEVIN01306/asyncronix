import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

const getThemePalette = (mode: PaletteMode) => {
    const isDark = mode === 'dark';

    return {
        mode,
        primary: {
            main: '#1E3A8A',
            
        },
        secondary: {
            main: '#4c72a7',
        },
        warning: {
            main: '#f2ba5a',
        },
        error: {
            main: '#d84e47',
        },
        success: {
            main: '#10b981',
        },
        info: {
            main: '#38bdf8',
        },
        background: {
            default: isDark ? '#0F172A' : '#f8faff',
            paper: isDark ? '#111827' : '#ffffff',
        },
        text: {
            primary: isDark ? '#e2e8f0' : '#0f172a',
            secondary: isDark ? '#cbd5e1' : '#64748b',
        },
        divider: isDark ? '#273449' : '#e3e8ee',
        action: {
            hover: isDark ? '#1e293b' : '#f8fafc',
        },
    };
};

export const createAppTheme = (mode: PaletteMode) =>
    createTheme({
        palette: getThemePalette(mode),
        shape: {
            borderRadius: 2,
        },
        typography: {
            fontFamily: '"Inter","Roboto", "Helvetica", Arial, sans-serif',
            h1: { fontSize: '2.5rem', fontWeight: 700 },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        border: `1px solid ${theme.palette.divider}`,
                    }),
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: 'none',
                    }),
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: () => ({
                        paddingTop: 3,
                        paddingBottom: 3,
                    }),
                },
            },
        },
    });

export const mainTheme = createAppTheme('light');
