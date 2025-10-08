"use client";

import { useTheme } from '@/contexts/theme';
import { Sun, Moon, Clock, Palette } from 'lucide-react';
import type { ThemeMode } from '@/contexts/theme';

const THEME_OPTIONS: Array<{
  mode: ThemeMode;
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    mode: 'light',
    label: 'Claro',
    icon: Sun,
    description: 'Tema claro permanente',
  },
  {
    mode: 'dark',
    label: 'Escuro',
    icon: Moon,
    description: 'Tema escuro permanente',
  },
  {
    mode: 'auto',
    label: 'Automático',
    icon: Clock,
    description: 'Muda conforme horário',
  },
  {
    mode: 'custom',
    label: 'Personalizado',
    icon: Palette,
    description: 'Cores customizadas',
  },
];

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export function ThemeSelector({ compact = false, className = '' }: ThemeSelectorProps) {
  const { mode, setTheme } = useTheme();

  if (compact) {
    return (
      <div className={`flex gap-1 ${className}`}>
        {THEME_OPTIONS.map(({ mode: themeMode, icon: Icon, label }) => (
          <button
            key={themeMode}
            onClick={() => setTheme(themeMode)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${
                mode === themeMode
                  ? 'bg-[var(--purple-magic)] text-white'
                  : 'bg-[var(--gray-whisper)] text-[var(--foreground)] hover:bg-[var(--purple-pale)] dark:bg-[var(--surface-dark)] dark:hover:bg-[var(--purple-dark)]'
              }
            `}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-[var(--foreground)]">Tema da aplicação</h3>
      <div className="grid grid-cols-2 gap-2">
        {THEME_OPTIONS.map(({ mode: themeMode, icon: Icon, label, description }) => (
          <button
            key={themeMode}
            onClick={() => setTheme(themeMode)}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200
              ${
                mode === themeMode
                  ? 'border-[var(--purple-magic)] bg-[var(--purple-pale)] dark:bg-[var(--purple-dark)]/20'
                  : 'border-[var(--gray-whisper)] hover:border-[var(--purple-light)] dark:border-[var(--purple-dark)]/30'
              }
            `}
          >
            <Icon className={`w-6 h-6 ${mode === themeMode ? 'text-[var(--purple-magic)]' : 'text-[var(--foreground)]'}`} />
            <div className="text-center">
              <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
              <div className="text-xs text-[var(--foreground)]/60">{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
