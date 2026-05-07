package com.wafercell.stock.service.domain;

import com.wafercell.stock.dto.indicator.StockIndicators;
import com.wafercell.stock.dto.response.StockApiResponse;
import com.wafercell.stock.dto.response.StockDetailDto;
import com.wafercell.stock.entity.Stock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StockMapper {

    /**
     * 기본 정보, API 응답 데이터, 계산된 지표들을 조합하여 상세 DTO를 생성합니다.
     */
    public StockDetailDto toDetailDto(Stock stock, StockApiResponse response, StockIndicators indicators) {
        return StockDetailDto.builder()
                .name(stock.getName()).ticker(stock.getTicker()).sector(stock.getSector())
                .marketCap(response.getMarketCap()).changePercent(response.getChangeRate()).price(response.getLastPrice())
                .highPrice(response.getHighPrice()).lowPrice(response.getLowPrice())
                .prevClose(response.getBasePrice()).volume(response.getVolume())
                .tradingValue(response.getTradingValue()).strength(100.0)
                .rsi(indicators.getRsi())
                .averageTradingValue(indicators.getAverageTradingValue())
                .tradingValueRatio(indicators.getTradingValueRatio())
                .build();
    }

    /**
     * 데이터 로드 실패 시 사용하는 기본(Fallback) DTO를 생성합니다.
     */
    public StockDetailDto toFallbackDto(Stock stock) {
        double lastVal = stock.getMarketCap() != null ? stock.getMarketCap() : 100.0;
        return StockDetailDto.builder()
                .name(stock.getName())
                .ticker(stock.getTicker())
                .sector(stock.getSector())
                .marketCap(lastVal)
                .changePercent(0.0)
                .rsi(50.0)
                .build();
    }
}
