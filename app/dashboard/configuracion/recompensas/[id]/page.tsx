"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RewardForm } from '@/components/admin/reward-form';
import { Reward } from '@/types/reward';

export default function EditarRecompensaPage({ params }: { params: { id: string } }) {
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchReward() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/rewards?id=${params.id}`);
        if (!res.ok) throw new Error('Error al cargar recompensa');
        const data = await res.json();
        setReward(data.reward || null);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchReward();
  }, [params.id]);

  if (loading) return <div>Cargando recompensa...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!reward) return <div>No se encontró la recompensa.</div>;

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Editar Recompensa</h2>
      <RewardForm initial={reward} />
    </div>
  );
}
