package com.wafercell.news.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 한투 외부 연동용 뉴스 속보 Raw DTO
 */
@Getter
@NoArgsConstructor
public class NewsRaw {
    @JsonProperty("cntt_usiq_srno")
    private String id;

    @JsonProperty("news_ofer_entp_code")
    private String newsOferEntpCode;

    @JsonProperty("data_dt")
    private String date;

    @JsonProperty("data_tm")
    private String time;

    @JsonProperty("hts_pbnt_titl_cntl")
    private String title;

    @JsonProperty("dorg")
    private String source;

    @JsonProperty("iscd1") private String iscd1;
    @JsonProperty("iscd2") private String iscd2;
    @JsonProperty("iscd3") private String iscd3;
    @JsonProperty("iscd4") private String iscd4;
    @JsonProperty("iscd5") private String iscd5;
    @JsonProperty("iscd6") private String iscd6;
    @JsonProperty("iscd7") private String iscd7;
    @JsonProperty("iscd8") private String iscd8;
    @JsonProperty("iscd9") private String iscd9;
    @JsonProperty("iscd10") private String iscd10;
}
