package com.wafercell.stock.dto.response;

import lombok.*;

import java.util.List;

/**
 * 히트맵 화면을 위한 통합 응답 데이터 (평면 구조 + 요약 통계)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockHeatmapResponse {

    /** 반도체 전체 요약 정보 */
    private StockSummaryDto overall;

    /** 섹터별 요약 정보 리스트 */
    private List<StockSummaryDto> sectors;

    /** 개별 종목 상세 리스트 (평면 데이터) */
    private List<StockDetailDto> stocks;
}
