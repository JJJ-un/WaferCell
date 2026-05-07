package com.wafercell.stock.service.application;

import com.wafercell.stock.dto.indicator.StockIndicators;
import com.wafercell.stock.dto.response.StockDetailDto;
import com.wafercell.stock.dto.response.StockUpdate;
import com.wafercell.stock.service.domain.StockIndicatorCalculator;
import com.wafercell.stock.service.storage.HistoricalPriceStore;
import com.wafercell.stock.service.storage.StockDetailStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockUpdateProcessor {
    private final StockDetailStore stockDetailStore;
    private final HistoricalPriceStore historicalPriceStore;
    private final StockIndicatorCalculator calculator;

    public void processUpdate(StockUpdate socketData) {
        String ticker = socketData.getTicker();
        StockDetailDto snapshot = stockDetailStore.get(ticker);
        if (snapshot == null) return;

        try {
            double newPrice = Double.parseDouble(socketData.getPrice());
            double newTradingValue = socketData.getTradingValue() != null ? Double.parseDouble(socketData.getTradingValue()) : 0.0;
            
            // 1. 새 지표 계산
            double newRsi = calculator.calculateRSI(historicalPriceStore.get(ticker), newPrice);
            double avgTamt = snapshot.getAverageTradingValue() != null ? snapshot.getAverageTradingValue() : 0.0;
            double newTamtRatio = calculator.calculateTradingValueRatio(newTradingValue, avgTamt);

            StockIndicators indicators = StockIndicators.builder()
                    .rsi(newRsi)
                    .averageTradingValue(avgTamt)
                    .tradingValueRatio(newTamtRatio)
                    .build();

            // 2. 새로운 DTO 생성 (불변성 유지)
            StockDetailDto updated = snapshot.updateFromSocket(socketData, indicators);

            // 3. 웹소켓 응답용 RSI 세팅 및 캐시 저장
            socketData.setRsi(String.format("%.2f", newRsi));
            stockDetailStore.update(ticker, updated);
        } catch (Exception e) {
            log.error("실시간 업데이트 처리 중 오류 발생 ({}): {}", ticker, e.getMessage());
        }
    }
}
