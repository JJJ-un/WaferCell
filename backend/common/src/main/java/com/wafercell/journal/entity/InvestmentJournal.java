package com.wafercell.journal.entity;

import com.wafercell.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 사용자의 주식 매매 및 투자 심리를 기록하는 엔티티
 */
@Entity
@Getter
@Table(name = "investment_journal", indexes = {
        @Index(name = "idx_journal_ticker", columnList = "ticker")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InvestmentJournal extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ticker;      // 종목 티커 (예: "NVDA")

    @Column(nullable = false)
    private String actionType;  // 매매 구분 ("BUY", "SELL", "MEMO")

    @Column
    private Double price;       // 매매 단가

    @Column
    private Double quantity;    // 매매 수량

    @Column(nullable = false)
    private String feeling;     // 투자 심리 상태 ("CALM", "GREEDY", "FEAR", "NEUTRAL")

    @Column(length = 3000)
    private String notes;       // 그날의 느낀 점 / 매매 복기 메모

    @Column(nullable = false)
    private LocalDate journalDate; // 일지 날짜 (예: 2026-06-28)

    @Column
    private String journalTime;    // 일지 시간 (예: "15:30")

    @Builder
    public InvestmentJournal(String ticker, String actionType, Double price, Double quantity, String feeling, String notes, LocalDate journalDate, String journalTime) {
        this.ticker = ticker.trim().toUpperCase();
        this.actionType = actionType;
        this.price = price;
        this.quantity = quantity;
        this.feeling = feeling;
        this.notes = notes;
        this.journalDate = journalDate;
        this.journalTime = journalTime;
    }
}
