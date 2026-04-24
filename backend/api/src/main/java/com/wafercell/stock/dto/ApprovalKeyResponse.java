package com.wafercell.stock.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 한국투자증권 웹소켓 승인키 응답 DTO
 */
@Getter
@NoArgsConstructor
public class ApprovalKeyResponse {
    @JsonProperty("approval_key")
    private String approvalKey;
}
