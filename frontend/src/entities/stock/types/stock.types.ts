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

// 3. 상세 주식 정보 (StockSummary 확장)
export interface Stock extends StockSummary {
  ticker: string;
  sector: string;
  price: number;
  highPrice: number;
  lowPrice: number;
  prevClose: number;
  tradingValue?: number;
  strength?: number;
  rsi?: number;
  averageTradingValue?: number;
  tradingValueRatio?: number;
  // SOXX 대비 상대 변동률(아직쓰이지 않고 있다.)
  relativeChange?: number;
}

// 4. 인덱싱된 히트맵 구조 (사용자 제안 반영: O(1) 접근 가능)
export interface IndexedStockResponse {
  overall: StockSummary;
  // 섹터별 즉시 접근: sectors['팹리스']
  sectors: Record<string, StockSummary>; 
  // 티커별 즉시 접근: stocks['NVDA']
  stocks: Record<string, Stock>;
}

// 5. 소켓에서 오는 원본 데이터 타입 (변환용)
export interface UpdatedStock {
  ticker: string;
  price: string;
  rate: string;     // UI의 changePercent로 변환됨
  volume: string;
  highPrice: string;
  lowPrice: string;
  timestamp: string;
  tradingValue?: string;
  strength?: string;
  rsi?: string;
  tradingValueRatio?: string;
}

// 웹소켓에서 해당과 같은 형태로 값을 불러온다. 
export interface StockResponse {
  overall: StockSummary;
  sectors: StockSummary[];
  stocks: Stock[];
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
