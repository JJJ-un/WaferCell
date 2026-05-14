package com.wafercell.stock.dto.response;

import lombok.*;

/**
 * 실시간 주가 관련 정보를 담는 DTO (Source: External API / WebSocket)
 */
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class StockPrice {
    private Double price;
    private Double changePercent;
    private Long volume;
    private Double highPrice;
    private Double lowPrice;
    private Double prevClose;
}
