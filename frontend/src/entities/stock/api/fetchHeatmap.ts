import { apiClient } from '@/shared/api/apiClient';
import { type StockHeatmap } from '../types/stock.types';

export const fetchHeatmap = async (): Promise<StockHeatmap> => {
  const { data } = await apiClient.get<StockHeatmap>('/stocks/heatmap');
  console.log('Fetched heatmap data:', data); // 디버깅 로그
  return data;
};