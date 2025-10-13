'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, ModalFooter } from './ui/modal';
import { Button } from './ui/button';
import { RenderTables, Column } from './RenderTables';
import { useModelos } from '@/hooks/use-configuracoes';
import { salvarConfiguracao, remove } from '@/services/configuracoes';
import type { Modelo } from '@/types';

interface ModeloTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModeloCreated?: (modeloId: string) => void;
}

type ModeloFormData = {
  id?: string;
  marca: string;
  nome: string;
  combustivel: string;
  tipo_cambio: string;
  motor: string;
  edicao: string;
  lugares: number | string;
  portas: number | string;
  carroceria: string;
};

const combustivelOptions = [
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'alcool', label: 'Álcool' },
  { value: 'flex', label: 'Flex' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'eletrico', label: 'Elétrico' },
  { value: 'hibrido', label: 'Híbrido' },
];

const tipoCambioOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatico', label: 'Automático' },
  { value: 'automatizado', label: 'Automatizado' },
  { value: 'cvt', label: 'CVT' },
  { value: 'outro', label: 'Outro' },
];

const carroceriaOptions = [
  { value: 'hatch', label: 'Hatch' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'camioneta', label: 'Camioneta' },
  { value: 'van', label: 'Van' },
  { value: 'buggy', label: 'Buggy' },
  { value: 'suv compacto', label: 'SUV Compacto' },
  { value: 'suv medio', label: 'SUV Médio' },
];

const parseOptionalNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const stringValue = typeof value === 'number' ? value.toString() : value;
  const trimmed = stringValue.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeOptionalText = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
};

export function ModeloTableModal({ isOpen, onClose, onModeloCreated }: ModeloTableModalProps) {
  const queryClient = useQueryClient();
  const { data: modelos = [] } = useModelos();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<Modelo | null>(null);
  const [formData, setFormData] = useState<ModeloFormData>({
    marca: '',
    nome: '',
    combustivel: 'gasolina',
    tipo_cambio: 'manual',
    motor: '1.0',
    edicao: '',
    lugares: 5,
    portas: 4,
    carroceria: 'hatch',
  });

  const columns = useMemo<Column<Modelo>[]>(() => [
    {
      key: 'marca',
      label: 'Marca',
      width: 150,
      sortable: true,
      editable: true,
      editRender: (value, row, onChange) => (
        <input
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
          autoFocus
        />
      ),
    },
    {
      key: 'nome',
      label: 'Nome',
      width: 200,
      sortable: true,
      editable: true,
      editRender: (value, row, onChange) => (
        <input
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
      ),
    },
    {
      key: 'combustivel',
      label: 'Combustível',
      width: 150,
      editable: true,
      render: (value) => {
        const option = combustivelOptions.find(o => o.value === value);
        return String(option?.label || value || '-');
      },
      editRender: (value, row, onChange) => (
        <select
          value={String(value || 'gasolina')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        >
          {combustivelOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'tipo_cambio',
      label: 'Câmbio',
      width: 150,
      editable: true,
      render: (value) => {
        const option = tipoCambioOptions.find(o => o.value === value);
        return String(option?.label || value || '-');
      },
      editRender: (value, row, onChange) => (
        <select
          value={String(value || 'manual')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        >
          {tipoCambioOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'motor',
      label: 'Motor',
      width: 100,
      editable: true,
      render: (value) => String(value || '-'),
      editRender: (value, row, onChange) => (
        <input
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
      ),
    },
    {
      key: 'edicao',
      label: 'Edição',
      width: 120,
      editable: true,
      render: (value) => String(value || '-'),
      editRender: (value, row, onChange) => (
        <input
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
      ),
    },
    {
      key: 'lugares',
      label: 'Lugares',
      width: 100,
      editable: true,
      render: (value) => String(value || '-'),
      editRender: (value, row, onChange) => (
        <input
          type="number"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
      ),
    },
    {
      key: 'portas',
      label: 'Portas',
      width: 100,
      editable: true,
      render: (value) => String(value || '-'),
      editRender: (value, row, onChange) => (
        <input
          type="number"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
      ),
    },
    {
      key: 'carroceria',
      label: 'Carroceria',
      width: 150,
      editable: true,
      render: (value) => {
        const option = carroceriaOptions.find(o => o.value === value);
        return String(option?.label || value || '-');
      },
      editRender: (value, row, onChange) => (
        <select
          value={String(value || 'hatch')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        >
          {carroceriaOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ),
    },
  ], []);

  const handleCreate = () => {
    setEditingModelo(null);
    setFormData({
      marca: '',
      nome: '',
      combustivel: 'gasolina',
      tipo_cambio: 'manual',
      motor: '1.0',
      edicao: '',
      lugares: 5,
      portas: 4,
      carroceria: 'hatch',
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (row: Modelo, updates: Partial<Modelo>) => {
    try {
      const payload = {
        id: row.id,
        marca: updates.marca !== undefined ? updates.marca : row.marca,
        nome: updates.nome !== undefined ? updates.nome : row.nome,
        combustivel: updates.combustivel !== undefined ? updates.combustivel : row.combustivel,
        tipo_cambio: updates.tipo_cambio !== undefined ? updates.tipo_cambio : row.tipo_cambio,
        motor: updates.motor !== undefined ? updates.motor : row.motor,
        edicao: updates.edicao !== undefined ? normalizeOptionalText(updates.edicao) : row.edicao,
        lugares: updates.lugares !== undefined ? parseOptionalNumber(updates.lugares) : row.lugares,
        portas: updates.portas !== undefined ? parseOptionalNumber(updates.portas) : row.portas,
        carroceria: updates.carroceria !== undefined ? updates.carroceria : row.carroceria,
      };

      await salvarConfiguracao('modelo', payload);
      await queryClient.invalidateQueries({ queryKey: ['configuracoes', 'modelo'] });
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error);
      throw error;
    }
  };

  const handleDelete = async (row: Modelo) => {
    if (!row.id) return;
    
    if (!window.confirm(`Deseja realmente remover o modelo "${row.marca} ${row.nome}"?`)) {
      return;
    }

    try {
      await remove('modelo', row.id);
      await queryClient.invalidateQueries({ queryKey: ['configuracoes', 'modelo'] });
    } catch (error) {
      console.error('Erro ao deletar modelo:', error);
      alert('Erro ao deletar modelo. Pode estar vinculado a veículos.');
    }
  };

  const handleSaveForm = async () => {
    if (!formData.marca.trim() || !formData.nome.trim()) {
      alert('Marca e Nome são obrigatórios');
      return;
    }

    try {
      const payload = {
        ...(editingModelo?.id ? { id: editingModelo.id } : {}),
        marca: formData.marca.trim(),
        nome: formData.nome.trim(),
        combustivel: formData.combustivel || null,
        tipo_cambio: formData.tipo_cambio || null,
        motor: formData.motor?.trim() || null,
        edicao: normalizeOptionalText(formData.edicao),
        lugares: parseOptionalNumber(formData.lugares),
        portas: parseOptionalNumber(formData.portas),
        carroceria: formData.carroceria || null,
      };

      await salvarConfiguracao('modelo', payload);
      await queryClient.refetchQueries({ queryKey: ['configuracoes', 'modelo'] });

      if (!editingModelo && onModeloCreated) {
        const updatedModelos = queryClient.getQueryData<Modelo[]>(['configuracoes', 'modelo']) || [];
        const newModelo = updatedModelos.find(
          m => m.marca === formData.marca.trim() && m.nome === formData.nome.trim()
        );
        if (newModelo?.id) {
          onModeloCreated(newModelo.id);
        }
      }

      setEditModalOpen(false);
      setEditingModelo(null);
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      alert('Erro ao salvar modelo');
    }
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Marca <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={formData.marca}
            onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
            className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Nome <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
            required
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Combustível</span>
          <select
            value={formData.combustivel}
            onChange={(e) => setFormData(prev => ({ ...prev, combustivel: e.target.value }))}
            className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
          >
            {combustivelOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Tipo de Câmbio</span>
          <select
            value={formData.tipo_cambio}
            onChange={(e) => setFormData(prev => ({ ...prev, tipo_cambio: e.target.value }))}
            className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
          >
            {tipoCambioOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Motor</span>
          <input
            type="text"
            value={formData.motor}
            onChange={(e) => setFormData(prev => ({ ...prev, motor: e.target.value }))}
            className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Edição</span>
          <input
            type="text"
            value={formData.edicao}
            onChange={(e) => setFormData(prev => ({ ...prev, edicao: e.target.value }))}
            className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
            placeholder="Ex.: Sport, Limited"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Lugares</span>
          <input
            type="number"
            value={formData.lugares}
            onChange={(e) => setFormData(prev => ({ ...prev, lugares: e.target.value }))}
            className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Portas</span>
          <input
            type="number"
            value={formData.portas}
            onChange={(e) => setFormData(prev => ({ ...prev, portas: e.target.value }))}
            className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Carroceria</span>
        <select
          value={formData.carroceria}
          onChange={(e) => setFormData(prev => ({ ...prev, carroceria: e.target.value }))}
          className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm"
        >
          {carroceriaOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Modelos" size="xl">
        <div className="p-6 bg-white">
          <RenderTables
            data={modelos}
            columns={columns}
            mode="edit"
            rowKey="id"
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onRowDelete={handleDelete}
            enableVirtualization={false}
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={editingModelo ? 'Editar Modelo' : 'Criar Modelo'}
        size="lg"
      >
        <div className="p-6 bg-white">
          {renderForm()}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveForm}>
            {editingModelo ? 'Atualizar' : 'Criar'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
