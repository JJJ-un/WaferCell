package com.wafercell.stock.dto.response;

import com.wafercell.stock.dto.indicator.StockIndicators;
import lombok.*;

/**
 * 개별 종목의 모든 데이터(정적, 동적, 지표)를 조립한 최종 컨테이너 DTO
 */
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class StockSnapshot {
    private StockBase base;
    private StockPrice price;
    private StockIndicators indicators;

    /**
     * 벤치마크 수익률을 바탕으로 상대 수익률이 계산된 새로운 인스턴스를 반환합니다.
     */
    public StockSnapshot calculateRelativeChange(double benchmarkRate) {
        StockIndicators updatedIndicators = this.indicators.toBuilder()
                .relativeChange(this.price.getChangePercent() - benchmarkRate)
                .build();
        
        return this.toBuilder()
                .indicators(updatedIndicators)
                .build();
    }

    /**
     * 실시간 업데이트 메시지를 기반으로 데이터를 갱신한 새로운 인스턴스를 반환합니다.
     */
    public StockSnapshot updateFromSocket(StockUpdate update, StockIndicators newIndicators) {
        try {
            StockPrice updatedPrice = this.price.toBuilder()
                    .price(update.getPrice())
                    .changePercent(update.getChangePercent())
                    .volume(update.getVolume())
                    .highPrice(update.getHighPrice())
                    .lowPrice(update.getLowPrice())
                    .build();

            return this.toBuilder()
                    .price(updatedPrice)
                    .indicators(newIndicators)
                    .build();
        } catch (Exception e) {
            return this;
        }
    }
}
