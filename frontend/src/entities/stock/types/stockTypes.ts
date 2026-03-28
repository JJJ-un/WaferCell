

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

/**
 * 금융 시장의 주식 데이터를 정의하는 인터페이스입니다.
 * * @interface Stock
 * @property {string} ticker - 주식 종목 코드 (예: "AAPL", "005930")
 * @property {number} price - 현재 거래 가격
 * @property {number} change - 전일 종가 대비 변동 금액
 * @property {number} changePercent - 전일 종가 대비 변동률 (%)
 * @property {number} volume - 해당 세션의 총 거래량
 * @property {number} value - 시가총액 또는 자산 가치
 * @property {string} currency - 화폐 단위 (예: "USD", "KRW")
 * @property {Date} lastUpdated - 데이터가 마지막으로 업데이트된 시각
 */

export interface Stock {
    id: string;
    ticker: string; 
    value: number; 
    change : number; 
    changePercent: number;
    volume: number; 
    price: number; 
    sectorName: SectorName;
    // 추가 지표
    tradingValue?: number;
    strength?: number;
    volumeIntensity?: number;
}

/**
 * 주식 시장의 특정 섹터(업종) 데이터를 정의하는 인터페이스입니다.
 * * @interface Sector
 * @property {string} name - 섹터 명칭 (예: "IT 서비스", "반도체", "금융")
 * @property {number} change - 섹터 평균 변동 금액
 * @property {number} changePercent - 섹터 평균 변동률 (%)
 * @property {number} marketCap - 섹터 내 상장 기업들의 시가총액 합계
 * @property {number} companyCount - 해당 섹터에 포함된 총 상장 기업 수
 */

// 어떻게 보면 이건 카테고리 처럼 빠질 수도 있다. 
// 애초에 이게 필요없어질 수도
export interface Sector {
    sectorName: SectorName;
    change: number;
    changePercent: number;
    marketCap: number;
    companyCount: number;
}


/**
 * 반도체 시장 전반의 요약 정보와 섹터별 성과를 정의하는 인터페이스입니다.
 * * @interface SemiconductorMarket
 * @property {string} marketName - 시장 명칭 (예: "Global Semi", "K-Semiconductor")
 * @property {number} totalMarketCap - 반도체 시장 전체 시가총액 합계
 * @property {number} averageChangePercent - 시장 전체 평균 등락률 (%)
 * @property {Sector[]} sectors - 밸류체인별(EDA, 팹리스 등) 상세 데이터 배열
 * @property {Date} lastUpdated - 시장 데이터 기준 시각
 */

export interface SemiconductorMarket {
    marketName: string;
    totalMarketCap: number;
    averageChangePercent: number;
    sectors: Sector[]; 
    lastUpdated: Date;
}

// 왜 이런구조로 작성했는가? => 히트 맵 특성상 트리맵을 위해  => 구조를 손볼 필요은 있을슷
export interface HeatmapNode {
  // 전체 / 섹션 / 종목
  name: string;
  // 시가총액
  value: number;
  // 등락률 => 내가 백엔드에서 만든 값이다. 
  rate: number;
  children: HeatmapNode[] | null;
}
