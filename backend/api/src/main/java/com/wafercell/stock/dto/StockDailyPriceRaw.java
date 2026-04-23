package com.wafercell.stock.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 한투 외부 연동용 일자별 시세 Raw DTO
 */
@Getter
@NoArgsConstructor
public class StockDailyPriceRaw {
    @JsonProperty("clos")
    private String closePrice;

    @JsonProperty("tamt")
    private String tradingValue;

    @JsonProperty("xymd")
    private String date;
}
