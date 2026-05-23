import { useQuery } from '@tanstack/react-query'
import { type ChartPeriod } from '@/shared/type/period.type'
import { fetchDailyPrices } from '@/entities/stock/api/fetchDailyPrices'

export const useChartData = (ticker: string, period: ChartPeriod) => {
  return useQuery({
    queryKey: ['chart', ticker, period],
    queryFn: async () => {
      const dailyPrices = await fetchDailyPrices(ticker);
      
      // 기간 필터링 로직 (단순 구현: 3개월=90일, 1년=365일 등)
      const now = new Date();
      let filterDate = new Date();
      if (period === '3개월') filterDate.setMonth(now.getMonth() - 3);
      else if (period === '1년') filterDate.setFullYear(now.getFullYear() - 1);
      else if (period === '3년') filterDate.setFullYear(now.getFullYear() - 3);
      else if (period === '10년') filterDate.setFullYear(now.getFullYear() - 10);

      const filteredPrices = dailyPrices.filter(item => new Date(item.date) >= filterDate);

      // 차트용 데이터로 변환 (날짜 오름차순)
      const chartData = [...filteredPrices]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(item => ({
          time: item.date,
          value: item.closePrice,
        }));

      // 리스트용 데이터 (날짜 내림차순 - 최신순)
      const sortedDailyPrices = [...filteredPrices].sort((a, b) => b.date.localeCompare(a.date));

      return { chartData, dailyPrices: sortedDailyPrices };
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  })
}
