import React from 'react';
import { BadgeList } from '@/components/admin/badge-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LogrosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Logros</h2>
        <Link href="/dashboard/configuracion/logros/nuevo">
          <Button variant="primary">Nuevo logro</Button>
        </Link>
      </div>
      <BadgeList />
    </div>
  );
}
