package com.wafercell.stock.service.domain;

import com.wafercell.stock.dto.StockApiResponse;
import com.wafercell.stock.dto.StockDetailDto;
import com.wafercell.stock.entity.Stock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class StockMapper {
    private final StockIndicatorCalculator calculator;

    public StockDetailDto toDetailDto(Stock stock, StockApiResponse response, List<Double> historicalPrices, List<Double> historicalTamts) {
        double rsi = calculator.calculateRSI(historicalPrices, response.getLastPrice());
        double avgTamt = calculator.calculateAverageTradingValue(historicalTamts);
        double tamtRatio = calculator.calculateTradingValueRatio(response.getTradingValue(), avgTamt);
        double rate = (response.getBasePrice() == 0) ? 0 : ((response.getLastPrice() - response.getBasePrice()) / response.getBasePrice()) * 100;

        return StockDetailDto.builder()
                .name(stock.getName()).ticker(stock.getTicker()).sector(stock.getSector())
                .marketCap(response.getMarketCap()).changePercent(rate).price(response.getLastPrice())
                .highPrice(response.getHighPrice()).lowPrice(response.getLowPrice())
                .prevClose(response.getBasePrice()).volume(response.getVolume())
                .tradingValue(response.getTradingValue()).strength(100.0)
                .rsi(rsi).averageTradingValue(avgTamt).tradingValueRatio(tamtRatio).build();
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
