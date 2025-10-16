import React from 'react';
import { BadgeForm } from '@/components/admin/badge-form';

export default function NuevoLogroPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Nuevo Logro</h2>
      <BadgeForm />
    </div>
  );
}
