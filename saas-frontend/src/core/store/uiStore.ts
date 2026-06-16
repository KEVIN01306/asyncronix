import { create } from 'zustand';
import type { PaletteMode } from '@mui/material';
import type { ThemeVariant } from '../theme/types';
import { getStoredThemeVariant, setStoredThemeVariant } from '../theme/mainTheme';

const THEME_SOURCE_KEY = 'themeSource';
const BORDER_INTENSITY_KEY = 'borderIntensity';
const BORDER_COLOR_INTENSITY_KEY = 'borderColorIntensity';
const TOASTER_POSITION_KEY = 'toasterPosition';
const TOASTER_STYLE_KEY = 'toasterStyle';

type ThemeSource = 'system' | 'light' | 'dark';
type ThemeVariantLocal = ThemeVariant;
type ToasterPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type ToasterStyle = 'colorful' | 'simple';

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
    themeVariant: ThemeVariantLocal;
    borderIntensity: number;
    borderColorIntensity: number;
    toasterPosition: ToasterPosition;
    toasterStyle: ToasterStyle;
    setThemeSource: (source: ThemeSource) => void;
    setBorderIntensity: (intensity: number) => void;
    setBorderColorIntensity: (intensity: number) => void;
    setToasterPosition: (position: ToasterPosition) => void;
    setToasterStyle: (style: ToasterStyle) => void;
    setThemeVariant: (variant: ThemeVariantLocal) => void;
}

export const useUiStore = create<UiState>((set) => {
    const initialSource = getInitialThemeMode();
    const initialIntensity = typeof window !== 'undefined' 
        ? parseFloat(localStorage.getItem(BORDER_INTENSITY_KEY) ?? '1') 
        : 1;
    const initialColorIntensity = typeof window !== 'undefined' 
        ? parseFloat(localStorage.getItem(BORDER_COLOR_INTENSITY_KEY) ?? '0.5') 
        : 0.5;
    const initialToasterPosition = (typeof window !== 'undefined' 
        ? localStorage.getItem(TOASTER_POSITION_KEY) 
        : 'top-right') as ToasterPosition || 'top-right';
    const initialToasterStyle = (typeof window !== 'undefined' 
        ? localStorage.getItem(TOASTER_STYLE_KEY) 
        : 'colorful') as ToasterStyle || 'colorful';

    return {
        themeSource: initialSource,
        themeMode: getActualThemeMode(initialSource),
        themeVariant: getStoredThemeVariant(),
        borderIntensity: initialIntensity,
        borderColorIntensity: initialColorIntensity,
        toasterPosition: initialToasterPosition,
        toasterStyle: initialToasterStyle,
        setThemeSource: (source) => {
            localStorage.setItem(THEME_SOURCE_KEY, source);
            const actualMode = getActualThemeMode(source);
            set({ themeSource: source, themeMode: actualMode });
        },
        setThemeVariant: (variant) => {
            try {
                setStoredThemeVariant(variant);
            } catch (e) {
                // ignore storage errors
                console.warn('Could not persist theme variant', e);
            }
            set({ themeVariant: variant });
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
        setToasterPosition: (position) => {
            localStorage.setItem(TOASTER_POSITION_KEY, position);
            set({ toasterPosition: position });
        },
        setToasterStyle: (style) => {
            localStorage.setItem(TOASTER_STYLE_KEY, style);
            set({ toasterStyle: style });
        },
    };
});

