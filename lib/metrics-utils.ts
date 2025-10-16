// Utilidades para métricas de energía y check-ins

type Checkin = { checkin_date: string; energy_level: number };

export function getEnergyByDay(checkins: Checkin[] = []): { day: string; avg: number }[] {
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const weekDays = [1,2,3,4,5,6,0]; // Lunes=1 ... Domingo=0
  const energyByDay: Record<string, number[]> = {};
  if (checkins) {
    checkins.forEach((c: Checkin) => {
      const d = new Date(c.checkin_date);
      const idx = d.getDay();
      const key = days[weekDays.indexOf(idx)];
      if (!energyByDay[key]) energyByDay[key] = [];
      energyByDay[key].push(c.energy_level);
    });
  }
  return days.map((day: string) => {
    const values: number[] = energyByDay[day] || [];
    const avg: number = values.length ? (values.reduce((a: number, b: number) => a + b, 0) / values.length) : 0;
    return { day, avg };
  });
}


export function getPriorityLabel(priority: string): string {
  if (priority === 'urgent') return 'Urgente';
  if (priority === 'high') return 'Alta';
  if (priority === 'medium') return 'Media';
  return 'Baja';
}


export function getPriorityColor(priority: string): string {
  if (priority === 'urgent') return 'bg-red-500';
  if (priority === 'high') return 'bg-orange-500';
  if (priority === 'medium') return 'bg-blue-500';
  return 'bg-gray-500';
}
