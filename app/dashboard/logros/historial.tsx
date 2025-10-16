import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface BadgeHistoryItem {
  id: number;
  badge_id: number;
  unlocked_at: string;
  badge_name?: string;
}

export default function HistorialLogrosUsuario() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<BadgeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/badges/history?userId=${session.user.id}`);
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
  }, [session?.user?.id]);

  if (!session?.user?.id) return <div>Inicia sesión para ver tu historial.</div>;
  if (loading) return <div>Cargando historial...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!history.length) return <div>No has desbloqueado logros aún.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">Historial de logros</h2>
      <ul className="divide-y divide-gray-200">
        {history.map(item => (
          <li key={item.id} className="py-3 flex items-center gap-4">
            <span className="font-medium">{item.badge_name || item.badge_id}</span>
            <span className="text-xs text-gray-500 ml-auto">{new Date(item.unlocked_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
