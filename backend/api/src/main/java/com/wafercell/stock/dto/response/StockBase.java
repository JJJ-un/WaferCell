package com.wafercell.stock.dto.response;

import lombok.*;

/**
 * 종목의 기본 정적 정보를 담는 DTO (Source: Database)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockBase {
    private String name;
    private String ticker;
    private String sector;
    private Double marketCap;
}
