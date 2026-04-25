package com.wafercell.global.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 한국투자증권 API 공통 응답 래퍼 (기술 공통 DTO)
 */
@Getter
@NoArgsConstructor
public class KoreaInvestRawResponse<T> {
    @JsonProperty("rt_cd")
    private String rtCd;

    @JsonProperty("msg1")
    private String msg1;

    @JsonProperty("output")
    private T output;

    @JsonProperty("output2")
    private List<T> output2;
}
