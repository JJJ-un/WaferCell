package com.wafercell.stock.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "stock_supply_chain", indexes = {
        @Index(name = "idx_supply_chain_base", columnList = "baseTicker")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockSupplyChain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String baseTicker;       // 기준 종목 티커 (예: "AMD")

    @Column(nullable = false)
    private String targetTicker;     // 연관 종목 티커 (예: "TSM")

    @Column(nullable = false)
    private String targetCompanyName; // 연관 기업명 (예: "TSMC")

    @Column(nullable = false)
    private String relationType;      // 관계 유형 ("SUPPLIER", "CUSTOMER", "COMPETITOR")

    @Column(length = 500)
    private String description;       // 관계 상세 설명

    @Builder
    public StockSupplyChain(String baseTicker, String targetTicker, String targetCompanyName, String relationType, String description) {
        this.baseTicker = baseTicker;
        this.targetTicker = targetTicker;
        this.targetCompanyName = targetCompanyName;
        this.relationType = relationType;
        this.description = description;
    }
}
