import { type Stock, type StockSummary } from '../types/stock.types';

/**
 * 변경된 종목 데이터를 기반으로 섹터 요약 정보를 재계산합니다.
 */
export const calculateSectors = (stocks: Stock[], currentSectors: StockSummary[]): StockSummary[] => {
  return currentSectors.map(sector => {
    const sectorStocks = stocks.filter(s => s.sector === sector.name);
    if (sectorStocks.length === 0) return { ...sector };

    const totalMarketCap = sectorStocks.reduce((sum, s) => sum + s.marketCap, 0);
    const totalVolume = sectorStocks.reduce((sum, s) => sum + s.volume, 0);
    const weightedAvgRate = totalMarketCap === 0 ? 0 :
      sectorStocks.reduce((sum, s) => sum + (s.changePercent * (s.marketCap / totalMarketCap)), 0);

    return {
      ...sector,
      marketCap: totalMarketCap,
      changePercent: weightedAvgRate,
      volume: totalVolume,
    };
  });
};
