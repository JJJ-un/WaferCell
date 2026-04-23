package com.wafercell.stock.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 한투 해외 주식 상세 시세 Raw DTO 
 */
@Getter
@NoArgsConstructor
public class StockDetailRaw {
    @JsonProperty("last")
    private String lastPrice;

    @JsonProperty("base")
    private String basePrice;

    @JsonProperty("diff")
    private String changeAmount;

    @JsonProperty("rate")
    private String changeRate;

    @JsonProperty("t_avls")
    private String marketCap;

    @JsonProperty("vol")
    private String volume;

    @JsonProperty("high")
    private String highPrice;

    @JsonProperty("low")
    private String lowPrice;

    @JsonProperty("tamt")
    private String tradingValue;
}
