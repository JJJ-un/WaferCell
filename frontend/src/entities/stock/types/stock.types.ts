// 전체, 섹터, 하위 종목

export type SectorName = 
  | '전체'
  | '팹리스' 
  | '파운드리' 
  | '소부장'
  | '메모리' 
  | 'IDM'
  | 'IP';

  export interface Stock {
    name: string;
    ticker: string;
    sector: string;
    marketCap: number;
    changePercent: number;
    price: number;
    highPrice: number;
    lowPrice: number;
    prevClose: number;
    volume: number;
    // --- 추가 실시간 지표 ---
    tradingValue?: number;       // 현재 누적 거래대금
    strength?: number;           // 체결강도
    relativeChange?: number;     // SOXX 대비 상대 변동률
    rsi?: number;                // RSI 지표
    averageTradingValue?: number; // 20일 평균 일일 거래대금
    tradingValueRatio?: number;   // 평소 대비 거래대금 비율 (%)
   }
  
   export interface StockSummary {
     name: string;
     marketCap: number;
     changePercent: number;
     volume: number;
   }
  
   export interface StockHeatmap {
     overall: StockSummary;
     sectors: StockSummary[];
     stocks: Stock[];
   }

   // --- 뉴스 관련 타입 ---
   export interface StockNews {
     id: string;               // cntt_usiq_srno
     newsOferEntpCode: string; // 상세 조회용 업체 코드
     date: string;             // YYYYMMDD
     time: string;             // HHMMSS
     title: string;
     source: string;           // 자료원
     tickers: string[];        // 연관 종목 리스트
   }

   export interface NewsDetailResponse {
     content: string;          // 기사 본문
   }
