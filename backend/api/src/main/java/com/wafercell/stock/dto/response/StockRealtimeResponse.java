package com.wafercell.stock.dto.response;

import com.wafercell.stock.dto.indicator.StockIndicators;
import lombok.Builder;
import lombok.Getter;

/**
 * 프론트엔드 실시간 전송 전용 DTO.
 * 백엔드에서 모든 지표(RSI, 거래대금 비율 등) 계산이 완료된 최종 상태를 담습니다.
 */
@Getter
@Builder
public class StockRealtimeResponse {
    private String ticker;
    private StockPrice price;        // 최신 가격 정보 (StockSnapshot의 Price와 동일 구조)
    private StockIndicators indicators; // 백엔드가 계산 완료한 모든 지표
}
