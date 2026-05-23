import { apiClient } from '@/shared/api/apiClient';
import { type DailyPrice } from '../types/stock.types';

export const fetchDailyPrices = async (ticker: string): Promise<DailyPrice[]> => {
  const { data } = await apiClient.get<DailyPrice[]>(`/stocks/${ticker}/daily-prices`);
  return data;
};
