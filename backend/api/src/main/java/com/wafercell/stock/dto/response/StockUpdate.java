package com.wafercell.stock.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 실시간 주가 업데이트 정보를 담는 DTO (수치 데이터 타입 최적화)
 */
@Getter
@Setter
@Builder
public class StockUpdate {
    private String ticker;
    private Double price;
    private Double changePercent;
    private Long volume;    // 실시간 누적 거래량
    private Double highPrice; // 당일 고가
    private Double lowPrice;  // 당일 저가
    
    // 추가 지표
    private Double tradingValue;    // 거래대금
    private Double strength;        // 체결강도
    private Double rsi;             // RSI 지표 (서버 계산 결과값)
}
