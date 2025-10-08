/**
 * Configurações de tema e aparência
 */

// Horários para tema automático (escuro/claro)
export const THEME_SCHEDULE = {
  NIGHT_START: 18,  // 18:00 - início do tema escuro
  NIGHT_END: 6,     // 06:00 - fim do tema escuro
  REFRESH_INTERVAL_MS: 15 * 60 * 1000, // 15 minutos
} as const;

// Modos de tema disponíveis
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
  CUSTOM: 'custom',
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];

// Variáveis CSS (para referência, valores reais estão em globals.css)
export const CSS_VARIABLES = {
  // Purple palette
  purpleMagic: '--purple-magic',
  purpleDark: '--purple-dark',
  purpleDarker: '--purple-darker',
  purpleLight: '--purple-light',
  purpleLighter: '--purple-lighter',
  purplePale: '--purple-pale',
  
  // White/Gray palette
  whiteDelicate: '--white-delicate',
  whiteSoft: '--white-soft',
  whitePure: '--white-pure',
  grayWhisper: '--gray-whisper',
  grayLight: '--gray-light',
  
  // Green palette
  jungleGreen: '--jungle-green',
  jungleDark: '--jungle-dark',
  jungleLight: '--jungle-light',
  junglePale: '--jungle-pale',
  
  // Status colors
  danger: '--danger',
  dangerDark: '--danger-dark',
  dangerLight: '--danger-light',
  dangerPale: '--danger-pale',
  warning: '--warning',
  warningLight: '--warning-light',
  warningPale: '--warning-pale',
  
  // Theme-aware
  background: '--background',
  foreground: '--foreground',
} as const;
