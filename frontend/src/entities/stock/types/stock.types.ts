// 전체, 섹터, 하위 종목

// 인자 타입이 있을 것 같고, 데이터 자체 타입이 있을 것 같다. 

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
