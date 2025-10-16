"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeForm } from '@/components/admin/badge-form';
import { Badge } from '@/types/badge';

export default function EditarLogroPage({ params }: { params: { id: string } }) {
  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchBadge() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/badges?id=${params.id}`);
        if (!res.ok) throw new Error('Error al cargar logro');
        const data = await res.json();
        setBadge(data.badge || null);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchBadge();
  }, [params.id]);

  if (loading) return <div>Cargando logro...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!badge) return <div>No se encontró el logro.</div>;

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Editar Logro</h2>
      <BadgeForm initial={badge} />
    </div>
  );
}
