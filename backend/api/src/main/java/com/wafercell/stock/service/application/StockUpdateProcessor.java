package com.wafercell.stock.service.application;

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

    public void processUpdate(StockUpdate update) {
        String ticker = update.getTicker();
        StockDetailDto existing = stockDetailStore.get(ticker);
        if (existing == null) return;

        try {
            double newPrice = Double.parseDouble(update.getPrice());
            double newTradingValue = update.getTradingValue() != null ? Double.parseDouble(update.getTradingValue()) : 0.0;
            
            // 1. 새 지표 계산
            double newRsi = calculator.calculateRSI(historicalPriceStore.get(ticker), newPrice);
            double avgTamt = existing.getAverageTradingValue() != null ? existing.getAverageTradingValue() : 0.0;
            double newTamtRatio = calculator.calculateTradingValueRatio(newTradingValue, avgTamt);

            // 2. DTO 스스로 업데이트 (중복 로직 제거)
            existing.updateFromSocket(update, newRsi, newTamtRatio);
            
            // 3. 웹소켓 응답용 RSI 세팅 및 캐시 저장
            update.setRsi(String.format("%.2f", newRsi));
            stockDetailStore.update(ticker, existing);
        } catch (Exception e) {
            log.error("실시간 업데이트 처리 중 오류 발생 ({}): {}", ticker, e.getMessage());
        }
    }
}
