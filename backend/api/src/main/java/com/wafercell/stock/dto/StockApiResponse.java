package com.wafercell.stock.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StockApiResponse {
    private final double marketCap;
    private final double lastPrice;
    private final double basePrice;
    private final double highPrice;
    private final double lowPrice;
    private final long volume;
    private final double tradingValue;
}
