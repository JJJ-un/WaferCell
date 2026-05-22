package com.wafercell.stock.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프론트엔드 일별 시세 리스트 전달을 위한 응답 DTO.
 * 기존 StockDailyPriceRaw 및 StockPriceData의 네이밍 컨벤션을 따름.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDailyPriceResponse {
    private String date;           // 날짜 (yyyy-MM-dd)
    private double closePrice;     // 종가
    private double changeAmount;   // 등락액
    private double changeRate;     // 등락률
    private long volume;           // 거래량
    private double tradingValue;   // 거래대금
}
