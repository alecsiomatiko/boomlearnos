import React from 'react';
import { RewardForm } from '@/components/admin/reward-form';

export default function NuevaRecompensaPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Nueva Recompensa</h2>
      <RewardForm />
    </div>
  );
}
