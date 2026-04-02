import { type StockSummary } from '../types/stock.types';

/**
 * 섹터 데이터를 기반으로 전체 요약 정보를 재계산합니다.
 */
export const calculateOverall = (sectors: StockSummary[]): StockSummary => {
  const totalMarketCap = sectors.reduce((sum, s) => sum + s.marketCap, 0);
  const totalVolume = sectors.reduce((sum, s) => sum + s.volume, 0);
  const overallAvgRate = totalMarketCap === 0 ? 0 :
    sectors.reduce((sum, s) => sum + (s.changePercent * (s.marketCap / totalMarketCap)), 0);

  return {
    name: '전체',
    marketCap: totalMarketCap,
    changePercent: overallAvgRate,
    volume: totalVolume,
  };
};
