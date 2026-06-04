import { create } from 'zustand';
import type { PaletteMode } from '@mui/material';

const THEME_SOURCE_KEY = 'themeSource';
const BORDER_INTENSITY_KEY = 'borderIntensity';
const BORDER_COLOR_INTENSITY_KEY = 'borderColorIntensity';

type ThemeSource = 'system' | 'light' | 'dark';

const getInitialThemeMode = (): ThemeSource => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    const storedSource = localStorage.getItem(THEME_SOURCE_KEY);
    if (storedSource === 'light' || storedSource === 'dark' || storedSource === 'system') {
        return storedSource;
    }

    return 'system';
};

const getActualThemeMode = (source: ThemeSource): PaletteMode => {
    if (source === 'system') {
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return source;
};

interface UiState {
    themeSource: ThemeSource;
    themeMode: PaletteMode;
    borderIntensity: number;
    borderColorIntensity: number;
    setThemeSource: (source: ThemeSource) => void;
    setBorderIntensity: (intensity: number) => void;
    setBorderColorIntensity: (intensity: number) => void;
}

export const useUiStore = create<UiState>((set) => {
    const initialSource = getInitialThemeMode();
    const initialIntensity = typeof window !== 'undefined' 
        ? parseFloat(localStorage.getItem(BORDER_INTENSITY_KEY) ?? '1') 
        : 1;
    const initialColorIntensity = typeof window !== 'undefined' 
        ? parseFloat(localStorage.getItem(BORDER_COLOR_INTENSITY_KEY) ?? '0.5') 
        : 0.5;

    return {
        themeSource: initialSource,
        themeMode: getActualThemeMode(initialSource),
        borderIntensity: initialIntensity,
        borderColorIntensity: initialColorIntensity,
        setThemeSource: (source) => {
            localStorage.setItem(THEME_SOURCE_KEY, source);
            const actualMode = getActualThemeMode(source);
            set({ themeSource: source, themeMode: actualMode });
        },
        setBorderIntensity: (intensity) => {
            const clamped = Math.max(0, Math.min(1, intensity));
            localStorage.setItem(BORDER_INTENSITY_KEY, clamped.toString());
            set({ borderIntensity: clamped });
        },
        setBorderColorIntensity: (intensity) => {
            const clamped = Math.max(0, Math.min(1, intensity));
            localStorage.setItem(BORDER_COLOR_INTENSITY_KEY, clamped.toString());
            set({ borderColorIntensity: clamped });
        },
    };
});

