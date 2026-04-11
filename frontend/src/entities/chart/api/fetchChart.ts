import { apiClient } from '@/shared/api/apiClient';

export const fetchChart = async () => {
  const { data } = await apiClient.get('/stocks/chart');
  return data;
};