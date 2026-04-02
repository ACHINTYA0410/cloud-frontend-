export interface PowerReading {
  time: string;
  hour: number;
  consumption: number;
  anomalyScore: number;
  isAnomaly: boolean;
}

export function generateMockData(): PowerReading[] {
  const data: PowerReading[] = [];
  const anomalyHours = [3, 7, 14, 19]; // hours with spikes

  for (let h = 0; h < 24; h++) {
    const base = 40 + Math.sin(h / 3) * 15 + Math.random() * 5;
    const isAnomaly = anomalyHours.includes(h);
    const consumption = isAnomaly
      ? base + 35 + Math.random() * 25
      : base;
    const anomalyScore = isAnomaly
      ? 0.75 + Math.random() * 0.25
      : Math.random() * 0.3;

    data.push({
      time: `${h.toString().padStart(2, "0")}:00`,
      hour: h,
      consumption: Math.round(consumption * 10) / 10,
      anomalyScore: Math.round(anomalyScore * 100) / 100,
      isAnomaly,
    });
  }
  return data;
}
