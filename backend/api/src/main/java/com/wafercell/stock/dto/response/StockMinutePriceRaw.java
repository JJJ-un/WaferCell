package com.wafercell.stock.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 한투 외부 연동용 해외주식 분봉 시세 Raw DTO
 */
@Getter
@NoArgsConstructor
public class StockMinutePriceRaw {
    @JsonProperty("tymd")
    private String localBusinessDate; // 현지영업일자

    @JsonProperty("xymd")
    private String localBaseDate;     // 현지기준일자

    @JsonProperty("xhms")
    private String localBaseTime;     // 현지기준시간

    @JsonProperty("kymd")
    private String koreaBaseDate;     // 한국기준일자

    @JsonProperty("khms")
    private String koreaBaseTime;     // 한국기준시간

    @JsonProperty("open")
    private String openPrice;

    @JsonProperty("high")
    private String highPrice;

    @JsonProperty("low")
    private String lowPrice;

    @JsonProperty("last")
    private String closePrice;        // 종가 (last)

    @JsonProperty("evol")
    private String volume;            // 체결량 (evol)

    @JsonProperty("eamt")
    private String tradingValue;      // 체결대금 (eamt)
}
