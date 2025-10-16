import React from 'react';
import { BadgeHistory } from '@/components/admin/badge-history';
import { RewardHistory } from '@/components/admin/reward-history';

export default function HistorialPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-semibold mb-6">Historial de logros y recompensas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-2">Desbloqueos de logros</h3>
          <BadgeHistory />
        </div>
        <div>
          <h3 className="text-lg font-bold mb-2">Canjes de recompensas</h3>
          <RewardHistory />
        </div>
      </div>
    </div>
  );
}
