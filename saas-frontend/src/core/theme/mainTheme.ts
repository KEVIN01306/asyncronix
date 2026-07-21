import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import type { ThemeVariant } from './types';
import { getThemePaletteByVariant, getThemeConfigByVariant } from './themes';

// localStorage key for the selected variant
const STORAGE_KEY = 'appThemeVariant';

export const getStoredThemeVariant = (): ThemeVariant => {
    try {
        const v = localStorage.getItem(STORAGE_KEY) as ThemeVariant | null;
        // Validate that the stored value is one of the valid variants
        if (v === 'normal' || v === 'marton' || v === 'corport' || v === 'brutalist' || v === 'neumorphic' || v === 'liquidGlass') {
            return v;
        }
        return 'marton';
    } catch {
        return 'marton';
    }
};

export const setStoredThemeVariant = (variant: ThemeVariant) => {
    try {
        localStorage.setItem(STORAGE_KEY, variant);
    } catch {
        // ignore
    }
};

export const createAppTheme = (
    mode: PaletteMode,
    borderIntensity: number = 1,
    borderColorIntensity: number = 0.5,
    variant: ThemeVariant = getStoredThemeVariant()
) => {
    const palette = getThemePaletteByVariant(
        mode,
        variant,
        borderIntensity,
        borderColorIntensity
    );
    const themeConfig = getThemeConfigByVariant(variant);

    return createTheme({
        palette,
        shape: themeConfig.shape,
        typography: themeConfig.typography,
        components: themeConfig.components,
    });
};

// default export theme (light + stored variant)
export const mainTheme = createAppTheme('light');