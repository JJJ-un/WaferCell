package com.wafercell.stock.dto.indicator;

import lombok.Builder;
import lombok.Getter;

/**
 * 계산된 주식 지표들을 담는 Parameter Object.
 * 새로운 지표가 추가될 경우 이 클래스에 필드를 추가하여 확장성을 확보합니다.
 */
@Getter
@Builder
public class StockIndicators {
    private final double rsi;
    private final double averageTradingValue;
    private final double tradingValueRatio;
    
    // 필요시 여기에 MACD, 이동평균선 등 추가 지표를 선언
}
