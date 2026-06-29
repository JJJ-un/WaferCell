package com.wafercell.stock.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "stock_supply_chain_event", indexes = {
        @Index(name = "idx_supply_chain_event_base", columnList = "baseTicker")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockSupplyChainEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String baseTicker;        // 기준 종목 티커 (예: "AMD")

    @Column(nullable = false)
    private String eventName;         // 사건명 (예: "ASML 2분기 실적 발표 예정")

    @Column(nullable = false)
    private String eventDate;         // 예정 일자 (예: "2026-06-05")

    @Column(length = 3000)
    private String estimatedImpact;   // 예상 파급 효과 브리핑 (혹은 한글 3줄 분석 브리핑)

    @Column(nullable = false)
    private String eventType = "CALENDAR";         // 이벤트 타입 ("CALENDAR" 또는 "REALTIME_IMPACT")

    @Column(nullable = true)
    private Integer score;            // AI 영향도 점수 (NULL 가능)

    @Column(length = 1000, nullable = true)
    private String newsUrl;           // 뉴스 기사 고유 원본 URL 주소 (중복 분석 방지용)

    @Builder
    public StockSupplyChainEvent(String baseTicker, String eventName, String eventDate, String estimatedImpact, String eventType, Integer score, String newsUrl) {
        this.baseTicker = baseTicker;
        this.eventName = eventName;
        this.eventDate = eventDate;
        this.estimatedImpact = estimatedImpact;
        this.eventType = (eventType != null) ? eventType : "CALENDAR";
        this.score = score;
        this.newsUrl = newsUrl;
    }
}
