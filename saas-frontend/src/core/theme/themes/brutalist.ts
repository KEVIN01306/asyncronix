import { alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { adjustColorIntensity } from './colorUtils';

/**
 * Generador de paleta Neo-Brutalista de alto contraste.
 * Sincronizado milimétricamente con el diseño "BRUTAL.hub" para el balance perfecto
 * de colores tanto en Claro (Crema, Coral, Amarillo) como en Oscuro (Negro, Violeta, Cian).
 */
export const getBrutalistThemePalette = (
    mode: PaletteMode,
    borderIntensity: number = 1,
    borderColorIntensity: number = 0.5
) => {
    const isDark = mode === 'dark';

    // Usar la utilidad de intensidad de borde para calcular el divisor
    const dividerWithIntensity = adjustColorIntensity(
        borderIntensity,
        borderColorIntensity,
        isDark
    );

    return {
        mode,
        primary: {
            // Claro: Coral Brutal | Oscuro: Violeta Eléctrico de alta vibración
            main: isDark ? '#9B5DE5' : '#FF5E5B',
            contrastText: isDark ? '#FFFFFF' : '#FFFFFF',
        },
        secondary: {
            // Claro: Amarillo Ácido | Oscuro: Cian Ácido ultra brillante
            main: isDark ? '#00F5D4' : '#FFD166',
            contrastText: '#000000',
        },
        success: {
            // Verde eléctrico neo-brutalista
            main: isDark ? '#00F5D4' : '#06D6A0',
            contrastText: '#000000',
        },
        warning: {
            main: '#FFD166',
            contrastText: '#000000',
        },
        error: {
            main: '#FF5E5B',
            contrastText: '#FFFFFF',
        },
        info: {
            main: isDark ? '#00F5D4' : '#06B6D4',
            contrastText: isDark ? '#000000' : '#FFFFFF',
        },
        background: {
            // Claro: Crema orgánico retro | Oscuro: Negro absoluto industrial
            default: isDark ? '#0C0C0E' : '#F1EFE9',
            paper: isDark ? '#1E1E24' : '#FFFFFF',
        },
        text: {
            // Máximo contraste en ambos modos para legibilidad agresiva
            primary: isDark ? '#FFFFFF' : '#000000',
            secondary: isDark ? '#C5C5C5' : '#27272A',
        },
        // Bordes gruesos y directos característicos del brutalismo
        divider: dividerWithIntensity || (isDark ? '#FFFFFF' : '#000000'),
        action: {
            hover: isDark
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.08)',
            selected: isDark
                ? 'rgba(255, 255, 255, 0.18)'
                : 'rgba(0, 0, 0, 0.12)',
        },
    };
};

export const brutalistThemeConfig = {
    shape: {
        // En el brutalismo reina la asimetría y las esquinas rígidas (bajas redondeces)
        borderRadius: 4,
    },
    typography: {
        // Combinación de fuentes de alto impacto (Impact para títulos / Courier New para textos técnicos)
        fontFamily: 'Impact, "Arial Black", "Courier New", Courier, monospace, sans-serif',
        h1: {
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            letterSpacing: '-0.03em',
            fontSize: '2.5rem',
            lineHeight: 1.1,
        },
        h2: {
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            letterSpacing: '-0.02em',
            fontSize: '1.8rem',
            lineHeight: 1.2,
        },
        h3: {
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            letterSpacing: '-0.01em',
            fontSize: '1.4rem',
        },
        body1: {
            // Cuerpo de texto usando Courier/Monospace para sensación cruda de terminal
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '0.9rem',
            fontWeight: 700,
            lineHeight: 1.5,
        },
        body2: {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '0.8rem',
            fontWeight: 700,
            lineHeight: 1.4,
        },
        button: {
            textTransform: 'uppercase' as const,
            fontWeight: 900,
            letterSpacing: '0.05em',
            fontFamily: 'Impact, "Arial Black", sans-serif',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    WebkitFontSmoothing: 'none', // Menos suavizado para dar sensación retro/pixelada
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        backgroundImage: 'none',
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 4,
                        // Borde grueso directo (brutal-border)
                        border: `4px solid ${strokeColor}`,
                        // Sombras duras sin difuminar (hard shadows)
                        boxShadow: isDark 
                            ? '6px 6px 0px 0px #FFFFFF' 
                            : '6px 6px 0px 0px #000000',
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                        backdropFilter: 'none', // Sin desenfoques estilo Apple Glassmorphism
                    };
                },
            },
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        backgroundImage: 'none',
                        // Borde inferior grueso y rígido
                        borderBottom: `4px solid ${strokeColor}`,
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderTop: 'none',
                        boxShadow: 'none',
                    };
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        // El brutalismo huye del círculo perfecto corporativo
                        borderRadius: 4, 
                        border: `3px solid ${strokeColor}`,
                        boxShadow: isDark 
                            ? '3px 3px 0px 0px #00F5D4' 
                            : '3px 3px 0px 0px #FF5E5B',
                        fontFamily: 'Impact, sans-serif',
                        fontWeight: 900,
                    };
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        borderRadius: 4,
                        padding: '10px 24px',
                        border: `3px solid ${strokeColor}`,
                        boxShadow: isDark 
                            ? '4px 4px 0px 0px #FFFFFF' 
                            : '4px 4px 0px 0px #000000',
                        transition: 'all 0.1s cubic-bezier(0, 0, 0, 1)',
                        '&:hover': {
                            transform: 'translate(-2px, -2px)',
                            boxShadow: isDark 
                                ? '6px 6px 0px 0px #FFFFFF' 
                                : '6px 6px 0px 0px #000000',
                            backgroundColor: alpha(theme.palette.primary.main, 0.95),
                        },
                        '&:active': {
                            transform: 'translate(2px, 2px)',
                            boxShadow: isDark 
                                ? '2px 2px 0px 0px #FFFFFF' 
                                : '2px 2px 0px 0px #000000',
                        },
                    };
                },
                contained: ({ theme }: any) => ({
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                    }
                }),
                outlined: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        backgroundColor: 'transparent',
                        color: theme.palette.text.primary,
                        borderColor: isDark ? '#FFFFFF' : '#000000',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            borderColor: isDark ? '#FFFFFF' : '#000000',
                        }
                    };
                }
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        borderRadius: 4, // Convertimos el botón redondo en un botón asimétrico/cuadrado brutal
                        border: `2px solid ${strokeColor}`,
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        boxShadow: isDark 
                            ? '2px 2px 0px 0px #FFFFFF' 
                            : '2px 2px 0px 0px #000000',
                        transition: 'all 0.1s ease',
                        '&:hover': {
                            backgroundColor: theme.palette.secondary.main,
                            color: '#000000',
                            transform: 'translate(-1px, -1px)',
                            boxShadow: isDark 
                                ? '3px 3px 0px 0px #FFFFFF' 
                                : '3px 3px 0px 0px #000000',
                        },
                        '&:active': {
                            transform: 'translate(1px, 1px)',
                            boxShadow: '1px 1px 0px 0px currentColor',
                        },
                    };
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        borderRadius: 4,
                        backgroundColor: theme.palette.background.default,
                        border: `3px solid ${strokeColor}`,
                        transition: 'all 0.1s ease',
                        '& fieldset': {
                            border: 'none', // Desactivamos el fieldset predeterminado de MUI para control directo
                        },
                        '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: isDark 
                                ? '4px 4px 0px 0px #00F5D4' 
                                : '4px 4px 0px 0px #FF5E5B',
                        },
                    };
                },
                input: {
                    fontFamily: '"Courier New", Courier, monospace',
                    fontWeight: 700,
                }
            },
        },
        MuiMenu: {
            defaultProps: {
                // Removemos efectos sutiles 3D/drop-shadow para forzar estilo brutalista plano
                elevation: 0,
            },
            styleOverrides: {
                paper: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        borderRadius: 4,
                        border: `4px solid ${strokeColor}`,
                        boxShadow: isDark 
                            ? '6px 6px 0px 0px #FFFFFF' 
                            : '6px 6px 0px 0px #000000',
                        padding: '4px 0',
                        filter: 'none !important', // Desactiva cualquier filtro drop-shadow de componentes flotantes
                    };
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        fontFamily: '"Courier New", Courier, monospace',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '10px 16px',
                        transition: 'all 0.1s ease',
                        margin: '4px 6px',
                        borderRadius: 2,
                        '&:hover': {
                            backgroundColor: theme.palette.secondary.main,
                            color: '#000000',
                            transform: 'translateX(4px)',
                            '& .MuiListItemIcon-root': {
                                color: '#000000',
                            }
                        },
                        '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            border: `2px solid ${isDark ? '#FFFFFF' : '#000000'}`,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                            }
                        }
                    };
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    color: theme.palette.text.primary,
                    minWidth: '36px !important',
                    transition: 'color 0.1s ease',
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        borderRadius: 4,
                        border: `4px solid ${strokeColor}`,
                        boxShadow: isDark 
                            ? '6px 6px 0px 0px #FFFFFF' 
                            : '6px 6px 0px 0px #000000',
                    };
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 2,
                        border: `2px solid ${isDark ? '#FFFFFF' : '#000000'}`,
                        fontWeight: 900,
                        textTransform: 'uppercase' as const,
                        fontFamily: 'Impact, sans-serif',
                        boxShadow: isDark 
                            ? '2px 2px 0px 0px #FFFFFF' 
                            : '2px 2px 0px 0px #000000',
                    };
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 2,
                        margin: '6px 8px',
                        border: `2px solid transparent`,
                        transition: 'all 0.1s ease',
                        '&.Mui-selected': {
                            backgroundColor: theme.palette.secondary.main,
                            color: '#000000',
                            border: `2px solid ${isDark ? '#FFFFFF' : '#000000'}`,
                            '&:hover': {
                                backgroundColor: theme.palette.secondary.main,
                            },
                        },
                        '&:hover': {
                            transform: 'translateX(3px)',
                        }
                    };
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 4,
                        padding: 12,
                        border: `6px solid ${isDark ? '#FFFFFF' : '#000000'}`,
                        boxShadow: isDark 
                            ? '12px 12px 0px 0px #FFFFFF' 
                            : '12px 12px 0px 0px #000000',
                    };
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    const strokeColor = isDark ? '#FFFFFF' : '#000000';
                    return {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        border: `2px solid ${strokeColor}`,
                        borderRadius: 2,
                        boxShadow: isDark 
                            ? '3px 3px 0px 0px #FFFFFF' 
                            : '3px 3px 0px 0px #000000',
                        fontFamily: '"Courier New", Courier, monospace',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '6px 12px',
                    };
                },
                arrow: ({ theme }: any) => ({
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
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
                paper: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRight: `4px solid ${isDark ? '#FFFFFF' : '#000000'}`,
                        backgroundColor: theme.palette.background.default,
                    };
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderBottom: `3px solid ${isDark ? '#FFFFFF' : '#000000'}`,
                        fontFamily: '"Courier New", Courier, monospace',
                        fontWeight: 700,
                    };
                },
                head: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        backgroundColor: theme.palette.secondary.main,
                        color: '#000000',
                        fontFamily: 'Impact, sans-serif',
                        fontSize: '1rem',
                        letterSpacing: '0.05em',
                        borderBottom: `4px solid ${isDark ? '#FFFFFF' : '#000000'}`,
                    };
                }
            },
        },
    },
};

export default brutalistThemeConfig;