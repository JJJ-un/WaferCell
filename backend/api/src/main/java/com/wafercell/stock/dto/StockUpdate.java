package com.wafercell.stock.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StockUpdate {
    private String ticker;
    private String price;
    private String rate;
    private String volume;    // 누적 거래량
    private String timestamp;
    
    // 추가 지표
    private String tradingValue; // 거래대금 (tamt)
    private String strength;     // 체결강도 (STRN)
    private String volumeIntensity; // 거래강도 (현재 누적 / 전일 전체 * 100)
}
