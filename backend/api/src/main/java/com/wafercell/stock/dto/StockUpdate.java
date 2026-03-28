package com.wafercell.stock.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 실시간 주가 업데이트 정보를 담는 DTO
 */
@Getter
@Setter
@Builder
public class StockUpdate {
    private String ticker;
    private String price;
    private String rate;
    private String volume;    // 실시간 누적 거래량
    private String highPrice; // 당일 고가
    private String lowPrice;  // 당일 저가
    private String timestamp;
    
    // 추가 지표
    private String tradingValue;    // 거래대금
    private String strength;        // 체결강도
    private String volumeIntensity; // 거래강도
    private String rsi;             // RSI 지표
}
