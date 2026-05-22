package com.wafercell.stock.dto.response;

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

    @JsonProperty("diff")
    private String changeAmount;

    @JsonProperty("rate")
    private String changeRate;

    @JsonProperty("tamt")
    private String tradingValue;

    @JsonProperty("tvol")
    private String volume;

    @JsonProperty("high")
    private String highPrice;

    @JsonProperty("low")
    private String lowPrice;

    @JsonProperty("xymd")
    private String date;
}
