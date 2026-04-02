import { type Stock } from '../types/stock.types';
import { getMarketProgress } from '@/shared/util/marketTime';

export interface UpdatedStock {
  ticker: string;
  price: string;
  rate: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  timestamp: string;
  tradingValue?: string;
  strength?: string;
  rsi?: string;
}

/**
 * STOMP로 받은 원시 데이터를 Stock 타입의 부분 데이터로 변환합니다.
 */
export const transformUpdate = (data: UpdatedStock): Partial<Stock> => ({
  price: parseFloat(data.price),
  changePercent: parseFloat(data.rate),
  volume: parseInt(data.volume, 10),
  highPrice: parseFloat(data.highPrice),
  lowPrice: parseFloat(data.lowPrice),
  tradingValue: data.tradingValue ? parseFloat(data.tradingValue) : undefined,
  strength: data.strength ? parseFloat(data.strength) : undefined,
  rsi: data.rsi ? parseFloat(data.rsi) : undefined,
});

/**
 * 특정 종목의 데이터를 업데이트하고 거래대금 비율을 재계산합니다.
 * 사용자 제안에 따라 '현재 시간 시점의 평균치'를 기준으로 강도를 산출합니다.
 */
export const updateIndividualStock = (stocks: Stock[], updateRaw: UpdatedStock): Stock[] => {
  const targetIndex = stocks.findIndex(s => s.ticker === updateRaw.ticker);
  if (targetIndex === -1) return stocks;

  const currentStock = stocks[targetIndex];
  const updatedInfo = transformUpdate(updateRaw);

  // 1. 거래대금 비율(Ratio) 실시간 재계산 (시간 가중치 적용)
  const newTradingValue = updatedInfo.tradingValue ?? (currentStock.tradingValue || 0);
  const avgTamt = currentStock.averageTradingValue || 0;
  
  // 장 진행률 계산 (0.001 ~ 1.0)
  const progress = getMarketProgress(updateRaw.timestamp);
  
  // 현재 시점의 예상 평균 거래대금 = 20일 전체 평균 * 진행률
  const currentExpectedAvg = avgTamt * progress;

  // 최종 강도 = 현재 터진 돈 / 현재 시점의 평균 예상치 * 100
  const newTamtRatio = currentExpectedAvg === 0 ? 0 : (newTradingValue / currentExpectedAvg) * 100;

  const newStocks = [...stocks];
  newStocks[targetIndex] = {
    ...currentStock,
    ...updatedInfo,
    tradingValueRatio: newTamtRatio,
  };

  return newStocks;
};
