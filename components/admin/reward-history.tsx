import React, { useEffect, useState } from 'react';
import { useOrgApi } from '@/hooks/useOrgApi';

interface RewardHistoryItem {
  id: number;
  user_id: number;
  reward_id: number;
  gems_spent: number;
  status: string;
  claimed_at: string;
  delivered_at?: string;
  notes?: string;
  user_name?: string;
  reward_title?: string;
}


export function RewardHistory() {
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [rewardFilter, setRewardFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const orgApi = useOrgApi();

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await orgApi('/api/admin/rewards-history', { method: 'POST' });
        if (!res.ok) throw new Error('Error al cargar historial');
        const data = await res.json();
        setHistory(data.data || data.history || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [orgApi]);

  const filtered = history.filter(item =>
    (!userFilter || (item.user_name || String(item.user_id)).toLowerCase().includes(userFilter.toLowerCase())) &&
    (!rewardFilter || (item.reward_title || String(item.reward_id)).toLowerCase().includes(rewardFilter.toLowerCase())) &&
    (!statusFilter || item.status === statusFilter)
  );

  // Estadísticas
  const total = history.length;
  const uniqueUsers = new Set(history.map(h => h.user_id)).size;
  const uniqueRewards = new Set(history.map(h => h.reward_id)).size;
  const totalGems = history.reduce((sum, h) => sum + (h.gems_spent || 0), 0);

  if (loading) return <div>Cargando historial...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!history.length) return <div>No hay canjes registrados.</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-3">
        <input
          className="input"
          placeholder="Filtrar por usuario"
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
        />
        <input
          className="input"
          placeholder="Filtrar por recompensa"
          value={rewardFilter}
          onChange={e => setRewardFilter(e.target.value)}
        />
        <select
          className="input"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="delivered">Entregada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <div className="ml-auto text-xs text-gray-500 flex items-center gap-4">
          <span>Total: <b>{total}</b></span>
          <span>Usuarios únicos: <b>{uniqueUsers}</b></span>
          <span>Recompensas únicas: <b>{uniqueRewards}</b></span>
          <span>Gemas totales: <b>{totalGems}</b></span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left">Usuario</th>
              <th className="px-3 py-2 text-left">Recompensa</th>
              <th className="px-3 py-2 text-left">Gemas</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b">
                <td className="px-3 py-2">{item.user_name || item.user_id}</td>
                <td className="px-3 py-2">{item.reward_title || item.reward_id}</td>
                <td className="px-3 py-2">{item.gems_spent}</td>
                <td className="px-3 py-2">{item.status}</td>
                <td className="px-3 py-2">{new Date(item.claimed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
