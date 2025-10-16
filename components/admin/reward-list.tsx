"use client"

import React, { useEffect, useState } from 'react';
import { Reward } from '../../types/reward.d';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useOrgApi } from '@/hooks/useOrgApi';

export function RewardList() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const orgApi = useOrgApi();

  async function fetchRewards() {
    setLoading(true);
    setError(null);
    try {
      const res = await orgApi('/api/admin/rewards', { method: 'POST', body: {} });
      if (!res.ok) throw new Error('Error al cargar recompensas');
      const data = await res.json();
      setRewards(data.rewards || []);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRewards(); }, []);

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar esta recompensa?')) return;
    setActionLoading(id);
    try {
      const res = await orgApi(`/api/admin/rewards?id=${id}`, { method: 'DELETE', body: {} });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchRewards();
    } catch (err: any) {
      alert(err.message || 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleActive(id: number, isActive: boolean) {
    setActionLoading(id);
    try {
      const res = await orgApi(`/api/admin/rewards?id=${id}`, {
        method: 'PUT',
        body: { is_available: !isActive },
      });
      if (!res.ok) throw new Error('Error al actualizar');
      await fetchRewards();
    } catch (err: any) {
      alert(err.message || 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div>Cargando recompensas...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!rewards.length) return <div>No hay recompensas registradas.</div>;

  return (
    <div className="space-y-4">
      {rewards.map(reward => (
        <div key={reward.id} className="flex items-center justify-between bg-white rounded shadow p-4">
          <div className="flex items-center space-x-4">
            {reward.icon && <img src={reward.icon} alt="icono" className="w-10 h-10 rounded" />}
            <div>
              <div className="font-semibold text-lg">{reward.title}</div>
              <div className="text-gray-600 text-sm">{reward.description}</div>
              <div className="text-xs text-gray-400 mt-1">
                Categoría: <span className="font-medium">{reward.category}</span> | Costo: <span className="font-medium">{reward.cost}</span>
                {reward.is_available ? (
                  <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">Disponible</span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-500 text-xs">No disponible</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/configuracion/recompensas/${reward.id}`}>
              <Button variant="outline" size="sm">Editar</Button>
            </Link>
            <Button
              variant={reward.is_available ? 'secondary' : 'default'}
              size="sm"
              disabled={actionLoading === reward.id}
              onClick={() => handleToggleActive(reward.id, reward.is_available)}
            >
              {reward.is_available ? 'Desactivar' : 'Activar'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={actionLoading === reward.id}
              onClick={() => handleDelete(reward.id)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
