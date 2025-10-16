import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';


const tabs = [
  { name: 'Logros', href: '/dashboard/configuracion/logros' },
  { name: 'Recompensas', href: '/dashboard/configuracion/recompensas' },
  { name: 'Historial', href: '/dashboard/configuracion/historial' },
];

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      <div className="flex space-x-4 border-b mb-8">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'pb-2 px-2 text-lg font-medium border-b-2',
              // Active tab styling will be handled in the page components
              'border-transparent hover:border-primary hover:text-primary transition-colors'
            )}
          >
            {tab.name}
          </Link>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
