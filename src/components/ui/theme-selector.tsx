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
                  ? 'bg-white border-2 border-[var(--purple-magic)] text-[var(--purple-magic)] dark:bg-zinc-800 dark:border-[var(--purple-light)] dark:text-[var(--purple-light)]'
                  : 'bg-[var(--gray-whisper)] text-[var(--foreground)] hover:bg-gray-100 dark:bg-[var(--surface-dark)] dark:hover:bg-zinc-700'
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
              flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200
              ${
                mode === themeMode
                  ? 'bg-white border-2 border-[var(--purple-magic)] dark:bg-zinc-800 dark:border-[var(--purple-light)]'
                  : 'bg-white border border-gray-200 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700'
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
