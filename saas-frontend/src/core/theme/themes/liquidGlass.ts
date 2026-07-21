import { alpha, createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { adjustColorIntensity } from './colorUtils';

// ==========================================
// 1. PALETA DE COLORES (Apple Liquid Glass)
// ==========================================
export const getLiquidGlassThemePalette = (
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
            main: isDark ? '#0A84FF' : '#007AFF', // Apple System Blue
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: isDark ? '#98989D' : '#86868B',
        },
        success: {
            main: '#34C759',
        },
        warning: {
            main: '#FF9500',
        },
        error: {
            main: '#FF3B30',
        },
        info: {
            main: '#5AC8FA',
        },
        background: {
            default: isDark ? '#000000' : '#F2F2F7',
            paper: isDark ? '#1C1C1E' : '#FFFFFF',
        },
        text: {
            primary: isDark ? '#FFFFFF' : '#000000',
            secondary: isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
        },
        divider: dividerWithIntensity,
        action: {
            hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            selected: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        },
    };
};

// ==========================================
// 2. CONFIGURACIÓN LIQUID GLASS
// ==========================================
export const LiquidGlassThemeConfig: Omit<ThemeOptions, 'palette'> = {
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.025em',
            fontSize: '2rem',
        },
        h2: {
            fontWeight: 600,
            letterSpacing: '-0.015em',
            fontSize: '1.5rem',
        },
        h3: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
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
            letterSpacing: '-0.01em',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme }) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        backgroundImage: 'none',
                        // Gradiente que simula la refracción de luz dentro del cristal
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.40) 100%)',
                        // Ecosistema Liquid Glass: Blur + Elevación de saturación de fondo
                        backdropFilter: 'blur(25px) saturate(190%)',
                        WebkitBackdropFilter: 'blur(25px) saturate(190%)',
                        borderRadius: 20,
                        // Borde con efecto de reflejo en bisel (Specular highlight)
                        border: `1px solid ${isDark
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(255, 255, 255, 0.8)'
                            }`,
                        // Sombras ambientales profundas y difusas estilo visionOS
                        boxShadow: isDark
                            ? '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                            : '0 20px 40px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                    };
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: ({ theme }: { theme: Theme }) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 999, // Pill Shape
                        padding: '10px 24px',
                        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: isDark
                            ? 'inset 0 1px 1px rgba(255,255,255,0.2)'
                            : 'inset 0 1px 1px rgba(255,255,255,0.8)',
                        '&:hover': {
                            transform: 'translateY(-1px) scale(1.02)',
                            boxShadow: isDark
                                ? '0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                                : '0 8px 20px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 1)',
                        },
                        '&:active': {
                            transform: 'scale(0.97)',
                        },
                    };
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme }) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 14,
                        background: isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.03)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        transition: 'all 0.25s ease',
                        border: `1px solid ${isDark
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.06)'
                            }`,
                        '& fieldset': {
                            border: 'none',
                        },
                        '&:hover': {
                            background: isDark
                                ? 'rgba(255, 255, 255, 0.09)'
                                : 'rgba(0, 0, 0, 0.05)',
                        },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
                            border: `1px solid ${theme.palette.primary.main}`,
                            background: isDark
                                ? 'rgba(255, 255, 255, 0.12)'
                                : 'rgba(255, 255, 255, 0.8)',
                        },
                    };
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme }) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 24,
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.30) 100%)',
                        backdropFilter: 'blur(30px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                        border: `1px solid ${isDark
                            ? 'rgba(255, 255, 255, 0.12)'
                            : 'rgba(255, 255, 255, 0.7)'
                            }`,
                        boxShadow: isDark
                            ? '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                            : '0 12px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    };
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme }) => ({
                    borderRadius: 10,
                    fontWeight: 500,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    backgroundColor: alpha(
                        theme.palette.text.primary,
                        theme.palette.mode === 'dark' ? 0.08 : 0.05
                    ),
                    border: `1px solid ${alpha(
                        theme.palette.text.primary,
                        theme.palette.mode === 'dark' ? 0.1 : 0.08
                    )}`,
                }),
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme }) => ({
                    borderRadius: 12,
                    margin: '4px 8px',
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.18),
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                }),
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }: { theme: Theme }) => ({
                    borderRadius: 28,
                    padding: 12,
                    backdropFilter: 'blur(40px) saturate(210%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(210%)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 24px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2)'
                        : '0 24px 60px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,1)',
                }),
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined' as const,
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: ({ theme }: { theme: Theme }) => ({
                    borderRight: `1px solid ${theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.5)'
                        }`,
                    backdropFilter: 'blur(30px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                }),
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme }) => ({
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }),
            },
        },
    },
};

// ==========================================
// 3. GENERADOR DEL TEMA
// ==========================================
export const createLiquidGlassTheme = (
    mode: PaletteMode,
    borderIntensity = 1,
    borderColorIntensity = 0.5
) => {
    return createTheme({
        palette: getLiquidGlassThemePalette(mode, borderIntensity, borderColorIntensity),
        ...LiquidGlassThemeConfig,
    });
};

export default LiquidGlassThemeConfig;