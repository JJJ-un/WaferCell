import { apiClient } from '@/shared/api/apiClient';
import { type HeatmapNode } from '../types/stockTypes';

export const fetchStocks = async (): Promise<HeatmapNode> => {
  const { data } = await apiClient.get<HeatmapNode>('/stocks/heatmap');
  return data;
};