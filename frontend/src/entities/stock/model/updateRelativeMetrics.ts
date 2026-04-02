import { type Stock } from '../types/stock.types';

/**
 * SOXX 대비 상대 지표를 재계산합니다.
 */
export const updateRelativeMetrics = (stocks: Stock[]): Stock[] => {
  const soxxStock = stocks.find(s => s.ticker === 'SOXX');
  const soxxRate = soxxStock ? soxxStock.changePercent : 0;

  return stocks.map(s => ({
    ...s,
    relativeChange: s.changePercent - soxxRate,
  }));
};
