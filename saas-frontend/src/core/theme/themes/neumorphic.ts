import { alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { adjustColorIntensity } from './colorUtils';

/**
 * Helper para generar sombras neumórficas reales (luces y sombras paralelas).
 * El neumorfismo requiere dos fuentes de luz opuestas para simular volumen 3D.
 */
const getNeumorphicShadow = (isDark: boolean, inset = false, intensityMultiplier = 1) => {
    // Definimos los tonos de luz y sombra según el modo
    const lightColor = isDark ? '#262b30' : '#ffffff';
    const darkColor = isDark ? '#121316' : '#a3b1c6';
    
    // Distancias proporcionales de fisicalidad
    const dist = `${8 * intensityMultiplier}px`;
    const negativeDist = `-${8 * intensityMultiplier}px`;
    const blur = `${16 * intensityMultiplier}px`;

    if (inset) {
        return `inset ${dist} ${dist} ${blur} ${darkColor}, inset ${negativeDist} ${negativeDist} ${blur} ${lightColor}`;
    }
    return `${dist} ${dist} ${blur} ${darkColor}, ${negativeDist} ${negativeDist} ${blur} ${lightColor}`;
};

/**
 * Generador de paleta Neumórfica (Soft UI).
 * Diseñado con colores de bajo contraste para suavizar las sombras duales.
 */
export const getNeumorphicThemePalette = (
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
            // Indigo suave para claro | Cian eléctrico amortiguado para oscuro
            main: isDark ? '#00F5D4' : '#4F46E5',
            contrastText: isDark ? '#000000' : '#FFFFFF',
        },
        secondary: {
            // Rosa orgánico para claro | Violeta galáctico suave para oscuro
            main: isDark ? '#ac74f1' : '#F43F5E',
            contrastText: '#FFFFFF',
        },
        success: {
            main: isDark ? '#00F5D4' : '#10B981',
            contrastText: isDark ? '#000000' : '#FFFFFF',
        },
        warning: {
            main: '#F59E0B',
            contrastText: '#000000',
        },
        error: {
            main: '#EF4444',
            contrastText: '#FFFFFF',
        },
        info: {
            main: isDark ? '#00F5D4' : '#3B82F6',
            contrastText: isDark ? '#000000' : '#FFFFFF',
        },
        background: {
            // El color de fondo DEBE ser exactamente igual al de los paneles (Paper)
            // para que las sombras neumórficas funcionen de forma fotorrealista.
            default: isDark ? '#1C1E22' : '#E0E8F6',
            paper: isDark ? '#1C1E22' : '#E0E8F6',
        },
        text: {
            // Tonos mate de bajo contraste para combinar orgánicamente
            primary: isDark ? '#E2E8F0' : '#3E4A5B',
            secondary: isDark ? '#A0AEC0' : '#718096',
        },
        // En Neumorfismo los bordes divisorios son casi invisibles o inexistentes
        divider: dividerWithIntensity || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
        action: {
            hover: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
            selected: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.03)',
        },
    };
};

export const neumorphicThemeConfig = {
    shape: {
        // En Neumorfismo imperan las curvas redondeadas y orgánicas para simular moldes fluidos
        borderRadius: 20,
    },
    typography: {
        // Tipografía elegante, moderna y sumamente legible (Inter)
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: {
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontSize: '2.2rem',
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
            fontSize: '1.6rem',
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        body1: {
            fontSize: '0.925rem',
            fontWeight: 500,
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.8rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        button: {
            textTransform: 'none' as const,
            fontWeight: 700,
            letterSpacing: '0.02em',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    WebkitFontSmoothing: 'antialiased',
                    transition: 'background-color 0.4s ease, color 0.4s ease',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        backgroundImage: 'none',
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 20,
                        // Relieve neumórfico estándar hacia afuera
                        boxShadow: getNeumorphicShadow(isDark, false, 1),
                        // Borde milimétrico ultra suave para evitar cortes duros
                        border: isDark 
                            ? '1px solid rgba(255, 255, 255, 0.03)' 
                            : '1px solid rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
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
                    return {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        backgroundImage: 'none',
                        // Un sutil relieve hacia afuera en la parte inferior para marcar jerarquía física
                        boxShadow: getNeumorphicShadow(isDark, false, 0.6),
                        border: 'none',
                        borderRadius: '0px 0px 24px 24px',
                    };
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: '50%',
                        // El avatar parece encastrado en un hueco neumórfico
                        boxShadow: getNeumorphicShadow(isDark, true, 0.4),
                        border: isDark 
                            ? '2px solid rgba(255, 255, 255, 0.05)' 
                            : '2px solid rgba(255, 255, 255, 0.8)',
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
                    return {
                        borderRadius: 16,
                        padding: '10px 24px',
                        transition: 'all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        // Por defecto los botones están sutilmente elevados
                        boxShadow: getNeumorphicShadow(isDark, false, 0.6),
                        border: isDark 
                            ? '1px solid rgba(255,255,255,0.02)' 
                            : '1px solid rgba(255,255,255,0.4)',
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        
                        '&:hover': {
                            // Se elevan un poco más al hacer hover
                            boxShadow: getNeumorphicShadow(isDark, false, 0.8),
                            backgroundColor: theme.palette.background.default,
                            transform: 'translateY(-1px)',
                        },
                        '&:active': {
                            // Al presionarse se hunden mecánicamente (efecto gomoso)
                            boxShadow: getNeumorphicShadow(isDark, true, 0.5),
                            transform: 'translateY(1px) scale(0.98)',
                        },
                    };
                },
                contained: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        // Botón de acción principal con acento neumórfico glow
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        boxShadow: isDark 
                            ? `0 0 16px ${alpha(theme.palette.primary.main, 0.4)}` 
                            : getNeumorphicShadow(isDark, false, 0.6),
                        '&:hover': {
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: isDark 
                                ? `0 0 24px ${alpha(theme.palette.primary.main, 0.6)}` 
                                : getNeumorphicShadow(isDark, false, 0.8),
                        },
                        '&:active': {
                            boxShadow: getNeumorphicShadow(isDark, true, 0.5),
                        }
                    };
                },
                outlined: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        backgroundColor: 'transparent',
                        borderColor: theme.palette.divider,
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            borderColor: theme.palette.divider,
                        },
                        '&:active': {
                            boxShadow: getNeumorphicShadow(isDark, true, 0.3),
                        }
                    };
                }
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 14,
                        padding: 10,
                        backgroundColor: theme.palette.background.default,
                        boxShadow: getNeumorphicShadow(isDark, false, 0.5),
                        border: isDark 
                            ? '1px solid rgba(255, 255, 255, 0.03)' 
                            : '1px solid rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        color: theme.palette.text.primary,
                        
                        '&:hover': {
                            boxShadow: getNeumorphicShadow(isDark, false, 0.7),
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.primary.main,
                        },
                        '&:active': {
                            boxShadow: getNeumorphicShadow(isDark, true, 0.5),
                            transform: 'scale(0.95)',
                        },
                    };
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 16,
                        backgroundColor: theme.palette.background.default,
                        // Las cajas de texto siempre van hacia adentro (efecto cavidad)
                        boxShadow: getNeumorphicShadow(isDark, true, 0.5),
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                            border: 'none', // Sin bordes duros de Material UI
                        },
                        '&.Mui-focused': {
                            // Enfoque con resplandor neumórfico sutil
                            boxShadow: `${getNeumorphicShadow(isDark, true, 0.5)}, 0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                    };
                },
                input: {
                    fontWeight: 600,
                    padding: '12px 16px',
                }
            },
        },
        MuiMenu: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                paper: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 20,
                        boxShadow: getNeumorphicShadow(isDark, false, 1.2),
                        padding: '6px 0',
                        border: isDark 
                            ? '1px solid rgba(255,255,255,0.05)' 
                            : '1px solid rgba(255,255,255,0.6)',
                        filter: 'none !important', // Eliminamos filtros drop-shadow obsoletos
                    };
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        padding: '10px 18px',
                        margin: '4px 8px',
                        borderRadius: 12,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            // El hover produce una leve cavidad interna
                            backgroundColor: 'transparent',
                            boxShadow: getNeumorphicShadow(isDark, true, 0.35),
                            color: theme.palette.primary.main,
                            '& .MuiListItemIcon-root': {
                                color: theme.palette.primary.main,
                            }
                        },
                        '&.Mui-selected': {
                            backgroundColor: 'transparent',
                            boxShadow: getNeumorphicShadow(isDark, true, 0.45),
                            color: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                boxShadow: getNeumorphicShadow(isDark, true, 0.5),
                            }
                        }
                    };
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    color: theme.palette.text.secondary,
                    minWidth: '32px !important',
                    transition: 'color 0.2s ease',
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 24,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: getNeumorphicShadow(isDark, false, 1),
                        border: isDark 
                            ? '1px solid rgba(255,255,255,0.03)' 
                            : '1px solid rgba(255,255,255,0.5)',
                    };
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        backgroundColor: theme.palette.background.default,
                        boxShadow: getNeumorphicShadow(isDark, true, 0.3),
                        border: 'none',
                        '& .MuiChip-label': {
                            paddingLeft: 12,
                            paddingRight: 12,
                        }
                    };
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        borderRadius: 14,
                        margin: '6px 10px',
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': {
                            backgroundColor: 'transparent',
                            boxShadow: getNeumorphicShadow(isDark, true, 0.4),
                            color: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                boxShadow: getNeumorphicShadow(isDark, true, 0.5),
                            },
                        },
                        '&:hover': {
                            backgroundColor: 'transparent',
                            boxShadow: getNeumorphicShadow(isDark, true, 0.3),
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
                        borderRadius: 28,
                        padding: 16,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: getNeumorphicShadow(isDark, false, 1.4),
                        border: isDark 
                            ? '1px solid rgba(255,255,255,0.05)' 
                            : '1px solid rgba(255,255,255,0.6)',
                    };
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: ({ theme }: any) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderRadius: 10,
                        boxShadow: getNeumorphicShadow(isDark, false, 0.5),
                        border: isDark 
                            ? '1px solid rgba(255, 255, 255, 0.05)' 
                            : '1px solid rgba(255, 255, 255, 0.6)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        padding: '8px 14px',
                    };
                },
                arrow: ({ theme }: any) => ({
                    color: theme.palette.background.paper,
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
                        borderRight: 'none',
                        backgroundColor: theme.palette.background.default,
                        boxShadow: isDark 
                            ? '8px 0px 24px rgba(0, 0, 0, 0.3)' 
                            : '8px 0px 24px rgba(163, 177, 198, 0.35)',
                    };
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    padding: '16px',
                    fontWeight: 500,
                }),
                head: ({ theme }: any) => {
                    return {
                        backgroundColor: theme.palette.background.default,
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        borderBottom: `2px solid ${theme.palette.divider}`,
                    };
                }
            },
        },
    },
};

export default neumorphicThemeConfig;