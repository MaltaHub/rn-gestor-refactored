"use client";

import { ThemeSelector } from "@/components/ui/theme-selector";
import { useTheme } from "@/contexts/theme";
import { useState } from "react";
import type { CustomThemeOverride } from "@/contexts/theme";

export function TemaSection() {
  const { mode, customOverride, setCustomOverride } = useTheme();
  const [customColors, setCustomColors] = useState<CustomThemeOverride>({
    background: customOverride?.background || '',
    foreground: customOverride?.foreground || '',
    primary: customOverride?.primary || '',
    secondary: customOverride?.secondary || '',
  });

  const handleSaveCustom = () => {
    const override = {
      ...(customColors.background && { background: customColors.background }),
      ...(customColors.foreground && { foreground: customColors.foreground }),
      ...(customColors.primary && { primary: customColors.primary }),
      ...(customColors.secondary && { secondary: customColors.secondary }),
    };
    
    setCustomOverride(Object.keys(override).length > 0 ? override : null);
  };

  const handleResetCustom = () => {
    setCustomColors({
      background: '',
      foreground: '',
      primary: '',
      secondary: '',
    });
    setCustomOverride(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Aparência</h2>
        <p className="text-sm text-[var(--foreground)]/60 mb-4">
          Personalize o tema da aplicação de acordo com sua preferência
        </p>
      </div>

      <ThemeSelector />

      {mode === 'custom' && (
        <div className="mt-6 rounded-lg border-2 border-[var(--purple-magic)]/20 bg-white p-4 text-gray-900 dark:bg-[var(--surface-dark)] dark:text-gray-100">
          <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
            Cores personalizadas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Cor de fundo
              </label>
              <input
                type="color"
                value={customColors.background || '#FFFFFF'}
                onChange={(e) => setCustomColors(prev => ({ ...prev, background: e.target.value }))}
                className="w-full h-10 rounded border border-[var(--gray-light)] cursor-pointer"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Cor do texto
              </label>
              <input
                type="color"
                value={customColors.foreground || '#000000'}
                onChange={(e) => setCustomColors(prev => ({ ...prev, foreground: e.target.value }))}
                className="w-full h-10 rounded border border-[var(--gray-light)] cursor-pointer"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Cor primária
              </label>
              <input
                type="color"
                value={customColors.primary || '#8B5CF6'}
                onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                className="w-full h-10 rounded border border-[var(--gray-light)] cursor-pointer"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Cor secundária
              </label>
              <input
                type="color"
                value={customColors.secondary || '#059669'}
                onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                className="w-full h-10 rounded border border-[var(--gray-light)] cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveCustom}
              className="px-4 py-2 rounded-lg bg-[var(--purple-magic)] text-white hover:bg-[var(--purple-dark)] transition-colors text-sm font-medium"
            >
              Aplicar cores
            </button>
            <button
              onClick={handleResetCustom}
              className="px-4 py-2 rounded-lg border border-[var(--gray-light)] text-gray-700 hover:bg-[var(--gray-whisper)] transition-colors text-sm font-medium dark:text-gray-200"
            >
              Resetar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
