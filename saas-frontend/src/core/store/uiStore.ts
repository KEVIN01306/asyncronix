import { create } from 'zustand';
import type { PaletteMode } from '@mui/material';

const THEME_MODE_KEY = 'themeMode';

const getInitialThemeMode = (): PaletteMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedMode = localStorage.getItem(THEME_MODE_KEY);
  if (storedMode === 'light' || storedMode === 'dark') {
    return storedMode;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

interface UiState {
  themeMode: PaletteMode;
  setThemeMode: (mode: PaletteMode) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  themeMode: getInitialThemeMode(),
  setThemeMode: (mode) => {
    localStorage.setItem(THEME_MODE_KEY, mode);
    set({ themeMode: mode });
  },
  toggleTheme: () => {
    set((state) => {
      const nextMode: PaletteMode = state.themeMode === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_MODE_KEY, nextMode);
      return { themeMode: nextMode };
    });
  },
}));
