import React, { useEffect, useState } from 'react';

interface BadgeHistoryItem {
  id: number;
  user_id: number;
  badge_id: number;
  unlocked_at: string;
  user_name?: string;
  badge_name?: string;
}


export function BadgeHistory() {
  const [history, setHistory] = useState<BadgeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/badges-history');
        if (!res.ok) throw new Error('Error al cargar historial');
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filtered = history.filter(item =>
    (!userFilter || (item.user_name || String(item.user_id)).toLowerCase().includes(userFilter.toLowerCase())) &&
    (!badgeFilter || (item.badge_name || String(item.badge_id)).toLowerCase().includes(badgeFilter.toLowerCase()))
  );

  // Estadísticas
  const total = history.length;
  const uniqueUsers = new Set(history.map(h => h.user_id)).size;
  const uniqueBadges = new Set(history.map(h => h.badge_id)).size;

  if (loading) return <div>Cargando historial...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!history.length) return <div>No hay desbloqueos registrados.</div>;

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
          placeholder="Filtrar por logro"
          value={badgeFilter}
          onChange={e => setBadgeFilter(e.target.value)}
        />
        <div className="ml-auto text-xs text-gray-500 flex items-center gap-4">
          <span>Total: <b>{total}</b></span>
          <span>Usuarios únicos: <b>{uniqueUsers}</b></span>
          <span>Logros únicos: <b>{uniqueBadges}</b></span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left">Usuario</th>
              <th className="px-3 py-2 text-left">Logro</th>
              <th className="px-3 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b">
                <td className="px-3 py-2">{item.user_name || item.user_id}</td>
                <td className="px-3 py-2">{item.badge_name || item.badge_id}</td>
                <td className="px-3 py-2">{new Date(item.unlocked_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
