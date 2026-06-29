package com.wafercell.journal.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 투자 일지 저장을 위한 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class JournalSaveRequest {
    private String ticker;
    private String actionType;  // BUY, SELL, MEMO
    private Double price;       // MEMO 시 null 허용
    private Double quantity;    // MEMO 시 null 허용
    private String feeling;     // CALM, GREEDY, FEAR, NEUTRAL
    private String notes;
    private LocalDate journalDate;
    private String journalTime;
}
