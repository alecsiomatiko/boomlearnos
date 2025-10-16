"use client"

import React, { useState } from 'react';
import { useOrgApi } from '@/hooks/useOrgApi';
import { Badge } from '@/types/badge';
import { Button } from '@/components/ui/button';

const typeOptions = [
  { value: 'tasks_completed', label: 'Tareas completadas' },
  { value: 'checkins_completed', label: 'Check-ins completados' },
  { value: 'streak', label: 'Racha (streak)' },
  { value: 'avg_energy', label: 'Promedio de energía' },
  { value: 'urgent_tasks', label: 'Tareas urgentes' },
  { value: 'gems_earned', label: 'Gemas ganadas' },
  { value: 'custom', label: 'Condición personalizada' },
];

const periodOptions = [
  { value: 'all', label: 'Siempre' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
];

export function BadgeForm({ initial }: { initial?: Partial<Badge> }) {
  const [form, setForm] = useState<Partial<Badge>>(initial || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const orgApi = useOrgApi();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await orgApi('/api/admin/badges', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error('Error al guardar el logro');
      setSuccess(true);
      setForm({});
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded shadow p-6">
      <div>
        <label className="block font-medium mb-1">Nombre</label>
        <input name="name" value={form.name || ''} onChange={handleChange} required className="input" />
      </div>
      <div>
        <label className="block font-medium mb-1">Descripción</label>
        <textarea name="description" value={form.description || ''} onChange={handleChange} required className="input" />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Tipo</label>
          <select name="type" value={form.type || ''} onChange={handleChange} required className="input">
            <option value="">Selecciona...</option>
            {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Periodo</label>
          <select name="period" value={form.period || 'all'} onChange={handleChange} className="input">
            {periodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Valor objetivo</label>
        <input name="target_value" type="number" value={form.target_value || ''} onChange={handleChange} required className="input" />
      </div>
      <div>
        <label className="block font-medium mb-1">Color</label>
        <input name="color" value={form.color || ''} onChange={handleChange} className="input" placeholder="#HEX o nombre" />
      </div>
      <div>
        <label className="block font-medium mb-1">Icono (URL)</label>
        <input name="icon" value={form.icon || ''} onChange={handleChange} className="input" placeholder="https://..." />
      </div>
      {form.type === 'custom' && (
        <div>
          <label className="block font-medium mb-1">Condición personalizada</label>
          <textarea name="custom_condition" value={form.custom_condition || ''} onChange={handleChange} className="input" />
        </div>
      )}
      <div className="flex items-center space-x-4 mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar logro'}
        </Button>
        {success && <span className="text-green-600">¡Guardado!</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </form>
  );
}
