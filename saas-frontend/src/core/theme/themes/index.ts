import type { PaletteMode } from '@mui/material';
import type { ThemeVariant } from '../types';
import { getNormalThemePalette, normalThemeConfig } from './normal';
import { getMartonThemePalette, martonThemeConfig } from './marton';
import { getCorporateThemePalette, corporateThemeConfig } from './corport';
import { getBrutalistThemePalette, brutalistThemeConfig } from './brutalist';
import { getNeumorphicThemePalette, neumorphicThemeConfig } from './neumorphic';
import { getLiquidGlassThemePalette, LiquidGlassThemeConfig } from './liquidGlass';

export const getThemePaletteByVariant = (
    mode: PaletteMode,
    variant: ThemeVariant,
    borderIntensity: number = 1,
    borderColorIntensity: number = 0.5
) => {
    if (variant === 'marton') {
        return getMartonThemePalette(mode, borderIntensity, borderColorIntensity);
    }
    if (variant === 'corport') {
        return getCorporateThemePalette(mode, borderIntensity, borderColorIntensity);
    }
    if (variant === 'brutalist') {
        return getBrutalistThemePalette(mode, borderIntensity, borderColorIntensity);
    }
    if (variant === 'neumorphic') {
        return getNeumorphicThemePalette(mode, borderIntensity, borderColorIntensity);
    }
    if (variant === 'liquidGlass') {
        return getLiquidGlassThemePalette(mode, borderIntensity, borderColorIntensity);
    }
    return getNormalThemePalette(mode, borderIntensity, borderColorIntensity);
};

export const getThemeConfigByVariant = (variant: ThemeVariant) => {
    if (variant === 'marton') {
        return martonThemeConfig;
    }
    if (variant === 'corport') {
        return corporateThemeConfig;
    }
    if (variant === 'brutalist') {
        return brutalistThemeConfig;
    }
    if (variant === 'neumorphic') {
        return neumorphicThemeConfig;
    }
    if (variant === 'liquidGlass') {
        return LiquidGlassThemeConfig;
    }
    return normalThemeConfig;
};

export default {
    getThemePaletteByVariant,
    getThemeConfigByVariant,
};
