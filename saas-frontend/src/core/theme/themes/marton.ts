import { alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { adjustColorIntensity } from './colorUtils';

// Tema Marton - Apple Style
export const getMartonThemePalette = (
    mode: PaletteMode,
    borderIntensity: number = 1,
    borderColorIntensity: number = 0.5
) => {
    const isDark = mode === 'dark';

    const dividerWithIntensity = adjustColorIntensity(
        borderIntensity,
        borderColorIntensity,
        isDark
    );

    return {
        mode,
        primary: {
            main: isDark ? '#0A84FF' : '#007AFF',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: isDark ? '#98989D' : '#86868B',
        },
        success: {
            main: '#10A37F',
        },
        warning: {
            main: '#F59E0B',
        },
        error: {
            main: '#EF4444',
        },
        info: {
            main: '#3B82F6',
        },
        background: {
            default: isDark ? '#000000' : '#F5F5F7',
            paper: isDark ? '#1C1C1E' : '#FFFFFF',
        },
        text: {
            primary: isDark ? '#F5F5F7' : '#1D1D1F',
            secondary: isDark ? '#98989D' : '#86868B',
        },
        divider: dividerWithIntensity,
        action: {
            hover: isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.04)',
            selected: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.06)',
        },
    };
};

export const martonThemeConfig = {
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontSize: '2rem',
        },
        h2: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
            fontSize: '1.5rem',
        },
        h3: {
            fontWeight: 600,
        },
        body1: {
            fontSize: '0.95rem',
            lineHeight: 1.6,
        },
        body2: {
            lineHeight: 1.5,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: 0,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    WebkitFontSmoothing: 'antialiased',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    backgroundImage: 'none',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(28,28,30,0.8)' : 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 16,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none',
                }),
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    padding: '8px 20px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.02)',
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 12,
                    backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2E' : '#E8E8ED',
                    '& fieldset': {
                        border: 'none',
                    },
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 20,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none',
                }),
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 10,
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                }),
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 24,
                    padding: 8,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined' as const,
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: ({ theme }: any) => ({
                    borderRight: `1px solid ${theme.palette.divider}`,
                }),
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }),
            },
        },
    },
};

export default martonThemeConfig;
