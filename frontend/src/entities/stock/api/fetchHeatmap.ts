import { apiClient } from '@/shared/api/apiClient';
import { type StockResponse } from '../types/stock.types';

export const fetchHeatmap = async (): Promise<StockResponse> => {
  const { data } = await apiClient.get<StockResponse>('/stocks/heatmap');
  return data;
};