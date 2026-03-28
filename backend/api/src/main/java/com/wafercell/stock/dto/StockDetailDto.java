package com.wafercell.stock.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * 개별 종목의 시장 상세 데이터를 담는 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StockDetailDto {

    /** 종목 명칭 (예: NVIDIA) */
    private String name;

    /** 종목 티커 (예: NVDA) */
    private String ticker;

    /** 소속 섹터 (예: Foundry, Memory) */
    private String sector;

    /** 시가총액 */
    private Double marketCap;

    /** 등락률 */
    private Double changePercent;

    /** 현재가 */
    private Double price;

    /** 당일 고가 */
    private Double highPrice;

    /** 당일 저가 */
    private Double lowPrice;

    /** 전일 종가 */
    private Double prevClose;

    /** 거래량 */
    private Long volume;
}
