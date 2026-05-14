package com.wafercell.stock.service.domain;

import com.wafercell.stock.dto.indicator.StockIndicators;
import com.wafercell.stock.dto.response.*;
import com.wafercell.stock.entity.Stock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StockMapper {

    /**
     * 기본 정보, API 응답 데이터, 계산된 지표들을 조합하여 상세 Snapshot을 생성합니다.
     */
    public StockSnapshot toSnapshot(Stock stock, StockPriceData response, StockIndicators indicators) {
        StockBase base = StockBase.builder()
                .name(stock.getName())
                .ticker(stock.getTicker())
                .sector(stock.getSector())
                .marketCap(response.getMarketCap())
                .build();

        StockPrice price = StockPrice.builder()
                .price(response.getLastPrice())
                .changePercent(response.getChangeRate())
                .highPrice(response.getHighPrice())
                .lowPrice(response.getLowPrice())
                .prevClose(response.getBasePrice())
                .volume(response.getVolume())
                .build();

        // 지표 객체 보강 (거래대금, 체결강도 추가)
        StockIndicators enrichedIndicators = indicators.toBuilder()
                .tradingValue(response.getTradingValue())
                .strength(response.getStrength())
                .build();

        return StockSnapshot.builder()
                .base(base)
                .price(price)
                .indicators(enrichedIndicators)
                .build();
    }

    /**
     * 데이터 로드 실패 시 사용하는 기본(Fallback) Snapshot을 생성합니다.
     */
    public StockSnapshot toFallbackSnapshot(Stock stock) {
        double lastVal = stock.getMarketCap() != null ? stock.getMarketCap() : 100.0;
        
        StockBase base = StockBase.builder()
                .name(stock.getName())
                .ticker(stock.getTicker())
                .sector(stock.getSector())
                .marketCap(lastVal)
                .build();

        StockPrice price = StockPrice.builder()
                .price(0.0)
                .changePercent(0.0)
                .volume(0L)
                .build();

        StockIndicators indicators = StockIndicators.builder()
                .rsi(50.0)
                .strength(100.0)
                .build();

        return StockSnapshot.builder()
                .base(base)
                .price(price)
                .indicators(indicators)
                .build();
    }
}
