import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface RewardHistoryItem {
  id: number;
  reward_id: number;
  gems_spent: number;
  status: string;
  claimed_at: string;
  reward_title?: string;
}

export default function HistorialRecompensasUsuario() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/rewards/history?userId=${session.user.id}`);
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
  if (!history.length) return <div>No has canjeado recompensas aún.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">Historial de recompensas</h2>
      <ul className="divide-y divide-gray-200">
        {history.map(item => (
          <li key={item.id} className="py-3 flex items-center gap-4">
            <span className="font-medium">{item.reward_title || item.reward_id}</span>
            <span className="text-xs text-gray-500 ml-auto">{new Date(item.claimed_at).toLocaleString()}</span>
            <span className="text-xs ml-2">{item.gems_spent} gemas</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${item.status === 'delivered' ? 'bg-green-100 text-green-700' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-500'}`}>{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
