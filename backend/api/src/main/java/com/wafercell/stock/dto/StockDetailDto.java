package com.wafercell.stock.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * 개별 종목의 시장 상세 데이터를 담는 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StockDetailDto {

    private String name;
    private String ticker;
    private String sector;
    private Double marketCap;
    private Double changePercent;
    private Double price;
    private Double highPrice;
    private Double lowPrice;
    private Double prevClose;
    private Long volume;
    private Double tradingValue;
    private Double strength;
    private Double relativeChange;
    private Double rsi;
    private Double averageTradingValue;
    private Double tradingValueRatio;

    /**
     * 실시간 업데이트 메시지를 기반으로 데이터를 갱신합니다.
     */
    public void updateFromSocket(StockUpdate update, double newRsi, double newTamtRatio) {
        try {
            this.price = Double.parseDouble(update.getPrice());
            this.changePercent = Double.parseDouble(update.getRate());
            this.volume = (long) Double.parseDouble(update.getVolume());
            this.highPrice = Double.parseDouble(update.getHighPrice());
            this.lowPrice = Double.parseDouble(update.getLowPrice());
            this.tradingValue = update.getTradingValue() != null ? Double.parseDouble(update.getTradingValue()) : 0.0;
            this.strength = update.getStrength() != null ? Double.parseDouble(update.getStrength()) : 100.0;
            this.rsi = newRsi;
            this.tradingValueRatio = newTamtRatio;
        } catch (Exception ignored) {}
    }
}
