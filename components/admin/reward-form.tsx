
"use client"

import React, { useState } from 'react';
import { Reward } from '@/types/reward';
import { Button } from '@/components/ui/button';
import { useOrgApi } from '@/hooks/useOrgApi';

export function RewardForm({ initial }: { initial?: Partial<Reward> }) {
  const [form, setForm] = useState<Partial<Reward>>(initial || {});
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
      const res = await orgApi('/api/admin/rewards', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error('Error al guardar la recompensa');
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
        <label className="block font-medium mb-1">Título</label>
        <input name="title" value={form.title || ''} onChange={handleChange} required className="input" />
      </div>
      <div>
        <label className="block font-medium mb-1">Descripción</label>
        <textarea name="description" value={form.description || ''} onChange={handleChange} required className="input" />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Categoría</label>
          <input name="category" value={form.category || ''} onChange={handleChange} className="input" />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Costo (gemas)</label>
          <input name="cost" type="number" value={form.cost || ''} onChange={handleChange} required className="input" />
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Stock máximo</label>
          <input name="stock_limit" type="number" value={form.stock_limit || ''} onChange={handleChange} className="input" />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Máx. canjes por usuario</label>
          <input name="max_claims_per_user" type="number" value={form.max_claims_per_user || ''} onChange={handleChange} className="input" />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Icono (URL)</label>
        <input name="icon" value={form.icon || ''} onChange={handleChange} className="input" placeholder="https://..." />
      </div>
      <div className="flex items-center space-x-4 mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar recompensa'}
        </Button>
        {success && <span className="text-green-600">¡Guardado!</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </form>
  );
}
