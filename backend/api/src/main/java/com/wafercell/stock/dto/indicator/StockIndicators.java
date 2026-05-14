package com.wafercell.stock.dto.indicator;

import lombok.*;

/**
 * 계산된 주식 지표들을 담는 Parameter Object.
 * 새로운 지표가 추가될 경우 이 클래스에 필드를 추가하여 확장성을 확보합니다.
 */
@Getter
@Setter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class StockIndicators {
    private Double rsi;
    private Double averageTradingValue;
    private Double tradingValueRatio;
    private Double tradingValue;
    private Double strength;
    private Double relativeChange;
}
