package com.wafercell.stock.dto;

import lombok.*;

/**
 * 전체 또는 섹터별 시장 요약 통계 정보를 담는 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockSummaryDto {
    /** 요약 명칭 (예: 반도체 전체, Memory, Foundry) */
    private String name;
    
    /** 시가총액 합계 */
    private Double marketCap;
    
    /** 가중 평균 등락률 */
    private Double changePercent;
    
    /** 거래량 합계 */
    private Long volume;
}
