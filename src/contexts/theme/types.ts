export type ThemeMode = 'light' | 'dark' | 'auto' | 'custom';
export type AppliedTheme = 'light' | 'dark';

export interface ThemeColors {
  purple: {
    magic: string;
    dark: string;
    darker: string;
    light: string;
    lighter: string;
    pale: string;
  };
  neutral: {
    whiteDelicate: string;
    whiteSoft: string;
    whitePure: string;
    grayWhisper: string;
    grayLight: string;
  };
  semantic: {
    jungle: string;
    jungleDark: string;
    jungleLight: string;
    junglePale: string;
    danger: string;
    dangerDark: string;
    dangerLight: string;
    dangerPale: string;
    warning: string;
    warningLight: string;
    warningPale: string;
  };
  theme: {
    background: string;
    foreground: string;
    backgroundLight: string;
    backgroundDark: string;
    surfaceDark: string;
    textLight: string;
    textDark: string;
  };
}

export interface CustomThemeOverride {
  background?: string;
  foreground?: string;
  primary?: string;
  secondary?: string;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  appliedTheme: AppliedTheme;
  colors: ThemeColors;
  customOverride: CustomThemeOverride | null;
  setTheme: (mode: ThemeMode) => void;
  setCustomOverride: (override: CustomThemeOverride | null) => void;
  toggleTheme: () => void;
}
