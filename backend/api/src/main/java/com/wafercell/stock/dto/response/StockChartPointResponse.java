package com.wafercell.stock.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 프론트엔드 차트 전송용 경량 데이터 포인트 DTO
 */
@Getter
@Builder
public class StockChartPointResponse {
    private Object time;  // "YYYY-MM-DD" 문자열 또는 Long (유닉스 타임스탬프)
    private Double value; // 종가 (closePrice)
}
