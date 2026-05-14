package com.wafercell.stock.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 한투 해외 주식 현재가상세 API에서 파서를 통해 해당 서비스에서 다루기 쉬운 데이터로 바꾸는 DTO
 * - parser 용 DTO로, API에서 받는 데이터와는 다르게 타입이 변환되어 있음
 */

@Getter
@Builder
public class StockPriceData {
    private final double lastPrice;
    private final double basePrice;
    private final double changeAmount;
    private final double changeRate;
    private final double marketCap;
    private final long volume;
    private final double highPrice;
    private final double lowPrice;
    private final double tradingValue;
    private final double strength;
}