// Shared color and border utilities for all themes

export const adjustColorIntensity = (
    opacityIntensity: number,
    _colorIntensity: number,
    isDark: boolean
): string => {
    if (isDark) {
        return `rgba(255,255,255,${0.08 * opacityIntensity})`;
    }
    return `rgba(0,0,0,${0.08 * opacityIntensity})`;
};
