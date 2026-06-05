import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

const getThemePalette = (mode: PaletteMode, borderIntensity: number = 1, borderColorIntensity: number = 0.5) => {
    const isDark = mode === 'dark';
    
    const dividerWithIntensity = adjustColorIntensity(borderIntensity, borderColorIntensity);

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
        divider: dividerWithIntensity,
        action: {
            hover: isDark ? '#1e293b' : '#f8fafc',
        },
    };
};

const adjustColorIntensity = (opacityIntensity: number, colorIntensity: number): string => {
    // Define color points for gradient
    // 0% = black (0, 0, 0)
    // 50% = light gray (227, 232, 238) = #e3e8ee
    // 100% = primary blue (30, 58, 138) = #1E3A8A
    
    const blackR = 0, blackG = 0, blackB = 0;
    const midR = 227, midG = 232, midB = 238;
    const blueR = 30, blueG = 58, blueB = 138;
    
    let r, g, b;
    
    if (colorIntensity < 0.5) {
        // Interpolate between black and mid-gray
        const t = colorIntensity * 2; // 0 to 1
        r = Math.round(blackR + (midR - blackR) * t);
        g = Math.round(blackG + (midG - blackG) * t);
        b = Math.round(blackB + (midB - blackB) * t);
    } else {
        // Interpolate between mid-gray and blue
        const t = (colorIntensity - 0.5) * 2; // 0 to 1
        r = Math.round(midR + (blueR - midR) * t);
        g = Math.round(midG + (blueG - midG) * t);
        b = Math.round(midB + (blueB - midB) * t);
    }
    
    // Apply opacity intensity
    const alpha = opacityIntensity;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const createAppTheme = (mode: PaletteMode, borderIntensity: number = 1, borderColorIntensity: number = 0.5) =>
    createTheme({
        palette: getThemePalette(mode, borderIntensity, borderColorIntensity),
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

export const mainTheme = createAppTheme('light', 1);
