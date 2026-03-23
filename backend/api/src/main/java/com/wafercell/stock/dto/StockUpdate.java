package com.wafercell.stock.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StockUpdate {
    private String ticker;    // 종목 코드 (예: NVDA)
    private String price;     // 현재가
    private String rate;      // 등락률
    private String volume;    // 거래량
    private String timestamp; // 체결 시간
}
