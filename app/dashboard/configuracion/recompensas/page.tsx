import React from 'react';
import { RewardList } from '@/components/admin/reward-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RecompensasPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Recompensas</h2>
        <Link href="/dashboard/configuracion/recompensas/nueva">
          <Button variant="default">Nueva recompensa</Button>
        </Link>
      </div>
      <RewardList />
    </div>
  );
}
