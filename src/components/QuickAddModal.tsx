'use client';

import { useState, FormEvent } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export type QuickAddField = 
  | { type: 'text'; name: string; label: string; required?: boolean; placeholder?: string }
  | { type: 'select'; name: string; label: string; required?: boolean; options: Array<{ value: string; label: string }> };

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: QuickAddField[];
  onSave: (data: Record<string, string>) => Promise<{ id?: string } | void>;
}

export function QuickAddModal({ isOpen, onClose, title, fields, onSave }: QuickAddModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClasses =
    "rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)] focus:outline-none transition-all duration-150";

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSave(formData);
      setFormData({});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({});
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
      <form onSubmit={handleSubmit}>
        <ModalContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field) => (
              <label key={field.name} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>

                {field.type === 'text' ? (
                  <input
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    className={inputClasses}
                    disabled={isLoading}
                  />
                ) : (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className={inputClasses}
                    disabled={isLoading}
                  >
                    <option value="">Selecione...</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            ))}
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
