package com.wafercell.stock.entity;

import com.wafercell.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 주식 종목 정보를 관리하는 엔티티
 * 반도체 전문 플랫폼이므로 sector 필드는 '팹리스', '파운드리' 등 세부 공정 분류를 나타냅니다.
 */
@Entity
@Getter
@Table(name = "stocks", indexes = {
        @Index(name = "idx_stock_ticker", columnList = "ticker")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Stock extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ticker;      // 종목 티커 (예: NVDA, AMD)

    @Column(nullable = false)
    private String name;        // 종목 이름 (예: 엔비디아)

    @Column(nullable = false)
    private String exchange;    // 거래소 코드 (예: NAS, NYS)

    @Column(nullable = false)
    private String sector;      // 세부 공정 섹터 (예: 팹리스, 파운드리, 소부장 등)


    @Builder
    public Stock(String ticker, String name, String exchange, String sector) {
        this.ticker = ticker;
        this.name = name;
        this.exchange = exchange;
        this.sector = sector;
    }

}
