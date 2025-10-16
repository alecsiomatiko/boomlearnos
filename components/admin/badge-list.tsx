"use client"

import React, { useEffect, useState } from 'react';
import { Badge } from '../../types/badge.d';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useOrgApi } from '@/hooks/useOrgApi';

export function BadgeList() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const orgApi = useOrgApi();

  async function fetchBadges() {
    setLoading(true);
    setError(null);
    try {
      const res = await orgApi('/api/admin/badges', { method: 'POST', body: {} });
      if (!res.ok) throw new Error('Error al cargar logros');
      const data = await res.json();
      setBadges(data.badges || []);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBadges(); }, []);

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar este logro?')) return;
    setActionLoading(id);
    try {
      const res = await orgApi(`/api/admin/badges?id=${id}`, { method: 'DELETE', body: {} });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchBadges();
    } catch (err: any) {
      alert(err.message || 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleActive(id: number, isActive: boolean) {
    setActionLoading(id);
    try {
      const res = await orgApi(`/api/admin/badges?id=${id}`, {
        method: 'PUT',
        body: { is_active: !isActive },
      });
      if (!res.ok) throw new Error('Error al actualizar');
      await fetchBadges();
    } catch (err: any) {
      alert(err.message || 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div>Cargando logros...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!badges.length) return <div>No hay logros registrados.</div>;

  return (
    <div className="space-y-4">
      {badges.map(badge => (
        <div key={badge.id} className="flex items-center justify-between bg-white rounded shadow p-4">
          <div className="flex items-center space-x-4">
            {badge.icon && <img src={badge.icon} alt="icono" className="w-10 h-10 rounded" />}
            <div>
              <div className="font-semibold text-lg" style={{ color: badge.color || undefined }}>{badge.name}</div>
              <div className="text-gray-600 text-sm">{badge.description}</div>
              <div className="text-xs text-gray-400 mt-1">
                Tipo: <span className="font-medium">{badge.type}</span> | Objetivo: <span className="font-medium">{badge.target_value}</span> | Periodo: <span className="font-medium">{badge.period}</span>
                {badge.is_active ? (
                  <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">Activo</span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-500 text-xs">Inactivo</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/configuracion/logros/${badge.id}`}>
              <Button variant="outline" size="sm">Editar</Button>
            </Link>
            <Button
              variant={badge.is_active ? 'secondary' : 'default'}
              size="sm"
              disabled={actionLoading === badge.id}
              onClick={() => handleToggleActive(badge.id, badge.is_active)}
            >
              {badge.is_active ? 'Desactivar' : 'Activar'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={actionLoading === badge.id}
              onClick={() => handleDelete(badge.id)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
