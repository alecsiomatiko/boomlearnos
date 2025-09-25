"use client"

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import AnalysisPageComponent from './analysis-page-component';

export default function AnalysisPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso no autorizado</h2>
          <p className="text-muted-foreground">Por favor, inicia sesión para acceder al análisis.</p>
        </div>
      </div>
    );
  }

  return <AnalysisPageComponent userId={user.id} />;
}
