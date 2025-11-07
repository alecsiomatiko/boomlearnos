"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, CheckCircle, Calendar, Target, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context"; // ✅ Importar useAuth

export default function EstrategiaPage() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth(); // ✅ Obtener usuario autenticado

  useEffect(() => {
    async function fetchPlan() {
      if (!user?.id) return; // ✅ Esperar a que el usuario esté disponible
      
      setLoading(true);
      try {
        const res = await fetch(`/api/diagnostics/ai-analysis?userId=${user.id}`); // ✅ Pasar userId
        const data = await res.json();
        if (data.success && data.analysis?.recommendations?.length) {
          const planRec = data.analysis.recommendations.find((r:any) => r.plan);
          setPlan(planRec?.plan || null);
        }
      } catch (e) {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [user?.id]); // ✅ Agregar dependencia

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <Brain className="mx-auto h-16 w-16 animate-pulse text-brand-red mb-4" />
          <h2 className="text-2xl font-bold">Cargando plan estratégico...</h2>
          <p className="text-muted-foreground">Generando tu estrategia personalizada</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold">No hay plan estratégico disponible</h2>
          <p className="text-muted-foreground">Aún no se ha generado tu plan estratégico con IA.</p>
          <Button 
            variant="outline" 
            className="mt-6" 
            onClick={() => router.push("/dashboard/mega-diagnostico")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al diagnóstico
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-10 px-2">
      <div className="max-w-4xl mx-auto">
        {/* Botón de Back */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/mega-diagnostico")}
          className="mb-4 hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Mega Diagnóstico
        </Button>

        <Card className="border-2 border-red-200 shadow-xl bg-white relative overflow-hidden">
          {/* Mascota en la esquina superior derecha */}
          <div className="absolute top-4 right-4 hidden lg:block">
            <motion.img 
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              src="/images/mascot-clipboard.png" 
              alt="Mascota Boomlearn" 
              className="w-32 h-32 object-contain drop-shadow-2xl"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>

          <CardHeader className="flex flex-col items-center gap-2 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg mb-2">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Plan Estratégico <span className="text-brand-red">IA</span>
            </CardTitle>
            <Badge className="bg-red-100 text-red-800 border border-red-300">
              Personalizado para tu empresa
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6 px-6 lg:px-12">
            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2"><Target className="h-5 w-5 text-brand-red" /> Objetivo General</h3>
              <p className="text-gray-700 text-base mb-4">{plan.objetivo_general}</p>
            </section>
            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Objetivos Específicos</h3>
              <ul className="list-disc pl-6 space-y-1">
                {plan.objetivos_especificos?.map((obj:string, i:number) => (
                  <li key={i} className="text-gray-700">{obj}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-brand-red" /> Acciones Clave</h3>
              <ul className="list-disc pl-6 space-y-1">
                {plan.acciones_clave?.map((acc:string, i:number) => (
                  <li key={i} className="text-gray-700">{acc}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Indicadores de Éxito</h3>
              <ul className="list-disc pl-6 space-y-1">
                {plan.indicadores_exito?.map((ind:string, i:number) => (
                  <li key={i} className="text-gray-700">{ind}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-red-500" /> Cronograma</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-red-200 rounded-lg bg-white">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="px-4 py-2 text-left text-red-700 font-semibold">Mes</th>
                      <th className="px-4 py-2 text-left text-red-700 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.cronograma?.map((mes:any, i:number) => (
                      <tr key={i} className="border-b border-red-100">
                        <td className="px-4 py-2 font-semibold text-red-800">{mes.mes}</td>
                        <td className="px-4 py-2">
                          <ul className="list-disc pl-4">
                            {mes.acciones?.map((a:string, j:number) => (
                              <li key={j} className="text-gray-700">{a}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
