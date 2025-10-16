"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, CheckCircle, Calendar, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EstrategiaPage() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      try {
        const res = await fetch("/api/diagnostics/ai-analysis");
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
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Brain className="mx-auto h-16 w-16 animate-pulse text-kalabasboom-red mb-4" />
          <h2 className="text-2xl font-bold">Cargando plan estratégico...</h2>
          <p className="text-muted-foreground">Generando tu estrategia personalizada</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold">No hay plan estratégico disponible</h2>
          <p className="text-muted-foreground">Aún no se ha generado tu plan estratégico con IA.</p>
          <Button variant="outline" className="mt-6" onClick={() => router.push("/dashboard/mega-diagnostico")}>Volver al diagnóstico</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-10 px-2">
      <div className="max-w-3xl mx-auto">
        <Card className="border-purple-200 shadow-xl bg-white/90">
          <CardHeader className="flex flex-col items-center gap-2">
            <Brain className="h-10 w-10 text-kalabasboom-red mb-2" />
            <CardTitle className="text-2xl font-bold text-kalabasboom-red">Plan Estratégico IA</CardTitle>
            <Badge className="bg-blue-100 text-blue-700">Personalizado para tu empresa</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="font-semibold text-lg text-purple-900 mb-2 flex items-center gap-2"><Target className="h-5 w-5 text-purple-500" /> Objetivo General</h3>
              <p className="text-gray-700 text-base mb-4">{plan.objetivo_general}</p>
            </section>
            <section>
              <h3 className="font-semibold text-lg text-purple-900 mb-2 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Objetivos Específicos</h3>
              <ul className="list-disc pl-6 space-y-1">
                {plan.objetivos_especificos?.map((obj:string, i:number) => (
                  <li key={i} className="text-gray-700">{obj}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-lg text-purple-900 mb-2 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-500" /> Acciones Clave</h3>
              <ul className="list-disc pl-6 space-y-1">
                {plan.acciones_clave?.map((acc:string, i:number) => (
                  <li key={i} className="text-gray-700">{acc}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-lg text-purple-900 mb-2 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Indicadores de Éxito</h3>
              <ul className="list-disc pl-6 space-y-1">
                {plan.indicadores_exito?.map((ind:string, i:number) => (
                  <li key={i} className="text-gray-700">{ind}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-lg text-purple-900 mb-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-orange-500" /> Cronograma</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-purple-200 rounded-lg bg-white">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="px-4 py-2 text-left text-purple-700">Mes</th>
                      <th className="px-4 py-2 text-left text-purple-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.cronograma?.map((mes:any, i:number) => (
                      <tr key={i} className="border-b border-purple-100">
                        <td className="px-4 py-2 font-semibold text-purple-800">{mes.mes}</td>
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
