// 1. 섹터명 타입 정의 (단순 유니온)
export type SectorName = 
  | '팹리스' 
  | '파운드리' 
  | '소부장' 
  | '메모리' 
  | 'IDM' 
  | 'IP'
  | '전체';

// 2. 공통 요약 인터페이스 (기존 StockBase 대체)
export interface StockSummary {
  name: string;
  marketCap: number;
  changePercent: number;
  volume: number;
}

// 3. 상세 주식 정보 (중첩 구조로 변경)
export interface StockBase {
  name: string;
  ticker: string;
  sector: string;
  marketCap: number;
}

export interface StockPrice {
  price: number;
  changePercent: number;
  volume: number;
  highPrice: number;
  lowPrice: number;
  prevClose: number;
  strength?: number;
}

export interface StockIndicators {
  rsi?: number;
  tradingValue?: number;
  averageTradingValue?: number;
  tradingValueRatio?: number;
  relativeChange?: number;
}

export interface StockSnapshot {
  base: StockBase;
  price: StockPrice;
  indicators: StockIndicators;
}

// 4. 인덱싱된 히트맵 구조
export interface IndexedStockResponse {
  overall: StockSummary;
  sectors: Record<string, StockSummary>; 
  stocks: Record<string, StockSnapshot>;
}

// 5. 소켓에서 오는 완성된 데이터 타입 (백엔드 StockRealtimeResponse와 동기화)
export interface UpdatedStock {
  ticker: string;
  price: {
    price: number;
    changePercent: number;
    volume: number;
    highPrice: number;
    lowPrice: number;
    strength: number;
  };
  indicators: {
    rsi: number;
    tradingValue: number;
    tradingValueRatio: number;
  };
}

export interface StockResponse {
  overall: StockSummary;
  sectors: StockSummary[];
  stocks: StockSnapshot[];
}







// --- 뉴스 관련 타입 ---
export interface StockNews {
  id: string;
  newsOferEntpCode: string;
  date: string;
  time: string;
  title: string;
  source: string;
  tickers: string[];
}

export interface NewsDetailResponse {
  content: string;
}
