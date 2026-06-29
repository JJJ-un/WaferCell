import { useQuery } from '@tanstack/react-query'
import { type ChartPeriod } from '@/shared/type/period.type'
import { fetchChartData } from '@/entities/stock/api/fetchChartData'

export const useChartData = (ticker: string, period: ChartPeriod) => {
  return useQuery({
    queryKey: ['chart', ticker, period],
    queryFn: async () => {
      const chartPoints = await fetchChartData(ticker, period);
      return { chartData: chartPoints || [] };
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  })
}
