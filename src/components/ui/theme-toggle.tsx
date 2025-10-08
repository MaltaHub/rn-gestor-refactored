"use client";

import { useTheme } from '@/contexts/theme';
import { Sun, Moon, Clock, Palette } from 'lucide-react';

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();

  const icons = {
    light: Sun,
    dark: Moon,
    auto: Clock,
    custom: Palette,
  };

  const Icon = icons[mode];

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-lg transition-all duration-200
        hover:bg-[var(--purple-pale)] dark:hover:bg-[var(--purple-dark)]/20
        text-[var(--foreground)]
      "
      title={`Tema: ${mode === 'light' ? 'Claro' : mode === 'dark' ? 'Escuro' : mode === 'auto' ? 'Automático' : 'Personalizado'}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
