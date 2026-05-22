package com.wafercell.stock.dto.response;

import lombok.*;

/**
 * 실시간 주가 업데이트 정보를 담는 DTO (수치 데이터 타입 최적화)
 * 한국투자증권 소켓으로부터 직접 파싱된 원천 데이터를 담습니다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
}
