import { useQuery } from '@tanstack/react-query'
import { type ChartPeriod } from '@/shared/type/period.type'

interface ChartData {
  time: string;
  value: number;
}

interface DailyPrice {
  date: string;
  price: number;
  change: number;
  volume: number;
}

// API 연동 전 Mock 데이터 생성기
const getMockData = async (ticker: string, period: ChartPeriod) => {
  // 로딩 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 300));

  const chartData: ChartData[] = Array.from({ length: 20 }, (_, i) => ({
    time: `2025-01-${(i + 1).toString().padStart(2, '0')}`,
    value: 100 + Math.random() * 50,
  }));

  const dailyPrices: DailyPrice[] = Array.from({ length: 10 }, (_, i) => ({
    date: `2025-01-${(20 - i).toString().padStart(2, '0')}`,
    price: 150 - i * 2,
    change: Math.random() * 10 - 5,
    volume: 1000 + Math.floor(Math.random() * 500),
  }));

  return { chartData, dailyPrices };
}

export const useChartData = (ticker: string, period: ChartPeriod) => {
  return useQuery({
    queryKey: ['chart', ticker, period],
    queryFn: () => getMockData(ticker, period),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  })
}
