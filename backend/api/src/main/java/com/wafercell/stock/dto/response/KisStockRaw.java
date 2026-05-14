package com.wafercell.stock.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 한투 해외 주식 현재가상세 API를 받는 Raw DTO
 */
@Getter
@NoArgsConstructor
public class KisStockRaw {
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

    @JsonProperty("tvol")
    private String volume;

    @JsonProperty("high")
    private String highPrice;

    @JsonProperty("low")
    private String lowPrice;

    @JsonProperty("tamt")
    private String tradingValue;
}
