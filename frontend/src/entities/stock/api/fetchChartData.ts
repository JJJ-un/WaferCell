import { apiClient } from '@/shared/api/apiClient';
import { type ChartPeriod } from '@/shared/type/period.type';

export interface ChartPoint {
  time: string | number;
  value: number;
}

export const fetchChartData = async (ticker: string, period: ChartPeriod): Promise<ChartPoint[]> => {
  const { data } = await apiClient.get<ChartPoint[]>(`/stocks/${ticker}/chart?period=${period}`);
  return data;
};
