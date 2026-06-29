package com.wafercell.journal.dto;

import com.wafercell.journal.entity.InvestmentJournal;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 프론트엔드로 반환되는 투자 일지 응답 DTO
 */
@Getter
public class JournalResponse {
    private Long id;
    private String ticker;
    private String actionType;
    private Double price;
    private Double quantity;
    private String feeling;
    private String notes;
    private LocalDate journalDate;
    private String journalTime;
    private LocalDateTime createdAt;

    @Builder
    public JournalResponse(Long id, String ticker, String actionType, Double price, Double quantity, String feeling, String notes, LocalDate journalDate, String journalTime, LocalDateTime createdAt) {
        this.id = id;
        this.ticker = ticker;
        this.actionType = actionType;
        this.price = price;
        this.quantity = quantity;
        this.feeling = feeling;
        this.notes = notes;
        this.journalDate = journalDate;
        this.journalTime = journalTime;
        this.createdAt = createdAt;
    }

    public static JournalResponse from(InvestmentJournal journal) {
        return JournalResponse.builder()
                .id(journal.getId())
                .ticker(journal.getTicker())
                .actionType(journal.getActionType())
                .price(journal.getPrice())
                .quantity(journal.getQuantity())
                .feeling(journal.getFeeling())
                .notes(journal.getNotes())
                .journalDate(journal.getJournalDate())
                .journalTime(journal.getJournalTime())
                .createdAt(journal.getCreatedAt())
                .build();
    }
}
