import type { PaletteMode } from '@mui/material';
import { adjustColorIntensity } from './colorUtils';

// Tema Normal - ChatGPT Style

export const getNormalThemePalette = (
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
            main: isDark ? '#1BBF95' : '#0e349c',
            dark: '#0D8B6C',
            light: '#1BBF95',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: isDark ? '#9CA3AF' : '#6B7280',
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
            default: isDark ? '#212121' : '#F7F7F8',
            paper: isDark ? '#2F2F2F' : '#FFFFFF',
        },
        text: {
            primary: isDark ? '#ECECEC' : '#111827',
            secondary: isDark ? '#B4B4B4' : '#6B7280',
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

export const normalThemeConfig = {
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily:
            '"Inter","Segoe UI","Roboto","Helvetica","Arial",sans-serif',
        h1: {
            fontSize: '2.25rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
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
            fontWeight: 500,
            letterSpacing: 0,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontFeatureSettings: '"cv02","cv03","cv04","cv11"',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    paddingInline: 16,
                    paddingBlock: 8,
                    fontWeight: 500,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 1px 2px rgba(0,0,0,0.20)'
                            : '0 1px 2px rgba(0,0,0,0.04)',
                    backgroundImage: 'none',
                }),
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 1px 2px rgba(0,0,0,0.20)'
                            : '0 1px 2px rgba(0,0,0,0.04)',
                    backgroundImage: 'none',
                }),
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 12,
                    '& fieldset': {
                        borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                        borderColor: theme.palette.text.secondary,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 1,
                    },
                }),
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined' as const,
            },
        },
        MuiSelect: {
            defaultProps: {
                variant: 'outlined' as const,
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
                root: {
                    borderRadius: 10,
                    '&.Mui-selected': {
                        fontWeight: 500,
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                },
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
                root: {
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                },
            },
        },
    },
};

export default normalThemeConfig;
