package com.wafercell.stock.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * 개별 종목의 시장 상세 데이터를 담는 DTO
 */
@Getter
@Setter
@Builder(toBuilder = true)
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
    // 벤치마크 대비 상대 수익률
    private Double relativeChange;
    private Double rsi;
    private Double averageTradingValue;
    private Double tradingValueRatio;

    /**
     * 벤치마크 수익률을 바탕으로 상대 수익률이 계산된 새로운 DTO 인스턴스를 반환합니다.
     */
    public StockDetailDto calculateRelativeChange(double benchmarkRate) {
        return this.toBuilder()
                .relativeChange(this.changePercent - benchmarkRate)
                .build();
    }
    /**
     * 실시간 업데이트 메시지를 기반으로 데이터를 갱신한 새로운 DTO 인스턴스를 반환합니다.
     */
    public StockDetailDto updateFromSocket(StockUpdate update, double newRsi, double newTamtRatio) {
        try {
            return this.toBuilder()
                    .price(Double.parseDouble(update.getPrice()))
                    .changePercent(Double.parseDouble(update.getRate()))
                    .volume((long) Double.parseDouble(update.getVolume()))
                    .highPrice(Double.parseDouble(update.getHighPrice()))
                    .lowPrice(Double.parseDouble(update.getLowPrice()))
                    .tradingValue(update.getTradingValue() != null ? Double.parseDouble(update.getTradingValue()) : 0.0)
                    .strength(update.getStrength() != null ? Double.parseDouble(update.getStrength()) : 100.0)
                    .rsi(newRsi)
                    .tradingValueRatio(newTamtRatio)
                    .build();
        } catch (Exception e) {
            return this;
        }
    }
}
