"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeContext } from './ThemeContext';
import { defaultThemeColors, cssVariableMap } from './tokens';
import { STORAGE_KEYS, THEME_SCHEDULE } from '@/config';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ThemeMode, AppliedTheme, CustomThemeOverride } from './types';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

function getSystemTheme(): AppliedTheme {
  if (typeof window === 'undefined') return 'light';
  
  const hour = new Date().getHours();
  return (hour >= THEME_SCHEDULE.NIGHT_START || hour < THEME_SCHEDULE.NIGHT_END) 
    ? 'dark' 
    : 'light';
}

function applyThemeToDOM(theme: AppliedTheme, customOverride: CustomThemeOverride | null) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  
  root.style.removeProperty('--background');
  root.style.removeProperty('--foreground');
  root.style.removeProperty('--purple-magic');
  root.style.removeProperty('--jungle-green');
  
  if (customOverride) {
    if (customOverride.background) {
      root.style.setProperty('--background', customOverride.background);
    }
    if (customOverride.foreground) {
      root.style.setProperty('--foreground', customOverride.foreground);
    }
    if (customOverride.primary) {
      root.style.setProperty('--purple-magic', customOverride.primary);
    }
    if (customOverride.secondary) {
      root.style.setProperty('--jungle-green', customOverride.secondary);
    }
  }
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setMode] = useLocalStorage<ThemeMode>(
    STORAGE_KEYS.theme.mode,
    defaultMode
  );
  
  const [customOverride, setCustomOverride] = useLocalStorage<CustomThemeOverride | null>(
    STORAGE_KEYS.theme.customColors,
    null
  );

  const [appliedTheme, setAppliedTheme] = useState<AppliedTheme>(
    mode === 'auto' ? getSystemTheme() : mode === 'custom' ? 'light' : mode
  );

  useEffect(() => {
    if (mode === 'auto') {
      const updateTheme = () => {
        const systemTheme = getSystemTheme();
        setAppliedTheme(systemTheme);
        applyThemeToDOM(systemTheme, null);
      };

      updateTheme();
      const interval = setInterval(updateTheme, 60000);
      
      return () => clearInterval(interval);
    } else if (mode === 'custom') {
      setAppliedTheme('light');
      applyThemeToDOM('light', customOverride);
    } else {
      setAppliedTheme(mode);
      applyThemeToDOM(mode, null);
    }
  }, [mode, customOverride]);

  const handleSetTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, [setMode]);

  const handleSetCustomOverride = useCallback((override: CustomThemeOverride | null) => {
    setCustomOverride(override);
  }, [setCustomOverride]);

  const toggleTheme = useCallback(() => {
    if (mode === 'light') {
      setMode('dark');
    } else if (mode === 'dark') {
      setMode('auto');
    } else {
      setMode('light');
    }
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      mode,
      appliedTheme,
      colors: defaultThemeColors,
      customOverride,
      setTheme: handleSetTheme,
      setCustomOverride: handleSetCustomOverride,
      toggleTheme,
    }),
    [mode, appliedTheme, customOverride, handleSetTheme, handleSetCustomOverride, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
